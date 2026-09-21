import { useState, useRef, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getRankInfo, calculateSetXP } from '../data/progression';
import { supabase } from '../db/supabaseClient';
import { useBackup } from '../hooks/useBackup';
import CircularProgress from '../components/profile/CircularProgress';
import MuscleRadarChart from '../components/profile/MuscleRadarChart';
import RankProgressionSheet from '../components/profile/RankProgressionSheet';
import ConfirmDeleteSheet from '../components/profile/ConfirmDeleteSheet';
import InBodyTracker from '../components/profile/InBodyTracker';
import MeasurementsTracker from '../components/profile/MeasurementsTracker';
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

const MUSCLE_ICONS = {
  Chest: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Back: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" />
      <path d="M12 22V12" />
      <path d="M12 12L3 7" />
      <path d="M12 12l9-5" />
    </svg>
  ),
  Arms: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10h-2.7a5.24 5.24 0 0 0-3.3-1.8L12 3v0a2 2 0 0 0-2 2v3.7a4.9 4.9 0 0 1-1.3 3.3L6.4 14" />
      <path d="M18 20a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-4a8 8 0 0 1-8-8v-2" />
    </svg>
  ),
  Legs: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M6 21V9a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v12" />
      <path d="M10 21V13h4v8" />
    </svg>
  ),
  Shoulders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Core: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </svg>
  ),
  Default: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 22 22 22" />
    </svg>
  )
};

function getAttributeRank(level) {
  if (level >= 9) return 'S-RANK SHADOW MONARCH';
  if (level >= 7) return 'A-RANK COMMANDER';
  if (level >= 5) return 'B-RANK VANGUARD';
  if (level >= 3) return 'C-RANK RAIDER';
  if (level >= 2) return 'D-RANK SLAYER';
  return 'E-RANK AWAKENED';
}

export default function ProfileScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  // Other screens can open the InBody sheet directly by navigating here with { openSheet: 'inbody' }.
  const [showInbody, setShowInbody] = useState(() => location.state?.openSheet === 'inbody');
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [showRankDetails, setShowRankDetails] = useState(false);
  const { syncing, syncStatus, exportMsg, backup, restore, exportFile } = useBackup();
  const [session, setSession] = useState(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (location.state?.openSheet === 'inbody') {
      // Clear the request so back/refresh doesn't reopen it
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.state, location.pathname, navigate]);

  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const achievements = useLiveQuery(() => db.achievements.toArray(), []);
  const inbodyScans = useLiveQuery(() => db.inbodyScans ? db.inbodyScans.orderBy('date').reverse().toArray() : [], []);
  const measurements = useLiveQuery(() => db.measurements ? db.measurements.orderBy('date').reverse().toArray() : [], []);
  const allSets = useLiveQuery(() => db.sets.toArray(), []);
  const allExercises = useLiveQuery(() => db.exercises.toArray(), []);

  const rankInfo = profile ? getRankInfo(profile.totalXP) : null;
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

  async function handleDeleteAll() {
    await db.delete();
    window.location.reload();
  }

  if (!profile) return (
    <div className="screen">
      <div className="screen-content loading-screen">
        <div className="shimmer" style={{ height: 100, borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />
        <div className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      </div>
    </div>
  );

  return (
    <div className="screen" id="profile-screen">
      <div className="profile-header">
        <h1 className="screen-title">PROFILE</h1>
        <button className="icon-btn" onClick={() => navigate('/settings')} id="settings-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>
      </div>

      <div className="screen-content">
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
          
          {/* Radar Chart */}
          <MuscleRadarChart muscleLevels={muscleLevels} />
          
          {/* Attributes Cards Grid */}
          <div className="muscle-mastery-list mt-16">
            {muscleLevels.map(([mg, data]) => {
              const mgCapitalized = mg.charAt(0).toUpperCase() + mg.slice(1).toLowerCase();
              const icon = MUSCLE_ICONS[mgCapitalized] || MUSCLE_ICONS.Default;
              const rank = getAttributeRank(data.level);
              const rankClass = rank.split('-')[0].toLowerCase() + '-rank'; // e.g. 's-rank', 'a-rank', etc.
              
              return (
                <div key={mg} className={`muscle-mastery-item card ${rankClass}`}>
                  <div className="muscle-mastery-inner">
                    <div className="stat-ring-container">
                      <CircularProgress progress={data.progress} size={64} strokeWidth={4.5} />
                      <div className="stat-ring-icon">
                        {icon}
                      </div>
                    </div>
                    <div className="stat-card-info">
                      <span className="muscle-mg">{mg.toUpperCase()}</span>
                      <div className="muscle-lvl-badge">
                        LVL {data.level}
                      </div>
                      <span className="muscle-rank-title">{rank}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                  <button className="sync-btn" onClick={backup} disabled={syncing}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    BACKUP
                  </button>
                  <button className="sync-btn" onClick={restore} disabled={syncing}>
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
              <button className="data-btn" onClick={exportFile} style={{ padding: 0, minHeight: 'auto' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                EXPORT .JSON
              </button>
              {exportMsg && <span className="sync-msg success">{exportMsg}</span>}
              {syncStatus && <span className={`sync-msg ${syncStatus.includes('failed') ? 'error' : 'success'}`}>{syncStatus}</span>}
            </div>
          </div>
        </div>

        {/* Tracker Section */}
        <InBodyTracker 
          scans={inbodyScans} 
          openSheet={showInbody} 
          setOpenSheet={setShowInbody} 
          unitPreference={profile?.unitPreference || 'kg'} 
          gender={profile?.gender}
          height={profile?.height}
        />
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
