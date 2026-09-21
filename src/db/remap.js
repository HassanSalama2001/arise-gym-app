import { LEGACY_ID_MAP, LEGACY_UNMAPPED } from '../data/legacyExercises';
import { normalizeMuscleGroup } from '../data/muscleGroups';
import { mergeRecords } from '../utils/workoutRules';

// Exercise ID ranges:
//   < 20000          seeded (dataset < 10001, correctives 10001+)
//   20000 – 99999    exercises recreated from the pre-2026-07 dataset (old ID + 20000)
//   >= 100000        exercises the user creates
export const LEGACY_CUSTOM_ID_BASE = 20000;
export const CUSTOM_EXERCISE_ID_START = 100000;

/** The ID for a new user-created exercise. */
export async function nextCustomExerciseId(exercisesTable) {
  const last = await exercisesTable.orderBy(':id').last();
  return Math.max(CUSTOM_EXERCISE_ID_START, (last?.id ?? 0) + 1);
}

/** Dexie upgrade step: move custom exercises out of the seeded ID range, updating references. */
export async function relocateCustomExercises(tx) {
  const table = tx.table('exercises');
  const misplaced = await table.filter(ex => !!ex.isCustom && ex.id < LEGACY_CUSTOM_ID_BASE).toArray();
  if (!misplaced.length) return;
  let next = await nextCustomExerciseId(table);
  const moves = new Map(misplaced.map(ex => [ex.id, next++]));
  await remapExerciseIds(tx, id => moves.get(id));
  await table.bulkDelete([...moves.keys()]);
  await table.bulkAdd(misplaced.map(ex => ({ ...ex, id: moves.get(ex.id) })));
}

// Tables whose rows reference an exercise, and how.
export const EXERCISE_REF_TABLES = ['sets', 'planExercises', 'personalRecords', 'exerciseNotes'];

/** Calls fn(holder) for every object holding an exerciseId in a row of `table`. */
export function forEachExerciseRef(table, row, fn) {
  if (table === 'customPosturalIssues') {
    for (const item of row.correctiveProtocol || []) {
      if (item && item.exerciseId != null) fn(item);
    }
  } else if (EXERCISE_REF_TABLES.includes(table) && row.exerciseId != null) {
    fn(row);
  }
}

/**
 * Rewrites every exercise reference in the database inside an open Dexie transaction.
 * mapId(oldId) returns the new ID, or undefined to leave the reference unchanged.
 */
export async function remapExerciseIds(tx, mapId) {
  for (const table of [...EXERCISE_REF_TABLES, 'customPosturalIssues']) {
    await tx.table(table).toCollection().modify(row => {
      forEachExerciseRef(table, row, holder => {
        const next = mapId(holder.exerciseId);
        if (next !== undefined) holder.exerciseId = next;
      });
    });
  }
}

/**
 * Resolver for pre-2026-07 exercise IDs. Mapped IDs go to their current equivalent; anything else becomes a
 * custom exercise (collected in `created`) so its history keeps a name. `oldRows` supplies names for old
 * custom exercises when available.
 */
export function legacyResolver(oldRows = new Map()) {
  const created = new Map();
  const resolve = (oldId) => {
    const id = Number(oldId);
    if (LEGACY_ID_MAP[id] !== undefined) return LEGACY_ID_MAP[id];
    const newId = LEGACY_CUSTOM_ID_BASE + id;
    if (!created.has(newId)) {
      const old = oldRows.get(id);
      const [name, group] = LEGACY_UNMAPPED[id] || [old?.name || `Exercise #${id}`, old?.muscleGroup];
      created.set(newId, {
        ...(old || {}),
        id: newId,
        name,
        muscleGroup: normalizeMuscleGroup(group),
        instructions: old?.instructions || [],
        isCustom: true,
      });
    }
    return newId;
  };
  return { resolve, created };
}

/** Dexie upgrade step: move a pre-2026-07 database onto current exercise IDs without losing history. */
export async function migrateLegacyExercises(tx) {
  const oldRows = new Map((await tx.table('exercises').toArray()).map(ex => [ex.id, ex]));
  const { resolve, created } = legacyResolver(oldRows);

  await remapExerciseIds(tx, resolve);
  for (const ex of oldRows.values()) {
    if (ex.isCustom) resolve(ex.id); // keep custom exercises even if nothing references them
  }

  await tx.table('exercises').clear(); // the seed step repopulates built-ins on next boot
  await tx.table('exerciseImageCache').clear();
  if (created.size) await tx.table('exercises').bulkPut([...created.values()]);
}

/** Dexie upgrade step: older versions added a new record row per PR; keep one merged row per exercise. */
export async function collapsePersonalRecords(tx) {
  const table = tx.table('personalRecords');
  const byExercise = new Map();
  for (const row of await table.toArray()) {
    if (!byExercise.has(row.exerciseId)) byExercise.set(row.exerciseId, []);
    byExercise.get(row.exerciseId).push(row);
  }
  for (const rows of byExercise.values()) {
    if (rows.length < 2 && rows[0]?.maxWeight !== undefined) continue;
    const merged = mergeRecords(rows);
    await table.bulkDelete(rows.map(r => r.id).filter(id => id !== merged.id));
    await table.put(merged);
  }
}
