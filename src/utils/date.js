// Calendar dates are stored as local "YYYY-MM-DD" strings. Never derive them with toISOString(),
// which gives the UTC date (at UTC+3, 00:00–03:00 would count as the previous day).

/** Local calendar date of a Date or timestamp, as "YYYY-MM-DD". */
export function toLocalDateString(value = new Date()) {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Parses "YYYY-MM-DD" as local midnight (new Date("YYYY-MM-DD") would be UTC midnight). */
export function parseLocalDate(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Shifts a "YYYY-MM-DD" date by whole calendar days (DST-safe). */
export function addDays(dateString, days) {
  const d = parseLocalDate(dateString);
  d.setDate(d.getDate() + days);
  return toLocalDateString(d);
}

export function getToday() {
  return toLocalDateString(new Date());
}

export function getYesterday() {
  return addDays(getToday(), -1);
}
