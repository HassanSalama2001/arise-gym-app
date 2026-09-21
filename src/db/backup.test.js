import { describe, it, expect, beforeEach } from 'vitest';
import db from './db';
import {
  USER_TABLES, EXCLUDED_TABLES, BACKUP_FORMAT,
  exportBackup, importBackup, parseBackup, hasLocalUserData, BackupError,
} from './backup';

async function resetDb() {
  await Promise.all(db.tables.map(t => t.clear()));
  await db.exercises.bulkPut([
    { id: 25, name: 'barbell bench press', muscleGroup: 'Chest' },
    { id: 652, name: 'pull-up', muscleGroup: 'Back' },
  ]);
  await db.settings.put({ key: 'exercise_seed_version', value: '1324+24_v6' });
}

async function seedUserData() {
  await db.playerProfile.put({ key: 'profile', name: 'Hunter', totalXP: 1200 });
  await db.settings.put({ key: 'rest_default', value: 90 });
  await db.exercises.put({ id: 100000, name: 'My Cable Thing', muscleGroup: 'Back', isCustom: true });
  const planId = await db.workoutPlans.add({ name: 'Push', createdAt: 1 });
  await db.planExercises.add({ planId, exerciseId: 25, order: 0 });
  const sessionId = await db.sessions.add({ planId, name: 'Push', startTime: 10, endTime: 20, date: '2026-09-01' });
  await db.sets.bulkAdd([
    { sessionId, exerciseId: 25, setNumber: 1, weight: 80, reps: 5, completed: 1 },
    { sessionId, exerciseId: 100000, setNumber: 1, weight: 30, reps: 12, completed: 1 },
  ]);
  await db.personalRecords.add({ exerciseId: 25, weight: 80, reps: 5, date: 10 });
  await db.exerciseNotes.add({ exerciseId: 25, planId, text: 'elbows in', createdAt: 5 });
  await db.meals.add({ date: '2026-09-01', type: 'lunch', calories: 700 });
  await db.hydration.add({ date: '2026-09-01', amount: 500 });
  await db.inbodyScans.add({ date: '2026-08-01', weight: 80, smm: 38, bf: 15 });
  await db.customPosturalIssues.put({ id: 'custom_1', name: 'Mine', correctiveProtocol: [{ exerciseId: 652 }] });
}

async function snapshot() {
  const out = {};
  for (const name of USER_TABLES) out[name] = await db.table(name).toArray();
  out.customExercises = await db.exercises.filter(e => !!e.isCustom).toArray();
  return out;
}

beforeEach(resetDb);

describe('table coverage', () => {
  it('classifies every table as backed up or excluded', () => {
    const classified = [...USER_TABLES, ...EXCLUDED_TABLES].sort();
    expect(db.tables.map(t => t.name).sort()).toEqual(classified);
  });
});

describe('export / import', () => {
  it('round-trips all user data, including meals, notes and custom exercises', async () => {
    await seedUserData();
    const before = await snapshot();
    const backup = JSON.parse(JSON.stringify(await exportBackup()));

    await resetDb();
    await importBackup(backup);

    expect(await snapshot()).toEqual(before);
  });

  it('replaces local data instead of merging into it', async () => {
    await seedUserData();
    const backup = await exportBackup();

    await db.sessions.add({ name: 'Extra', startTime: 99 });
    await db.meals.add({ date: '2026-09-02', type: 'dinner' });
    await db.exercises.put({ id: 100500, name: 'Local only', isCustom: true });
    await importBackup(backup);

    expect(await db.sessions.count()).toBe(1);
    expect(await db.meals.count()).toBe(1);
    expect(await db.exercises.get(100500)).toBeUndefined();
  });

  it('never exports or overwrites device settings', async () => {
    await seedUserData();
    await db.settings.put({ key: 'last_sync_time', value: 'local' });
    const backup = await exportBackup();
    expect(backup.tables.settings.map(s => s.key)).toEqual(['rest_default']);

    backup.tables.settings.push({ key: 'exercise_seed_version', value: 'other-device' });
    await importBackup(backup);
    expect((await db.settings.get('exercise_seed_version')).value).toBe('1324+24_v6');
    expect((await db.settings.get('last_sync_time')).value).toBe('local');
  });

  it('keeps built-in exercises when restoring', async () => {
    await seedUserData();
    await importBackup(await exportBackup());
    expect(await db.exercises.get(25)).toMatchObject({ name: 'barbell bench press' });
  });
});

describe('validation', () => {
  it.each([null, [], 'text', { format: 'something-else', schemaVersion: 1 }])('rejects %j', bad => {
    expect(() => parseBackup(bad)).toThrow(BackupError);
  });

  it('rejects backups from a newer app version', () => {
    expect(() => parseBackup({ format: BACKUP_FORMAT, schemaVersion: 99, tables: {} })).toThrow(/newer version/);
  });

  it('rejects an old-style file with no profile or sessions', () => {
    expect(() => parseBackup({ exportedAt: '2026-08-01T00:00:00Z' })).toThrow(BackupError);
  });

  it('leaves a failed import without touching local data', async () => {
    await seedUserData();
    await expect(importBackup({ format: BACKUP_FORMAT, schemaVersion: 99 })).rejects.toThrow();
    expect(await db.sessions.count()).toBe(1);
  });

  it('does not modify the object it is given', () => {
    const legacy = { profile: { key: 'profile' }, sets: [{ exerciseId: 1 }], settings: [{ key: 'exercise_seed_version', value: '371_v2' }] };
    const copy = structuredClone(legacy);
    parseBackup(legacy);
    expect(legacy).toEqual(copy);
  });
});

