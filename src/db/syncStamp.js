import syncDb from './syncDb';
import { SYNC_TABLES, SYNC_TABLE_NAMES, isSyncable, newUid } from './syncSchema';

/**
 * Dexie middleware that keeps synced rows ready to sync:
 *  - stamps `uid` and `updatedAt` on every create/update
 *  - writes a tombstone when a synced row is deleted, so the delete reaches other devices
 *
 * Screens keep using db.<table>.add/put/update/delete as before.
 */
let applyingRemote = false;

/** While true, rows are written exactly as received (no re-stamping, no tombstones). */
export function setApplyingRemote(value) {
  applyingRemote = value;
}

export function syncStampMiddleware() {
  return {
    stack: 'dbcore',
    name: 'syncStamp',
    create(core) {
      return {
        ...core,
        table(tableName) {
          const table = core.table(tableName);
          if (!SYNC_TABLE_NAMES.includes(tableName)) return table;

          const primaryKeyOf = row => table.schema.primaryKey.extractKey?.(row);

          return {
            ...table,
            async mutate(req) {
              if (applyingRemote) return table.mutate(req);

              if (req.type === 'put' || req.type === 'add') {
                const now = Date.now();
                req = {
                  ...req,
                  values: req.values.map(row => {
                    if (!isSyncable(tableName, row)) return row;
                    return { ...row, uid: row.uid || newUid(), updatedAt: row.updatedAt ?? now };
                  }),
                };
              }

              if (req.type === 'delete') {
                // Read the rows first: once they're gone we can't know their uids.
                const existing = await table.getMany({ trans: req.trans, keys: req.keys });
                const doomed = existing.filter(row => row?.uid && isSyncable(tableName, row));
                const result = await table.mutate(req);
                if (doomed.length) {
                  const now = Date.now();
                  // Written after the delete and deliberately not awaited: awaiting another
                  // database inside this transaction would let IndexedDB commit it early.
                  recordTombstones(doomed.map(row => ({
                    table: tableName,
                    uid: row.uid,
                    localKey: primaryKeyOf(row),
                    deletedAt: now,
                  })));
                }
                return result;
              }

              return table.mutate(req);
            },
          };
        },
      };
    },
  };
}

/** Queues tombstones for deleted rows; failures are logged, never thrown into the app's delete. */
export function recordTombstones(rows) {
  pendingTombstones = pendingTombstones
    .then(() => syncDb.tombstones.bulkPut(rows))
    .catch(err => console.error('Failed to record deletions for sync:', err));
  return pendingTombstones;
}

let pendingTombstones = Promise.resolve();

/** Resolves once queued tombstone writes have been flushed (used before syncing and in tests). */
export function tombstonesWritten() {
  return pendingTombstones;
}

/** Dexie upgrade step: give existing rows a uid and updatedAt so they can sync. */
export async function stampExistingRows(tx) {
  const now = Date.now();
  for (const name of SYNC_TABLE_NAMES) {
    const table = tx.table(name);
    await table.toCollection().modify(row => {
      if (!isSyncable(name, row)) return;
      if (!row.uid) row.uid = newUid();
      if (!row.updatedAt) row.updatedAt = now;
    });
  }
}

/** Fields of `row` that point at other synced rows. */
export function refFields(table) {
  return SYNC_TABLES[table]?.refs ?? {};
}
