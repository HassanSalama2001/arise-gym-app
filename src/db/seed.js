import db from './db';
import exerciseData from '../data/exercises';

let seedingPromise = null;

export async function seedDatabase() {
  if (seedingPromise) return seedingPromise;
  
  seedingPromise = (async () => {
    try {
      const count = await db.exercises.count();
      const seedVer = await db.settings.get('exercise_seed_version');
      const currentVer = exerciseData.length + '_v2';

      if (count === 0 || !seedVer || seedVer.value !== currentVer) {
        await db.exercises.bulkPut(exerciseData);
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
          hapticEnabled: true
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
