import { describe, it, expect, beforeAll } from 'vitest';
import Dexie from 'dexie';
import { declareV7 } from '../test/legacySchema';
import { CUSTOM_EXERCISE_ID_START, nextCustomExerciseId } from './remap';

let db;

// A v11 database: unified dataset, but custom exercises created with IDs right after the dataset.
beforeAll(async () => {
  await Dexie.delete('AriseDB');
  const old = new Dexie('AriseDB');
  declareV7(old);
  old.version(11).stores({});
  await old.open();
  await old.exercises.bulkPut([
    { id: 25, name: 'barbell bench press', muscleGroup: 'Chest' },
    { id: 5202, name: 'Landmine Press', muscleGroup: 'Shoulders', isCustom: true },
    { id: 5203, name: 'Band Thing', muscleGroup: 'Corrective', isCustom: true },
  ]);
  await old.sets.bulkAdd([
    { sessionId: 1, exerciseId: 25, setNumber: 1, weight: 60, reps: 5 },
    { sessionId: 1, exerciseId: 5202, setNumber: 2, weight: 20, reps: 10 },
  ]);
  await old.personalRecords.add({ exerciseId: 5202, weight: 20, reps: 10, date: 1 });
  await old.customPosturalIssues.put({ id: 'custom_1', name: 'Mine', correctiveProtocol: [{ exerciseId: 5203 }] });
  old.close();

  db = (await import('./db')).default;
  await db.open();
});

describe('v12: custom exercises move out of the seeded ID range', () => {
  it('moves each custom exercise and keeps its details', async () => {
    expect(await db.exercises.get(5202)).toBeUndefined();
    expect(await db.exercises.get(5203)).toBeUndefined();
    const customs = await db.exercises.filter(ex => !!ex.isCustom).toArray();
    expect(customs.map(ex => ex.name).sort()).toEqual(['Band Thing', 'Landmine Press']);
    expect(customs.every(ex => ex.id >= CUSTOM_EXERCISE_ID_START)).toBe(true);
  });

  it('updates every reference', async () => {
    const landmine = (await db.exercises.filter(ex => ex.name === 'Landmine Press').first()).id;
    const band = (await db.exercises.filter(ex => ex.name === 'Band Thing').first()).id;
    expect((await db.sets.orderBy('setNumber').toArray()).map(s => s.exerciseId)).toEqual([25, landmine]);
    expect((await db.personalRecords.toArray())[0].exerciseId).toBe(landmine);
    expect((await db.customPosturalIssues.get('custom_1')).correctiveProtocol[0].exerciseId).toBe(band);
  });

  it('gives new custom exercises IDs in the custom range', async () => {
    const id = await nextCustomExerciseId(db.exercises);
    expect(id).toBeGreaterThan(CUSTOM_EXERCISE_ID_START);
    expect(await db.exercises.get(id)).toBeUndefined();
  });
});
