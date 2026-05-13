import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useLocation } from 'react-router-dom';
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

/* ── Rank Progression Sheet ─────────────────────── */
function RankProgressionSheet({ currentXP, onClose }) {
  const currentRankInfo = getRankInfo(currentXP);
  
  return (
    <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ zIndex: 1100 }}>
      <motion.div 
        className="bottom-sheet" 
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="bottom-sheet-handle" />
        <h3 className="sheet-title">RANK PROGRESSION</h3>
        
        <div className="rank-list mt-16">
          {RANKS.map((rank, i) => {
            const isUnlocked = currentXP >= rank.minXP;
            const isCurrent = currentRankInfo.current.rank === rank.rank;
            const xpToReach = rank.minXP - currentXP;
            
            return (
              <div key={rank.rank} className={`rank-item ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`}>
                <div className="rank-item-badge" style={{ borderColor: rank.color, color: rank.color }}>
                  {rank.rank}
                </div>
                <div className="rank-item-info">
                  <span className="rank-item-name">{rank.name}</span>
                  <span className="section-label">
                    {isUnlocked 
                      ? (isCurrent ? 'CURRENT RANK' : 'UNLOCKED') 
                      : `REACH AT: ${rank.minXP.toLocaleString()} XP (${xpToReach.toLocaleString()} REMAINING)`}
                  </span>
                </div>
                {isUnlocked && <div className="rank-check">✓</div>}
              </div>
            );
          })}
        </div>
        
        <button className="btn-primary mt-24" onClick={onClose} style={{ marginBottom: 40 }}>GOT IT</button>
      </motion.div>
    </motion.div>
  );
}

