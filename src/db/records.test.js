import { describe, it, expect, beforeEach } from 'vitest';
import db from './db';
import { recordSetIfPR, countPRsSince } from './records';

const set = (weight, reps) => ({ weight, reps, type: 'normal' });

beforeEach(() => db.personalRecords.clear());

describe('recordSetIfPR', () => {
  it('keeps a single record row per exercise, updated in place', async () => {
    expect(await recordSetIfPR(25, set(80, 8))).toBe(true);
    expect(await recordSetIfPR(25, set(80, 6))).toBe(false);
    expect(await recordSetIfPR(25, set(80, 10))).toBe(true);
    expect(await recordSetIfPR(25, set(85, 8))).toBe(true);

    const rows = await db.personalRecords.where('exerciseId').equals(25).toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ weight: 85, reps: 8, maxWeight: 85 });
  });

  it('does not fire again for a set that only beats an old record', async () => {
    await recordSetIfPR(25, set(60, 5));
    await recordSetIfPR(25, set(100, 5));
    expect(await recordSetIfPR(25, set(70, 5))).toBe(false); // beat the first record, not the current one
  });
});

describe('countPRsSince', () => {
  it('counts exercises with a PR in this session', async () => {
    await db.personalRecords.bulkAdd([
      { exerciseId: 25, weight: 80, reps: 5, date: 100 },
      { exerciseId: 27, weight: 60, reps: 8, date: 5000 },
      { exerciseId: 43, weight: 100, reps: 5, date: 6000 },
    ]);
    expect(await countPRsSince(['25', '27', '43'], 1000)).toBe(2);
  });
});
