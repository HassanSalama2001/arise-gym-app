import { describe, it, expect } from 'vitest';
import { buildActivityCalendar, toWeekColumns, muscleVolume, periodStart } from './progressStats';
import { toLocalDateString, parseLocalDate } from './date';

const at = (dateString, hour = 12) => {
  const d = parseLocalDate(dateString);
  d.setHours(hour);
  return d.getTime();
};

describe('buildActivityCalendar', () => {
  it('covers whole weeks, starting on a Monday and ending this week', () => {
    const days = buildActivityCalendar([], { weeks: 4, today: '2026-09-23' }); // a Wednesday
    expect(days).toHaveLength(28);
    expect(parseLocalDate(days[0].date).getDay()).toBe(1); // Monday
    expect(days[0].date).toBe('2026-08-31'); // 3 weeks before the Monday of this week
    expect(days.at(-1).date).toBe('2026-09-27'); // Sunday of the current week
  });

  it('counts sessions and volume on their local day, and marks days ahead of today', () => {
    const sessions = [
      { id: 1, startTime: at('2026-09-21', 7), volume: 1000 },
      { id: 2, startTime: at('2026-09-21', 19), volume: 500 },
      { id: 3, startTime: at('2026-09-22', 0), volume: 250 }, // just after local midnight
    ];
    const days = buildActivityCalendar(sessions, { weeks: 2, today: '2026-09-23' });
    const byDate = Object.fromEntries(days.map(d => [d.date, d]));
    expect(byDate['2026-09-21']).toMatchObject({ sessions: 2, volume: 1500, future: false });
    expect(byDate['2026-09-22']).toMatchObject({ sessions: 1, volume: 250 });
    expect(byDate['2026-09-24'].future).toBe(true);
    expect(byDate[toLocalDateString(at('2026-09-23'))].future).toBe(false);
  });

  it('splits into week columns of seven', () => {
    const columns = toWeekColumns(buildActivityCalendar([], { weeks: 3, today: '2026-09-23' }));
    expect(columns).toHaveLength(3);
    expect(columns.every(c => c.length === 7)).toBe(true);
  });
});

describe('muscleVolume', () => {
  const exercisesById = { 25: { muscleGroup: 'Chest' }, 43: { muscleGroup: 'Legs' } };
  const sessions = [{ id: 1, startTime: 1000 }, { id: 2, startTime: 5000 }];
  const sets = [
    { sessionId: 1, exerciseId: 25, weight: 100, reps: 5, completed: 1 },
    { sessionId: 2, exerciseId: 25, weight: 60, reps: 10, completed: 1 },
    { sessionId: 2, exerciseId: 43, weight: 100, reps: 5, completed: 1 },
    { sessionId: 2, exerciseId: 43, weight: 100, reps: 5, completed: 0 }, // not completed
    { sessionId: 9, exerciseId: 25, weight: 50, reps: 5, completed: 1 },  // orphan session
  ];

  it('totals completed sets by muscle group', () => {
    expect(muscleVolume(sets, sessions, exercisesById)).toEqual({ Chest: 1100, Legs: 500 });
  });

  it('respects the period cutoff', () => {
    expect(muscleVolume(sets, sessions, exercisesById, 2000)).toEqual({ Chest: 600, Legs: 500 });
  });

  it('handles empty input', () => {
    expect(muscleVolume(undefined, undefined, {})).toEqual({});
  });
});

describe('periodStart', () => {
  it('returns 0 for all time and a cutoff otherwise', () => {
    expect(periodStart('all', 1_000_000)).toBe(0);
    expect(periodStart('week', 10 * 86400000)).toBe(3 * 86400000);
  });
});