function ConfirmDeleteSheet({ onConfirm, onClose }) {
  const [input, setInput] = useState('');
  return (
    <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div 
        className="bottom-sheet" 
        drag="y"
        dragConstraints={{ top: 0 }}
        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
        initial={{ y: '100%' }} 
        animate={{ y: 0 }} 
        exit={{ y: '100%' }} 
        transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
        onClick={e => e.stopPropagation()}
      >
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
        <div className="sheet-actions" style={{ paddingBottom: 40 }}>
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
  const location = useLocation();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [showInbody, setShowInbody] = useState(false);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [showRankDetails, setShowRankDetails] = useState(false);
  const [exportMsg, setExportMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [session, setSession] = useState(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state?.openSheet === 'inbody') {
      setShowInbody(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const profile = useLiveQuery(() => db.playerProfile.get('profile'));
  const achievements = useLiveQuery(() => db.achievements.toArray());
  const inbodyScans = useLiveQuery(() => db.inbodyScans ? db.inbodyScans.orderBy('date').reverse().toArray() : []);
  const measurements = useLiveQuery(() => db.measurements ? db.measurements.orderBy('date').reverse().toArray() : []);
  const allSets = useLiveQuery(() => db.sets.toArray());
  const allExercises = useLiveQuery(() => db.exercises.toArray());

  const rankInfo = useMemo(() => profile ? getRankInfo(profile.totalXP) : null, [profile?.totalXP]);
  const earnedTypes = new Set((achievements || []).map(a => a.type));

  const muscleXP = useMemo(() => {
    if (!allSets || !allExercises) return {};
    const totals = {};
    for (const set of allSets) {
      if (!set.completed) continue;
      const ex = allExercises.find(e => e.id === set.exerciseId);
      if (!ex) continue;
      const mg = ex.muscleGroup || 'Other';
      if (!totals[mg]) totals[mg] = 0;
      const xp = calculateSetXP(set.weight || 0, set.reps || 0, ex.difficulty || 'E', set.type || 'normal');
      totals[mg] += xp;
    }
    return totals;
  }, [allSets, allExercises]);

  const muscleLevels = useMemo(() => {
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

  async function handleBackup() {
    setSyncing(true);
    setSyncStatus('Backing up...');
    const res = await backupToCloud();
    if (res.success) {
      setSyncStatus('Backup successful');
      await db.playerProfile.update('profile', { lastSyncedAt: Date.now() });
    } else {
      setSyncStatus('Backup failed: ' + res.error);
    }
    setSyncing(false);
    setTimeout(() => setSyncStatus(''), 3000);
  }

  async function handleRestore() {
    if (!window.confirm('This will OVERWRITE your local data with cloud data. Continue?')) return;
    setSyncing(true);
    setSyncStatus('Restoring...');
    const res = await restoreFromCloud();
    if (res.success) {
      setSyncStatus('Restore successful');
      await db.playerProfile.update('profile', { lastSyncedAt: Date.now() });
      window.location.reload();
    } else {
      setSyncStatus('Restore failed: ' + res.error);
    }
    setSyncing(false);
    setTimeout(() => setSyncStatus(''), 3000);
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
    a.href = url;
    a.download = `arise-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setExportMsg('Exported successfully');
    setTimeout(() => setExportMsg(''), 3000);
  }

  async function handleDeleteAll() {
    await db.delete();
    window.location.reload();
  }

  if (!profile) return null;

  return (
    <div className="screen" id="profile-screen">
      <div className="screen-content">
        <div className="workouts-header">
          <h1 className="screen-title">PROFILE</h1>
          <button className="icon-btn" onClick={() => navigate('/login')} id="settings-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </button>
        </div>

        {/* Hunter Identity */}
        <div className="profile-hero">
          <motion.div 
            className="rank-badge rank-badge-lg" 
            style={{ borderColor: rankInfo?.current.color, color: rankInfo?.current.color, cursor: 'pointer' }}
            onClick={() => setShowRankDetails(true)}
            whileTap={{ scale: 0.9 }}
          >
            {rankInfo?.current.rank}
          </motion.div>
          {editingName ? (
            <div className="edit-name-row">
              <input ref={nameInputRef} type="text" value={nameVal} onChange={e => setNameVal(e.target.value)} onBlur={saveName} onKeyDown={e => e.key === 'Enter' && saveName()} id="edit-name-input" />
            </div>
          ) : (
            <div className="profile-name-row" onClick={startEditName}>
              <h2 className="profile-name">{profile.name.toUpperCase()}</h2>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          )}
          <span className="hunter-rank-name" style={{ color: rankInfo?.current.color }}>{rankInfo?.current.name}</span>
        </div>

        {/* Muscle Mastery */}
        <div className="profile-section">
          <span className="section-label">MUSCLE MASTERY</span>
          <div className="muscle-mastery-list mt-8">
            {muscleLevels.map(([mg, data]) => (
              <div key={mg} className="muscle-mastery-item card">
                <div className="muscle-mastery-top">
                  <span className="muscle-mg">{mg.toUpperCase()}</span>
                  <span className="muscle-level">LVL {data.level}</span>
                </div>
                <div className="progress-bar">
                  <motion.div className="progress-fill" style={{ width: `${data.progress * 100}%` }} initial={{ width: 0 }} animate={{ width: `${data.progress * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data & Sync Section */}
        <div className="profile-section">
          <span className="section-label">DATA & CLOUD SYNC</span>
          <div className="sync-card card mt-8">
            <div className="sync-status-row">
              <div className="sync-info">
                <span className="sync-status-label">{session ? (syncing ? 'SYNCING...' : 'CLOUD ACTIVE') : 'LOCAL ONLY'}</span>
                {profile.lastSyncedAt && (
                  <span className="last-sync-date">Last synced: {new Date(profile.lastSyncedAt).toLocaleString()}</span>
                )}
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
                    BACKUP
                  </button>
                  <button className="sync-btn" onClick={handleRestore} disabled={syncing}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    RESTORE
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => navigate('/login')} style={{ gridColumn: 'span 2' }}>
                  SIGN IN TO ENABLE SYNC
                </button>
              )}
            </div>

            <div className="sync-secondary-actions mt-16">
              <button className="data-btn" onClick={handleExport} style={{ padding: 0, minHeight: 'auto' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                EXPORT .JSON
              </button>
              {exportMsg && <span className="sync-msg success">{exportMsg}</span>}
              {syncStatus && <span className={`sync-msg ${syncStatus.includes('failed') ? 'error' : 'success'}`}>{syncStatus}</span>}
            </div>
          </div>
        </div>

        {/* Tracker Section */}
        <InBodyTracker scans={inbodyScans} openSheet={showInbody} setOpenSheet={setShowInbody} />
        <MeasurementsTracker measurements={measurements} openSheet={showMeasurement} setOpenSheet={setShowMeasurement} />

        {/* Achievements */}
        <div className="profile-section">
          <span className="section-label">ACHIEVEMENTS</span>
          <div className="achievements-grid mt-8">
            {ALL_ACHIEVEMENTS.map(a => {
              const earned = earnedTypes.has(a.type);
              return (
                <div key={a.type} className={`achievement-tile card ${earned ? 'earned' : 'locked'}`} id={`achievement-${a.type}`}>
                  <span className="achievement-tile-icon">{a.icon}</span>
                  <span className="achievement-tile-name">{a.title}</span>
                  <span className="achievement-tile-desc">{a.desc}</span>
                </div>
              );
            })}
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

        <button 
          className="btn-ghost" 
          style={{ margin: '32px 0 110px', color: 'var(--accent-red)', width: '100%' }} 
          onClick={() => setShowDelete(true)}
          id="danger-zone-btn"
        >
          DANGER ZONE: DELETE ACCOUNT
        </button>

      </div>

      {/* Sheets */}
      <AnimatePresence>
        {showDelete && <ConfirmDeleteSheet onConfirm={handleDeleteAll} onClose={() => setShowDelete(false)} />}
        {showRankDetails && <RankProgressionSheet currentXP={profile.totalXP} onClose={() => setShowRankDetails(false)} />}
      </AnimatePresence>
    </div>
  );
}

/* ── InBody Scan Tracker ────────────────────────── */
function InBodyTracker({ scans, openSheet, setOpenSheet }) {
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
    setOpenSheet(false);
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
        
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setOpenSheet(true)}>+ ADD INBODY SCAN</button>
      </div>

      <AnimatePresence>
        {openSheet && (
          <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenSheet(false)} style={{ zIndex: 1000 }}>
            <motion.div 
              className="bottom-sheet" 
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => { if (info.offset.y > 100) setOpenSheet(false); }}
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 40 }}
            >
              <div className="bottom-sheet-handle" />
              <p className="section-label" style={{ marginBottom: 16 }}>RECORD INBODY SCAN</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="section-label">Weight (kg)</label>
                  <input type="number" inputMode="decimal" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label className="section-label">SMM - Muscle (kg)</label>
                  <input type="number" inputMode="decimal" value={formData.smm} onChange={e => setFormData(p => ({ ...p, smm: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label className="section-label">Body Fat (%)</label>
                  <input type="number" inputMode="decimal" value={formData.bf} onChange={e => setFormData(p => ({ ...p, bf: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
                </div>
                <div>
                  <label className="section-label">InBody Score</label>
                  <input type="number" inputMode="decimal" value={formData.score} onChange={e => setFormData(p => ({ ...p, score: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
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
                  <label style={{ display: 'block', marginTop: 8, padding: '16px', border: '1px solid var(--border)', borderStyle: 'dashed', borderRadius: 'var(--radius-sm)', textAlign: 'center', color: 'var(--accent-blue)', cursor: 'pointer' }}>
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
function MeasurementsTracker({ measurements, openSheet, setOpenSheet }) {
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
    setOpenSheet(false);
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
                <span className="stat-number" style={{ fontSize: 16 }}>{latest[k]}cm</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>No measurements yet.</p>
        )}
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => setOpenSheet(true)}>+ ADD MEASUREMENTS</button>
      </div>

      <AnimatePresence>
        {openSheet && (
          <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpenSheet(false)} style={{ zIndex: 1000 }}>
            <motion.div 
              className="bottom-sheet" 
              drag="y"
              dragConstraints={{ top: 0 }}
              onDragEnd={(_, info) => { if (info.offset.y > 100) setOpenSheet(false); }}
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', stiffness: 400, damping: 35 }} 
              onClick={e => e.stopPropagation()}
              style={{ paddingBottom: 40 }}
            >
              <div className="bottom-sheet-handle" />
              <p className="section-label" style={{ marginBottom: 16 }}>RECORD MEASUREMENTS</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                {['neck', 'chest', 'waist', 'arms'].map(k => (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="section-label" style={{ textTransform: 'capitalize' }}>{k} (cm)</label>
                      <button className="guide-btn" onClick={() => setShowGuide(showGuide === k ? null : k)} style={{ background: 'var(--bg-void)', border: '1px solid var(--border)', width: 20, height: 20, borderRadius: '50%', fontSize: 10, color: 'var(--text-muted)' }}>?</button>
                    </div>
                    <input type="number" inputMode="decimal" value={formData[k]} onChange={e => setFormData(p => ({ ...p, [k]: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
                    <AnimatePresence>
                      {showGuide === k && (
                        <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ fontSize: 11, color: 'var(--accent-blue)', marginTop: 4, overflow: 'hidden' }}>
                          {guides[k]}
                        </motion.p>
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
