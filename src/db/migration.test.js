import { describe, it, expect, beforeAll } from 'vitest';
import Dexie from 'dexie';
import { LEGACY_CUSTOM_ID_BASE } from './remap';

// Schema as it was before v11 (the unified-dataset migration).
function declareV7(d) {
  d.version(1).stores({
    exercises: '++id, name, muscleGroup, difficulty',
    workoutPlans: '++id, name, createdAt',
    planExercises: '++id, planId, exerciseId, order',
    sessions: '++id, planId, name, startTime, endTime',
    sets: '++id, sessionId, exerciseId, setNumber, weight, reps, completed',
    bodyWeight: '++id, date, weight',
    personalRecords: '++id, exerciseId, weight, reps, date',
    settings: 'key',
    videoNotes: '++id, exerciseId, videoUri, uploadedAt',
    playerProfile: 'key',
    achievements: '++id, type, title, date, xpAwarded',
    dailyQuests: '++id, date, type, target, current, completed, xpReward',
  });
  d.version(2).stores({ inbodyScans: '++id, date', measurements: '++id, date' });
  d.version(3).stores({
    videoNotes: null,
    sessions: '++id, planId, name, startTime, endTime, date',
    sets: '++id, sessionId, exerciseId, [sessionId+exerciseId], setNumber, weight, reps, completed',
  });
  d.version(4).stores({ userPosturalIssues: '++id, issueId, addedAt, status, targetSessions, completedSessions, position' });
  d.version(5).stores({ customPosturalIssues: 'id, name, category, icon, severity, timeline, targetSessionsDefault' });
  d.version(6).stores({ meals: '++id, date, type', hydration: '++id, date', mealSuggestions: '++id, mealType' });
  d.version(7).stores({ exerciseNotes: '++id, exerciseId, planId, createdAt', exerciseImageCache: 'exerciseId' });
}

let db;

beforeAll(async () => {
  await Dexie.delete('AriseDB');
  const old = new Dexie('AriseDB');
  declareV7(old);
  await old.open();
  await old.exercises.bulkPut([
    { id: 1, name: 'Barbell Bench Press', muscleGroup: 'Chest' },
    { id: 17, name: 'Floor Press (Barbell)', muscleGroup: 'Chest' },
    { id: 10021, name: 'My Band Thing', muscleGroup: 'Corrective', isCustom: true },
    { id: 10022, name: 'Unused Custom', muscleGroup: 'Back', isCustom: true },
  ]);
  await old.sessions.add({ id: 1, name: 'Push', startTime: 1 });
  await old.sets.bulkAdd([
    { sessionId: 1, exerciseId: 1, setNumber: 1, weight: 60, reps: 8 },
    { sessionId: 1, exerciseId: 17, setNumber: 2, weight: 50, reps: 8 },
    { sessionId: 1, exerciseId: 10021, setNumber: 3, weight: 0, reps: 15 },
  ]);
  await old.planExercises.add({ planId: 1, exerciseId: 64, order: 0 });
  await old.personalRecords.add({ exerciseId: 1, weight: 60, reps: 8, date: 1 });
  await old.exerciseNotes.add({ exerciseId: 1, planId: 1, text: 'arch', createdAt: 1 });
  await old.customPosturalIssues.put({ id: 'custom_1', name: 'Mine', correctiveProtocol: [{ exerciseId: 10018 }, { exerciseId: 10021 }] });
  await old.meals.add({ date: '2026-07-01', type: 'lunch' });
  old.close();

  db = (await import('./db')).default;
  await db.open();
});

describe('v11 migration from the old exercise dataset', () => {
  it('keeps workout history instead of deleting it', async () => {
    expect(await db.sessions.count()).toBe(1);
    expect(await db.sets.count()).toBe(3);
    expect(await db.meals.count()).toBe(1);
    expect(await db.exerciseNotes.count()).toBe(1);
  });

  it('points history at the current exercise IDs', async () => {
    const sets = await db.sets.orderBy('setNumber').toArray();
    expect(sets.map(s => s.exerciseId)).toEqual([25, LEGACY_CUSTOM_ID_BASE + 17, LEGACY_CUSTOM_ID_BASE + 10021]);
    expect((await db.planExercises.toArray())[0].exerciseId).toBe(334);
    expect((await db.personalRecords.toArray())[0].exerciseId).toBe(25);
    expect((await db.exerciseNotes.toArray())[0].exerciseId).toBe(25);
  });

  it('remaps exercises inside custom corrective protocols', async () => {
    const issue = await db.customPosturalIssues.get('custom_1');
    expect(issue.correctiveProtocol.map(p => p.exerciseId)).toEqual([10018, LEGACY_CUSTOM_ID_BASE + 10021]);
  });

  it('keeps custom exercises (with their names) out of the reserved corrective range', async () => {
    expect(await db.exercises.get(LEGACY_CUSTOM_ID_BASE + 10021)).toMatchObject({ name: 'My Band Thing', isCustom: true });
    expect(await db.exercises.get(LEGACY_CUSTOM_ID_BASE + 10022)).toMatchObject({ name: 'Unused Custom', isCustom: true });
    expect(await db.exercises.get(LEGACY_CUSTOM_ID_BASE + 17)).toMatchObject({ name: 'Floor Press (Barbell)', isCustom: true });
    expect(await db.exercises.get(10021)).toBeUndefined(); // left for the seeded Bird Dog
  });
});
