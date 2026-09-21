import db from './db';
import { LEGACY_DATASET_CUTOFF, LEGACY_ID_MAP, LEGACY_UNMAPPED } from '../data/legacyExercises';
import { normalizeMuscleGroup } from '../data/muscleGroups';
import { exercises as exerciseData } from '../data/exercises';
import { correctiveExercises } from '../data/correctiveExercises';

export const BACKUP_FORMAT = 'arise-backup';
export const BACKUP_SCHEMA_VERSION = 1;

// Every Dexie table must appear in exactly one of these lists (enforced by backup.test.js).
export const USER_TABLES = [
  'playerProfile', 'settings',
  'workoutPlans', 'planExercises', 'sessions', 'sets', 'personalRecords', 'exerciseNotes',
  'achievements', 'dailyQuests',
  'bodyWeight', 'inbodyScans', 'measurements',
  'userPosturalIssues', 'customPosturalIssues',
  'meals', 'hydration',
];
// Not backed up: seeded or cached data. Custom exercises are the exception, exported separately.
export const EXCLUDED_TABLES = ['exercises', 'exerciseImageCache', 'mealSuggestions'];

// Settings rows that describe this device rather than the user; never exported or overwritten.
const DEVICE_SETTINGS = new Set(['exercise_seed_version', 'last_sync_time']);

// Custom exercises recreated from old backups live here, clear of seeded IDs (dataset < 10001, correctives 10001+).
const LEGACY_CUSTOM_ID_BASE = 20000;

export class BackupError extends Error {}

export async function exportBackup() {
  const tables = {};
  await db.transaction('r', [...USER_TABLES.map(t => db.table(t)), db.exercises], async () => {
    for (const name of USER_TABLES) {
      tables[name] = await db.table(name).toArray();
    }
    tables.settings = tables.settings.filter(s => !DEVICE_SETTINGS.has(s.key));
    tables.customExercises = await db.exercises.filter(ex => !!ex.isCustom).toArray();
  });
  return {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tables,
  };
}

/**
 * Validates a backup (current or older format) and converts it to the current shape:
 * { tables: { [table]: rows[] }, customExercises: rows[], exportedAt, legacyIds: boolean }.
 * Does not touch the database.
 */
export function parseBackup(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new BackupError('This file is not an ARISE backup.');
  }
  data = structuredClone(data); // remapping edits rows in place

  if (data.format !== undefined) {
    if (data.format !== BACKUP_FORMAT) throw new BackupError('This file is not an ARISE backup.');
    if (typeof data.schemaVersion !== 'number' || data.schemaVersion > BACKUP_SCHEMA_VERSION) {
      throw new BackupError('This backup was made by a newer version of ARISE. Update the app and try again.');
    }
    const { customExercises = [], ...rest } = data.tables || {};
    const tables = pickTables(rest);
    return fixDanglingReferences({ tables, customExercises: asRows(customExercises), exportedAt: data.exportedAt, legacyIds: false });
  }

  // Older unversioned exports: table arrays at the top level, profile stored as "profile"
  // (an array from cloud backups, a single object from the Settings export).
  const raw = { ...data };
  if (raw.profile !== undefined) {
    raw.playerProfile = Array.isArray(raw.profile) ? raw.profile : [raw.profile];
    delete raw.profile;
  }
  const tables = pickTables(raw);
  if (!tables.playerProfile.length && !tables.sessions.length) {
    throw new BackupError('This backup has no profile or workout data.');
  }
  const legacyIds = usesLegacyExerciseIds(tables, data.exportedAt);
  const parsed = { tables, customExercises: [], exportedAt: data.exportedAt, legacyIds };
  return fixDanglingReferences(legacyIds ? remapLegacyExercises(parsed) : parsed);
}

