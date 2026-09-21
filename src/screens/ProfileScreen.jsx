import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getRankInfo, RANKS, calculateSetXP } from '../data/progression';
import { supabase } from '../db/supabaseClient';
import { useBackup } from '../hooks/useBackup';
import { useAlert } from '../context/AlertContext';
import BottomSheet from '../components/BottomSheet';
import { compressImageToDataUrl } from '../utils/image';
import './ProfileScreen.css';
import { 
  calculateInBodyScore, 
  calculateBMI, 
  lbsToKg 
} from '../utils/calorieEngine';

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

function CircularProgress({ progress, size = 44, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="circular-progress">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-surface)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="progress-ring-circle"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

function MuscleRadarChart({ muscleLevels }) {
  const axes = ['Chest', 'Back', 'Arms', 'Legs', 'Shoulders', 'Core'];
  const maxLevel = 10;
  const width = 280;
  const height = 240;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 70;

  const levelsMap = {};
  axes.forEach(a => { levelsMap[a] = 1; });
  if (muscleLevels) {
    muscleLevels.forEach(([mg, data]) => {
      const match = axes.find(a => a.toLowerCase() === mg.toLowerCase());
      if (match) {
        levelsMap[match] = data.level;
      }
    });
  }

  const getCoordinates = (index, value) => {
    const angle = (index * 60) * Math.PI / 180 - Math.PI / 2;
    const factor = Math.min(value, maxLevel) / maxLevel;
    const d = radius * factor;
    return {
      x: centerX + d * Math.cos(angle),
      y: centerY + d * Math.sin(angle)
    };
  };

  const gridLevels = [2, 4, 6, 8, 10];
  const gridPaths = gridLevels.map(lvl => {
    const points = Array.from({ length: 6 }).map((_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x},${y}`;
    });
    return points.join(' ');
  });

  const userPoints = Array.from({ length: 6 }).map((_, i) => {
    const lvl = levelsMap[axes[i]];
    const { x, y } = getCoordinates(i, lvl);
    return `${x},${y}`;
  });
  const userPath = userPoints.join(' ');

  const userVertices = Array.from({ length: 6 }).map((_, i) => {
    const lvl = levelsMap[axes[i]];
    return getCoordinates(i, lvl);
  });

  const labelPositions = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * 60) * Math.PI / 180 - Math.PI / 2;
    const d = radius + 15;
    return {
      name: axes[i].toUpperCase(),
      level: levelsMap[axes[i]],
      x: centerX + d * Math.cos(angle),
      y: centerY + d * Math.sin(angle)
    };
  });

  return (
    <div className="radar-chart-container">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(79, 195, 247, 0.35)" />
            <stop offset="100%" stopColor="rgba(79, 195, 247, 0.02)" />
          </radialGradient>
        </defs>

        {gridPaths.map((path, idx) => (
          <polygon
            key={idx}
            points={path}
            fill="none"
            stroke="rgba(30, 58, 84, 0.4)"
            strokeWidth="1"
            strokeDasharray={idx < 4 ? "3 3" : "none"}
          />
        ))}

        {Array.from({ length: 6 }).map((_, i) => {
          const outer = getCoordinates(i, maxLevel);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={outer.x}
              y2={outer.y}
              stroke="rgba(30, 58, 84, 0.3)"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={userPath}
          fill="url(#radarGlow)"
          stroke="var(--accent-blue)"
          strokeWidth="2"
        />

        {userVertices.map((pt, i) => (
          <circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="var(--bg-void)"
            stroke="var(--accent-blue)"
            strokeWidth="1.5"
          />
        ))}

        {labelPositions.map((pos, i) => {
          let textAnchor = 'middle';
          if (i === 1 || i === 2) textAnchor = 'start';
          if (i === 4 || i === 5) textAnchor = 'end';
          
          let dy = '0.35em';
          if (i === 0) dy = '-0.1em';
          if (i === 3) dy = '1.1em';

          return (
            <g key={i}>
              <text
                x={pos.x}
                y={pos.y}
                textAnchor={textAnchor}
                dy={dy}
                className="radar-label"
              >
                {pos.name}
              </text>
              <text
                x={pos.x}
                y={pos.y}
                textAnchor={textAnchor}
                dy={i === 0 ? '-1.3em' : i === 3 ? '2.2em' : '1.3em'}
                className="radar-level-label"
              >
                LVL {pos.level}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Rank Progression Sheet ─────────────────────── */
function RankProgressionSheet({ currentXP, onClose }) {
  const currentRankInfo = getRankInfo(currentXP);
  
  return (
    <BottomSheet 
      onClose={onClose} 
      title="RANK PROGRESSION"
      footer={
        <button className="btn-primary w-full" onClick={onClose} style={{ marginBottom: 8 }}>GOT IT</button>
      }
    >
      <div className="rank-list mt-16">
        {RANKS.map((rank, i) => {
          const isUnlocked = currentXP >= rank.xpRequired;
          const isCurrent = currentRankInfo.current.rank === rank.rank;
          const xpToReach = rank.xpRequired - currentXP;
          
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
                    : `REACH AT: ${rank.xpRequired.toLocaleString()} XP (${xpToReach.toLocaleString()} REMAINING)`}
                </span>
              </div>
              {isUnlocked && <div className="rank-check">✓</div>}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

function ConfirmDeleteSheet({ onConfirm, onClose }) {
  const [input, setInput] = useState('');
  return (
    <BottomSheet 
      onClose={onClose} 
      title="DANGER ZONE"
      footer={
        <div className="sheet-actions" style={{ display: 'flex', gap: 8 }}>
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
      }
    >
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>This will permanently delete ALL your workout data, XP, and progress. Type <strong style={{ color: 'var(--text-primary)' }}>ARISE</strong> to confirm.</p>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type ARISE to confirm"
        id="delete-confirm-input"
        style={{ marginBottom: 16 }}
      />
    </BottomSheet>
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
      setShowInbody(true);
      // Only clear if we actually opened it
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

/* ── InBody Scan Tracker ────────────────────────── */
function InBodyTracker({ scans, openSheet, setOpenSheet, unitPreference, gender, height }) {
  const { showAlert, showConfirm, showToast } = useAlert();
  const [formData, setFormData] = useState({ weight: '', smm: '', bf: '', score: '', photoUrl: '' });
  
  async function handleSave() {
    if (!formData.weight || !formData.smm || !formData.bf) return;
    
    let scoreVal = parseFloat(formData.score) || 0;
    let scoreEstimated = false;
    
    if (scoreVal === 0 && height && gender) {
      const weightKg = unitPreference === 'lbs' ? lbsToKg(parseFloat(formData.weight)) : parseFloat(formData.weight);
      const smmKg = unitPreference === 'lbs' ? lbsToKg(parseFloat(formData.smm)) : parseFloat(formData.smm);
      scoreVal = calculateInBodyScore(weightKg, smmKg, parseFloat(formData.bf), height, gender);
      scoreEstimated = true;
    } else if (scoreVal > 0) {
      scoreEstimated = false;
    }

    await db.inbodyScans.put({
      date: new Date().toISOString(),
      weight: parseFloat(formData.weight),
      smm: parseFloat(formData.smm),
      bf: parseFloat(formData.bf),
      score: scoreVal,
      scoreEstimated,
      photoUrl: formData.photoUrl
    });
    setOpenSheet(false);
    setFormData({ weight: '', smm: '', bf: '', score: '', photoUrl: '' });
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const photoUrl = await compressImageToDataUrl(file);
      setFormData(p => ({ ...p, photoUrl }));
    } catch {
      showAlert('Could not read that image. Try a JPEG or PNG photo.', 'Photo Error');
    }
  }

  const unscoredCount = scans ? scans.filter(s => !s.score || s.score === 0).length : 0;
  const canRecalculate = unscoredCount > 0 && gender && height;

  async function handleBatchRecalculate() {
    const confirmation = await showConfirm(`Estimate scores for ${unscoredCount} historical scan(s) using your profile height (${height}cm) and gender (${gender.toUpperCase()})?`);
    if (!confirmation) return;
    
    await db.transaction('rw', db.inbodyScans, async () => {
      for (const scan of scans) {
        if (!scan.score || scan.score === 0) {
          const weightKg = unitPreference === 'lbs' ? lbsToKg(scan.weight) : scan.weight;
          const smmKg = unitPreference === 'lbs' ? lbsToKg(scan.smm) : scan.smm;
          const calculated = calculateInBodyScore(weightKg, smmKg, scan.bf, height, gender);
          await db.inbodyScans.update(scan.id, {
            score: calculated,
            scoreEstimated: true
          });
        }
      }
    });
    
    showToast(`Estimated scores for ${unscoredCount} scans!`);
  }

  const getScoreColor = (score) => {
    if (!score) return 'var(--text-secondary)';
    if (score >= 80) return 'var(--success)';
    if (score >= 70) return 'var(--accent-gold)';
    return 'var(--accent-red)';
  };

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
                <span className="stat-number">{latest.weight}{unitPreference}</span>
                <span className="section-label">Weight</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: 'var(--success)' }}>{latest.smm}{unitPreference}</span>
                <span className="section-label">Muscle</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: 'var(--accent-red)' }}>{latest.bf}%</span>
                <span className="section-label">Fat</span>
              </div>
              <div className="stat-overview-box">
                <span className="stat-number" style={{ color: getScoreColor(latest.score) }}>{latest.score || 'N/A'}</span>
                <span className="section-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  Score
                  {latest.scoreEstimated && <span style={{ fontSize: 9, color: 'var(--accent-blue)', opacity: 0.8, marginTop: 2 }}>⚡ EST.</span>}
                </span>
              </div>
            </div>

            {height ? (
              <div style={{ textAlign: 'center', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                BMI: <strong style={{ color: 'var(--text-primary)' }}>{calculateBMI(unitPreference === 'lbs' ? lbsToKg(latest.weight) : latest.weight, height)}</strong>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                ⚠️ Set Height in settings to view BMI and auto-calculate InBody Score
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '12px 0' }}>No InBody scans recorded yet.</p>
        )}
        
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn-ghost" style={{ marginTop: 16, flex: 1 }} onClick={() => setOpenSheet(true)}>+ ADD INBODY SCAN</button>
          {canRecalculate && (
            <button className="btn-ghost" style={{ marginTop: 16, flex: 1, color: 'var(--accent-blue)', borderColor: 'rgba(79, 195, 247, 0.3)' }} onClick={handleBatchRecalculate}>
              ⚡ ESTIMATE HISTORICAL ({unscoredCount})
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {openSheet && (
          <BottomSheet 
            onClose={() => setOpenSheet(false)} 
            title="RECORD INBODY SCAN"
            footer={
              <button className="btn-primary w-full" onClick={handleSave} disabled={!formData.weight || !formData.smm || !formData.bf}>SAVE SCAN</button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="section-label">Weight ({unitPreference})</label>
                <input type="number" inputMode="decimal" value={formData.weight} onChange={e => setFormData(p => ({ ...p, weight: e.target.value }))} onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)} style={{ marginTop: 4 }} />
              </div>
              <div>
                <label className="section-label">SMM - Muscle ({unitPreference})</label>
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
          </BottomSheet>
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
          <BottomSheet 
            onClose={() => setOpenSheet(false)} 
            title="RECORD MEASUREMENTS"
            footer={
              <button className="btn-primary w-full" onClick={handleSave}>SAVE MEASUREMENTS</button>
            }
          >
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
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
