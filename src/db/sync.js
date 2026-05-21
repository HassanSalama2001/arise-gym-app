import db from './db';
import { supabase } from './supabaseClient';

export async function exportDataJSON() {
  const [
    profile, sessions, sets, bodyWeight, personalRecords, achievements,
    workoutPlans, planExercises, inbodyScans, measurements, dailyQuests, settings
  ] = await Promise.all([
    db.playerProfile.toArray(),
    db.sessions.toArray(),
    db.sets.toArray(),
    db.bodyWeight.toArray(),
    db.personalRecords.toArray(),
    db.achievements.toArray(),
    db.workoutPlans.toArray(),
    db.planExercises.toArray(),
    db.inbodyScans.toArray(),
    db.measurements.toArray(),
    db.dailyQuests.toArray(),
    db.settings.toArray()
  ]);

  return {
    profile, sessions, sets, bodyWeight, personalRecords, achievements,
    workoutPlans, planExercises, inbodyScans, measurements, dailyQuests, settings,
    exportedAt: new Date().toISOString(),
  };
}

export async function importDataJSON(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup data format');
  }

  // Wrap everything in a single atomic transaction
  await db.transaction('rw', [
    db.playerProfile, db.sessions, db.sets, db.achievements,
    db.workoutPlans, db.planExercises, db.bodyWeight,
    db.personalRecords, db.inbodyScans, db.measurements, 
    db.dailyQuests, db.settings
  ], async () => {
    if (data.profile) await db.playerProfile.bulkPut(data.profile);
    if (data.sessions) await db.sessions.bulkPut(data.sessions);
    if (data.sets) await db.sets.bulkPut(data.sets);
    if (data.achievements) await db.achievements.bulkPut(data.achievements);
    if (data.workoutPlans) await db.workoutPlans.bulkPut(data.workoutPlans);
    if (data.planExercises) await db.planExercises.bulkPut(data.planExercises);
    if (data.bodyWeight) await db.bodyWeight.bulkPut(data.bodyWeight);
    if (data.personalRecords) await db.personalRecords.bulkPut(data.personalRecords);
    if (data.inbodyScans) await db.inbodyScans.bulkPut(data.inbodyScans);
    if (data.measurements) await db.measurements.bulkPut(data.measurements);
    if (data.dailyQuests) await db.dailyQuests.bulkPut(data.dailyQuests);
    if (data.settings) await db.settings.bulkPut(data.settings);
  });
}

export async function backupToCloud() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'No active session' };

  try {
    const dataJSON = await exportDataJSON();
    
    // Upsert into Supabase backups table
    const { error } = await supabase.from('backups').upsert({
      user_id: session.user.id,
      data: dataJSON,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) throw error;
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
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    
    if (data && data.data) {
      await importDataJSON(data.data);
      return { success: true };
    }
    return { success: false, error: 'No cloud backup found' };
  } catch (error) {
    console.error('Failed to restore from cloud:', error);
    return { success: false, error: error.message || String(error) };
  }
}
