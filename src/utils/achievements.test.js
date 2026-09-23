import { describe, it, expect, vi, beforeEach } from 'vitest';
import db from '../db/db';
import { checkAndUnlockAchievement, ACHIEVEMENT_DEFS } from './achievements';

const events = [];

beforeEach(async () => {
  events.length = 0;
  const target = new EventTarget();
  target.addEventListener('achievement_unlocked', e => events.push(e.detail));
  vi.stubGlobal('window', target);
  await Promise.all([db.achievements.clear(), db.playerProfile.clear()]);
  await db.playerProfile.put({ key: 'profile', totalXP: 1000 });
});

describe('checkAndUnlockAchievement', () => {
  it('unlocks once, awarding XP and announcing it', async () => {
    await checkAndUnlockAchievement('pr_first');
    await checkAndUnlockAchievement('pr_first');

    expect(await db.achievements.where('type').equals('pr_first').count()).toBe(1);
    expect((await db.playerProfile.get('profile')).totalXP).toBe(1000 + ACHIEVEMENT_DEFS.pr_first.xpAwarded);
    expect(events.map(e => e.type)).toEqual(['pr_first']);
  });

  it('ignores unknown achievement types', async () => {
    await checkAndUnlockAchievement('nope');
    expect(await db.achievements.count()).toBe(0);
    expect(events).toEqual([]);
  });
});
