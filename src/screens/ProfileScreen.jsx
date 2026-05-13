import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getRankInfo, RANKS, calculateSetXP } from '../data/progression';
import { supabase } from '../db/supabaseClient';
import { backupToCloud, restoreFromCloud } from '../db/sync';
import './ProfileScreen.css';

const ALL_ACHIEVEMENTS = [
  { type: 'rank_d', title: 'Iron Hunter', desc: 'Reach Rank D', icon: '🥉' },
  { type: 'rank_c', title: 'Bronze Slayer', desc: 'Reach Rank C', icon: '🥈' },
  { type: 'rank_b', title: 'Silver Raider', desc: 'Reach Rank B', icon: '🥇' },
  { type: 'rank_a', title: 'Gold Monarch', desc: 'Reach Rank A', icon: '👑' },
  { type: 'rank_s', title: 'Shadow Elite', desc: 'Reach Rank S', icon: '⚡' },
  { type: 'streak_7', title: '7-Day Streak', desc: 'Train 7 days in a row', icon: '🔥' },
  { type: 'streak_30', title: '30-Day Streak', desc: 'Train 30 days in a row', icon: '🌟' },
  { type: 'sessions_10', title: 'Veteran', desc: 'Complete 10 sessions', icon: '🎖️' },
  { type: 'sessions_50', title: 'Elite', desc: 'Complete 50 sessions', icon: '💎' },
  { type: 'pr_first', title: 'First PR', desc: 'Set your first personal record', icon: '🏆' },
];

