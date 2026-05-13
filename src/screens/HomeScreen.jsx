import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getRankInfo, getRankColor, generateDailyQuests } from '../data/progression';
import './HomeScreen.css';

function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{display.toLocaleString()}</span>;
}

function StreakRing({ streak }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const maxStreak = 30;
  const progress = Math.min(streak / maxStreak, 1);
  const strokeColor = streak > 7 ? 'var(--accent-gold)' : 'var(--accent-blue)';

  return (
    <div className="streak-ring-container">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--bg-surface)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={strokeColor} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="streak-ring-text">
        <span className="streak-number stat-number">{streak}</span>
        <span className="streak-label">DAY STREAK</span>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const achievements = useLiveQuery(() => db.achievements.orderBy('id').reverse().limit(3).toArray(), []);
  const quests = useLiveQuery(() => db.dailyQuests.where('date').equals(getToday()).toArray(), []);

  useEffect(() => {
    let cancelled = false;
    async function checkQuests() {
      const today = getToday();
      const existing = await db.dailyQuests.where('date').equals(today).count();
      if (existing === 0 && !cancelled) {
        const newQuests = generateDailyQuests(today);
        const recheck = await db.dailyQuests.where('date').equals(today).count();
        if (recheck === 0 && !cancelled) {
          await db.dailyQuests.bulkAdd(newQuests);
        }
      }
    }
    
    // Initial check
    checkQuests();

    // Setup midnight countdown and periodic check
    function update() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight - now;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeToMidnight(`${h}h ${m}m`);
      
      // If the day rolls over while app is open, this will catch it
      checkQuests();
    }
    
    update();
    const iv = setInterval(update, 60000);
    
    // Check on resume
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        update();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => { 
      cancelled = true; 
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const rankInfo = useMemo(() => {
    if (!profile) return null;
    return getRankInfo(profile.totalXP);
  }, [profile?.totalXP]);

  const inbodyScans = useLiveQuery(() => db.inbodyScans.orderBy('date').reverse().limit(1).toArray());

  const showInBodyReminder = useMemo(() => {
    if (!inbodyScans) return false;
    if (profile?.postponedInBodyDate && new Date(profile.postponedInBodyDate) > new Date()) return false;
    if (inbodyScans.length === 0) return true;
    const lastScan = new Date(inbodyScans[0].date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return lastScan < thirtyDaysAgo;
  }, [inbodyScans, profile?.postponedInBodyDate]);

  async function postponeInBody() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    await db.playerProfile.update('profile', { postponedInBodyDate: nextWeek.toISOString() });
  }

  const [timeToMidnight, setTimeToMidnight] = useState('');

  if (!profile || !rankInfo) return <div className="screen"><div className="screen-content loading-screen">Loading...</div></div>;

  return (
    <div className="screen" id="home-screen">
      <div className="screen-content">
        {/* Header */}
        <motion.div
          className="home-header"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="arise-wordmark">ARISE</h1>
          <button className="icon-btn" aria-label="Notifications" id="notification-bell">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </button>
        </motion.div>

        {/* Hunter Card */}
        <motion.div
          className="hunter-card card card-glow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          id="hunter-card"
        >
          <div className="hunter-card-top">
            <div
              className="rank-badge rank-badge-md"
              style={{ borderColor: rankInfo.current.color, color: rankInfo.current.color, boxShadow: `0 0 12px ${rankInfo.current.color}40` }}
            >
              {rankInfo.current.rank}
            </div>
            <div className="hunter-rank-info">
              <span className="hunter-rank-name" style={{ color: rankInfo.current.color }}>{rankInfo.current.name}</span>
              <span className="hunter-rank-label section-label">RANK {rankInfo.current.rank}</span>
            </div>
          </div>

          <h2 className="hunter-name">{profile.name.toUpperCase()}</h2>

          <div className="xp-bar-section">
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                style={{ background: `linear-gradient(90deg, ${rankInfo.current.color}, var(--accent-blue))` }}
                initial={{ width: 0 }}
                animate={{ width: `${rankInfo.progress * 100}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <div className="xp-text">
              <span className="stat-number xp-current"><AnimatedNumber value={rankInfo.xpIntoRank} /></span>
              <span className="xp-separator"> / </span>
              <span className="xp-total">{rankInfo.xpForNext > 0 ? `${rankInfo.xpForNext.toLocaleString()} XP` : 'MAX RANK'}</span>
            </div>
          </div>

          <div className="hunter-stats-row">
            <div className="hunter-stat">
              <span className="stat-number"><AnimatedNumber value={profile.totalSessions} /></span>
              <span className="section-label">SESSIONS</span>
            </div>
            <div className="hunter-stat-divider" />
            <div className="hunter-stat">
              <span className="stat-number"><AnimatedNumber value={Math.round(profile.totalVolume)} /></span>
              <span className="section-label">VOLUME {profile.unitPreference.toUpperCase()}</span>
            </div>
            <div className="hunter-stat-divider" />
            <div className="hunter-stat">
              <span className="stat-number"><AnimatedNumber value={profile.currentStreak} /></span>
              <span className="section-label">STREAK</span>
            </div>
          </div>
        </motion.div>

        {/* InBody Reminder */}
        <AnimatePresence>
          {showInBodyReminder && (
            <motion.div className="card mt-24" style={{ borderLeft: '2px solid var(--accent-red)' }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 24 }}>⚖️</span>
                <div>
                  <h3 style={{ fontSize: 16, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>InBody Scan Due</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>It's been over 30 days since your last scan.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: 14 }} onClick={() => navigate('/profile', { state: { openSheet: 'inbody' } })}>UPDATE NOW</button>
                <button className="btn-ghost" style={{ flex: 1, padding: '8px', fontSize: 14 }} onClick={postponeInBody}>POSTPONE</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Daily Quests */}
        <motion.div
          className="section mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="section-header">
            <span className="section-label">DAILY QUESTS</span>
            <span className="quest-timer">{timeToMidnight}</span>
          </div>
          <div className="quest-list">
            {quests && quests.map((quest, i) => (
              <motion.div
                key={quest.id}
                className={`quest-card card ${quest.completed ? 'quest-completed' : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="quest-info">
                  <span className="quest-desc">{quest.description || quest.type}</span>
                  <div className="quest-progress-row">
                    <div className="progress-bar quest-progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min((quest.current / quest.target) * 100, 100)}%`,
                          background: quest.completed ? 'var(--success)' : 'var(--accent-blue)'
                        }}
                      />
                    </div>
                    <span className="quest-progress-text">{quest.current}/{quest.target}</span>
                  </div>
                </div>
                <div className="quest-reward">
                  {quest.completed ? (
                    <div className="quest-check">✓</div>
                  ) : (
                    <span className="chip chip-gold">+{quest.xpReward} XP</span>
                  )}
                </div>
              </motion.div>
            ))}
            {(!quests || quests.length === 0) && (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                Loading quests...
              </div>
            )}
          </div>
        </motion.div>

        {/* Streak Ring */}
        <motion.div
          className="section mt-24 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <StreakRing streak={profile.currentStreak} />
        </motion.div>

        {/* Recent Achievements */}
        {achievements && achievements.length > 0 && (
          <motion.div
            className="section mt-24"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <span className="section-label">RECENT ACHIEVEMENTS</span>
            <div className="achievements-list mt-8">
              {achievements.map((a, i) => (
                <div key={a.id} className="achievement-card card">
                  <span className="achievement-icon">🏆</span>
                  <div className="achievement-info">
                    <span className="achievement-title">{a.title}</span>
                    <span className="achievement-date">{new Date(a.date).toLocaleDateString()}</span>
                  </div>
                  <span className="chip chip-gold">+{a.xpAwarded} XP</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick action card */}
        <motion.div
          className="section mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button className="begin-mission-btn btn-primary" onClick={() => navigate('/log')} id="begin-mission-btn">
            BEGIN MISSION
          </button>
        </motion.div>
      </div>

      {/* Quick Log FAB */}
      <motion.button
        className="fab"
        onClick={() => navigate('/log')}
        whileTap={{ scale: 0.9 }}
        animate={{ boxShadow: ['0 0 8px rgba(79,195,247,0.3)', '0 0 24px rgba(79,195,247,0.5)', '0 0 8px rgba(79,195,247,0.3)'] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-label="Quick Log"
        id="quick-log-fab"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </motion.button>
    </div>
  );
}

function getToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
