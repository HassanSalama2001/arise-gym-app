import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { supabase } from '../db/supabaseClient';
import { backupToCloud, restoreFromCloud } from '../db/sync';
import { useAlert } from '../context/AlertContext';
import './SettingsScreen.css';

export default function SettingsScreen() {
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const navigate = useNavigate();
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const [session, setSession] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [exportMsg, setExportMsg] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!profile) {
    return (
      <div className="screen">
        <div className="screen-content loading-screen">Loading...</div>
      </div>
    );
  }

  async function updateSetting(key, value) {
    if (key === 'unitPreference' && value !== profile.unitPreference) {
      const confirmation = await showConfirm(`Convert all existing workout history weights from ${profile.unitPreference.toUpperCase()} to ${value.toUpperCase()}?\n\n(Choose CONFIRM to convert values, or CANCEL to only change the label)`);
      
      if (confirmation) {
        setSyncing(true);
        setSyncStatus('Converting units...');
        try {
          const factor = value === 'lbs' ? 2.20462 : 1 / 2.20462;
          await db.transaction('rw', [db.sets, db.personalRecords, db.bodyWeight, db.inbodyScans, db.playerProfile], async () => {
            const sets = await db.sets.toArray();
            for (const s of sets) {
              if (s.weight) await db.sets.update(s.id, { weight: Math.round(s.weight * factor * 10) / 10 });
            }
            const prs = await db.personalRecords.toArray();
            for (const pr of prs) {
              if (pr.weight) await db.personalRecords.update(pr.id, { weight: Math.round(pr.weight * factor * 10) / 10 });
            }
            const bws = await db.bodyWeight.toArray();
            for (const bw of bws) {
              if (bw.weight) await db.bodyWeight.update(bw.id, { weight: Math.round(bw.weight * factor * 10) / 10 });
            }
            const scans = await db.inbodyScans.toArray();
            for (const scan of scans) {
              if (scan.weight) await db.inbodyScans.update(scan.id, { weight: Math.round(scan.weight * factor * 10) / 10 });
              if (scan.smm) await db.inbodyScans.update(scan.id, { smm: Math.round(scan.smm * factor * 10) / 10 });
            }
            const prof = await db.playerProfile.get('profile');
            if (prof) {
              await db.playerProfile.update('profile', {
                totalVolume: Math.round(prof.totalVolume * factor),
                unitPreference: value
              });
            }
          });
          setSyncStatus('Units converted!');
        } catch (err) {
          await showAlert('Failed to convert units: ' + err.message, 'Error');
        } finally {
          setSyncing(false);
          setTimeout(() => setSyncStatus(''), 3000);
        }
        return;
      }
    }
    await db.playerProfile.update('profile', { [key]: value });
  }

  async function handleBackup() {
    setSyncing(true);
    setSyncStatus('Backing up...');
    try {
      const res = await backupToCloud();
      if (res.success) {
        setSyncStatus('Backup complete!');
      } else if (res.conflict) {
        setSyncStatus('Conflict detected!');
        const force = await showConfirm(
          `A newer backup from ${new Date(res.cloudTime).toLocaleString()} exists on the cloud.\n\nYour last sync on this device was ${res.localTime ? new Date(res.localTime).toLocaleString() : 'never'}.\n\nDo you want to FORCE overwrite the cloud with your local data?`,
          "Sync Conflict Detected",
          { okText: 'FORCE BACKUP', cancelText: 'CANCEL' }
        );
        if (force) {
          setSyncStatus('Forcing backup...');
          const forceRes = await backupToCloud(true);
          if (forceRes.success) {
            setSyncStatus('Backup complete!');
          } else {
            setSyncStatus('Backup failed: ' + forceRes.error);
          }
        } else {
          setSyncStatus('Backup cancelled.');
        }
      } else {
        setSyncStatus('Backup failed: ' + res.error);
      }
    } catch (err) {
      setSyncStatus('Backup failed: ' + err.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  }

  async function handleRestore() {
    const confirmed = await showConfirm("Restoring from the cloud will overwrite your current local data. Do you want to proceed?", "Restore from Cloud?", { danger: true });
    if (!confirmed) {
      return;
    }
    setSyncing(true);
    setSyncStatus('Restoring...');
    try {
      const res = await restoreFromCloud();
      if (res.success) {
        setSyncStatus('Restore complete!');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setSyncStatus('Restore failed: ' + res.error);
      }
    } catch (err) {
      setSyncStatus('Restore failed: ' + err.message);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(''), 3000);
    }
  }

  async function handleLogout() {
    const confirmed = await showConfirm("Are you sure you want to sign out? Your local data will remain on this device.", "Sign Out?");
    if (confirmed) {
      await supabase.auth.signOut();
      await db.playerProfile.update('profile', { guestMode: true });
      navigate('/profile');
    }
  }

  async function handleExport() {
    try {
      const data = {
        profile: await db.playerProfile.get('profile'),
        sessions: await db.sessions.toArray(),
        sets: await db.sets.toArray(),
        personalRecords: await db.personalRecords.toArray(),
        workoutPlans: await db.workoutPlans.toArray(),
        planExercises: await db.planExercises.toArray(),
        dailyQuests: await db.dailyQuests.toArray(),
        achievements: await db.achievements.toArray(),
        inbodyScans: await db.inbodyScans.toArray(),
        measurements: await db.measurements.toArray(),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arise-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setExportMsg('Exported successfully');
      setTimeout(() => setExportMsg(''), 3000);
    } catch (err) {
      await showAlert("Failed to export data: " + err.message, "Export Failed");
    }
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = await showConfirm("Importing this backup will overwrite ALL your current local workout data. Do you want to proceed?", "Import Backup?", { danger: true });
    if (!confirmed) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data || !data.profile) {
          await showAlert("Invalid backup file. Could not find profile data.", "Import Error");
          return;
        }

        await db.transaction('rw', [
          db.playerProfile,
          db.sessions,
          db.sets,
          db.personalRecords,
          db.workoutPlans,
          db.planExercises,
          db.dailyQuests,
          db.achievements,
          db.inbodyScans,
          db.measurements
        ], async () => {
          if (data.profile) await db.playerProfile.put(data.profile);
          if (data.sessions) {
            await db.sessions.clear();
            await db.sessions.bulkAdd(data.sessions);
          }
          if (data.sets) {
            await db.sets.clear();
            await db.sets.bulkAdd(data.sets);
          }
          if (data.personalRecords) {
            await db.personalRecords.clear();
            await db.personalRecords.bulkAdd(data.personalRecords);
          }
          if (data.workoutPlans) {
            await db.workoutPlans.clear();
            await db.workoutPlans.bulkAdd(data.workoutPlans);
          }
          if (data.planExercises) {
            await db.planExercises.clear();
            await db.planExercises.bulkAdd(data.planExercises);
          }
          if (data.dailyQuests) {
            await db.dailyQuests.clear();
            await db.dailyQuests.bulkAdd(data.dailyQuests);
          }
          if (data.achievements) {
            await db.achievements.clear();
            await db.achievements.bulkAdd(data.achievements);
          }
          if (data.inbodyScans) {
            await db.inbodyScans.clear();
            await db.inbodyScans.bulkAdd(data.inbodyScans);
          }
          if (data.measurements) {
            await db.measurements.clear();
            await db.measurements.bulkAdd(data.measurements);
          }
        });

        await showAlert("Import successful! The app will reload to apply changes.", "Success");
        window.location.reload();
      } catch (err) {
        await showAlert("Failed to import backup: " + err.message, "Import Error");
      }
    };
    reader.readAsText(file);
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirm("CRITICAL WARNING: This will permanently delete ALL your local data from this device! This action cannot be undone unless you have a backup. Do you want to proceed?", "CRITICAL WARNING", { okText: 'PROCEED', danger: true });
    if (confirmed) {
      const confirmation = await showPrompt("Type 'DELETE' to confirm permanent reset:", "", "Type DELETE");
      if (confirmation === 'DELETE') {
        await db.delete();
        window.location.reload();
      } else {
        await showAlert("Deletion cancelled. Text did not match.", "Cancelled");
      }
    }
  }

  return (
    <div className="screen" id="settings-screen">
      <div className="screen-content">
        {/* Header */}
        <div className="settings-header">
          <button className="back-btn" onClick={() => navigate('/profile')} id="settings-back-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 className="screen-title">SETTINGS</h1>
        </div>

        {/* Section: Workout Preferences */}
        <div className="settings-section">
          <span className="section-label">WORKOUT PREFERENCES</span>
          <div className="settings-card card mt-8">
            {/* Unit Preference */}
            <div className="settings-row">
              <div className="settings-info">
                <span className="settings-title">Weight Unit</span>
                <span className="settings-desc">Choose between Metric (kg) and Imperial (lbs)</span>
              </div>
              <div className="tab-pills" style={{ margin: 0 }}>
                <button 
                  className={`tab-pill ${profile.unitPreference === 'kg' ? 'active' : ''}`}
                  onClick={() => updateSetting('unitPreference', 'kg')}
                >
                  KG
                </button>
                <button 
                  className={`tab-pill ${profile.unitPreference === 'lbs' ? 'active' : ''}`}
                  onClick={() => updateSetting('unitPreference', 'lbs')}
                >
                  LBS
                </button>
              </div>
            </div>

            {/* Rest Timer Duration */}
            <div className="settings-row flex-column mt-16">
              <div className="settings-info" style={{ marginBottom: 12 }}>
                <span className="settings-title">Default Rest Timer</span>
                <span className="settings-desc">Automatic countdown between sets: {profile.defaultRestDuration ?? 60} seconds</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
                <input 
                  type="range" 
                  min="15" 
                  max="300" 
                  step="15"
                  className="settings-slider"
                  value={profile.defaultRestDuration ?? 60}
                  onChange={(e) => updateSetting('defaultRestDuration', parseInt(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span className="slider-value-badge">{profile.defaultRestDuration ?? 60}s</span>
              </div>
            </div>

            {/* Haptic Feedback Toggle */}
            <div className="settings-row mt-16">
              <div className="settings-info">
                <span className="settings-title">Haptic Feedback</span>
                <span className="settings-desc">Vibrate device on screen actions and set completion</span>
              </div>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={profile.hapticEnabled !== false}
                  onChange={(e) => updateSetting('hapticEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Section: Account & Cloud Sync */}
        <div className="settings-section mt-24">
          <span className="section-label">ACCOUNT & CLOUD SYNC</span>
          <div className="settings-card card mt-8">
            <div className="account-status-row">
              <div className="settings-info">
                <span className="settings-title">
                  {session ? `Signed in as` : 'Guest Mode'}
                </span>
                <span className="settings-desc" style={{ color: session ? 'var(--accent-blue)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {session ? session.user.email : 'Data saved locally on this device'}
                </span>
              </div>
              {session && (
                <div className="sync-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>

            <div className="sync-actions-grid mt-16">
              {session ? (
                <>
                  <button className="sync-btn" onClick={handleBackup} disabled={syncing}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    SYNC TO CLOUD
                  </button>
                  <button className="sync-btn" onClick={handleRestore} disabled={syncing}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    RESTORE FROM CLOUD
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => navigate('/login')} style={{ gridColumn: 'span 2' }}>
                  SIGN IN TO SYNC
                </button>
              )}
            </div>

            {syncStatus && <div className={`sync-msg mt-8 ${syncStatus.includes('failed') ? 'error' : 'success'}`}>{syncStatus}</div>}

            {session && (
              <button className="btn-ghost mt-16" onClick={handleLogout} style={{ color: 'var(--accent-red)', borderColor: 'rgba(255, 23, 68, 0.2)' }}>
                SIGN OUT
              </button>
            )}
          </div>
        </div>

        {/* Section: Backup & Recovery */}
        <div className="settings-section mt-24">
          <span className="section-label">BACKUP & LOCAL DATA</span>
          <div className="settings-card card mt-8" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="data-action-row">
              <div className="settings-info">
                <span className="settings-title">Export Backup</span>
                <span className="settings-desc">Save your workout history as a JSON file</span>
              </div>
              <button className="data-btn" onClick={handleExport} style={{ minHeight: 'auto', padding: '8px 16px' }}>
                EXPORT
              </button>
            </div>
            {exportMsg && <div className="sync-msg success">{exportMsg}</div>}

            <div className="data-action-row mt-8">
              <div className="settings-info">
                <span className="settings-title">Import Backup</span>
                <span className="settings-desc">Load database from a previously exported JSON file</span>
              </div>
              <label className="data-btn" style={{ minHeight: 'auto', padding: '8px 16px', cursor: 'pointer', textAlign: 'center' }}>
                IMPORT
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="data-action-row mt-8" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="settings-info">
                <span className="settings-title" style={{ color: 'var(--accent-red)' }}>Clear All Data</span>
                <span className="settings-desc">Delete all local workouts, plans, and profile history</span>
              </div>
              <button className="btn-ghost" onClick={handleDeleteAll} style={{ color: 'var(--accent-red)', borderColor: 'rgba(255, 23, 68, 0.2)', padding: '6px 12px', minHeight: 'auto' }}>
                RESET APP
              </button>
            </div>
          </div>
        </div>

        {/* Info / Version */}
        <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 16, color: 'var(--text-muted)', fontSize: 12 }}>
          <p>ARISE GYM APP v1.3.0</p>
          <p style={{ marginTop: 4 }}>Offline-First Game-ified Fitness Tracker</p>
        </div>
      </div>
    </div>
  );
}
