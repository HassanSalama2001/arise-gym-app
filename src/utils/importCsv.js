// Parses workout-history CSV exports from Hevy and Strong into sessions of sets.
// Only parsing and normalising happens here; writing to the database lives in db/importWorkouts.js.

const BYTE_ORDER_MARK = 0xfeff;

/** Splits CSV text into rows, honouring quoted fields and the file's delimiter. */
export function parseCsv(text) {
  if (text.charCodeAt(0) === BYTE_ORDER_MARK) text = text.slice(1);
  const clean = text.replace(/\r\n?/g, '\n');
  const headerLine = clean.slice(0, clean.indexOf('\n') === -1 ? clean.length : clean.indexOf('\n'));
  const delimiter = (headerLine.match(/;/g)?.length || 0) > (headerLine.match(/,/g)?.length || 0) ? ';' : ',';

  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (quoted) {
      if (char === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === delimiter) { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  return rows.filter(r => r.some(value => value !== ''));
}

const FORMATS = {
  hevy: {
    required: ['exercise_title', 'reps'],
    columns: {
      workout: ['title'],
      start: ['start_time'],
      end: ['end_time'],
      exercise: ['exercise_title'],
      weight: ['weight_kg'],
      reps: ['reps'],
      rpe: ['rpe'],
      setType: ['set_type'],
      duration: ['duration_seconds'],
      unit: [],
    },
    defaultUnit: 'kg',
  },
  strong: {
    required: ['exercise name'],
    columns: {
      workout: ['workout name'],
      start: ['date'],
      end: [],
      exercise: ['exercise name'],
      weight: ['weight', 'weight (kg)', 'weight (lbs)'],
      reps: ['reps'],
      rpe: ['rpe'],
      setType: ['set order'],
      duration: ['seconds'],
      unit: ['weight unit'],
    },
    defaultUnit: null, // taken from the weight column header or the unit column
  },
};

export function detectFormat(header) {
  const lower = header.map(h => h.trim().toLowerCase());
  for (const [name, format] of Object.entries(FORMATS)) {
    if (format.required.every(column => lower.includes(column))) return name;
  }
  return null;
}

const KG_PER_LB = 0.45359237;

function parseDate(value) {
  if (!value) return null;
  // Strong writes "2026-09-22 18:30:00"; Hevy writes ISO or "22 Sep 2026, 18:30"
  const direct = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  if (!Number.isNaN(direct.getTime())) return direct;
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Turns CSV text into { format, unit, sessions: [{ name, startTime, endTime, sets: [...] }], skipped }.
 * Weights come back in kilograms.
 */
export function parseWorkoutCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error('This file has no rows.');

  const header = rows[0].map(h => h.trim());
  const formatName = detectFormat(header);
  if (!formatName) {
    throw new Error('Unrecognised CSV. Export your history from Hevy or Strong and try that file.');
  }
  const format = FORMATS[formatName];
  const lower = header.map(h => h.toLowerCase());
  const indexOf = names => {
    for (const name of names) {
      const i = lower.indexOf(name);
      if (i !== -1) return i;
    }
    return -1;
  };
  const columns = Object.fromEntries(Object.entries(format.columns).map(([key, names]) => [key, indexOf(names)]));

  // Strong sometimes puts the unit in the weight header, e.g. "Weight (lbs)"
  const weightHeader = columns.weight === -1 ? '' : lower[columns.weight];
  const headerUnit = weightHeader.includes('lb') ? 'lb' : weightHeader.includes('kg') ? 'kg' : null;

  const sessions = new Map();
  let skipped = 0;

  for (const row of rows.slice(1)) {
    const value = i => (i === -1 ? '' : (row[i] ?? '').trim());
    const exercise = value(columns.exercise);
    const reps = parseFloat(value(columns.reps)) || 0;
    const duration = parseFloat(value(columns.duration)) || 0;
    const startedAt = parseDate(value(columns.start));

    if (!exercise || !startedAt || (!reps && !duration)) { skipped++; continue; }

    const rowUnit = (value(columns.unit) || headerUnit || format.defaultUnit || 'kg').toLowerCase();
    const rawWeight = parseFloat(value(columns.weight)) || 0;
    const weight = rowUnit.startsWith('lb') ? rawWeight * KG_PER_LB : rawWeight;

    const startTime = startedAt.getTime();
    const key = `${startTime}|${value(columns.workout)}`;
    if (!sessions.has(key)) {
      const end = parseDate(value(columns.end));
      sessions.set(key, {
        name: value(columns.workout) || 'Imported workout',
        startTime,
        endTime: end ? end.getTime() : null,
        sets: [],
      });
    }

    const setType = value(columns.setType).toLowerCase();
    sessions.get(key).sets.push({
      exerciseName: exercise,
      weight: Math.round(weight * 100) / 100,
      reps,
      rpe: parseFloat(value(columns.rpe)) || null,
      type: setType.includes('warm') ? 'warmup' : setType.includes('drop') ? 'drop' : 'normal',
      ...(duration && !reps ? { mode: 'time', duration } : {}),
    });
  }

  return {
    format: formatName,
    sessions: [...sessions.values()].sort((a, b) => a.startTime - b.startTime),
    skipped,
  };
}

/** Loose name matching: lowercase, drop punctuation and bracketed qualifiers, collapse spaces. */
export function normalizeExerciseName(name) {
  return String(name)
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Word-set key: keeps bracketed qualifiers but ignores their position, so
 * "Bench Press (Barbell)" and "barbell bench press" land on the same key.
 */
export function exerciseTokenKey(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .sort()
    .join(' ');
}

// Common Hevy/Strong names whose words don't line up with the dataset's.
// Keys are token keys (see exerciseTokenKey); values are dataset exercise names.
export const NAME_ALIASES = {
  'barbell squat': 'barbell full squat',
  'back barbell squat': 'barbell full squat',
  'bicep curl dumbbell': 'dumbbell biceps curl',
  'barbell bicep curl': 'barbell curl',
  'barbell overhead press': 'barbell seated overhead press',
  'barbell military press': 'barbell seated overhead press',
  'cable lat pulldown': 'cable pulldown',
  'cable pulldown wide': 'cable pulldown',
  'cable row seated': 'cable seated row',
  'dumbbell lateral raise side': 'dumbbell lateral raise',
  'extension lying triceps': 'barbell lying triceps extension',
  'cable pushdown triceps': 'cable pushdown',
  'bulgarian dumbbell split squat': 'dumbbell single leg split squat',
  'calf machine raise seated': 'lever seated calf raise',
  'calf machine raise standing': 'lever standing calf raise',
  'curl leg lying machine': 'lever lying leg curl',
  'extension leg machine': 'lever leg extension',
};

/**
 * Matches imported exercise names against the app's exercises, trying an exact name, then the
 * name without qualifiers, then the same words in any order, then a small alias table.
 * Returns { matched: Map(name -> exercise), unmatched: string[] }.
 */
export function matchExercises(names, exercises) {
  const byExact = new Map();
  const byNormal = new Map();
  const byTokens = new Map();
  for (const exercise of exercises) {
    byExact.set(exercise.name.toLowerCase(), exercise);
    for (const [map, key] of [[byNormal, normalizeExerciseName(exercise.name)], [byTokens, exerciseTokenKey(exercise.name)]]) {
      if (!map.has(key)) map.set(key, exercise);
    }
  }

  const matched = new Map();
  const unmatched = [];
  for (const name of names) {
    const tokens = exerciseTokenKey(name);
    const alias = NAME_ALIASES[tokens];
    const hit = byExact.get(name.toLowerCase())
      || byNormal.get(normalizeExerciseName(name))
      || byTokens.get(tokens)
      || (alias ? byExact.get(alias) : undefined);
    if (hit) matched.set(name, hit);
    else unmatched.push(name);
  }
  return { matched, unmatched };
}
