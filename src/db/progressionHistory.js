import db from './db';
import { suggestNextSet } from '../utils/loadProgression';

/** Past sessions of an exercise, most recent first, as arrays of set rows. */
export async function exerciseHistory(exerciseId, { limit = 5 } = {}) {
  const sets = await db.sets.where('exerciseId').equals(exerciseId).toArray();
  if (!sets.length) return [];

  const sessions = await db.sessions.bulkGet([...new Set(sets.map(s => s.sessionId))]);
  const startTimes = new Map(sessions.filter(Boolean).map(s => [s.id, s.startTime]));

  const bySession = new Map();
  for (const set of sets) {
    if (!startTimes.has(set.sessionId)) continue;
    if (!bySession.has(set.sessionId)) bySession.set(set.sessionId, []);
    bySession.get(set.sessionId).push(set);
  }

  return [...bySession.entries()]
    .sort((a, b) => startTimes.get(b[0]) - startTimes.get(a[0]))
    .slice(0, limit)
    .map(([, rows]) => rows);
}

/**
 * Next-session targets for the given exercises, keyed by exercise id.
 * `progressionById` maps exercise id -> the plan's progression settings for it.
 */
export async function suggestionsFor(exercises, progressionById = {}) {
  const entries = await Promise.all(exercises.map(async ex => {
    const history = await exerciseHistory(ex.id);
    const suggestion = suggestNextSet(history, progressionById[ex.id] ?? ex.progression);
    return suggestion ? [ex.id, suggestion] : null;
  }));
  return Object.fromEntries(entries.filter(Boolean));
}
