import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import db from './db';
import {
  finishWorkout, startWorkoutSession, correctiveBlocks, setRowsForSession, CORRECTIVE_RESOLVED_XP,
} from './workoutSession';

const NOW = new Date(2026, 8, 22, 18, 0).getTime(); // 18:00 local, Sep 22
const done = (weight, reps) => ({ weight, reps, type: 'normal', completed: true });

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  vi.stubGlobal('window', new EventTarget());
  await Promise.all(db.tables.map(t => t.clear()));
  await db.exercises.bulkPut([
    { id: 25, name: 'bench', muscleGroup: 'Chest' },
    { id: 43, name: 'squat', muscleGroup: 'Legs' },
    { id: 10018, name: 'Band Pull-Apart', muscleGroup: 'Corrective', isCorrective: true },
  ]);
  await db.playerProfile.put({
    key: 'profile', totalXP: 900, totalSessions: 9, totalVolume: 0,
    currentStreak: 2, longestStreak: 2, lastSessionDate: '2026-09-21',
  });
});

afterEach(() => vi.useRealTimers());

async function startSession() {
  return db.sessions.add({ name: 'Push', startTime: NOW - 30 * 60000, endTime: null });
}

describe('setRowsForSession', () => {
  it('stores completed sets and entered-but-unticked ones, skipping blanks', () => {
    const rows = setRowsForSession(7, { 25: [done(80, 5), { weight: 80, reps: 5, completed: false }, { weight: 0, reps: 0, completed: false }] });
    expect(rows.map(r => [r.exerciseId, r.setNumber, r.completed])).toEqual([[25, 1, 1], [25, 2, 0]]);
  });
});

describe('finishWorkout', () => {
  it('saves the session and updates XP, streak, totals and achievements', async () => {
    const sessionId = await startSession();
    const result = await finishWorkout({
      sessionId, startTime: NOW - 30 * 60000, sessionXP: 100,
      sets: { 25: [done(100, 5), done(100, 5)], 43: [done(120, 5)] },
    });

    // (100 set XP + 50 completion bonus) x 1.2 for a 2-day streak
    expect(result.finalXP).toBe(180);
    expect(result).toMatchObject({ totalVol: 1600, duration: 30 * 60000, prevXP: 900 });
    expect(await db.sets.where('sessionId').equals(sessionId).count()).toBe(3);
    expect(await db.sessions.get(sessionId)).toMatchObject({ endTime: NOW, volume: 1600, xpEarned: 180 });

    const profile = await db.playerProfile.get('profile');
    expect(profile).toMatchObject({ totalSessions: 10, currentStreak: 3, lastSessionDate: '2026-09-22', totalVolume: 1600 });
    // 900 + 180 = 1080 reaches rank D; 10 sessions unlocks Veteran; both award their own XP
    const unlocked = (await db.achievements.toArray()).map(a => a.type).sort();
    expect(unlocked).toEqual(['rank_d', 'sessions_10']);
  });

  it('progresses and completes today\'s quests, adding their XP', async () => {
    await db.dailyQuests.bulkAdd([
      { date: '2026-09-22', type: 'chest_sets', target: 3, current: 1, completed: false, xpReward: 50 },
      { date: '2026-09-22', type: 'train_legs', target: 1, current: 0, completed: false, xpReward: 70 },
      { date: '2026-09-22', type: 'fast_workout', target: 1, current: 0, completed: false, xpReward: 60 },
      { date: '2026-09-21', type: 'chest_sets', target: 3, current: 0, completed: false, xpReward: 50 },
    ]);
    const sessionId = await startSession();
    const result = await finishWorkout({
      sessionId, startTime: NOW - 30 * 60000, sessionXP: 0,
      sets: { 25: [done(60, 8), done(60, 8)], 43: [done(80, 8)] },
    });

    const quests = await db.dailyQuests.where('date').equals('2026-09-22').toArray();
    expect(quests.map(q => [q.type, q.current, q.completed])).toEqual([
      ['chest_sets', 3, true], ['train_legs', 1, true], ['fast_workout', 1, true],
    ]);
    expect(result.finalXP).toBe(Math.round(50 * 1.2) + 50 + 70 + 60);
    expect(result.prevQuests[0].current).toBe(1); // what Mission Complete compares against
    expect((await db.dailyQuests.where('date').equals('2026-09-21').first()).current).toBe(0);
  });

  it('advances postural issues whose protocol was trained, awarding XP when resolved', async () => {
    await db.userPosturalIssues.bulkAdd([
      { issueId: 'rounded_shoulders', status: 'active', completedSessions: 29, targetSessions: 30 },
      { issueId: 'flat_feet', status: 'active', completedSessions: 0, targetSessions: 30 },
    ]);
    const protocol = (await import('../data/posturalIssues')).default.find(i => i.id === 'rounded_shoulders').correctiveProtocol;

    const sessionId = await startSession();
    const result = await finishWorkout({
      sessionId, startTime: NOW - 30 * 60000, sessionXP: 0,
      sets: { [protocol[0].exerciseId]: [done(0, 15)] },
    });

    const [rounded, feet] = await db.userPosturalIssues.orderBy('id').toArray();
    expect(rounded).toMatchObject({ completedSessions: 30, status: 'resolved' });
    expect(feet).toMatchObject({ completedSessions: 0, status: 'active' });
    // the resolution XP is part of what the player is shown
    expect(result.finalXP).toBe(Math.round(50 * 1.2) + CORRECTIVE_RESOLVED_XP);
  });

  it('restarts a broken streak', async () => {
    await db.playerProfile.update('profile', { lastSessionDate: '2026-09-18', currentStreak: 6 });
    const sessionId = await startSession();
    await finishWorkout({ sessionId, startTime: NOW - 60000, sessionXP: 0, sets: {} });
    expect((await db.playerProfile.get('profile')).currentStreak).toBe(1);
  });
});

