import { describe, it, expect, vi, afterEach } from 'vitest';
import { toLocalDateString, parseLocalDate, addDays, getToday, getYesterday } from './date';

afterEach(() => vi.useRealTimers());

describe('local dates', () => {
  it('formats the local calendar date, not the UTC one', () => {
    // 00:30 local on Sep 22 (built from local parts, so this holds in any time zone)
    const justAfterMidnight = new Date(2026, 8, 22, 0, 30);
    expect(toLocalDateString(justAfterMidnight)).toBe('2026-09-22');
    expect(toLocalDateString(justAfterMidnight.getTime())).toBe('2026-09-22');
  });

  it('parses YYYY-MM-DD as local midnight', () => {
    const d = parseLocalDate('2026-09-22');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 8, 22, 0]);
  });

  it('adds calendar days across month and year ends', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('gives today and yesterday from the local clock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 2, 1, 1, 15)); // 01:15 local, Mar 1
    expect(getToday()).toBe('2026-03-01');
    expect(getYesterday()).toBe('2026-02-28');
  });
});
