import db from '../db/db';

export const ACHIEVEMENT_DEFS = {
  rank_d: { type: 'rank_d', title: 'Iron Hunter', desc: 'Reach Rank D', icon: '🥉' },
  rank_c: { type: 'rank_c', title: 'Bronze Slayer', desc: 'Reach Rank C', icon: '🥈' },
  rank_b: { type: 'rank_b', title: 'Silver Raider', desc: 'Reach Rank B', icon: '🥇' },
  rank_a: { type: 'rank_a', title: 'Gold Monarch', desc: 'Reach Rank A', icon: '👑' },
  rank_s: { type: 'rank_s', title: 'Shadow Elite', desc: 'Reach Rank S', icon: '⚡' },
  streak_7: { type: 'streak_7', title: '7-Day Streak', desc: 'Train 7 days in a row', icon: '🔥' },
  streak_30: { type: 'streak_30', title: '30-Day Streak', desc: 'Train 30 days in a row', icon: '🌟' },
  sessions_10: { type: 'sessions_10', title: 'Veteran', desc: 'Complete 10 sessions', icon: '🎖️' },
  sessions_50: { type: 'sessions_50', title: 'Elite', desc: 'Complete 50 sessions', icon: '💎' },
  pr_first: { type: 'pr_first', title: 'First PR', desc: 'Set your first personal record', icon: '🏆' },
};

export async function checkAndUnlockAchievement(type) {
  const def = ACHIEVEMENT_DEFS[type];
  if (!def) return;
  
  const existing = await db.achievements.where('type').equals(type).first();
  if (!existing) {
    await db.achievements.add({
      type,
      title: def.title,
      date: Date.now()
    });
    
    // Dispatch event to show popup
    window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: def }));
  }
}
