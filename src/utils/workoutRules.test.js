import { describe, it, expect } from 'vitest';
import {
  setXP, estimateOneRepMax, evaluatePR, summarizeSets, questSessionProgress, applyQuestProgress,
  finalSessionXP, nextStreak, earnedAchievements, CORRECTIVE_SET_XP,
} from './workoutRules';
import { QUEST_TEMPLATES } from '../data/progression';

const bench = { id: 25, muscleGroup: 'Chest' };
const row = { id: 27, muscleGroup: 'Back' };
const squat = { id: 43, muscleGroup: 'Legs' };
const band = { id: 10018, muscleGroup: 'Corrective', isCorrective: true };
const byId = { 25: bench, 27: row, 43: squat, 10018: band };

const done = (weight, reps, extra = {}) => ({ weight, reps, completed: true, type: 'normal', ...extra });
const todo = (weight, reps) => ({ weight, reps, completed: false, type: 'normal' });

describe('setXP', () => {
  it('uses volume for working sets, nothing for warm-ups, a flat amount for correctives', () => {
    expect(setXP(done(100, 5), bench)).toBe(50);
    expect(setXP(done(100, 5, { type: 'warmup' }), bench)).toBe(0);
    expect(setXP(done(0, 15), band)).toBe(CORRECTIVE_SET_XP);
  });
});

describe('PRs', () => {
  it('estimates 1RM with Epley, and a single is its own 1RM', () => {
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(133.33, 1);
    expect(estimateOneRepMax(140, 1)).toBe(140);
  });

  it('counts the first working set as a PR', () => {
    expect(evaluatePR(undefined, done(60, 8), 1).isPR).toBe(true);
  });

  it('counts more reps at the same weight (the old rule missed this)', () => {
    const record = { weight: 80, reps: 8 };
    const { isPR, record: next } = evaluatePR(record, done(80, 10), 2);
    expect(isPR).toBe(true);
    expect(next).toMatchObject({ weight: 80, reps: 10, maxWeight: 80, date: 2 });
  });

  it('counts a lighter set with a better estimated 1RM', () => {
    expect(evaluatePR({ weight: 100, reps: 3 }, done(90, 8)).isPR).toBe(true); // 114 vs 110
  });

  it('counts a heavier weight even with a lower e1RM, keeping the best-e1RM set', () => {
    const { isPR, record } = evaluatePR({ weight: 90, reps: 10 }, done(100, 1), 3); // e1RM 100 vs 120
    expect(isPR).toBe(true);
    expect(record).toMatchObject({ weight: 90, reps: 10, maxWeight: 100 });
  });

  it('does not flip-flop between the two kinds of PR', () => {
    const afterHeavy = { weight: 90, reps: 10, maxWeight: 100 };
    expect(evaluatePR(afterHeavy, done(90, 9)).isPR).toBe(false);
    expect(evaluatePR(afterHeavy, done(100, 1)).isPR).toBe(false);
  });

  it('ignores warm-ups, bodyweight and empty sets', () => {
    expect(evaluatePR(undefined, done(100, 5, { type: 'warmup' })).isPR).toBe(false);
    expect(evaluatePR(undefined, done(0, 20)).isPR).toBe(false);
    expect(evaluatePR(undefined, done(50, 0)).isPR).toBe(false);
  });
});

describe('summarizeSets', () => {
  it('counts only completed sets, by muscle group', () => {
    const stats = summarizeSets({
      25: [done(80, 5), done(80, 5), todo(80, 5)],
      27: [done(60, 10)],
      43: [todo(100, 5)],
    }, byId);
    expect(stats).toEqual({ byGroup: { Chest: 2, Back: 1 }, totalSets: 3, volume: 1400, exercisesTrained: 2 });
  });
});

describe('quests', () => {
  const stats = { byGroup: { Chest: 3, Legs: 2, Back: 4, Shoulders: 1, Arms: 5, Core: 3 }, totalSets: 18, volume: 9000, exercisesTrained: 6, newPRs: 1 };

  it('has a progress rule for every quest the app can generate', () => {
    for (const t of QUEST_TEMPLATES) {
      const progress = questSessionProgress({ type: t.type }, { ...stats, durationMinutes: 30 });
      expect(progress, t.type).toBeGreaterThan(0);
    }
  });

  it('progresses chest and exercise-count quests (never completable before)', () => {
    expect(applyQuestProgress({ type: 'chest_sets', current: 0, target: 3 }, stats)).toEqual({ current: 3, completed: true });
    expect(applyQuestProgress({ type: 'exercise_count', current: 0, target: 5 }, stats)).toEqual({ current: 5, completed: true });
  });

  it('accumulates daily quests across sessions', () => {
    expect(applyQuestProgress({ type: 'back_sets', current: 2, target: 4 }, { ...stats, byGroup: { Back: 1 } }))
      .toEqual({ current: 3, completed: false });
  });

  it('judges "in one session" quests on a single session', () => {
    const twoHalfSessions = applyQuestProgress({ type: 'total_sets', current: 10, target: 20 }, { ...stats, totalSets: 10 });
    expect(twoHalfSessions).toEqual({ current: 10, completed: false });
  });

  it('only awards the fast-workout quest once the duration is known', () => {
    expect(questSessionProgress({ type: 'fast_workout' }, stats)).toBe(0);
    expect(questSessionProgress({ type: 'fast_workout' }, { ...stats, durationMinutes: 40 })).toBe(1);
    expect(questSessionProgress({ type: 'fast_workout' }, { ...stats, durationMinutes: 50 })).toBe(0);
  });
});

describe('session XP and streaks', () => {
  it('adds the completion bonus and applies the streak multiplier, capped at 2x', () => {
    expect(finalSessionXP(100, 0)).toBe(150);
    expect(finalSessionXP(100, 3)).toBe(195);
    expect(finalSessionXP(100, 50)).toBe(300);
  });

  it('extends, keeps or restarts the streak', () => {
    expect(nextStreak('2026-09-21', 4, '2026-09-22', '2026-09-21')).toBe(5);
    expect(nextStreak('2026-09-22', 4, '2026-09-22', '2026-09-21')).toBe(4);
    expect(nextStreak('2026-09-19', 4, '2026-09-22', '2026-09-21')).toBe(1);
    expect(nextStreak(null, 0, '2026-09-22', '2026-09-21')).toBe(1);
  });
});

describe('earnedAchievements', () => {
  it('derives rank achievements from the rank table', () => {
    expect(earnedAchievements({ totalSessions: 1, streak: 1, totalXP: 999 })).toEqual([]);
    expect(earnedAchievements({ totalSessions: 12, streak: 7, totalXP: 5000 }))
      .toEqual(['sessions_10', 'streak_7', 'rank_d', 'rank_c']);
  });
});
