import db from './db';
import posturalIssues from '../data/posturalIssues';
import { countPRsSince } from './records';
import { checkAndUnlockAchievement } from '../utils/achievements';
import { getToday, getYesterday } from '../utils/date';
import { groupIntoBlocks } from '../utils/planGroups';
import {
  summarizeSets, applyQuestProgress, finalSessionXP, nextStreak, earnedAchievements,
} from '../utils/workoutRules';

export const CORRECTIVE_RESOLVED_XP = 200;

/** Set rows to store: completed sets, plus any with numbers entered. */
export function setRowsForSession(sessionId, sets) {
  const rows = [];
  for (const [exIdStr, exSets] of Object.entries(sets)) {
    exSets.forEach((s, i) => {
      if (!s.completed && !(s.weight > 0 && s.reps > 0)) return;
      rows.push({
        sessionId,
        exerciseId: Number(exIdStr),
        setNumber: i + 1,
        weight: s.weight,
        reps: s.reps,
        rpe: s.rpe || null,
        type: s.type || 'normal',
        completed: s.completed ? 1 : 0,
      });
    });
  }
  return rows;
}

const blankSets = (count, reps) =>
  Array.from({ length: count }, () => ({ weight: 0, reps, type: 'normal', completed: false }));

/**
 * Corrective exercises to add around a workout for the user's active postural issues.
 * Returns { warmup, cooldown, sets } where warmup/cooldown are exercise lists (deduplicated, in protocol
 * order) and sets holds pre-filled sets for each corrective exercise.
 */
export function correctiveBlocks(activeRecords, issues, exercisesById) {
  const warmup = [];
  const cooldown = [];
  const sets = {};
  for (const record of activeRecords) {
    const issue = issues.find(p => p.id === record.issueId);
    for (const item of issue?.correctiveProtocol || []) {
      const exercise = exercisesById[item.exerciseId];
      if (!exercise) continue;
      const tagged = { ...exercise, isCorrective: true, issueId: record.issueId, protoNote: item.notes };
      if ((record.position === 'warmup' || record.position === 'both') && !warmup.some(e => e.id === tagged.id)) {
        warmup.push(tagged);
      }
      if ((record.position === 'cooldown' || record.position === 'both') && !cooldown.some(e => e.id === tagged.id)) {
        cooldown.push(tagged);
      }
      const reps = parseInt(String(item.reps ?? '').match(/\d+/)?.[0], 10) || 10; // "30s hold" -> 30
      sets[exercise.id] = blankSets(parseInt(item.sets, 10) || 2, reps);
    }
  }
  return { warmup, cooldown, sets };
}

/**
 * Creates the session record and the initial workout state: corrective warm-ups, the plan's exercises
 * (pre-filled with their target sets/reps) and corrective cool-downs, one exercise per block.
 */
export async function startWorkoutSession({ planName, planId = null, exercises = [], now = Date.now() }) {
  const [activeRecords, customIssues, allExercises, todayQuests] = await Promise.all([
    db.userPosturalIssues.where('status').equals('active').toArray(),
    db.customPosturalIssues.toArray(),
    db.exercises.toArray(),
    db.dailyQuests.where('date').equals(getToday()).toArray(),
  ]);
  const exercisesById = Object.fromEntries(allExercises.map(e => [e.id, e]));
  const correctives = correctiveBlocks(activeRecords, [...posturalIssues, ...customIssues], exercisesById);

  const planSets = Object.fromEntries(exercises.map(ex => [ex.id, blankSets(ex.targetSets || 3, ex.targetReps || 10)]));
  const sessionId = await db.sessions.add({ planId, name: planName, startTime: now, endTime: null });

  return {
    sessionId,
    startTime: now,
    blocks: [
      ...correctives.warmup.map(ex => [ex]),
      ...groupIntoBlocks(exercises), // linked plan exercises start as one superset block
      ...correctives.cooldown.map(ex => [ex]),
    ],
    sets: { ...planSets, ...correctives.sets },
    todayQuests,
  };
}

/** Advances active postural issues whose protocol was trained. Returns XP earned for issues resolved. */
async function logCorrectiveProgress(sets) {
  const active = await db.userPosturalIssues.where('status').equals('active').toArray();
  if (!active.length) return 0;

  const allIssues = [...posturalIssues, ...(await db.customPosturalIssues.toArray())];
  const trained = new Set(
    Object.entries(sets).filter(([, exSets]) => exSets.some(s => s.completed)).map(([id]) => Number(id))
  );

  let xp = 0;
  for (const record of active) {
    const issue = allIssues.find(p => p.id === record.issueId);
    if (!issue?.correctiveProtocol.some(p => trained.has(p.exerciseId))) continue;
    const completedSessions = record.completedSessions + 1;
    const resolved = completedSessions >= record.targetSessions;
    await db.userPosturalIssues.update(record.id, { completedSessions, status: resolved ? 'resolved' : 'active' });
    if (resolved) xp += CORRECTIVE_RESOLVED_XP;
  }
  return xp;
}

/**
 * Saves a finished workout: sets, quest progress, session stats, profile totals/streak, achievements and
 * corrective progress. `sessionXP` is the XP earned from sets during the workout.
 * Returns the data the Mission Complete screen shows.
 */
export async function finishWorkout({ sessionId, startTime, sets, sessionXP, now = Date.now() }) {
  const profile = await db.playerProfile.get('profile');
  const today = getToday();
  const prevAchievements = await db.achievements.toArray();

  const finalXP = finalSessionXP(sessionXP, profile?.currentStreak);
  await db.sets.bulkAdd(setRowsForSession(sessionId, sets));

  const exercisesById = Object.fromEntries((await db.exercises.toArray()).map(e => [e.id, e]));
  const summary = summarizeSets(sets, exercisesById);
  const stats = {
    ...summary,
    newPRs: await countPRsSince(Object.keys(sets), startTime),
    durationMinutes: (now - startTime) / 60000,
  };

  // Daily quests
  const todayQuests = await db.dailyQuests.where('date').equals(today).toArray();
  const prevQuests = structuredClone(todayQuests);
  let questXP = 0;
  for (const quest of todayQuests) {
    if (quest.completed) continue;
    const { current, completed } = applyQuestProgress(quest, stats);
    await db.dailyQuests.update(quest.id, { current, completed });
    if (completed) questXP += quest.xpReward;
  }

  let correctiveXP = 0;
  try {
    correctiveXP = await logCorrectiveProgress(sets);
  } catch (err) {
    console.error('Failed to log corrective progress:', err);
  }

  const earnedXP = finalXP + questXP + correctiveXP;
  await db.sessions.update(sessionId, { endTime: now, volume: summary.volume, xpEarned: earnedXP });

  const streak = nextStreak(profile?.lastSessionDate, profile?.currentStreak, today, getYesterday());
  const totalXP = (profile?.totalXP || 0) + earnedXP;
  const totalSessions = (profile?.totalSessions || 0) + 1;
  await db.playerProfile.update('profile', {
    totalXP,
    totalSessions,
    totalVolume: (profile?.totalVolume || 0) + summary.volume,
    currentStreak: streak,
    longestStreak: Math.max(profile?.longestStreak || 0, streak),
    lastSessionDate: today,
  });

  for (const type of earnedAchievements({ totalSessions, streak, totalXP })) {
    await checkAndUnlockAchievement(type);
  }

  return {
    sessionId,
    finalXP: earnedXP,
    totalVol: summary.volume,
    duration: now - startTime,
    prevXP: profile?.totalXP || 0,
    prevProfile: profile,
    prevQuests,
    prevAchievements,
  };
}
