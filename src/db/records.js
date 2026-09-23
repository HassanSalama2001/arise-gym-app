import db from './db';
import { evaluatePR } from '../utils/workoutRules';

/** Checks a completed set against the exercise's record and saves it if it's a PR. Returns isPR. */
export async function recordSetIfPR(exerciseId, set) {
  const current = await db.personalRecords.where('exerciseId').equals(exerciseId).first();
  const { isPR, record } = evaluatePR(current, set);
  if (isPR) await db.personalRecords.put({ ...record, exerciseId });
  return isPR;
}

/** How many of these exercises got a new PR since `since` (ms). */
export async function countPRsSince(exerciseIds, since) {
  const records = await db.personalRecords.where('exerciseId').anyOf(exerciseIds.map(Number)).toArray();
  return new Set(records.filter(r => r.date >= since).map(r => r.exerciseId)).size;
}
