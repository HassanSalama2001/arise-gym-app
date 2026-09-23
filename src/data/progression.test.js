import { describe, it, expect } from 'vitest';
import { RANKS, getRankInfo, getRankColor, calculateSetXP, generateDailyQuests, QUEST_TEMPLATES } from './progression';

describe('ranks', () => {
  it('starts at E with progress toward D', () => {
    const info = getRankInfo(500);
    expect(info.current.rank).toBe('E');
    expect(info.next.rank).toBe('D');
    expect(info.progress).toBeCloseTo(0.5);
  });

  it('promotes exactly at the threshold', () => {
    expect(getRankInfo(999).current.rank).toBe('E');
    expect(getRankInfo(1000).current.rank).toBe('D');
    expect(getRankInfo(1000).xpIntoRank).toBe(0);
  });

  it('caps at the top rank with full progress', () => {
    const top = RANKS[RANKS.length - 1];
    const info = getRankInfo(top.xpRequired * 10);
    expect(info.current).toBe(top);
    expect(info.next).toBeNull();
    expect(info.progress).toBe(1);
  });

  it('handles a missing XP total', () => {
    expect(getRankInfo(undefined).current.rank).toBe('E');
  });

  it('falls back to rank E colour', () => {
    expect(getRankColor('nope')).toBe('var(--rank-e)');
  });
});

describe('calculateSetXP', () => {
  it('scales weighted sets by volume / 10', () => {
    expect(calculateSetXP(100, 5)).toBe(50);
  });

  it('scales bodyweight sets by reps', () => {
    expect(calculateSetXP(0, 12)).toBe(24);
  });

  it('awards at least 5 XP', () => {
    expect(calculateSetXP(5, 1)).toBe(5);
    expect(calculateSetXP(0, 1)).toBe(5);
  });
});

describe('generateDailyQuests', () => {
  it('gives three different quests for the day', () => {
    const quests = generateDailyQuests('2026-09-22');
    expect(quests).toHaveLength(3);
    expect(new Set(quests.map(q => q.type)).size).toBe(3);
    for (const q of quests) {
      expect(QUEST_TEMPLATES.map(t => t.type)).toContain(q.type);
      expect(q).toMatchObject({ date: '2026-09-22', current: 0, completed: false });
    }
  });

  it('is the same all day and varies between days', () => {
    const types = d => generateDailyQuests(d).map(q => q.type).join();
    expect(types('2026-09-22')).toBe(types('2026-09-22'));
    const week = ['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26'].map(types);
    expect(new Set(week).size).toBeGreaterThan(1);
  });
});
