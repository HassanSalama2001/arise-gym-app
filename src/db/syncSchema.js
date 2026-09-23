// Which tables take part in per-record sync, and how their rows point at each other.
//
// Every synced row carries:
//   uid       a UUID that identifies the row on every device (local primary keys stay local)
//   updatedAt ms timestamp of the last local change, used to settle conflicts (last write wins)
//
// `refs` maps a field holding a local primary key to the table it points at. Those fields are
// translated to the target row's uid when pushing, and back to a local id when pulling.

export const SYNC_TABLES = {
  playerProfile: { keyPath: 'key', refs: {} },
  settings: { keyPath: 'key', refs: {} },
  workoutPlans: { refs: {} },
  planExercises: { refs: { planId: 'workoutPlans', exerciseId: 'exercises' } },
  sessions: { refs: { planId: 'workoutPlans' } },
  sets: { refs: { sessionId: 'sessions', exerciseId: 'exercises' } },
  personalRecords: { refs: { exerciseId: 'exercises' } },
  exerciseNotes: { refs: { exerciseId: 'exercises', planId: 'workoutPlans' } },
  achievements: { refs: {} },
  dailyQuests: { refs: {} },
  bodyWeight: { refs: {} },
  inbodyScans: { refs: {} },
  measurements: { refs: {} },
  userPosturalIssues: { refs: {} },
  customPosturalIssues: { keyPath: 'id', refs: {} },
  meals: { refs: {} },
  hydration: { refs: {} },
  // Only user-created exercises sync; seeded ones exist on every device already.
  exercises: { refs: {}, onlyCustom: true },
};

export const SYNC_TABLE_NAMES = Object.keys(SYNC_TABLES);

/** Settings keys that describe this device and must never sync. */
export const DEVICE_SETTINGS = new Set(['exercise_seed_version', 'last_sync_time', 'sync_cursor', 'device_id']);

/** True when this row should be synced at all. */
export function isSyncable(table, row) {
  if (!row) return false;
  if (SYNC_TABLES[table]?.onlyCustom && !row.isCustom) return false;
  if (table === 'settings' && DEVICE_SETTINGS.has(row.key)) return false;
  return true;
}

export function newUid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'uid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
