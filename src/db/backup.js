import db from './db';
import { LEGACY_DATASET_CUTOFF } from '../data/legacyExercises';
import {
  EXERCISE_REF_TABLES, forEachExerciseRef, legacyResolver, LEGACY_CUSTOM_ID_BASE, CUSTOM_EXERCISE_ID_START,
} from './remap';
import { mergeRecords } from '../utils/workoutRules';

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
    return { tables, customExercises: asRows(customExercises), exportedAt: data.exportedAt, legacyIds: false };
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
  return legacyIds ? remapLegacyExercises(parsed) : parsed;
}

/** Replaces all user data with the backup's contents in one transaction. */
export async function importBackup(data) {
  const { tables, customExercises: backupCustom } = parseBackup(data);
  tables.personalRecords = onePersonalRecordPerExercise(tables.personalRecords);
  const customExercises = relocateLowCustomIds(
    [...backupCustom, ...(await placeholdersForMissingExercises(tables, backupCustom))],
    tables,
  );

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

function exerciseRefs(tables) {
  const holders = [];
  for (const table of [...EXERCISE_REF_TABLES, 'customPosturalIssues']) {
    for (const row of tables[table]) forEachExerciseRef(table, row, h => holders.push(h));
  }
  return holders;
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
  const { resolve, created } = legacyResolver();
  for (const holder of exerciseRefs(parsed.tables)) holder.exerciseId = resolve(holder.exerciseId);
  return { ...parsed, customExercises: [...parsed.customExercises, ...created.values()] };
}

// Older exports never included custom exercises, so a restore could leave sets pointing at nothing.
// Keep the history by keeping or recreating the exercise under the same ID. (Built-ins are checked against
// the database; a placeholder that lands on a built-in ID is overwritten by the next seed.)
async function placeholdersForMissingExercises(tables, customExercises) {
  const known = new Set(customExercises.map(ex => ex.id));
  const ids = [...new Set(exerciseRefs(tables).map(h => h.exerciseId))].filter(id => !known.has(id));
  const rows = await db.exercises.bulkGet(ids);
  return ids.flatMap((id, i) => {
    if (rows[i] && !rows[i].isCustom) return [];
    // A custom exercise still on this device keeps its details; otherwise use a named placeholder.
    return [rows[i] ?? { id, name: `Exercise #${id}`, muscleGroup: 'Other', isCustom: true, instructions: [] }];
  });
}

// Backups made before custom exercises had their own ID range can hold them among seeded IDs,
// where a later dataset update would overwrite them. Move them (and their references) up.
function relocateLowCustomIds(customExercises, tables) {
  let next = Math.max(CUSTOM_EXERCISE_ID_START, ...customExercises.map(ex => ex.id + 1));
  const moves = new Map();
  for (const ex of customExercises) {
    if (ex.id < LEGACY_CUSTOM_ID_BASE) moves.set(ex.id, next++);
  }
  if (!moves.size) return customExercises;
  for (const holder of exerciseRefs(tables)) {
    if (moves.has(holder.exerciseId)) holder.exerciseId = moves.get(holder.exerciseId);
  }
  return customExercises.map(ex => (moves.has(ex.id) ? { ...ex, id: moves.get(ex.id) } : ex));
}

// Older versions added a record row per PR; keep one merged row per exercise (see migration v13).
function onePersonalRecordPerExercise(rows) {
  const byExercise = new Map();
  for (const row of rows) {
    if (!byExercise.has(row.exerciseId)) byExercise.set(row.exerciseId, []);
    byExercise.get(row.exerciseId).push(row);
  }
  return [...byExercise.values()].map(group => (group.length === 1 ? group[0] : mergeRecords(group)));
}
