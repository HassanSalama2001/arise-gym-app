import Dexie from 'dexie';

/**
 * Sync bookkeeping, deliberately in its own database.
 *
 * A Dexie transaction may only touch tables in its declared scope, so recording a tombstone from
 * inside an app transaction (which knows nothing about sync) would fail. A separate database has
 * its own transactions, so deletes anywhere in the app can leave a tombstone without callers
 * having to widen their scope. It also keeps sync state out of user backups.
 *
 *  tombstones  rows deleted locally, so the deletion reaches other devices
 *  state       cursors and ids: last pull time, last push time, device id
 */
const syncDb = new Dexie('AriseSyncDB');

syncDb.version(1).stores({
  tombstones: '++id, [table+uid], uid, deletedAt',
  state: 'key',
});

export async function getSyncState(key, fallback = null) {
  return (await syncDb.state.get(key))?.value ?? fallback;
}

export async function setSyncState(key, value) {
  await syncDb.state.put({ key, value });
}

/** Wipes sync bookkeeping (used when the user clears all data). */
export async function resetSyncDb() {
  await syncDb.delete();
  await syncDb.open();
}

export default syncDb;
