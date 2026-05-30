import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { supabase } from '../db/supabaseClient';
import { backupToCloud, restoreFromCloud } from '../db/sync';
import { useAlert } from '../context/AlertContext';
import './SettingsScreen.css';
import { 
  calculateBMR, 
  calculateTDEE, 
  determineGoal, 
  calculateCalorieTarget, 
  calculateMacroTargets, 
  lbsToKg,
  calculateAge 
} from '../utils/calorieEngine';

export default function SettingsScreen() {
  const { showAlert, showConfirm, showPrompt } = useAlert();
  const navigate = useNavigate();
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const [session, setSession] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [exportMsg, setExportMsg] = useState('');

  const [autoActivity, setAutoActivity] = useState('sedentary');
  const [latestWeight, setLatestWeight] = useState(null);
  const [latestBf, setLatestBf] = useState(null);
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [heightCm, setHeightCm] = useState('');

  // 1. Fetch recent sessions to auto-detect activity level
  useEffect(() => {
    const detectActivity = async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSessions = await db.sessions
          .where('date')
          .above(thirtyDaysAgo.toISOString().split('T')[0])
          .toArray();
        const count = recentSessions.length;
        if (count >= 6) setAutoActivity('active');
        else if (count >= 4) setAutoActivity('moderate');
        else if (count >= 2) setAutoActivity('light');
        else setAutoActivity('sedentary');
      } catch (e) {
        console.error("Failed to detect activity level:", e);
      }
    };
    detectActivity();
  }, [profile]);

  // 2. Fetch latest InBody scan or bodyWeight for weight & fat%
  useEffect(() => {
    const fetchBiometrics = async () => {
      try {
        const scan = await db.inbodyScans.orderBy('date').reverse().first();
        if (scan?.weight) {
          setLatestWeight({ val: scan.weight, source: 'inbody' });
          if (scan.bf) {
            setLatestBf(scan.bf);
          } else {
            setLatestBf(null);
          }
          return;
        }
        const bw = await db.bodyWeight.orderBy('date').reverse().first();
        if (bw?.weight) {
          setLatestWeight({ val: bw.weight, source: 'weight' });
          setLatestBf(null);
          return;
        }
        setLatestWeight(null);
        setLatestBf(null);
      } catch (e) {
        console.error("Failed to fetch biometrics:", e);
      }
    };
    fetchBiometrics();
  }, [profile]);

  // 3. Keep height inputs sync'd with database value
  useEffect(() => {
    if (profile && profile.height) {
      setHeightCm(profile.height);
      const totalInches = profile.height / 2.54;
      const ft = Math.floor(totalInches / 12);
      const inch = Math.round(totalInches % 12);
      setHeightFt(ft);
      setHeightIn(inch);
    } else {
      setHeightCm('');
      setHeightFt('');
      setHeightIn('');
    }
  }, [profile?.height]);

  // 4. Recommendation derivation
  const isProfileComplete = profile?.gender && profile?.dob && profile?.height && latestWeight;
  let recommendedGoal = 'maintain';
  let recommendedCalories = 2000;
  let recommendedMacros = { protein: 120, carbs: 200, fat: 60 };

  if (isProfileComplete) {
    const age = calculateAge(profile.dob);
    const weightKg = profile.unitPreference === 'lbs' ? lbsToKg(latestWeight.val) : latestWeight.val;
    const bmr = calculateBMR(weightKg, profile.height, age, profile.gender);
    const actLevel = profile.activityLevel || autoActivity;
    const tdee = calculateTDEE(bmr, actLevel);
    recommendedGoal = latestBf ? determineGoal(latestBf, profile.gender) : 'maintain';
    recommendedCalories = calculateCalorieTarget(tdee, recommendedGoal);
    recommendedMacros = calculateMacroTargets(recommendedCalories, weightKg, recommendedGoal);
  }

  async function applyRecommendation() {
    if (!isProfileComplete) return;
    await db.playerProfile.update('profile', {
      calorieGoal: recommendedCalories,
      proteinGoal: recommendedMacros.protein,
      carbsGoal: recommendedMacros.carbs,
      fatGoal: recommendedMacros.fat,
      waterGoal: 3000,
      nutritionGoalType: recommendedGoal
    });
    showAlert(`Successfully set targets to recommended: ${recommendedCalories} kcal (${recommendedGoal.toUpperCase()})`, "Targets Applied");
  }

  async function resetGoals() {
    await db.playerProfile.update('profile', {
      calorieGoal: null,
      proteinGoal: null,
      carbsGoal: null,
      fatGoal: null,
      waterGoal: 3000,
      nutritionGoalType: null
    });
    showAlert("Nutrition goals reset to default.", "Goals Reset");
  }

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

        {/* Section: Body Profile */}
        <div className="settings-section mt-24">
          <span className="section-label">BODY PROFILE</span>
          <div className="settings-card card mt-8" style={{ gap: 16 }}>
            {/* Gender */}
            <div className="settings-row">
              <div className="settings-info">
                <span className="settings-title">Gender</span>
                <span className="settings-desc">Used for biological BMR & score calculations</span>
              </div>
              <div className="tab-pills" style={{ margin: 0 }}>
                <button 
                  className={`tab-pill ${profile.gender === 'male' ? 'active' : ''}`}
                  onClick={() => updateSetting('gender', 'male')}
                >
                  MALE
                </button>
                <button 
                  className={`tab-pill ${profile.gender === 'female' ? 'active' : ''}`}
                  onClick={() => updateSetting('gender', 'female')}
                >
                  FEMALE
                </button>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="settings-row">
              <div className="settings-info">
                <span className="settings-title">Date of Birth</span>
                <span className="settings-desc">Used to determine age</span>
              </div>
              <div style={{ width: '150px' }}>
                <input 
                  type="date"
                  className="settings-input"
                  value={profile.dob || ''}
                  onChange={(e) => updateSetting('dob', e.target.value || null)}
                />
              </div>
            </div>

            {/* Height */}
            <div className="settings-row">
              <div className="settings-info">
                <span className="settings-title">Height</span>
                <span className="settings-desc">Stored in cm: {profile.height ? `${profile.height} cm` : 'Not set'}</span>
              </div>
              <div style={{ width: '150px' }}>
                {profile.unitPreference === 'lbs' ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input 
                        type="number"
                        placeholder="ft"
                        className="settings-input"
                        style={{ paddingRight: '16px' }}
                        value={heightFt}
                        onChange={e => {
                          const ft = parseInt(e.target.value) || 0;
                          setHeightFt(e.target.value);
                          const cm = Math.round(((ft * 12) + (parseInt(heightIn) || 0)) * 2.54);
                          setHeightCm(cm);
                          updateSetting('height', cm > 0 ? cm : null);
                        }}
                      />
                    </div>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input 
                        type="number"
                        placeholder="in"
                        className="settings-input"
                        style={{ paddingRight: '16px' }}
                        value={heightIn}
                        onChange={e => {
                          const inch = parseInt(e.target.value) || 0;
                          setHeightIn(e.target.value);
                          const cm = Math.round((((parseInt(heightFt) || 0) * 12) + inch) * 2.54);
                          setHeightCm(cm);
                          updateSetting('height', cm > 0 ? cm : null);
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="number"
                      placeholder="cm"
                      className="settings-input"
                      style={{ paddingRight: '32px' }}
                      value={heightCm}
                      onChange={e => {
                        const val = parseInt(e.target.value) || 0;
                        setHeightCm(e.target.value);
                        updateSetting('height', val > 0 ? val : null);
                      }}
                    />
                    <span style={{ position: 'absolute', right: 8, fontSize: 12, color: 'var(--text-muted)' }}>cm</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Level */}
            <div className="settings-row">
              <div className="settings-info">
                <span className="settings-title">Activity Level</span>
                <span className="settings-desc">To determine daily calorie multipliers</span>
              </div>
              <div style={{ width: '180px' }}>
                <select 
                  className="settings-select"
                  value={profile.activityLevel || ''}
                  onChange={(e) => updateSetting('activityLevel', e.target.value || null)}
                >
                  <option value="">Auto-Detect (Suggested: {autoActivity.toUpperCase()})</option>
                  <option value="sedentary">Sedentary (No exercise)</option>
                  <option value="light">Light (1-3 workouts/week)</option>
                  <option value="moderate">Moderate (3-5 workouts/week)</option>
                  <option value="active">Active (6-7 workouts/week)</option>
                  <option value="very_active">Very Active (Heavy training)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Nutrition Goals */}
        <div className="settings-section mt-24">
          <span className="section-label">NUTRITION GOALS</span>
          <div className="settings-card card mt-8">
            {isProfileComplete ? (
              <div className="recommendation-banner">
                <div className="recommendation-text">
                  Based on your body stats and {latestWeight.source === 'inbody' ? 'latest InBody scan' : 'latest weight'}, we recommend a <strong>{recommendedGoal.toUpperCase()}</strong>:
                  <br />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'inline-block' }}>
                    Recommended: <strong>{recommendedCalories} kcal</strong> | P: {recommendedMacros.protein}g | C: {recommendedMacros.carbs}g | F: {recommendedMacros.fat}g
                  </span>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ minHeight: '36px', padding: '6px 12px', fontSize: '13px' }}
                  onClick={applyRecommendation}
                >
                  ⚡ APPLY RECOMMENDATION
                </button>
              </div>
            ) : (
              <div className="recommendation-banner warning">
                <div className="recommendation-text" style={{ fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>⚠️</span>
                  <span>Complete your <strong>Body Profile</strong> and log at least one weight/InBody scan to receive personalized nutrition target recommendations.</span>
                </div>
              </div>
            )}

            <div className="goals-grid">
              {/* Daily Calories */}
              <div className="goal-input-box">
                <label className="section-label" style={{ fontSize: '11px' }}>Daily Calories</label>
                <div className="goal-input-wrapper">
                  <input 
                    type="number"
                    className="settings-input"
                    placeholder="Auto"
                    defaultValue={profile.calorieGoal || ''}
                    key={profile.calorieGoal}
                    onBlur={e => {
                      const val = parseInt(e.target.value) || 0;
                      updateSetting('calorieGoal', val > 0 ? val : null);
                    }}
                  />
                  <span className="goal-input-unit">kcal</span>
                </div>
              </div>

              {/* Water Goal */}
              <div className="goal-input-box">
                <label className="section-label" style={{ fontSize: '11px' }}>Water Target</label>
                <div className="goal-input-wrapper">
                  <input 
                    type="number"
                    className="settings-input"
                    placeholder="3000"
                    defaultValue={profile.waterGoal || 3000}
                    key={profile.waterGoal}
                    onBlur={e => {
                      const val = parseInt(e.target.value) || 3000;
                      updateSetting('waterGoal', val);
                    }}
                  />
                  <span className="goal-input-unit">ml</span>
                </div>
              </div>

              {/* Protein */}
              <div className="goal-input-box">
                <label className="section-label" style={{ fontSize: '11px' }}>Protein</label>
                <div className="goal-input-wrapper">
                  <input 
                    type="number"
                    className="settings-input"
                    placeholder="Auto"
                    defaultValue={profile.proteinGoal || ''}
                    key={profile.proteinGoal}
                    onBlur={e => {
                      const val = parseInt(e.target.value) || 0;
                      updateSetting('proteinGoal', val > 0 ? val : null);
                    }}
                  />
                  <span className="goal-input-unit">g</span>
                </div>
              </div>

              {/* Carbs */}
              <div className="goal-input-box">
                <label className="section-label" style={{ fontSize: '11px' }}>Carbohydrates</label>
                <div className="goal-input-wrapper">
                  <input 
                    type="number"
                    className="settings-input"
                    placeholder="Auto"
                    defaultValue={profile.carbsGoal || ''}
                    key={profile.carbsGoal}
                    onBlur={e => {
                      const val = parseInt(e.target.value) || 0;
                      updateSetting('carbsGoal', val > 0 ? val : null);
                    }}
                  />
                  <span className="goal-input-unit">g</span>
                </div>
              </div>

              {/* Fat */}
              <div className="goal-input-box">
                <label className="section-label" style={{ fontSize: '11px' }}>Fat</label>
                <div className="goal-input-wrapper">
                  <input 
                    type="number"
                    className="settings-input"
                    placeholder="Auto"
                    defaultValue={profile.fatGoal || ''}
                    key={profile.fatGoal}
                    onBlur={e => {
                      const val = parseInt(e.target.value) || 0;
                      updateSetting('fatGoal', val > 0 ? val : null);
                    }}
                  />
                  <span className="goal-input-unit">g</span>
                </div>
              </div>

              {/* Goal Type Badge */}
              <div className="goal-input-box">
                <label className="section-label" style={{ fontSize: '11px' }}>Goal Type</label>
                <select
                  className="settings-select"
                  value={profile.nutritionGoalType || ''}
                  onChange={e => updateSetting('nutritionGoalType', e.target.value || null)}
                >
                  <option value="">None / Custom</option>
                  <option value="cut">Cut (Deficit)</option>
                  <option value="maintain">Maintain (Balance)</option>
                  <option value="bulk">Bulk (Surplus)</option>
                </select>
              </div>
            </div>

            {(profile.calorieGoal || profile.proteinGoal || profile.carbsGoal || profile.fatGoal || profile.nutritionGoalType) && (
              <button 
                className="btn-ghost mt-16" 
                style={{ fontSize: '12px', minHeight: '32px', padding: '4px' }}
                onClick={resetGoals}
              >
                RESET TO DEFAULT / AUTO
              </button>
            )}
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
          <div className="settings-card card mt-8" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="data-action-block">
              <div className="settings-info">
                <span className="settings-title">Export Backup</span>
                <span className="settings-desc">Save your workout history as a JSON file</span>
              </div>
              <button className="data-btn mt-8" onClick={handleExport}>
                EXPORT
              </button>
            </div>
            {exportMsg && <div className="sync-msg success" style={{ marginTop: 4 }}>{exportMsg}</div>}

            <div className="data-action-block" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="settings-info">
                <span className="settings-title">Import Backup</span>
                <span className="settings-desc">Load database from a previously exported JSON file</span>
              </div>
              <label className="data-btn mt-8" style={{ cursor: 'pointer', textAlign: 'center' }}>
                IMPORT
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
            </div>

            <div className="data-action-block" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div className="settings-info">
                <span className="settings-title" style={{ color: 'var(--accent-red)' }}>Clear All Data</span>
                <span className="settings-desc">Delete all local workouts, plans, and profile history</span>
              </div>
              <button className="btn-ghost mt-8" onClick={handleDeleteAll} style={{ color: 'var(--accent-red)', borderColor: 'rgba(255, 23, 68, 0.3)' }}>
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
