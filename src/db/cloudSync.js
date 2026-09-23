import db from './db';
import { supabase } from './supabaseClient';
import { getSyncState, setSyncState } from './syncDb';
import { syncRecords } from './recordSync';
import { importBackup, hasLocalUserData } from './backup';

const PUSH_CHUNK = 400;
const PAGE_SIZE = 1000;

/** Talks to the sync_records table as the signed-in user. */
export function supabaseTransport(userId, client = supabase) {
  return {
    async pushRecords(records) {
      for (let i = 0; i < records.length; i += PUSH_CHUNK) {
        const chunk = records.slice(i, i + PUSH_CHUNK).map(record => ({
          user_id: userId,
          table_name: record.table,
          uid: record.uid,
          updated_at: record.updatedAt,
          deleted: record.deleted,
          data: record.data,
        }));
        const { error } = await client.from('sync_records').upsert(chunk, { onConflict: 'user_id,table_name,uid' });
        if (error) throw error;
      }
    },

    async fetchRecords(since) {
      const records = [];
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await client
          .from('sync_records')
          .select('table_name,uid,updated_at,deleted,data')
          .eq('user_id', userId)
          .gt('updated_at', since)
          .order('updated_at', { ascending: true })
          .range(from, from + PAGE_SIZE - 1);
        if (error) throw error;
        records.push(...data.map(row => ({
          table: row.table_name,
          uid: row.uid,
          updatedAt: Number(row.updated_at),
          deleted: row.deleted,
          data: row.data,
        })));
        if (data.length < PAGE_SIZE) return records;
      }
    },
  };
}

/**
 * A device that only ever used the old whole-database backup has nothing in sync_records.
 * On its first sync, adopt that backup so history isn't lost, then let normal syncing take over.
 */
async function adoptLegacyBackup(userId, transport) {
  if (await getSyncState('legacyAdopted', false)) return false;
  await setSyncState('legacyAdopted', true);

  if (await hasLocalUserData()) return false; // this device already has the data
  if ((await transport.fetchRecords(0)).length) return false; // sync already has it

  const { data, error } = await supabase.from('backups').select('data').eq('user_id', userId).maybeSingle();
  if (error || !data?.data) return false;

  await importBackup(data.data);
  return true;
}

/**
 * Syncs this device with the cloud: pushes local changes, applies remote ones.
 * Returns { success, pushed, added, updated, deleted, adoptedLegacyBackup } or { success: false, error }.
 */
export async function syncWithCloud() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not signed in' };

  try {
    const transport = supabaseTransport(session.user.id);
    const adoptedLegacyBackup = await adoptLegacyBackup(session.user.id, transport);
    const result = await syncRecords(transport);
    await db.playerProfile.update('profile', { lastSyncedAt: Date.now() });
    return { success: true, adoptedLegacyBackup, ...result };
  } catch (error) {
    console.error('Sync failed:', error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function lastSyncedAt() {
  return getSyncState('lastSyncAt', null);
}
