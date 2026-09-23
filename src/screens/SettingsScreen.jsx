import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { supabase } from '../db/supabaseClient';
import { useBackup } from '../hooks/useBackup';
import { resetSyncDb } from '../db/syncDb';
import { useAlert } from '../context/useAlert';
import OfflineVisualsSection from '../components/settings/OfflineVisualsSection';
import NutritionGoalsSection from '../components/settings/NutritionGoalsSection';
import AccountSyncSection from '../components/settings/AccountSyncSection';
import LocalDataSection from '../components/settings/LocalDataSection';
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
  const { showAlert, showConfirm, showPrompt, showToast } = useAlert();
  const navigate = useNavigate();
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const [session, setSession] = useState(null);
  const { syncing, syncStatus, exportMsg, sync, exportFile, importFile } = useBackup();

  const [autoActivity, setAutoActivity] = useState('sedentary');
  const [latestWeight, setLatestWeight] = useState(null);
  const [latestBf, setLatestBf] = useState(null);
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [syncedHeight, setSyncedHeight] = useState(undefined);

  // Keep the height inputs in sync with the saved value (on load, and when it changes elsewhere).
  if (profile && profile.height !== syncedHeight) {
    setSyncedHeight(profile.height);
    if (profile.height) {
      const totalInches = profile.height / 2.54;
      setHeightCm(profile.height);
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(Math.round(totalInches % 12));
    } else {
      setHeightCm('');
      setHeightFt('');
      setHeightIn('');
    }
  }

  // 1. Fetch recent sessions to auto-detect activity level
  useEffect(() => {
    const detectActivity = async () => {
      try {
        // Sessions carry startTime (ms); there is no `date` field to query.
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const count = await db.sessions.where('startTime').above(thirtyDaysAgo.getTime()).count();
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
        try {
          const factor = value === 'lbs' ? 2.20462 : 1 / 2.20462;
          await db.transaction('rw', [db.sets, db.personalRecords, db.bodyWeight, db.inbodyScans, db.playerProfile], async () => {
            const sets = await db.sets.toArray();
            for (const s of sets) {
              if (s.weight) await db.sets.update(s.id, { weight: Math.round(s.weight * factor * 10) / 10 });
            }
            const prs = await db.personalRecords.toArray();
            for (const pr of prs) {
              if (pr.weight) {
                await db.personalRecords.update(pr.id, {
                  weight: Math.round(pr.weight * factor * 10) / 10,
                  ...(pr.maxWeight ? { maxWeight: Math.round(pr.maxWeight * factor * 10) / 10 } : {}),
                });
              }
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
          showToast('Units converted!');
        } catch (err) {
          await showAlert('Failed to convert units: ' + err.message, 'Error');
        }
        return;
      }
    }
    await db.playerProfile.update('profile', { [key]: value });
  }

  async function handleLogout() {
    const confirmed = await showConfirm("Are you sure you want to sign out? Your local data will remain on this device.", "Sign Out?");
    if (confirmed) {
      await supabase.auth.signOut();
      await db.playerProfile.update('profile', { guestMode: true });
      navigate('/profile');
    }
  }

  async function handleDeleteAll() {
    const confirmed = await showConfirm("CRITICAL WARNING: This will permanently delete ALL your local data from this device! This action cannot be undone unless you have a backup. Do you want to proceed?", "CRITICAL WARNING", { okText: 'PROCEED', danger: true });
    if (confirmed) {
      const confirmation = await showPrompt("Type 'DELETE' to confirm permanent reset:", "", "Type DELETE");
      if (confirmation === 'DELETE') {
        await resetSyncDb();
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

        <OfflineVisualsSection />

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

        <NutritionGoalsSection profile={profile} isProfileComplete={isProfileComplete} latestWeight={latestWeight} recommendedGoal={recommendedGoal} recommendedCalories={recommendedCalories} recommendedMacros={recommendedMacros} onApplyRecommendation={applyRecommendation} onResetGoals={resetGoals} onUpdateSetting={updateSetting} />

        <AccountSyncSection session={session} syncing={syncing} syncStatus={syncStatus} lastSyncedAt={profile.lastSyncedAt} onSync={sync} onSignIn={() => navigate('/login')} onSignOut={handleLogout} />

        <LocalDataSection exportMsg={exportMsg} onExport={exportFile} onImport={importFile} onReset={handleDeleteAll} />

        {/* Info / Version */}
        <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 16, color: 'var(--text-muted)', fontSize: 12 }}>
          <p>ARISE GYM APP v1.3.0</p>
          <p style={{ marginTop: 4 }}>Offline-First Game-ified Fitness Tracker</p>
        </div>
      </div>
    </div>
  );
}