/** Replaces all user data with the backup's contents in one transaction. */
export async function importBackup(data) {
  const { tables, customExercises } = parseBackup(data);

  await db.transaction('rw', [...USER_TABLES.map(t => db.table(t)), db.exercises], async () => {
    for (const name of USER_TABLES) {
      if (name === 'settings') {
        await db.settings.filter(s => !DEVICE_SETTINGS.has(s.key)).delete();
      } else {
        await db.table(name).clear();
      }
    }
    await db.exercises.filter(ex => !!ex.isCustom).delete();

    await db.exercises.bulkPut(customExercises);
    for (const name of USER_TABLES) {
      let rows = tables[name];
      if (name === 'settings') rows = rows.filter(s => !DEVICE_SETTINGS.has(s.key));
      if (rows.length) await db.table(name).bulkPut(rows);
    }
  });

  return {
    sessions: tables.sessions.length,
    meals: tables.meals.length,
    customExercises: customExercises.length,
  };
}

/** True if this device holds anything a restore would destroy. */
export async function hasLocalUserData() {
  const [sessions, meals, plans, scans, weights] = await Promise.all([
    db.sessions.count(), db.meals.count(), db.workoutPlans.count(), db.inbodyScans.count(), db.bodyWeight.count(),
  ]);
  return sessions + meals + plans + scans + weights > 0;
}

// ── helpers ─────────────────────────────────────────────

function asRows(value) {
  return Array.isArray(value) ? value.filter(r => r && typeof r === 'object') : [];
}

function pickTables(source) {
  const tables = {};
  for (const name of USER_TABLES) tables[name] = asRows(source[name]);
  return tables;
}

// Tables whose rows point at an exercise.
function exerciseRefs(tables) {
  const refs = [];
  for (const name of ['sets', 'planExercises', 'personalRecords', 'exerciseNotes']) {
    for (const row of tables[name]) refs.push({ row, key: 'exerciseId' });
  }
  for (const issue of tables.customPosturalIssues) {
    for (const item of issue.correctiveProtocol || []) refs.push({ row: item, key: 'exerciseId' });
  }
  return refs.filter(r => r.row[r.key] !== undefined && r.row[r.key] !== null);
}

function usesLegacyExerciseIds(tables, exportedAt) {
  const seed = tables.settings.find(s => s.key === 'exercise_seed_version')?.value;
  if (typeof seed === 'string') {
    // Old dataset devices wrote "<count>_v1" / "<count>_v2"; everything since is v3+.
    return /_v[12]$/.test(seed);
  }
  return !!exportedAt && new Date(exportedAt) < new Date(LEGACY_DATASET_CUTOFF);
}

function remapLegacyExercises(parsed) {
  const created = new Map();
  for (const ref of exerciseRefs(parsed.tables)) {
    const oldId = Number(ref.row[ref.key]);
    if (LEGACY_ID_MAP[oldId] !== undefined) {
      ref.row[ref.key] = LEGACY_ID_MAP[oldId];
      continue;
    }
    const newId = LEGACY_CUSTOM_ID_BASE + oldId;
    if (!created.has(newId)) {
      const [name, group] = LEGACY_UNMAPPED[oldId] || [`Exercise #${oldId}`, 'Other'];
      created.set(newId, { id: newId, name, muscleGroup: normalizeMuscleGroup(group), isCustom: true, instructions: [] });
    }
    ref.row[ref.key] = newId;
  }
  return { ...parsed, customExercises: [...parsed.customExercises, ...created.values()] };
}

// Older exports never included custom exercises, so sets could point at IDs that won't exist after a restore.
// Keep the history by creating a named placeholder under the same ID.
function fixDanglingReferences(parsed) {
  const known = new Set(parsed.customExercises.map(ex => ex.id));
  const placeholders = new Map();
  for (const ref of exerciseRefs(parsed.tables)) {
    const id = ref.row[ref.key];
    if (known.has(id) || isSeededExerciseId(id) || placeholders.has(id)) continue;
    placeholders.set(id, { id, name: `Exercise #${id}`, muscleGroup: 'Other', isCustom: true, instructions: [] });
  }
  return { ...parsed, customExercises: [...parsed.customExercises, ...placeholders.values()] };
}

let seededIds = null;
function isSeededExerciseId(id) {
  seededIds ??= new Set([...exerciseData, ...correctiveExercises].map(ex => ex.id));
  return seededIds.has(id);
}
