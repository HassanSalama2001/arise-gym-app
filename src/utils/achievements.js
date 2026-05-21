import db from '../db/db';

export const ACHIEVEMENT_DEFS = {
  rank_d: { type: 'rank_d', title: 'Iron Hunter', desc: 'Reach Rank D', icon: '🥉', xpAwarded: 100 },
  rank_c: { type: 'rank_c', title: 'Bronze Slayer', desc: 'Reach Rank C', icon: '🥈', xpAwarded: 250 },
  rank_b: { type: 'rank_b', title: 'Silver Raider', desc: 'Reach Rank B', icon: '🥇', xpAwarded: 500 },
  rank_a: { type: 'rank_a', title: 'Gold Monarch', desc: 'Reach Rank A', icon: '👑', xpAwarded: 1000 },
  rank_s: { type: 'rank_s', title: 'Shadow Elite', desc: 'Reach Rank S', icon: '⚡', xpAwarded: 2000 },
  streak_7: { type: 'streak_7', title: '7-Day Streak', desc: 'Train 7 days in a row', icon: '🔥', xpAwarded: 150 },
  streak_30: { type: 'streak_30', title: '30-Day Streak', desc: 'Train 30 days in a row', icon: '🌟', xpAwarded: 1000 },
  sessions_10: { type: 'sessions_10', title: 'Veteran', desc: 'Complete 10 sessions', icon: '🎖️', xpAwarded: 200 },
  sessions_50: { type: 'sessions_50', title: 'Elite', desc: 'Complete 50 sessions', icon: '💎', xpAwarded: 1000 },
  pr_first: { type: 'pr_first', title: 'First PR', desc: 'Set your first personal record', icon: '🏆', xpAwarded: 50 },
};

export async function checkAndUnlockAchievement(type) {
  const def = ACHIEVEMENT_DEFS[type];
  if (!def) return;
  
  const existing = await db.achievements.where('type').equals(type).first();
  if (!existing) {
    await db.achievements.add({
      type,
      title: def.title,
      date: new Date().toISOString(),
      xpAwarded: def.xpAwarded
    });
    
    const profile = await db.playerProfile.get('profile');
    if (profile) {
      await db.playerProfile.update('profile', {
        totalXP: (profile.totalXP || 0) + def.xpAwarded
      });
    }
    
    // Dispatch event to show popup
    window.dispatchEvent(new CustomEvent('achievement_unlocked', { detail: def }));
  }
}
