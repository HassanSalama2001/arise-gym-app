import { describe, it, expect, beforeEach } from 'vitest';
import db from './db';
import { previewWorkoutImport, importWorkouts } from './importWorkouts';
import { CUSTOM_EXERCISE_ID_START } from './remap';

const hevyCsv = `title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe
"Push Day",2026-09-20T18:00:00,2026-09-20T19:10:00,,"Bench Press (Barbell)",,,0,normal,80,5,,,8
"Push Day",2026-09-20T18:00:00,2026-09-20T19:10:00,,"Prowler Sled Push",,,1,normal,0,,,30,
"Leg Day",2026-09-22T17:00:00,2026-09-22T18:00:00,,"Barbell Full Squat",,,0,normal,100,5,,,`;

beforeEach(async () => {
  await Promise.all(db.tables.map(t => t.clear()));
  await db.exercises.bulkPut([
    { id: 25, name: 'barbell bench press', muscleGroup: 'Chest' },
    { id: 43, name: 'barbell full squat', muscleGroup: 'Legs' },
  ]);
  await db.playerProfile.put({ key: 'profile', unitPreference: 'kg' });
});

describe('previewWorkoutImport', () => {
  it('summarises the file without writing anything', async () => {
    const preview = await previewWorkoutImport(hevyCsv);
    expect(preview).toMatchObject({ format: 'hevy', sessions: 2, sets: 3, matched: 2, alreadyImported: 0 });
    expect(preview.unmatched).toEqual(['Prowler Sled Push']);
    expect(await db.sessions.count()).toBe(0);
  });
});

describe('importWorkouts', () => {
  it('writes sessions and sets, and keeps unmatched exercises by name', async () => {
    const { parsed } = await previewWorkoutImport(hevyCsv);
    const result = await importWorkouts(parsed);
    expect(result).toMatchObject({ importedSessions: 2, importedSets: 3, createdExercises: 1 });

    const sessions = await db.sessions.orderBy('startTime').toArray();
    expect(sessions.map(s => s.name)).toEqual(['Push Day', 'Leg Day']);
    expect(sessions[0]).toMatchObject({ importedFrom: 'hevy', xpEarned: 0, volume: 400, date: '2026-09-20' });

    const sled = await db.exercises.where('name').equals('Prowler Sled Push').first();
    expect(sled.id).toBeGreaterThanOrEqual(CUSTOM_EXERCISE_ID_START);
    expect(sled).toMatchObject({ isCustom: true, importedFrom: 'hevy' });

    const pushSets = await db.sets.where('sessionId').equals(sessions[0].id).toArray();
    expect(pushSets.map(s => [s.exerciseId, s.weight, s.reps, s.rpe])).toEqual([[25, 80, 5, 8], [sled.id, 0, 0, null]]);
    expect(pushSets[1]).toMatchObject({ mode: 'time', duration: 30 });
  });

  it('does not import the same workouts twice', async () => {
    const first = await previewWorkoutImport(hevyCsv);
    await importWorkouts(first.parsed);
    const second = await previewWorkoutImport(hevyCsv);
    expect(second.alreadyImported).toBe(2);

    const result = await importWorkouts(second.parsed);
    expect(result.importedSessions).toBe(0);
    expect(await db.sessions.count()).toBe(2);
  });

  it('converts weights for a profile using pounds', async () => {
    await db.playerProfile.update('profile', { unitPreference: 'lbs' });
    const { parsed } = await previewWorkoutImport(hevyCsv);
    await importWorkouts(parsed);
    const benchSet = await db.sets.where('exerciseId').equals(25).first();
    expect(benchSet.weight).toBeCloseTo(176.37, 1); // 80 kg
  });
});
