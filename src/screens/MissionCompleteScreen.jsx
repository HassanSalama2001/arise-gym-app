import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { getRankInfo, RANKS } from '../data/progression';
import quotes from '../data/quotes';
import RankUpCinematic from '../components/RankUpCinematic';
import { playLevelUpSound } from '../utils/audio';
import { hapticLevelUp } from '../utils/haptics';
import { useAlert } from '../context/AlertContext';
import { getToday } from '../utils/date';
import './MissionCompleteScreen.css';

function FloatingParticle({ style }) {
  return (
    <motion.div
      className="particle"
      style={style}
      initial={{ y: '100vh', opacity: 0, scale: 0 }}
      animate={{ y: '-20vh', opacity: [0, 0.7, 0.7, 0], scale: [0, 1, 1, 0.5] }}
      transition={{ duration: style.duration, delay: style.delay, ease: 'linear', repeat: Infinity }}
    />
  );
}

function AnimatedNumber({ value, duration = 1500, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export default function MissionCompleteScreen() {
  const { showConfirm } = useAlert();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { sessionId, finalXP = 0, totalVol = 0, duration = 0, prevXP = 0, prevProfile, prevQuests, prevAchievements } = state || {};

  const [rankUp, setRankUp] = useState(null);
  const [showCinematic, setShowCinematic] = useState(false);
  const checkedRankUp = useRef(false);

  const profile = useLiveQuery(() => db.playerProfile.get('profile'));
  const sessionSets = useLiveQuery(() => sessionId ? db.sets.where('sessionId').equals(sessionId).toArray() : [], [sessionId]);
  const quests = useLiveQuery(() => db.dailyQuests.where('date').equals(getToday()).toArray());

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    if (checkedRankUp.current || !profile) return;
    checkedRankUp.current = true;

    const prevRankInfo = getRankInfo(prevXP);
    const newRankInfo = getRankInfo(profile.totalXP);
    if (newRankInfo.current.rank !== prevRankInfo.current.rank) {
      setRankUp({ prevRank: prevRankInfo.current, newRank: newRankInfo.current });
      setTimeout(() => {
        playLevelUpSound();
        hapticLevelUp();
        setShowCinematic(true);
      }, 600);
    }
  }, [profile, prevXP]);

  // Duration formatting
  const dSecs = Math.floor(duration / 1000);
  const dMins = Math.floor(dSecs / 60);
  const dHours = Math.floor(dMins / 60);
  const dStr = dHours > 0 ? `${dHours}h ${dMins % 60}m` : `${dMins}m ${dSecs % 60}s`;

  const completedSets = (sessionSets || []).filter(s => s.completed);
  const exerciseIds = [...new Set((sessionSets || []).map(s => s.exerciseId))];

  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    width: `${4 + Math.random() * 6}px`,
    height: `${4 + Math.random() * 6}px`,
    background: i % 3 === 0 ? 'var(--accent-blue)' : i % 3 === 1 ? 'var(--accent-gold)' : 'var(--success)',
    borderRadius: '50%',
    position: 'absolute',
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 3,
  }));

  if (!state) {
    navigate('/');
    return null;
  }

  return (
    <div className="mission-complete-screen" id="mission-complete-screen">
      {/* Floating particles */}
      <div className="particles-bg">
        {particles.map((p, i) => <FloatingParticle key={i} style={p} />)}
      </div>

      <div className="mission-complete-scroll">
        {/* Header */}
        <motion.div
          className="mc-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mc-title">MISSION COMPLETE</h1>
          <p className="mc-quote">"{quote.text}"</p>
          <p className="mc-quote-author">— {quote.author}</p>
        </motion.div>

        {/* XP Card */}
        <motion.div
          className="xp-gained-card"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <p className="section-label">XP GAINED</p>
          <div className="xp-gained-number">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span className="stat-number" style={{ fontSize: 56, color: 'var(--accent-gold)' }}>
              <AnimatedNumber value={finalXP} duration={1200} prefix="+" />
            </span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {[
            { label: 'DURATION', value: dStr, icon: '⏱' },
            { label: 'VOLUME', value: `${Math.round(totalVol).toLocaleString()} ${profile?.unitPreference || 'kg'}`, icon: '🏋️' },
            { label: 'SETS DONE', value: completedSets.length, icon: '✅' },
            { label: 'EXERCISES', value: exerciseIds.length, icon: '💪' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-box card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <span className="stat-box-icon">{stat.icon}</span>
              <span className="stat-box-value stat-number">{stat.value}</span>
              <span className="section-label">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Completed Quests */}
        {quests && quests.some(q => q.completed) && (
          <motion.div
            className="mc-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <span className="section-label">QUESTS COMPLETED</span>
            <div className="quest-complete-list mt-8">
              {quests.filter(q => q.completed).map(q => (
                <div key={q.id} className="quest-complete-row card">
                  <div className="quest-check">✓</div>
                  <span style={{ flex: 1, fontSize: 14, color: 'var(--text-primary)' }}>{q.description}</span>
                  <span className="chip chip-gold">+{q.xpReward} XP</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="mc-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button className="btn-primary" onClick={() => navigate('/')} id="save-exit-btn">
            SAVE & EXIT
          </button>
          <button
            className="btn-ghost"
            onClick={async () => {
              const confirmed = await showConfirm('Discard this workout? All XP and stats gained will be lost.', 'Discard Workout?', { danger: true });
              if (!confirmed) return;
              if (sessionId) {
                await db.sets.where('sessionId').equals(sessionId).delete();
                await db.sessions.delete(sessionId);
              }
              if (prevProfile) {
                await db.playerProfile.put(prevProfile);
              }
              if (prevQuests && prevQuests.length > 0) {
                for (const q of prevQuests) {
                  await db.dailyQuests.put(q);
                }
              }
              if (prevAchievements) {
                const prevIds = new Set(prevAchievements.map(a => a.id));
                const currentAchievements = await db.achievements.toArray();
                for (const ach of currentAchievements) {
                  if (!prevIds.has(ach.id)) {
                    await db.achievements.delete(ach.id);
                  }
                }
              }
              navigate('/');
            }}
            id="discard-complete-btn"
          >
            DISCARD
          </button>
        </motion.div>
      </div>

      {/* Rank Up Cinematic */}
      <AnimatePresence>
        {showCinematic && rankUp && (
          <RankUpCinematic
            prevRank={rankUp.prevRank}
            newRank={rankUp.newRank}
            onComplete={() => setShowCinematic(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