describe('older backups', () => {
  const legacyBackup = () => ({
    profile: [{ key: 'profile', name: 'Old Hunter' }],
    sessions: [{ id: 1, name: 'Push', startTime: 1 }],
    sets: [
      { id: 1, sessionId: 1, exerciseId: 1, weight: 60, reps: 8 },   // Barbell Bench Press -> 25
      { id: 2, sessionId: 1, exerciseId: 17, weight: 50, reps: 8 },  // Floor Press: no equivalent
      { id: 3, sessionId: 1, exerciseId: 10018, weight: 0, reps: 15 }, // Band Pull-Apart, same ID today
    ],
    planExercises: [{ id: 1, planId: 1, exerciseId: 64, order: 0 }], // Lateral Raise (Dumbbell) -> 334
    settings: [{ key: 'exercise_seed_version', value: '371_v2' }],
    exportedAt: '2026-08-10T00:00:00Z',
  });

  it('remaps pre-migration exercise IDs', () => {
    const { tables, legacyIds } = parseBackup(legacyBackup());
    expect(legacyIds).toBe(true);
    expect(tables.sets.map(s => s.exerciseId)).toEqual([25, 20017, 10018]);
    expect(tables.planExercises[0].exerciseId).toBe(334);
  });

  it('recreates unmapped old exercises as custom exercises under their old name', async () => {
    await importBackup(legacyBackup());
    expect(await db.exercises.get(20017)).toMatchObject({ name: 'Floor Press (Barbell)', muscleGroup: 'Chest', isCustom: true });
  });

  it('accepts the Settings-screen export, where profile is a single object', () => {
    const { tables } = parseBackup({ profile: { key: 'profile', name: 'X' }, sessions: [], exportedAt: '2026-09-01T00:00:00Z' });
    expect(tables.playerProfile).toEqual([{ key: 'profile', name: 'X' }]);
  });

  it('uses the export date when the seed version is missing', () => {
    const early = parseBackup({ profile: [{ key: 'profile' }], sets: [{ exerciseId: 1 }], exportedAt: '2026-06-01T00:00:00Z' });
    const late = parseBackup({ profile: [{ key: 'profile' }], sets: [{ exerciseId: 25 }], exportedAt: '2026-09-01T00:00:00Z' });
    expect(early.legacyIds).toBe(true);
    expect(late.legacyIds).toBe(false);
  });

  it('keeps history for custom exercises that old exports left out', async () => {
    await importBackup({
      profile: [{ key: 'profile' }],
      sets: [{ id: 1, sessionId: 1, exerciseId: 5210, weight: 20, reps: 10 }],
      settings: [{ key: 'exercise_seed_version', value: '1324_v3' }],
      exportedAt: '2026-08-20T00:00:00Z',
    });
    const [set] = await db.sets.toArray();
    expect(set.exerciseId).toBeGreaterThanOrEqual(100000);
    expect(await db.exercises.get(set.exerciseId)).toMatchObject({ name: 'Exercise #5210', isCustom: true });
  });

  it('moves custom exercises out of the seeded ID range, keeping references', async () => {
    await importBackup({
      format: 'arise-backup', schemaVersion: 1, exportedAt: '2026-09-01T00:00:00Z',
      tables: {
        playerProfile: [{ key: 'profile' }],
        sets: [{ id: 1, sessionId: 1, exerciseId: 5202, weight: 20, reps: 10 }, { id: 2, sessionId: 1, exerciseId: 25, weight: 60, reps: 5 }],
        planExercises: [{ id: 1, planId: 1, exerciseId: 5202, order: 0 }],
        customExercises: [{ id: 5202, name: 'Landmine Press', muscleGroup: 'Shoulders', isCustom: true }],
      },
    });
    const sets = await db.sets.orderBy('id').toArray();
    expect(sets.map(s => s.exerciseId)).toEqual([100000, 25]);
    expect((await db.planExercises.toArray())[0].exerciseId).toBe(100000);
    expect(await db.exercises.get(100000)).toMatchObject({ name: 'Landmine Press' });
    expect(await db.exercises.get(5202)).toBeUndefined();
  });
});

describe('personal records', () => {
  it('merges the duplicate PR rows older versions created', async () => {
    await importBackup({
      format: BACKUP_FORMAT, schemaVersion: 1, exportedAt: '2026-09-01T00:00:00Z',
      tables: {
        playerProfile: [{ key: 'profile' }],
        personalRecords: [
          { id: 1, exerciseId: 25, weight: 60, reps: 5, date: 1 },
          { id: 2, exerciseId: 25, weight: 80, reps: 8, date: 2 },
          { id: 3, exerciseId: 25, weight: 90, reps: 1, date: 3 },
        ],
      },
    });
    const rows = await db.personalRecords.toArray();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ weight: 80, reps: 8, maxWeight: 90 });
  });
});

describe('hasLocalUserData', () => {
  it('is false on a fresh device and true once something is logged', async () => {
    await db.playerProfile.put({ key: 'profile', name: 'Hunter' });
    expect(await hasLocalUserData()).toBe(false);
    await db.meals.add({ date: '2026-09-01', type: 'snack' });
    expect(await hasLocalUserData()).toBe(true);
  });
});
