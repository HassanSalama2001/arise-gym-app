import { describe, it, expect, beforeAll } from 'vitest';
import Dexie from 'dexie';
import { declareV7 } from '../test/legacySchema';

let db;

// A v12 database where every PR had been added as a new row.
beforeAll(async () => {
  await Dexie.delete('AriseDB');
  const old = new Dexie('AriseDB');
  declareV7(old);
  old.version(12).stores({});
  await old.open();
  await old.personalRecords.bulkAdd([
    { exerciseId: 25, weight: 60, reps: 5, date: 1 },
    { exerciseId: 25, weight: 80, reps: 8, date: 2 },  // best estimated 1RM (~101)
    { exerciseId: 25, weight: 90, reps: 1, date: 3 },  // heaviest
    { exerciseId: 27, weight: 50, reps: 10, date: 4 },
  ]);
  old.close();

  db = (await import('./db')).default;
  await db.open();
});

describe('v13: one personal record per exercise', () => {
  it('merges duplicate rows into the best set plus the heaviest weight', async () => {
    const bench = await db.personalRecords.where('exerciseId').equals(25).toArray();
    expect(bench).toHaveLength(1);
    expect(bench[0]).toMatchObject({ weight: 80, reps: 8, maxWeight: 90, date: 3 });
  });

  it('adds maxWeight to single records', async () => {
    const row = await db.personalRecords.where('exerciseId').equals(27).first();
    expect(row).toMatchObject({ weight: 50, reps: 10, maxWeight: 50 });
  });
});