function ConfirmDeleteSheet({ onConfirm, onClose }) {
  const [input, setInput] = useState('');
  return (
    <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bottom-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <h3 className="sheet-title" style={{ color: 'var(--accent-red)' }}>DANGER ZONE</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>This will permanently delete ALL your workout data, XP, and progress. Type <strong style={{ color: 'var(--text-primary)' }}>ARISE</strong> to confirm.</p>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type ARISE to confirm"
          id="delete-confirm-input"
          style={{ marginBottom: 16 }}
        />
        <div className="sheet-actions">
          <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>CANCEL</button>
          <button
            className="btn-primary"
            style={{ flex: 1, background: input === 'ARISE' ? 'var(--accent-red)' : 'var(--bg-surface)', color: input === 'ARISE' ? 'white' : 'var(--text-muted)' }}
            disabled={input !== 'ARISE'}
            onClick={onConfirm}
            id="confirm-delete-btn"
          >
            DELETE ALL
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ProfileScreen() {
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [exportMsg, setExportMsg] = useState('');
  const [session, setSession] = useState(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const profile = useLiveQuery(() => db.playerProfile.get('profile'));
  const achievements = useLiveQuery(() => db.achievements.toArray());
  const inbodyScans = useLiveQuery(() => db.inbodyScans ? db.inbodyScans.orderBy('date').reverse().toArray() : []);
  const measurements = useLiveQuery(() => db.measurements ? db.measurements.orderBy('date').reverse().toArray() : []);
  const allSets = useLiveQuery(() => db.sets.toArray());
  const allExercises = useLiveQuery(() => db.exercises.toArray());

  const rankInfo = profile ? getRankInfo(profile.totalXP) : null;
  const earnedTypes = new Set((achievements || []).map(a => a.type));

  const muscleXP = React.useMemo(() => {
    if (!allSets || !allExercises) return {};
    const totals = {};
    for (const set of allSets) {
      if (!set.completed) continue;
      const ex = allExercises.find(e => e.id === set.exerciseId);
      if (!ex) continue;
      const mg = ex.muscleGroup || 'Other';
      if (!totals[mg]) totals[mg] = 0;
      const xp = calculateSetXP(set.weight || 0, set.reps || 0, ex.difficulty || 1, set.type || 'normal');
      totals[mg] += xp;
    }
    return totals;
  }, [allSets, allExercises]);

  const muscleLevels = React.useMemo(() => {
    const levels = {};
    for (const [mg, xp] of Object.entries(muscleXP)) {
      const currentLevel = Math.floor(Math.sqrt(xp / 50)) + 1;
      const xpForNext = Math.pow(currentLevel, 2) * 50;
      const xpForCurrent = Math.pow(currentLevel - 1, 2) * 50;
      const progress = (xp - xpForCurrent) / (xpForNext - xpForCurrent);
      levels[mg] = { xp, level: currentLevel, progress };
    }
    return Object.entries(levels).sort((a, b) => b[1].level - a[1].level);
  }, [muscleXP]);

  async function saveName() {
    if (nameVal.trim()) await db.playerProfile.update('profile', { name: nameVal.trim() });
    setEditingName(false);
  }

  function startEditName() {
    setNameVal(profile?.name || '');
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }

  async function handleExport() {
    const data = {
      profile: await db.playerProfile.toArray(),
      sessions: await db.sessions.toArray(),
      sets: await db.sets.toArray(),
      bodyWeight: await db.bodyWeight.toArray(),
      personalRecords: await db.personalRecords.toArray(),
      achievements: await db.achievements.toArray(),
      workoutPlans: await db.workoutPlans.toArray(),
      planExercises: await db.planExercises.toArray(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `arise-backup-${Date.now()}.json`;
    a.click(); URL.revokeObjectURL(url);
    setExportMsg('✓ Exported!');
    setTimeout(() => setExportMsg(''), 2000);
  }

  async function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.profile) await db.playerProfile.bulkPut(data.profile);
      if (data.sessions) await db.sessions.bulkPut(data.sessions);
      if (data.sets) await db.sets.bulkPut(data.sets);
      if (data.achievements) await db.achievements.bulkPut(data.achievements);
      if (data.workoutPlans) await db.workoutPlans.bulkPut(data.workoutPlans);
      if (data.planExercises) await db.planExercises.bulkPut(data.planExercises);
      alert('Import successful!');
    } catch {
      alert('Failed to import — invalid file.');
    }
  }

  async function handleDeleteAll() {
    await db.sessions.clear();
    await db.sets.clear();
    await db.achievements.clear();
    await db.dailyQuests.clear();
    await db.bodyWeight.clear();
    await db.personalRecords.clear();
    await db.workoutPlans.clear();
    await db.planExercises.clear();
    await db.playerProfile.put({
      key: 'profile',
      name: profile?.name || 'Hunter',
      totalXP: 0, currentRank: 'E', rankName: 'Awakened',
      currentStreak: 0, longestStreak: 0, totalSessions: 0, totalVolume: 0,
      lastSessionDate: null, unitPreference: 'kg', defaultRestDuration: 60, hapticEnabled: true
    });
    setShowDelete(false);
  }

  async function toggleUnit() {
    const current = profile?.unitPreference || 'kg';
    await db.playerProfile.update('profile', { unitPreference: current === 'kg' ? 'lbs' : 'kg' });
  }

  async function toggleHaptic() {
    await db.playerProfile.update('profile', { hapticEnabled: !profile?.hapticEnabled });
  }

  async function setRestDuration(val) {
    await db.playerProfile.update('profile', { defaultRestDuration: val });
  }

  if (!profile || !rankInfo) return <div className="screen"><div className="screen-content loading-screen">Loading...</div></div>;

  return (
    <div className="screen" id="profile-screen">
      <div className="screen-content">
        <h1 className="screen-title" style={{ marginBottom: 24 }}>PROFILE</h1>

        {/* Rank Badge Hero */}
        <div className="profile-hero">
          <motion.div
            className="profile-rank-circle"
            style={{ borderColor: rankInfo.current.color, color: rankInfo.current.color, boxShadow: `0 0 40px ${rankInfo.current.color}40` }}
            animate={{ boxShadow: [`0 0 20px ${rankInfo.current.color}40`, `0 0 50px ${rankInfo.current.color}60`, `0 0 20px ${rankInfo.current.color}40`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {rankInfo.current.rank}
          </motion.div>

          {/* Name (editable) */}
          {editingName ? (
            <div className="name-edit-row">
              <input
                ref={nameInputRef}
                className="name-input"
                type="text"
                value={nameVal}
                onChange={e => setNameVal(e.target.value)}
                onBlur={saveName}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                id="profile-name-input"
              />
            </div>
          ) : (
            <button className="profile-name-btn" onClick={startEditName} id="edit-name-btn">
              <h2 className="profile-name">{(profile?.name || 'Hunter').toUpperCase()}</h2>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}

          <p className="profile-rank-name" style={{ color: rankInfo.current.color }}>{rankInfo.current.name}</p>

          {/* XP Bar */}
          <div className="profile-xp-section">
            <div className="progress-bar" style={{ height: 10 }}>
              <motion.div
                className="progress-fill"
                style={{ background: `linear-gradient(90deg, ${rankInfo.current.color}, var(--accent-blue))` }}
                initial={{ width: 0 }}
                animate={{ width: `${rankInfo.progress * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <div className="profile-xp-text">
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)', fontSize: 12 }}>
                {rankInfo.xpIntoRank.toLocaleString()} / {rankInfo.xpForNext > 0 ? `${rankInfo.xpForNext.toLocaleString()} XP` : 'MAX RANK'}
              </span>
              {rankInfo.next && (
                <span style={{ fontFamily: 'var(--font-display)', color: rankInfo.next.color, fontSize: 12 }}>→ {rankInfo.next.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="profile-section">
          <span className="section-label">LIFETIME STATS</span>
          <div className="lifetime-grid mt-8">
            {[
              { label: 'Total XP', value: profile.totalXP.toLocaleString(), color: 'var(--accent-gold)' },
              { label: 'Sessions', value: profile.totalSessions, color: 'var(--accent-blue)' },
              { label: 'Volume (kg)', value: Math.round(profile.totalVolume).toLocaleString(), color: 'var(--text-primary)' },
              { label: 'Best Streak', value: `${profile.longestStreak}d`, color: 'var(--success)' },
            ].map(s => (
              <div key={s.label} className="lifetime-box card">
                <span className="stat-number" style={{ fontSize: 22, color: s.color }}>{s.value}</span>
                <span className="section-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Muscle Levels */}
        {muscleLevels.length > 0 && (
          <div className="profile-section">
            <span className="section-label">MUSCLE LEVELS</span>
            <div className="card mt-8" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {muscleLevels.map(([mg, data]) => (
                <div key={mg}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{mg}</span>
                    <span style={{ fontSize: 13, color: 'var(--accent-blue)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Lv. {data.level}</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6, background: 'var(--bg-void)' }}>
                    <motion.div
                      className="progress-fill"
                      style={{ background: 'var(--accent-blue)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${data.progress * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences */}
        <div className="profile-section">
          <span className="section-label">PREFERENCES</span>
          <div className="settings-card card mt-8">
            {/* Unit toggle */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Weight Unit</span>
                <span className="section-label">kg or lbs</span>
              </div>
              <button className="unit-toggle" onClick={toggleUnit} id="unit-toggle-btn">
                <span className={profile.unitPreference === 'kg' ? 'unit-active' : ''}>kg</span>
                <span className="unit-sep">/</span>
                <span className={profile.unitPreference === 'lbs' ? 'unit-active' : ''}>lbs</span>
              </button>
            </div>

            <div className="setting-divider" />

            {/* Default rest */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Default Rest</span>
                <span className="section-label">Between sets</span>
              </div>
              <div className="rest-preset-row">
                {[30, 60, 90, 120].map(v => (
                  <button
                    key={v}
                    className={`rest-mini-preset ${profile.defaultRestDuration === v ? 'active' : ''}`}
                    onClick={() => setRestDuration(v)}
                    id={`rest-preset-${v}`}
                  >
                    {v}s
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-divider" />

            {/* Haptic */}
            <div className="setting-row">
              <div className="setting-info">
                <span className="setting-label">Haptic Feedback</span>
                <span className="section-label">Vibration on timer end</span>
              </div>
              <button
                className={`toggle-switch ${profile.hapticEnabled ? 'on' : 'off'}`}
                onClick={toggleHaptic}
                aria-label="Toggle haptic"
                id="haptic-toggle"
              >
                <div className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        {/* Holistic Tracking */}
        <InBodyTracker scans={inbodyScans} />
        <MeasurementsTracker measurements={measurements} />

        {/* Achievements */}
        <div className="profile-section">
          <span className="section-label">ACHIEVEMENTS</span>
          <div className="achievements-grid mt-8">
            {ALL_ACHIEVEMENTS.map(a => {
              const earned = earnedTypes.has(a.type);
              return (
                <motion.div
                  key={a.type}
                  className={`achievement-tile ${earned ? 'earned' : 'locked'}`}
                  whileTap={earned ? { scale: 0.95 } : {}}
                >
                  <span className="achievement-tile-icon">{earned ? a.icon : '?'}</span>
                  <span className="achievement-tile-name">{earned ? a.title : '???'}</span>
                  <span className="achievement-tile-desc">{earned ? a.desc : 'Locked'}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Data & Sync */}
        <div className="profile-section">
          <span className="section-label">DATA & SYNC</span>
          <div className="data-actions card mt-8">
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>☁️</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Cloud Sync</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {session ? `Logged in as ${session.user.email}` : 'Guest Mode (Local Only)'}
                </p>
              </div>
            </div>
            
            {session ? (
              <>
                <button className="data-btn" onClick={async () => { 
                  setExportMsg('Backing up...');
                  const ok = await backupToCloud();
                  setExportMsg(ok ? '✓ Cloud Backup Complete' : '❌ Cloud Backup Failed');
                  setTimeout(() => setExportMsg(''), 3000);
                }} style={{ color: 'var(--accent-blue)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  {exportMsg && exportMsg.includes('Backup') ? exportMsg : 'Backup to Cloud'}
                </button>
                <div className="data-divider"/>
                <button className="data-btn" onClick={async () => {
                  setExportMsg('Restoring...');
                  const ok = await restoreFromCloud();
                  setExportMsg(ok ? '✓ Cloud Restore Complete' : '❌ Cloud Restore Failed');
                  setTimeout(() => setExportMsg(''), 3000);
                }} style={{ color: 'var(--accent-gold)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  {exportMsg && exportMsg.includes('Restore') ? exportMsg : 'Restore from Cloud'}
                </button>
                <div className="data-divider"/>
                <button className="data-btn" onClick={async () => { 
                  if (window.confirm("Signing out will remove your local data from this device (it remains safe in the cloud). Continue?")) {
                    await supabase.auth.signOut(); 
                    await db.delete(); // clear local data
                    window.location.reload(); 
                  }
                }} style={{ color: 'var(--accent-red)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </>
            ) : (
              <button className="data-btn" onClick={() => navigate('/login')} style={{ color: 'var(--accent-blue)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Sign In / Sync to Cloud
              </button>
            )}

            <div className="data-divider"/>

            <button className="data-btn" onClick={handleExport} id="export-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {exportMsg && exportMsg.includes('Export') ? exportMsg : 'Export JSON Backup'}
            </button>
            <div className="data-divider"/>
            <label className="data-btn" id="import-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import JSON Backup
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <div className="data-divider"/>
            <button className="data-btn data-danger" onClick={() => setShowDelete(true)} id="clear-all-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              Wipe Device Data
            </button>
          </div>
        </div>

        {/* About ARISE-CV */}
        <div className="profile-section">
          <span className="section-label">ABOUT ARISE-CV</span>
          <div className="card mt-8" style={{ borderLeft: '2px solid var(--accent-blue)', padding: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              ARISE-CV is a companion tool for posture analysis. It uses <strong style={{ color: 'var(--text-primary)' }}>MediaPipe Pose</strong> for skeleton extraction and a custom CNN trained per exercise. Output is a timestamped PDF report showing posture errors and corrections. Runs 100% locally — no cloud, no LLM, just math.
            </p>
          </div>
        </div>

      </div>

      {/* Delete Confirm Sheet */}
      <AnimatePresence>
        {showDelete && <ConfirmDeleteSheet onConfirm={handleDeleteAll} onClose={() => setShowDelete(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ── InBody Scan Tracker ────────────────────────── */
function InBodyTracker({ scans }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ weight: '', smm: '', bf: '', score: '', photoUrl: '' });
  
  async function handleSave() {
    if (!formData.weight || !formData.smm || !formData.bf) return;
    await db.inbodyScans.put({
      date: new Date().toISOString(),
      weight: parseFloat(formData.weight),
      smm: parseFloat(formData.smm),
      bf: parseFloat(formData.bf),
      score: parseFloat(formData.score) || 0,
      photoUrl: formData.photoUrl
    });
    setShowForm(false);
    setFormData({ weight: '', smm: '', bf: '', score: '', photoUrl: '' });
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setFormData(p => ({ ...p, photoUrl: e.target.result }));
      reader.readAsDataURL(file);
    }
  }

  const latest = scans?.[0];

  return (
    <div className="profile-section">
      <span className="section-label">INBODY SCANS</span>
      <div className="card mt-8">
        {latest ? (
          <div className="inbody-latest">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Latest: {new Date(latest.date).toLocaleDateString()}</span>
              {latest.photoUrl && <span style={{ fontSize: 13, color: 'var(--accent-blue)' }}>📸 Proof attached</span>}
            </div>
            <div className="stat-overview-row" style={{ marginBottom: 0 }}>
              <div className="stat-overview-box">
                <span className="stat-number">{latest.weight}kg</span>
                <span className="section-label">Weight</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: 'var(--success)' }}>{latest.smm}kg</span>
                <span className="section-label">Muscle</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: 'var(--accent-red)' }}>{latest.bf}%</span>
                <span className="section-label">Fat</span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>No InBody scans recorded yet.</p>
        )}
        
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>+ ADD INBODY SCAN</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} style={{ zIndex: 1000 }}>
            <motion.div className="bottom-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} onClick={e => e.stopPropagation()}>
              <div className="bottom-sheet-handle" />
              <p className="section-label" style={{ marginBottom: 16 }}>RECORD INBODY SCAN</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="section-label">Weight (kg)</label>
                  <input type="number" inputMode="decimal" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label className="section-label">SMM - Muscle (kg)</label>
                  <input type="number" inputMode="decimal" value={formData.smm} onChange={e => setFormData(p => ({ ...p, smm: e.target.value }))} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label className="section-label">Body Fat (%)</label>
                  <input type="number" inputMode="decimal" value={formData.bf} onChange={e => setFormData(p => ({ ...p, bf: e.target.value }))} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label className="section-label">InBody Score</label>
                  <input type="number" inputMode="decimal" value={formData.score} onChange={e => setFormData(p => ({ ...p, score: e.target.value }))} style={{ marginTop: 4 }} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="section-label">Photo Proof (Optional)</label>
                {formData.photoUrl ? (
                  <div style={{ marginTop: 8, position: 'relative' }}>
                    <img src={formData.photoUrl} alt="InBody Proof" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                    <button onClick={() => setFormData(p => ({ ...p, photoUrl: '' }))} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: '50%' }}>❌</button>
                  </div>
                ) : (
                  <label style={{ display: 'block', marginTop: 8, padding: '16px', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--accent-blue)' }}>
                    Tap to upload scan photo
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              <button className="btn-primary" onClick={handleSave} disabled={!formData.weight || !formData.smm || !formData.bf}>SAVE SCAN</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Measurements Tracker ────────────────────────── */
function MeasurementsTracker({ measurements }) {
  const [showForm, setShowForm] = useState(false);
  const [showGuide, setShowGuide] = useState(null);
  const [formData, setFormData] = useState({ neck: '', chest: '', waist: '', arms: '' });

  const guides = {
    neck: 'Measure horizontally around the widest part of your neck.',
    chest: 'Measure across the nipples while breathing normally.',
    waist: 'Measure around the belly button, totally relaxed.',
    arms: 'Measure the thickest part of the bicep while flexed.'
  };

  async function handleSave() {
    await db.measurements.put({
      date: new Date().toISOString(),
      neck: parseFloat(formData.neck) || null,
      chest: parseFloat(formData.chest) || null,
      waist: parseFloat(formData.waist) || null,
      arms: parseFloat(formData.arms) || null
    });
    setShowForm(false);
    setFormData({ neck: '', chest: '', waist: '', arms: '' });
  }

  const latest = measurements?.[0];

  return (
    <div className="profile-section">
      <span className="section-label">BODY MEASUREMENTS</span>
      <div className="card mt-8">
        {latest ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {['neck', 'chest', 'waist', 'arms'].map(k => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}</span>
                <span className="stat-number">{latest[k] ? `${latest[k]} cm` : '-'}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>No measurements logged yet.</p>
        )}
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setShowForm(true)}>+ UPDATE MEASUREMENTS</button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} style={{ zIndex: 1000 }}>
            <motion.div className="bottom-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} onClick={e => e.stopPropagation()}>
              <div className="bottom-sheet-handle" />
              <p className="section-label" style={{ marginBottom: 16 }}>LOG MEASUREMENTS (cm)</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {['neck', 'chest', 'waist', 'arms'].map(k => (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="section-label" style={{ textTransform: 'capitalize' }}>{k}</label>
                      <button onClick={() => setShowGuide(k === showGuide ? null : k)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: 12, textDecoration: 'underline', padding: 0 }}>How to measure?</button>
                    </div>
                    <input type="number" inputMode="decimal" value={formData[k]} onChange={e => setFormData(p => ({ ...p, [k]: e.target.value }))} style={{ marginTop: 4 }} />
                    <AnimatePresence>
                      {showGuide === k && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'var(--bg-void)', padding: '8px 12px', borderRadius: 4, marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                          ℹ️ {guides[k]}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={handleSave}>SAVE MEASUREMENTS</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
