import { toLocalDateString, parseLocalDate, addDays } from './date';

/**
 * Day cells for an activity heatmap, oldest first, always starting on a Monday so the
 * component can chop it into week columns. Each cell: { date, sessions, volume }.
 */
export function buildActivityCalendar(sessions, { weeks = 26, today = toLocalDateString() } = {}) {
  const byDate = new Map();
  for (const s of sessions || []) {
    if (!s.startTime) continue;
    const date = toLocalDateString(s.startTime);
    const cell = byDate.get(date) || { sessions: 0, volume: 0 };
    cell.sessions++;
    cell.volume += s.volume || 0;
    byDate.set(date, cell);
  }

  // Monday of the current week, then back `weeks - 1` weeks
  const todayDate = parseLocalDate(today);
  const mondayOffset = (todayDate.getDay() + 6) % 7;
  const start = addDays(today, -mondayOffset - (weeks - 1) * 7);

  return Array.from({ length: weeks * 7 }, (_, i) => {
    const date = addDays(start, i);
    const cell = byDate.get(date);
    return { date, sessions: cell?.sessions || 0, volume: cell?.volume || 0, future: date > today };
  });
}

/** Splits the calendar's days into week columns of 7 (Monday first). */
export function toWeekColumns(days) {
  const columns = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));
  return columns;
}

/** Training volume per muscle group for sessions started at or after `since` (ms; 0 = all time). */
export function muscleVolume(sets, sessions, exercisesById, since = 0) {
  const startTimes = new Map((sessions || []).map(s => [s.id, s.startTime]));
  const totals = {};
  for (const set of sets || []) {
    if (!set.completed) continue;
    const startTime = startTimes.get(set.sessionId);
    if (startTime === undefined || startTime < since) continue;
    const group = exercisesById[set.exerciseId]?.muscleGroup;
    if (!group) continue;
    totals[group] = (totals[group] || 0) + (set.weight || 0) * (set.reps || 0);
  }
  return totals;
}

export const VOLUME_PERIODS = {
  week: { label: 'WEEK', days: 7 },
  month: { label: 'MONTH', days: 30 },
  all: { label: 'ALL TIME', days: null },
};

export function periodStart(period, now = Date.now()) {
  const days = VOLUME_PERIODS[period]?.days;
  return days ? now - days * 86400000 : 0;
}
