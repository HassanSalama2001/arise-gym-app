import { describe, it, expect, beforeEach } from 'vitest';
import db from './db';
import { exerciseHistory, suggestionsFor } from './progressionHistory';

const BENCH = 25;

async function logSession(startTime, sets) {
  const sessionId = await db.sessions.add({ name: 'S', startTime, endTime: startTime + 3e6 });
  await db.sets.bulkAdd(sets.map((s, i) => ({ sessionId, exerciseId: BENCH, setNumber: i + 1, completed: 1, type: 'normal', ...s })));
  return sessionId;
}

beforeEach(async () => {
  await Promise.all([db.sets.clear(), db.sessions.clear()]);
});

describe('exerciseHistory', () => {
  it('groups sets by session, most recent first', async () => {
    await logSession(1000, [{ weight: 60, reps: 5 }]);
    await logSession(5000, [{ weight: 70, reps: 5 }, { weight: 70, reps: 4 }]);
    const history = await exerciseHistory(BENCH);
    expect(history.map(rows => rows.map(r => r.weight))).toEqual([[70, 70], [60]]);
  });

  it('limits how far back it looks', async () => {
    for (let i = 0; i < 8; i++) await logSession(1000 * (i + 1), [{ weight: 60 + i, reps: 5 }]);
    expect(await exerciseHistory(BENCH, { limit: 3 })).toHaveLength(3);
  });

  it('skips sets whose session is gone', async () => {
    const id = await logSession(1000, [{ weight: 60, reps: 5 }]);
    await db.sessions.delete(id);
    expect(await exerciseHistory(BENCH)).toEqual([]);
  });

  it('returns nothing for an exercise never trained', async () => {
    expect(await exerciseHistory(999)).toEqual([]);
  });
});

describe('suggestionsFor', () => {
  it('uses each exercise\'s own scheme', async () => {
    await logSession(1000, [{ weight: 80, reps: 5 }, { weight: 80, reps: 5 }]);
    const suggestions = await suggestionsFor(
      [{ id: BENCH, progression: { type: 'linear', targetReps: 5, increment: 2.5 } }],
      {},
    );
    expect(suggestions[BENCH]).toMatchObject({ weight: 82.5, reps: 5 });
  });

  it('falls back to repeating the last session without a scheme', async () => {
    await logSession(1000, [{ weight: 60, reps: 10 }]);
    const suggestions = await suggestionsFor([{ id: BENCH }]);
    expect(suggestions[BENCH]).toMatchObject({ weight: 60, reps: 10 });
  });

  it('omits exercises with no usable history', async () => {
    expect(await suggestionsFor([{ id: BENCH }])).toEqual({});
  });
});
