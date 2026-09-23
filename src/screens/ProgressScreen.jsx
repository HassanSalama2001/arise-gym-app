import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getRankInfo } from '../data/progression';
import SessionDetailModal from '../components/SessionDetailModal';
import AnimatedNumber from '../components/AnimatedNumber';
import { useNow } from '../hooks/useNow';
import { getToday, toLocalDateString } from '../utils/date';
import XPAreaChart from '../components/progress/XPAreaChart';
import VolumeBarChart from '../components/progress/VolumeBarChart';
import RankTimeline from '../components/progress/RankTimeline';
import SessionCard from '../components/progress/SessionCard';
import MuscleFrequencyGrid from '../components/progress/MuscleFrequencyGrid';
import ActivityHeatmap from '../components/progress/ActivityHeatmap';
import MuscleVolumeChart from '../components/progress/MuscleVolumeChart';
import InBodyProgressionChart from '../components/progress/InBodyProgressionChart';
import BodyWeightChart from '../components/progress/BodyWeightChart';
import OneRepMaxChart from '../components/progress/OneRepMaxChart';
import WorkoutCalendar from '../components/progress/WorkoutCalendar';
import './ProgressScreen.css';

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState('stats');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [calendarView, setCalendarView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const now = useNow();

  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const sessions = useLiveQuery(() => db.sessions.orderBy('startTime').reverse().toArray(), []);
  const sets = useLiveQuery(() => db.sets.toArray(), []);
  const achievements = useLiveQuery(() => db.achievements.orderBy('id').reverse().toArray(), []);
  const bodyWeights = useLiveQuery(() => db.bodyWeight.orderBy('date').toArray(), []);
  const inbodyScans = useLiveQuery(() => db.inbodyScans ? db.inbodyScans.orderBy('date').toArray() : [], []);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  // Sessions for selected date
  const selectedSessions = useMemo(() => {
    if (!sessions) return [];
    return sessions.filter(s => toLocalDateString(s.startTime) === selectedDate);
  }, [sessions, selectedDate]);

  // Build 30-day XP history
  const xpChartData = useMemo(() => {
    if (!sessions) return [];
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now - (29 - i) * 86400000);
      const dateStr = toLocalDateString(d);
      const daySessions = (sessions || []).filter(s => {
        const sd = toLocalDateString(s.startTime);
        return sd === dateStr;
      });
      return { date: dateStr, xp: daySessions.reduce((a, s) => a + (s.xpEarned || 0), 0) };
    });
    // Make cumulative
    let cum = 0;
    return days.map(d => { cum += d.xp; return { ...d, xp: cum }; });
  }, [sessions, now]);

  // Weekly volume (Mon-Sun)
  const weekData = useMemo(() => {
    if (!sessions || !sets) return Array.from({ length: 7 }, () => ({ vol: 0 }));
    const today = new Date(now);
    const dayOfWeek = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday.getTime() + i * 86400000);
      const dayEnd = new Date(day.getTime() + 86400000);
      const daySessions = sessions.filter(s => s.startTime >= day.getTime() && s.startTime < dayEnd.getTime());
      const vol = daySessions.reduce((acc, s) => {
        const sSets = sets.filter(st => st.sessionId === s.id && st.completed);
        return acc + sSets.reduce((a, st) => a + (st.weight * st.reps), 0);
      }, 0);
      return { vol: Math.round(vol) };
    });
  }, [sessions, sets, now]);

  // History filter
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    if (historyFilter === 'week') return sessions.filter(s => s.startTime > now - 7 * 86400000);
    if (historyFilter === 'month') return sessions.filter(s => s.startTime > now - 30 * 86400000);
    return sessions;
  }, [sessions, historyFilter, now]);

  const rankInfo = profile ? getRankInfo(profile.totalXP) : null;

  if (profile === undefined || sessions === undefined) {
    return (
      <div className="screen" id="progress-screen">
        <div className="screen-content" style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 16 }}>
          <div className="workouts-header">
            <h1 className="screen-title">PROGRESS</h1>
          </div>
          <div className="tab-pills" id="progress-tabs">
            <button className="tab-pill active" style={{ flex: 1 }}>STATS</button>
            <button className="tab-pill" style={{ flex: 1 }}>HISTORY</button>
          </div>
          {/* Stats boxes shimmer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="shimmer card" style={{ height: 60 }} />
            <div className="shimmer card" style={{ height: 60 }} />
            <div className="shimmer card" style={{ height: 60 }} />
          </div>
          {/* Chart Section Shimmers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="shimmer" style={{ width: '40%', height: 16, borderRadius: 4 }} />
            <div className="shimmer card" style={{ height: 140 }} />
            
            <div className="shimmer" style={{ width: '40%', height: 16, borderRadius: 4 }} />
            <div className="shimmer card" style={{ height: 120 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" id="progress-screen">
      <div className="screen-content">
        <div className="workouts-header">
          <h1 className="screen-title">PROGRESS</h1>
        </div>

        {/* Tab Pills */}
        <div className="tab-pills" id="progress-tabs">
          <button className={`tab-pill ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')} id="tab-stats">STATS</button>
          <button className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} id="tab-history">HISTORY</button>
        </div>

        {activeTab === 'stats' ? (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

            {/* XP Overview */}
            {profile && rankInfo && (
              <div className="stat-overview-row">
                {[
                  { label: 'TOTAL XP', value: profile.totalXP },
                  { label: 'SESSIONS', value: profile.totalSessions },
                  { label: 'BEST STREAK', value: profile.longestStreak },
                ].map(s => (
                  <div key={s.label} className="stat-overview-box card">
                    <span className="stat-number" style={{ fontSize: 22 }}><AnimatedNumber value={s.value} /></span>
                    <span className="section-label">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Consistency Calendar */}
            <div className="chart-section" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span className="section-label">CONSISTENCY</span>
                <div className="view-toggle">
                  <button className={calendarView === 'week' ? 'active' : ''} onClick={() => setCalendarView('week')}>WEEK</button>
                  <button className={calendarView === 'month' ? 'active' : ''} onClick={() => setCalendarView('month')}>MONTH</button>
                </div>
              </div>
              <div className="chart-card card">
                <WorkoutCalendar 
                  sessions={sessions || []} 
                  viewMode={calendarView}
                  selectedDate={selectedDate}
                  onDateClick={(d) => setSelectedDate(toLocalDateString(d))}
                />
                
                {/* Selected Day Details */}
                <div className="cal-details">
                  <span className="section-label" style={{ fontSize: 10, display: 'block', marginBottom: 8, textAlign: 'center' }}>
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                  </span>
                  {selectedSessions.length > 0 ? (
                    <div className="cal-session-strip">
                      {selectedSessions.map(s => (
                        <div key={s.id} className="cal-session-item">
                          <span className="session-name" style={{ fontSize: 14 }}>{s.name}</span>
                          <span className="chip chip-gold">+{s.xpEarned} XP</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center' }}>Rest Day</p>
                  )}
                </div>
              </div>
            </div>

            {/* XP Chart */}
            <div className="chart-section">
              <span className="section-label">XP HISTORY (30 DAYS)</span>
              <div className="chart-card card mt-8">
                <XPAreaChart data={xpChartData} />
              </div>
            </div>

            {/* Weekly Volume */}
            <div className="chart-section">
              <span className="section-label">WEEKLY VOLUME ({(profile?.unitPreference || 'kg').toUpperCase()})</span>
              <div className="chart-card card mt-8">
                <VolumeBarChart weekData={weekData} />
              </div>
            </div>

            {/* Estimated 1RM */}
            <div className="chart-section">
              <span className="section-label">ESTIMATED 1RM (EPLEY, {(profile?.unitPreference || 'kg').toUpperCase()})</span>
              <div className="chart-card card mt-8">
                <OneRepMaxChart sets={sets || []} sessions={sessions || []} exercises={exercises || []} />
              </div>
            </div>

            {/* Muscle Frequency */}
            <div className="chart-section">
              <span className="section-label">MUSCLE FREQUENCY THIS WEEK</span>
              <div className="mt-8">
                {sessions && sessions.length > 0
                  ? <MuscleFrequencyGrid sessions={sessions} sets={sets} />
                  : <div className="chart-empty chart-card card"><span className="section-label">NO DATA YET</span></div>
                }
              </div>
            </div>

            <div className="chart-section">
              <ActivityHeatmap sessions={sessions} />
            </div>

            <div className="chart-section">
              <MuscleVolumeChart sessions={sessions} sets={sets} unitPreference={profile.unitPreference || 'kg'} />
            </div>

            {/* Rank Timeline */}
            <div className="chart-section">
              <span className="section-label">RANK PROGRESSION</span>
              <div className="rank-timeline-card card mt-8" style={{ padding: 16 }}>
                {/* Current rank always shown */}
                {profile && rankInfo && (
                  <div className="current-rank-row">
                    <div className="rank-badge rank-badge-sm" style={{ borderColor: rankInfo.current.color, color: rankInfo.current.color }}>
                      {rankInfo.current.rank}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: rankInfo.current.color, fontSize: 15 }}>{rankInfo.current.name}</p>
                      <span className="section-label">CURRENT RANK</span>
                    </div>
                    {rankInfo.next && (
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)' }}>Next: {rankInfo.next.name}</p>
                        <span className="section-label">{(rankInfo.xpForNext - rankInfo.xpIntoRank).toLocaleString()} XP away</span>
                      </div>
                    )}
                  </div>
                )}
                <RankTimeline achievements={achievements || []} />
              </div>
            </div>

            {/* Body Weight Chart */}
            {bodyWeights && bodyWeights.length > 1 && (
              <div className="chart-section">
                <span className="section-label">BODY WEIGHT</span>
                <div className="chart-card card mt-8">
                  <BodyWeightChart data={bodyWeights} />
                </div>
              </div>
            )}

            {/* InBody Scan Progression Chart */}
            <div className="chart-section mt-24">
              <span className="section-label">INBODY PROTOCOL HISTORY</span>
              <div className="mt-8">
                <InBodyProgressionChart scans={inbodyScans || []} profile={profile} />
              </div>
            </div>

          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {/* Filter Pills */}
            <div className="filter-chips" id="history-filters">
              {[['all', 'ALL TIME'], ['month', 'THIS MONTH'], ['week', 'THIS WEEK']].map(([v, l]) => (
                <button key={v} className={`filter-chip ${historyFilter === v ? 'active' : ''}`} onClick={() => setHistoryFilter(v)} id={`filter-${v}`}>{l}</button>
              ))}
            </div>

            {filteredSessions.length > 0 ? (
              <div className="session-list">
                {filteredSessions.map(s => (
                  <SessionCard key={s.id} session={s} unitPreference={profile?.unitPreference} onClick={() => setSelectedSessionId(s.id)} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span style={{ fontSize: 36 }}>📊</span>
                <p>No sessions yet</p>
                <span className="section-label">Complete a workout to see your history</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedSessionId !== null && (
          <SessionDetailModal sessionId={selectedSessionId} onClose={() => setSelectedSessionId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
