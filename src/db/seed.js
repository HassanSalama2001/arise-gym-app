import db from './db';
import exerciseData from '../data/exercises';

let seedingPromise = null;

export async function seedDatabase() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    const count = await db.exercises.count();
    if (count === 0) {
      await db.exercises.bulkAdd(exerciseData);
    } else if (count > exerciseData.length) {
      // Fix duplicates from StrictMode double-invoke
      await db.exercises.clear();
      await db.exercises.bulkAdd(exerciseData);
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
  })();
  return seedingPromise;
}
