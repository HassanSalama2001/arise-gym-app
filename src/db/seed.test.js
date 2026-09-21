import { describe, it, expect } from 'vitest';
import db from './db';
import { seedDatabase, EXERCISE_SEED_VERSION } from './seed';
import { exercises } from '../data/exercises';
import { correctiveExercises } from '../data/correctiveExercises';

describe('seedDatabase', () => {
  it('has a seed version that matches the data', () => {
    expect(EXERCISE_SEED_VERSION.startsWith(`${exercises.length}+${correctiveExercises.length}_`)).toBe(true);
  });

  it('seeds normalized exercises, correctives and a profile, and keeps custom exercises', async () => {
    await db.exercises.put({ id: 30000, name: 'Mine', muscleGroup: 'Back', isCustom: true });
    await seedDatabase();

    expect(await db.exercises.count()).toBe(exercises.length + correctiveExercises.length + 1);
    expect(await db.exercises.get(25)).toMatchObject({ muscleGroup: 'Chest', bodyPart: 'chest', difficulty: 'D' });
    expect(await db.exercises.get(10024)).toMatchObject({ name: 'Plank', muscleGroup: 'Corrective', isCorrective: true });
    expect(await db.exercises.get(30000)).toMatchObject({ name: 'Mine' });
    expect((await db.settings.get('exercise_seed_version')).value).toBe(EXERCISE_SEED_VERSION);
    expect(await db.playerProfile.get('profile')).toMatchObject({ name: 'Hunter', totalXP: 0 });
  });
});
