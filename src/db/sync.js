import db from './db';
import { supabase } from './supabaseClient';

export async function exportDataJSON() {
  return {
    profile: await db.playerProfile.toArray(),
    sessions: await db.sessions.toArray(),
    sets: await db.sets.toArray(),
    bodyWeight: await db.bodyWeight.toArray(),
    personalRecords: await db.personalRecords.toArray(),
    achievements: await db.achievements.toArray(),
    workoutPlans: await db.workoutPlans.toArray(),
    planExercises: await db.planExercises.toArray(),
    inbodyScans: await db.inbodyScans.toArray(),
    measurements: await db.measurements.toArray(),
    dailyQuests: await db.dailyQuests.toArray(),
    exportedAt: new Date().toISOString(),
  };
}

export async function importDataJSON(data) {
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
}

export async function backupToCloud() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    const dataJSON = await exportDataJSON();
    
    // Upsert into Supabase backups table
    const { error } = await supabase.from('backups').upsert({
      user_id: session.user.id,
      data: dataJSON,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Failed to backup to cloud:', error);
    return false;
  }
}

export async function restoreFromCloud() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;

  try {
    const { data, error } = await supabase
      .from('backups')
      .select('data')
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
    
    if (data && data.data) {
      await importDataJSON(data.data);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to restore from cloud:', error);
    return false;
  }
}
