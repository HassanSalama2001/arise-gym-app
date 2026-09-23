import db from './db';
import syncDb, { getSyncState, setSyncState } from './syncDb';
import { SYNC_TABLE_NAMES, SYNC_TABLES, isSyncable } from './syncSchema';
import { setApplyingRemote, tombstonesWritten } from './syncStamp';

// Parents before children, so a pulled row can resolve what it points at.
const APPLY_ORDER = ['exercises', 'workoutPlans', 'sessions', ...SYNC_TABLE_NAMES.filter(
  t => !['exercises', 'workoutPlans', 'sessions'].includes(t)
)];

const UID_REF = 'uid:';

function primaryKeyPath(table) {
  return SYNC_TABLES[table]?.keyPath ?? 'id';
}

/** Local row -> the record shape stored in the cloud (local keys removed, references as uids). */
async function toRecord(table, row) {
  const data = { ...row };
  delete data.updatedAt;
  const keyPath = primaryKeyPath(table);
  if (keyPath === 'id') delete data.id;

  for (const [field, targetTable] of Object.entries(SYNC_TABLES[table].refs)) {
    const value = row[field];
    if (value === undefined || value === null) continue;
    const target = await db.table(targetTable).get(value);
    // Seeded rows (built-in exercises) have the same id everywhere, so they travel as-is.
    data[field] = target?.uid ? UID_REF + target.uid : value;
  }

  return { table, uid: row.uid, updatedAt: row.updatedAt ?? Date.now(), deleted: false, data };
}

/** Record from the cloud -> a row for this device (uid references resolved to local keys). */
async function toLocalRow(table, record) {
  const row = { ...record.data, uid: record.uid, updatedAt: record.updatedAt };

  for (const field of Object.keys(SYNC_TABLES[table].refs)) {
    const value = row[field];
    if (typeof value !== 'string' || !value.startsWith(UID_REF)) continue;
    const targetTable = SYNC_TABLES[table].refs[field];
    const target = await db.table(targetTable).where('uid').equals(value.slice(UID_REF.length)).first();
    if (!target) return null; // its parent hasn't arrived yet; try again on the next pass
    row[field] = target[primaryKeyPath(targetTable)];
  }

  return row;
}

/** Local changes since the last push: edited rows and deletions. */
export async function collectLocalChanges(since = 0) {
  const records = [];

  for (const table of SYNC_TABLE_NAMES) {
    const rows = await db.table(table)
      .where('updatedAt').above(since)
      .filter(row => isSyncable(table, row))
      .toArray();
    for (const row of rows) records.push(await toRecord(table, row));
  }

  const tombstones = await syncDb.tombstones.where('deletedAt').above(since).toArray();
  for (const tombstone of tombstones) {
    records.push({
      table: tombstone.table,
      uid: tombstone.uid,
      updatedAt: tombstone.deletedAt,
      deleted: true,
      data: null,
    });
  }

  return records.sort((a, b) => a.updatedAt - b.updatedAt);
}

/**
 * Applies records from the cloud. A record wins only if it is newer than the local row
 * (last write wins, per record). Returns counts of what changed.
 */
export async function applyRemoteChanges(records) {
  const byTable = new Map(APPLY_ORDER.map(table => [table, []]));
  for (const record of records) {
    if (byTable.has(record.table)) byTable.get(record.table).push(record);
  }

  const summary = { added: 0, updated: 0, deleted: 0, skipped: 0 };
  let deferred = [];

  setApplyingRemote(true);
  try {
    for (const [table, tableRecords] of byTable) {
      for (const record of tableRecords.sort((a, b) => a.updatedAt - b.updatedAt)) {
        const applied = await applyOne(table, record, summary);
        if (!applied) deferred.push([table, record]);
      }
    }

    // Rows whose parent arrived later in the same batch.
    for (let pass = 0; pass < 3 && deferred.length; pass++) {
      const retry = deferred;
      deferred = [];
      for (const [table, record] of retry) {
        const applied = await applyOne(table, record, summary);
        if (!applied) deferred.push([table, record]);
      }
    }
    summary.skipped += deferred.length;
  } finally {
    setApplyingRemote(false);
  }

  return summary;
}

async function applyOne(table, record, summary) {
  const dbTable = db.table(table);
  const existing = await dbTable.where('uid').equals(record.uid).first();

  if (record.deleted) {
    if (existing && (existing.updatedAt ?? 0) <= record.updatedAt) {
      await dbTable.delete(existing[primaryKeyPath(table)]);
      summary.deleted++;
    }
    return true;
  }

  if (existing && (existing.updatedAt ?? 0) >= record.updatedAt) {
    summary.skipped++;
    return true; // this device has the newer version
  }

  const row = await toLocalRow(table, record);
  if (!row) return false;

  const keyPath = primaryKeyPath(table);
  if (existing) {
    await dbTable.put({ ...row, [keyPath]: existing[keyPath] });
    summary.updated++;
  } else {
    if (keyPath === 'id') delete row.id; // let this device assign its own key
    await dbTable.put(row);
    summary.added++;
  }
  return true;
}

/**
 * One sync round: push what changed here, then apply what changed elsewhere.
 * `transport` talks to the cloud: { pushRecords(records), fetchRecords(since) }.
 */
export async function syncRecords(transport) {
  await tombstonesWritten();

  const pushedAt = await getSyncState('pushedAt', 0);
  const local = await collectLocalChanges(pushedAt);
  if (local.length) await transport.pushRecords(local);
  const pushWatermark = local.reduce((max, r) => Math.max(max, r.updatedAt), pushedAt);

  const pulledAt = await getSyncState('pulledAt', 0);
  const remote = await transport.fetchRecords(pulledAt);
  const summary = remote.length ? await applyRemoteChanges(remote) : { added: 0, updated: 0, deleted: 0, skipped: 0 };
  const pullWatermark = remote.reduce((max, r) => Math.max(max, r.updatedAt), pulledAt);

  await setSyncState('pushedAt', pushWatermark);
  await setSyncState('pulledAt', pullWatermark);
  await setSyncState('lastSyncAt', Date.now());

  // Tombstones have served their purpose once pushed.
  await syncDb.tombstones.where('deletedAt').belowOrEqual(pushWatermark).delete();

  return { pushed: local.length, ...summary };
}

/** Forgets what has been synced, so the next sync re-sends and re-reads everything. */
export async function resetSyncCursors() {
  await setSyncState('pushedAt', 0);
  await setSyncState('pulledAt', 0);
}
