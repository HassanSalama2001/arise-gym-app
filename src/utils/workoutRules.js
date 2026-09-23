// Pure game rules for a workout: set XP, PRs, quest progress, streaks and achievements.
// LogWorkoutScreen does the I/O; everything here is unit-tested in workoutRules.test.js.
import { RANKS, calculateSetXP } from '../data/progression';

export const PR_BONUS_XP = 100;
export const COMPLETION_BONUS_XP = 50;
export const CORRECTIVE_SET_XP = 5;

export function isCorrectiveExercise(exercise) {
  return !!(exercise?.isCorrective || exercise?.muscleGroup === 'Corrective');
}

/** Reps counted for a set: per-side sets are logged once but worked twice. */
export function effectiveReps(set) {
  return (set.reps || 0) * (set.perSide ? 2 : 1);
}

/** Volume (weight x reps) for a set. Timed holds have no rep volume. */
export function setVolume(set) {
  if (set.mode === 'time') return 0;
  return (set.weight || 0) * effectiveReps(set);
}

/** XP for one completed set (before any PR bonus). Warm-ups earn nothing. */
export function setXP(set, exercise) {
  if (set.type === 'warmup') return 0;
  if (isCorrectiveExercise(exercise)) return CORRECTIVE_SET_XP;
  // A timed hold earns like bodyweight reps, counting roughly 3 seconds per rep.
  if (set.mode === 'time') return Math.max(Math.round((set.duration || 0) / 3) * 2, 5);
  return calculateSetXP(set.weight || 0, effectiveReps(set));
}

/** Epley estimated one-rep max. */
export function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0;
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

/**
 * Whether a working set beats the exercise's record, by estimated 1RM or by heaviest weight.
 * Returns { isPR, record } where record is what to store (unchanged when not a PR).
 * The stored set is the best-e1RM set; maxWeight tracks the heaviest weight separately so the
 * two kinds of PR don't keep overriding each other.
 */
export function evaluatePR(record, set, now = Date.now()) {
  const weight = set.weight || 0;
  const reps = effectiveReps(set);
  if (set.type === 'warmup' || set.mode === 'time' || weight <= 0 || reps <= 0) return { isPR: false, record };

  const setE1RM = estimateOneRepMax(weight, reps);
  if (!record) {
    return { isPR: true, record: { weight, reps, maxWeight: weight, date: now } };
  }

  const bestE1RM = estimateOneRepMax(record.weight, record.reps);
  const maxWeight = record.maxWeight ?? record.weight;
  const betterE1RM = setE1RM > bestE1RM + 1e-9;
  const heavier = weight > maxWeight;
  if (!betterE1RM && !heavier) return { isPR: false, record };

  return {
    isPR: true,
    record: {
      ...record,
      ...(betterE1RM ? { weight, reps } : {}),
      maxWeight: Math.max(maxWeight, weight),
      date: now,
    },
  };
}

/** Merges several record rows for one exercise (older app versions added a row per PR) into one. */
export function mergeRecords(rows) {
  if (!rows.length) return null;
  const best = rows.reduce((a, b) => (estimateOneRepMax(b.weight, b.reps) > estimateOneRepMax(a.weight, a.reps) ? b : a));
  return {
    ...best,
    maxWeight: Math.max(...rows.map(r => r.maxWeight ?? r.weight ?? 0)),
    date: Math.max(...rows.map(r => r.date || 0)),
  };
}

/**
 * Summarises the completed sets of a workout.
 * `sets` maps exerciseId -> set rows (as in the workout context); `exercisesById` maps id -> exercise.
 */
export function summarizeSets(sets, exercisesById) {
  const byGroup = {};
  let totalSets = 0;
  let volume = 0;
  let exercisesTrained = 0;

  for (const [exId, exSets] of Object.entries(sets)) {
    const done = exSets.filter(s => s.completed);
    if (!done.length) continue;
    exercisesTrained++;
    totalSets += done.length;
    volume += done.reduce((acc, s) => acc + setVolume(s), 0);
    const group = exercisesById[exId]?.muscleGroup;
    if (group) byGroup[group] = (byGroup[group] || 0) + done.length;
  }

  return { byGroup, totalSets, volume, exercisesTrained };
}

// Quests judged on a single session: progress replaces, rather than adds to, earlier sessions today.
const PER_SESSION_QUESTS = new Set(['exercise_count', 'total_sets', 'fast_workout']);

const GROUP_QUESTS = {
  chest_sets: 'Chest',
  back_sets: 'Back',
  shoulder_sets: 'Shoulders',
  arm_sets: 'Arms',
  core_work: 'Core',
};

/**
 * This session's contribution to a quest.
 * stats: summarizeSets() result plus newPRs and, once the workout is finished, durationMinutes.
 */
export function questSessionProgress(quest, stats) {
  if (GROUP_QUESTS[quest.type]) return stats.byGroup[GROUP_QUESTS[quest.type]] || 0;
  switch (quest.type) {
    case 'train_legs': return (stats.byGroup.Legs || 0) > 0 ? 1 : 0;
    case 'total_sets': return stats.totalSets;
    case 'exercise_count': return stats.exercisesTrained;
    case 'new_pr': return stats.newPRs || 0;
    case 'fast_workout': return stats.durationMinutes !== undefined && stats.durationMinutes < 45 ? 1 : 0;
    // Older quest types that may still be stored on devices
    case 'workout_count': return stats.durationMinutes !== undefined ? 1 : 0;
    case 'total_volume': return stats.volume;
    default: return 0;
  }
}

/** The quest's progress for today after this session, capped at its target. */
export function applyQuestProgress(quest, stats) {
  const progress = questSessionProgress(quest, stats);
  const current = PER_SESSION_QUESTS.has(quest.type)
    ? Math.max(quest.current, progress)
    : quest.current + progress;
  const capped = Math.min(current, quest.target);
  return { current: capped, completed: capped >= quest.target };
}

/** Session XP: sets + completion bonus, times a streak multiplier (+10% per streak day, up to 2x). */
export function finalSessionXP(earnedXP, currentStreak) {
  const multiplier = Math.min(1 + (currentStreak || 0) * 0.1, 2);
  return Math.round((earnedXP + COMPLETION_BONUS_XP) * multiplier);
}

/** Streak after training today. Dates are local "YYYY-MM-DD" strings. */
export function nextStreak(lastSessionDate, currentStreak, today, yesterday) {
  if (lastSessionDate === today) return currentStreak || 1;
  if (lastSessionDate === yesterday) return (currentStreak || 0) + 1;
  return 1;
}

const RANK_ACHIEVEMENTS = { D: 'rank_d', C: 'rank_c', B: 'rank_b', A: 'rank_a', S: 'rank_s' };

/** Achievement types earned by these totals (already-unlocked ones are filtered out by the caller). */
export function earnedAchievements({ totalSessions, streak, totalXP }) {
  const types = [];
  if (totalSessions >= 10) types.push('sessions_10');
  if (totalSessions >= 50) types.push('sessions_50');
  if (streak >= 7) types.push('streak_7');
  if (streak >= 30) types.push('streak_30');
  for (const rank of RANKS) {
    if (RANK_ACHIEVEMENTS[rank.rank] && totalXP >= rank.xpRequired) types.push(RANK_ACHIEVEMENTS[rank.rank]);
  }
  return types;
}
