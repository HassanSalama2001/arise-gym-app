import db from './db';
import { exercises as exerciseData } from '../data/exercises';
import { normalizeMuscleGroup } from '../data/muscleGroups';
import { correctiveExercises } from '../data/correctiveExercises';

let seedingPromise = null;

export async function seedDatabase() {
  if (seedingPromise) return seedingPromise;
  
  seedingPromise = (async () => {
    try {
      const count = await db.exercises.count();
      const seedVer = await db.settings.get('exercise_seed_version');
      const currentVer = `${exerciseData.length}+${correctiveExercises.length}_v5`;

      if (count === 0 || !seedVer || seedVer.value !== currentVer) {
        await db.exercises.bulkPut(exerciseData.map(ex => ({
          ...ex,
          bodyPart: ex.muscleGroup,
          muscleGroup: normalizeMuscleGroup(ex.muscleGroup),
        })));
        await db.exercises.bulkPut(correctiveExercises);
        await db.settings.put({ key: 'exercise_seed_version', value: currentVer });
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
