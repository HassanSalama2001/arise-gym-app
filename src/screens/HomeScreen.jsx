import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getRankInfo, generateDailyQuests } from '../data/progression';
import { getToday } from '../utils/date';
import BottomSheet from '../components/BottomSheet';
import './HomeScreen.css';

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) { setDisplay(0); return; }
    let startTime = null;
    const startVal = 0;
    const endVal = value;
    
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplay(Math.floor(progress * (endVal - startVal) + startVal));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
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

let isCheckingQuests = false;

export default function HomeScreen() {
  const navigate = useNavigate();
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const achievements = useLiveQuery(() => db.achievements.orderBy('id').reverse().limit(3).toArray(), []);
  const quests = useLiveQuery(() => db.dailyQuests.where('date').equals(getToday()).toArray(), []);

  const todayStr = getToday();
  const loggedMeals = useLiveQuery(() => db.meals.where('date').equals(todayStr).toArray(), [todayStr]);
  const loggedHydration = useLiveQuery(() => db.hydration.where('date').equals(todayStr).toArray(), [todayStr]);

  const totalCalories = useMemo(() => {
    if (!loggedMeals) return 0;
    return loggedMeals.reduce((acc, m) => acc + (parseFloat(m.calories) || 0), 0);
  }, [loggedMeals]);

  const totalWater = useMemo(() => {
    if (!loggedHydration) return 0;
    return loggedHydration.reduce((acc, h) => acc + (parseInt(h.amountMl) || 0), 0);
  }, [loggedHydration]);

  const [timeToMidnight, setTimeToMidnight] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkQuests() {
      if (isCheckingQuests) return;
      const today = getToday();

      // Self-healing: Deduplicate existing quests if any duplicates exist in DB
      try {
        const todayQuests = await db.dailyQuests.where('date').equals(today).toArray();
        const uniqueTypes = new Set();
        const duplicatesToDelete = [];
        for (const q of todayQuests) {
          if (uniqueTypes.has(q.type)) {
            duplicatesToDelete.push(q.id);
          } else {
            uniqueTypes.add(q.type);
          }
        }
        if (duplicatesToDelete.length > 0) {
          await db.dailyQuests.bulkDelete(duplicatesToDelete);
        }
      } catch (err) {
        console.error('Failed to deduplicate daily quests:', err);
      }

      const existing = await db.dailyQuests.where('date').equals(today).count();
      if (existing === 0 && !cancelled) {
        isCheckingQuests = true;
        try {
          const newQuests = generateDailyQuests(today);
          const recheck = await db.dailyQuests.where('date').equals(today).count();
          if (recheck === 0 && !cancelled) {
            await db.dailyQuests.bulkAdd(newQuests);
          }
        } catch (err) {
          console.error('Failed to generate daily quests:', err);
        } finally {
          isCheckingQuests = false;
        }
      }
    }

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


  const notifications = useMemo(() => {
    const list = [];

    // 1. Quests notifications
    const pendingQuests = quests ? quests.filter(q => q.current < q.target) : [];
    if (pendingQuests.length > 0) {
      list.push({
        id: 'quests',
        title: 'Daily Quests Active',
        desc: `You have ${pendingQuests.length} daily quest${pendingQuests.length > 1 ? 's' : ''} remaining for today. Finish them to claim XP!`,
        icon: '🎯',
        time: 'Today'
      });
    }

    // 2. Streak warning / encouragement
    if (profile) {
      if (profile.streak > 0) {
        list.push({
          id: 'streak',
          title: `${profile.streak}-Day Streak Active!`,
          desc: 'Keep the momentum going. Log a workout today to preserve your streak.',
          icon: '🔥',
          time: 'Active'
        });
      } else {
        list.push({
          id: 'streak',
          title: 'Start a Streak!',
          desc: 'Complete your first workout to start your daily streak.',
          icon: '⚡',
          time: 'Encouragement'
        });
      }
    }

    // 3. Cloud / Offline mode status
    if (profile) {
      if (profile.guestMode) {
        list.push({
          id: 'sync',
          title: 'Offline Guest Mode',
          desc: 'Your workouts are saved locally on this device. Sign in to sync data across devices.',
          icon: '📴',
          time: 'Status'
        });
      } else {
        list.push({
          id: 'sync',
          title: 'Cloud Sync Active',
          desc: 'All your workout history, achievements, and stats are securely backed up to the cloud.',
          icon: '☁️',
          time: 'Status'
        });
      }
    }

    // 4. Latest Achievement
    if (achievements && achievements.length > 0) {
      const sorted = [...achievements].sort((a, b) => b.unlockedAt - a.unlockedAt);
      list.push({
        id: 'achievement',
        title: 'Achievement Unlocked!',
        desc: `You unlocked the "${sorted[0].title}" achievement!`,
        icon: '🏆',
        time: new Date(sorted[0].unlockedAt).toLocaleDateString()
      });
    }

    return list;
  }, [quests, profile, achievements]);

  if (!profile || !rankInfo) {
    return (
      <div className="screen">
        <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
          {/* Header Shimmer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="shimmer" style={{ width: 64, height: 64, borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div className="shimmer" style={{ width: '60%', height: 20, borderRadius: 4 }} />
              <div className="shimmer" style={{ width: '40%', height: 14, borderRadius: 4 }} />
            </div>
          </div>
          {/* XP Bar Shimmer */}
          <div className="shimmer" style={{ width: '100%', height: 16, borderRadius: 8 }} />
          {/* Action Card Shimmer */}
          <div className="shimmer" style={{ width: '100%', height: 90, borderRadius: 'var(--radius-md)' }} />
          {/* Quests Shimmer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="shimmer" style={{ width: '30%', height: 16, borderRadius: 4 }} />
            <div className="shimmer" style={{ width: '100%', height: 70, borderRadius: 'var(--radius-md)' }} />
            <div className="shimmer" style={{ width: '100%', height: 70, borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      </div>
    );
  }

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
          <button
            className="icon-btn"
            aria-label="Notifications"
            id="notification-bell"
            onClick={() => setShowNotifications(true)}
            style={{ position: 'relative' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            {notifications.length > 0 && <span className="notification-badge" />}
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

        {/* Nutrition Chamber Card */}
        <motion.div
          className="nutrition-card card mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="nutrition-card-header">
            <h3 className="nutrition-card-title">NUTRITION CHAMBER</h3>
            <span style={{ fontSize: 20 }}>🍎</span>
          </div>

          <div className="nutrition-card-stats">
            <div className="nutrition-stat-pill">
              <span className="nutrition-stat-label section-label">CALORIES LOGGED</span>
              <div className="nutrition-stat-value">
                {Math.round(totalCalories)} <span className="nutrition-stat-unit">kcal</span>
              </div>
            </div>
            <div className="nutrition-stat-pill">
              <span className="nutrition-stat-label section-label">WATER INTAKE</span>
              <div className="nutrition-stat-value">
                {totalWater} <span className="nutrition-stat-unit">/ 3000 ml</span>
              </div>
            </div>
          </div>

          <button className="btn-ghost mt-8" onClick={() => navigate('/meals')} style={{ minHeight: 40, width: '100%' }}>
            ACCESS CHAMBER
          </button>
        </motion.div>

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
              {achievements.map(a => (
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

      {/* Notifications Bottom Sheet */}
      <AnimatePresence>
        {showNotifications && (
          <BottomSheet
            onClose={() => setShowNotifications(false)}
            title="SYSTEM NOTIFICATIONS"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div key={n.id} className="card" style={{ display: 'flex', gap: 12, padding: 14, alignItems: 'center' }}>
                    <span style={{ fontSize: 24, flexShrink: 0 }}>{n.icon}</span>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.desc}</span>
                    </div>
                    <span className="section-label" style={{ fontSize: 9, alignSelf: 'flex-start' }}>{n.time}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <span style={{ fontSize: 32 }}>🔔</span>
                  <p>All caught up!</p>
                  <span className="section-label">No new notifications at this time</span>
                </div>
              )}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
