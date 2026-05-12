import db from '../db/db';

async function canVibrate() {
  if (!navigator.vibrate) return false;
  try {
    const profile = await db.playerProfile.get('profile');
    return profile?.hapticEnabled !== false; // true by default
  } catch {
    return true;
  }
}

// Light tap for button clicks
export async function hapticClick() {
  if (await canVibrate()) navigator.vibrate(10);
}

// Medium tap for setting completion
export async function hapticSetComplete() {
  if (await canVibrate()) navigator.vibrate([30, 50, 30]);
}

// Heavy vibration for leveling up / major achievements
export async function hapticLevelUp() {
  if (await canVibrate()) navigator.vibrate([100, 50, 100, 50, 200]);
}

// Error / Warning vibration
export async function hapticError() {
  if (await canVibrate()) navigator.vibrate([50, 100, 50, 100, 50]);
}
