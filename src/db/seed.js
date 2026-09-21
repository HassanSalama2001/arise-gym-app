import db from './db';

// Bump when the exercise dataset or how it is seeded changes. Kept separate from the data so a normal boot
// can skip loading the (large) dataset. referentialIntegrity.test.js checks it matches the data.
export const EXERCISE_SEED_VERSION = '1324+24_v6';

let seedingPromise = null;

async function seedExercises() {
  const [{ exercises }, { correctiveExercises }, { normalizeMuscleGroup }, { deriveDifficulty }] = await Promise.all([
    import('../data/exercises'),
    import('../data/correctiveExercises'),
    import('../data/muscleGroups'),
    import('../data/difficulty'),
  ]);
  const rows = [
    ...exercises.map(ex => ({
      ...ex,
      bodyPart: ex.muscleGroup,
      muscleGroup: normalizeMuscleGroup(ex.muscleGroup),
      difficulty: ex.difficulty ?? deriveDifficulty(ex),
    })),
    ...correctiveExercises.map(ex => ({ ...ex, difficulty: deriveDifficulty(ex) })),
  ];
  await db.transaction('rw', db.exercises, db.settings, async () => {
    await db.exercises.bulkPut(rows);
    await db.settings.put({ key: 'exercise_seed_version', value: EXERCISE_SEED_VERSION });
  });
}

export async function seedDatabase() {
  if (seedingPromise) return seedingPromise;

  seedingPromise = (async () => {
    try {
      const count = await db.exercises.count();
      const seedVer = await db.settings.get('exercise_seed_version');

      if (count === 0 || seedVer?.value !== EXERCISE_SEED_VERSION) {
        await seedExercises();
      }

      const profile = await db.playerProfile.get('profile');
      if (!profile) {
        await db.playerProfile.put({
          key: 'profile',
          name: 'Hunter',
          totalXP: 0,
          currentRank: 'E',
          rankName: 'Awakened',
          currentStreak: 0,
          longestStreak: 0,
          totalSessions: 0,
          totalVolume: 0,
          lastSessionDate: null,
          unitPreference: 'kg',
          defaultRestDuration: 60,
          hapticEnabled: true,
          gender: null,
          dob: null,
          height: null,
          activityLevel: null,
          calorieGoal: null,
          proteinGoal: null,
          carbsGoal: null,
          fatGoal: null,
          waterGoal: 3000,
          nutritionGoalType: null
        });
      }
    } catch (error) {
      seedingPromise = null;
      console.error('Database seeding failed:', error);
      throw error;
    }
  })();

  return seedingPromise;
}
