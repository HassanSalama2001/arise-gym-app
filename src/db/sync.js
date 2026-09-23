import db from './db';
import { supabase } from './supabaseClient';
import { exportBackup, importBackup } from './backup';

export async function backupToCloud(force = false) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No active session' };

  try {
    const dataJSON = await exportBackup();
    
    // Check for conflicts if not forced
    if (!force) {
      const { data: existing, error: fetchError } = await supabase
        .from('backups')
        .select('data')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!fetchError && existing && existing.data && existing.data.exportedAt) {
        const lastSyncSetting = await db.settings.get('last_sync_time');
        const lastSyncTime = lastSyncSetting ? lastSyncSetting.value : null;

        if (lastSyncTime && new Date(existing.data.exportedAt) > new Date(lastSyncTime)) {
          return {
            success: false,
            conflict: true,
            cloudTime: existing.data.exportedAt,
            localTime: lastSyncTime
          };
        }
      }
    }
    
    // Upsert into Supabase backups table
    const { error } = await supabase.from('backups').upsert({
      user_id: session.user.id,
      data: dataJSON,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) throw error;

    // Record last sync time locally
    await db.settings.put({ key: 'last_sync_time', value: dataJSON.exportedAt });

    return { success: true };
  } catch (error) {
    console.error('Failed to backup to cloud:', error);
    return { success: false, error: error.message || String(error) };
  }
}

export async function restoreFromCloud() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No active session' };

  try {
    const { data, error } = await supabase
      .from('backups')
      .select('data')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data?.data) return { success: false, error: 'No cloud backup found' };

    await importBackup(data.data);
    if (data.data.exportedAt) {
      await db.settings.put({ key: 'last_sync_time', value: data.data.exportedAt });
    }
    return { success: true };
  } catch (error) {
    console.error('Failed to restore from cloud:', error);
    return { success: false, error: error.message || String(error) };
  }
}

/** When the signed-in user's cloud backup was made, or null if there is none. Doesn't change local data. */
export async function getCloudBackupTime() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabase
    .from('backups')
    .select('updated_at')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.updated_at ?? null;
}