describe('correctiveBlocks', () => {
  const issues = [
    { id: 'a', correctiveProtocol: [{ exerciseId: 10018, sets: 3, reps: '15 reps' }, { exerciseId: 999, sets: 2, reps: '10' }] },
    { id: 'b', correctiveProtocol: [{ exerciseId: 10018, sets: 2, reps: '30s hold' }] },
  ];
  const byId = { 10018: { id: 10018, name: 'Band Pull-Apart' } };

  it('places exercises by position, once each, skipping unknown exercises', () => {
    const out = correctiveBlocks([{ issueId: 'a', position: 'both' }, { issueId: 'b', position: 'warmup' }], issues, byId);
    expect(out.warmup.map(e => e.id)).toEqual([10018]);
    expect(out.cooldown.map(e => e.id)).toEqual([10018]);
    expect(out.warmup[0]).toMatchObject({ isCorrective: true, issueId: 'a' });
  });

  it('pre-fills sets from the protocol, reading numbers out of text like "30s hold"', () => {
    const out = correctiveBlocks([{ issueId: 'b', position: 'warmup' }], issues, byId);
    expect(out.sets[10018]).toHaveLength(2);
    expect(out.sets[10018][0]).toMatchObject({ reps: 30, weight: 0, completed: false });
  });
});

describe('startWorkoutSession', () => {
  it('creates the session (with its plan) and lays out warm-up, plan and cool-down blocks', async () => {
    await db.userPosturalIssues.add({ issueId: 'rounded_shoulders', status: 'active', position: 'warmup', completedSessions: 0, targetSessions: 30 });
    const protocol = (await import('../data/posturalIssues')).default.find(i => i.id === 'rounded_shoulders').correctiveProtocol;
    await db.exercises.bulkPut(protocol.map(p => ({ id: p.exerciseId, name: p.name, muscleGroup: 'Corrective' })));
    await db.dailyQuests.add({ date: '2026-09-22', type: 'chest_sets', target: 3, current: 0, completed: false, xpReward: 50 });

    const session = await startWorkoutSession({
      planName: 'Push', planId: 4,
      exercises: [{ id: 25, name: 'bench', targetSets: 4, targetReps: 8 }],
    });

    expect(await db.sessions.get(session.sessionId)).toMatchObject({ planId: 4, name: 'Push', startTime: NOW, endTime: null });
    expect(session.blocks.map(b => b[0].id)).toEqual([...protocol.map(p => p.exerciseId), 25]);
    expect(session.sets[25]).toHaveLength(4);
    expect(session.sets[25][0]).toMatchObject({ reps: 8, weight: 0 });
    expect(session.todayQuests.map(q => q.type)).toEqual(['chest_sets']);
  });
});
