import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { getRankInfo } from '../data/progression';
import { TRAINED_MUSCLE_GROUPS } from '../data/muscleGroups';
import SessionDetailModal from '../components/SessionDetailModal';
import AnimatedNumber from '../components/AnimatedNumber';
import { useNow } from '../hooks/useNow';
import './ProgressScreen.css';
import { 
  calculateInBodyScore, 
  calculateBMI, 
  lbsToKg 
} from '../utils/calorieEngine';

/* ── SVG Area Chart (XP over 30 days) ────────────── */
function XPAreaChart({ data }) {
  const W = 340, H = 120, PAD = 10;
  if (!data || data.length < 2) return (
    <div className="chart-empty"><span className="section-label">LOG WORKOUTS TO SEE DATA</span></div>
  );
  const maxVal = Math.max(...data.map(d => d.xp), 1);
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((d.xp / maxVal) * (H - PAD * 2));
    return [x, y];
  });
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(' ');
  const area = `M${pts[0][0]},${H - PAD} L${polyline.split(' ').map(p => p).join(' L')} L${pts[pts.length - 1][0]},${H - PAD} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="area-chart">
      <defs>
        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="var(--accent-blue)" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#xpGrad)"/>
      <polyline points={polyline} fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="var(--accent-blue)"/>
      ))}
    </svg>
  );
}

/* ── Weekly Volume Bar Chart ──────────────────────── */
function VolumeBarChart({ weekData }) {
  const W = 340, H = 100, PAD = 8;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxVol = Math.max(...weekData.map(d => d.vol), 1);
  const barW = (W - PAD * 2) / 7 - 4;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} className="bar-chart">
      {weekData.map((d, i) => {
        const barH = d.vol > 0 ? Math.max(((d.vol / maxVol) * (H - PAD)), 4) : 0;
        const x = PAD + i * ((W - PAD * 2) / 7) + 2;
        const y = H - barH;
        const todayDay = new Date().getDay();
        const todayIdx = todayDay === 0 ? 6 : todayDay - 1;
        const isToday = i === todayIdx;
        return (
          <g key={i}>
            {barH > 0 && (
              <motion.rect
                x={x} y={y} width={barW} height={barH} rx="3"
                fill={isToday ? 'var(--accent-gold)' : (d.vol > 0 ? 'var(--accent-blue)' : 'var(--bg-surface)')}
                opacity={isToday ? 1.0 : 0.8}
                initial={{ scaleY: 0, originY: 1 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                style={{ transformOrigin: `${x + barW / 2}px ${H}px` }}
              />
            )}
            {barH === 0 && (
              <rect x={x} y={H - 3} width={barW} height={3} rx="2" fill={isToday ? 'var(--accent-gold)' : 'var(--bg-surface)'} opacity={isToday ? 0.6 : 0.4}/>
            )}
            <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize="10" fill={isToday ? 'var(--accent-gold)' : 'var(--text-muted)'} fontWeight={isToday ? '700' : '600'} fontFamily="var(--font-display)">{days[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Muscle Frequency Grid ────────────────────────── */
function MuscleGrid({ data }) {
  const muscles = TRAINED_MUSCLE_GROUPS;
  const maxCount = Math.max(...muscles.map(m => data[m] || 0), 1);
  return (
    <div className="muscle-grid">
      {muscles.map(m => {
        const count = data[m] || 0;
        const intensity = count / maxCount;
        return (
          <div
            key={m}
            className="muscle-cell"
            style={{ background: `rgba(79, 195, 247, ${0.05 + intensity * 0.7})`, borderColor: `rgba(79, 195, 247, ${0.1 + intensity * 0.5})` }}
          >
            <span className="muscle-cell-name">{m}</span>
            <span className="muscle-cell-count stat-number">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Rank Timeline ────────────────────────────────── */
function RankTimeline({ achievements }) {
  const rankUps = achievements.filter(a => a.type === 'rankup');
  if (rankUps.length === 0) return (
    <div className="chart-empty"><span className="section-label">NO RANK-UPS YET — KEEP GRINDING</span></div>
  );
  return (
    <div className="rank-timeline">
      {rankUps.map((a, i) => (
        <div key={a.id} className="rank-timeline-item">
          <div className="rank-timeline-dot" style={{ background: a.rankColor || 'var(--accent-blue)' }}/>
          {i < rankUps.length - 1 && <div className="rank-timeline-line"/>}
          <div className="rank-timeline-info">
            <span className="rank-timeline-rank" style={{ color: a.rankColor || 'var(--accent-blue)' }}>{a.title}</span>
            <span className="section-label">{new Date(a.date).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── History Session Card ─────────────────────────── */
function SessionCard({ session, onClick, unitPreference }) {
  const dur = session.endTime ? session.endTime - session.startTime : 0;
  const mins = Math.floor(dur / 60000);
  return (
    <motion.div className="session-card card" onClick={onClick} whileTap={{ scale: 0.97 }} id={`session-${session.id}`}>
      <div className="session-card-top">
        <span className="session-name">{session.name}</span>
        <span className="session-xp chip chip-gold">+{session.xpEarned || 0} XP</span>
      </div>
      <div className="session-card-meta">
        <span className="section-label">{new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        <span className="section-label">{mins}m · {session.volume || 0} {unitPreference || 'kg'}</span>
      </div>
    </motion.div>
  );
}

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState('stats');
  const [historyFilter, setHistoryFilter] = useState('all');
  const [calendarView, setCalendarView] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
    return sessions.filter(s => new Date(s.startTime).toISOString().split('T')[0] === selectedDate);
  }, [sessions, selectedDate]);

  // Build 30-day XP history
  const xpChartData = useMemo(() => {
    if (!sessions) return [];
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now - (29 - i) * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const daySessions = (sessions || []).filter(s => {
        const sd = new Date(s.startTime).toISOString().split('T')[0];
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
                  onDateClick={(d) => setSelectedDate(d.toISOString().split('T')[0])}
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

/* Muscle frequency with exercise DB lookup */
function MuscleFrequencyGrid({ sessions, sets }) {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const now = useNow();
  const weekAgo = now - 7 * 86400000;
  const weekSessions = (sessions || []).filter(s => s.startTime > weekAgo);
  const weekSessionIds = new Set(weekSessions.map(s => s.id));
  const weekSets = (sets || []).filter(s => weekSessionIds.has(s.sessionId) && s.completed);
  const muscles = TRAINED_MUSCLE_GROUPS;
  const data = {};
  muscles.forEach(m => { data[m] = 0; });
  weekSets.forEach(s => {
    const ex = (exercises || []).find(e => e.id === s.exerciseId);
    if (ex && data[ex.muscleGroup] !== undefined) data[ex.muscleGroup]++;
  });
  return <MuscleGrid data={data} />;
}

function InBodyProgressionChart({ scans, profile }) {
  const [chartMode, setChartMode] = useState('overview');
  
  const unitPreference = profile?.unitPreference || 'kg';
  const height = profile?.height || 0;
  const gender = profile?.gender || '';

  // Process scans to calculate missing scores on-the-fly
  const processedScans = useMemo(() => {
    if (!scans) return [];
    const sorted = [...scans].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map(scan => {
      let score = scan.score || 0;
      if (score === 0 && height && gender) {
        const weightKg = unitPreference === 'lbs' ? lbsToKg(scan.weight) : scan.weight;
        const smmKg = unitPreference === 'lbs' ? lbsToKg(scan.smm) : scan.smm;
        score = calculateInBodyScore(weightKg, smmKg, scan.bf, height, gender);
      }
      return {
        ...scan,
        score
      };
    });
  }, [scans, height, gender, unitPreference]);

  if (!processedScans || processedScans.length === 0) {
    return (
      <div className="chart-empty chart-card card" style={{ height: 'auto', padding: '24px 16px', flexDirection: 'column' }}>
        <span style={{ fontSize: 24, marginBottom: 8 }}>📊</span>
        <span className="section-label" style={{ fontSize: 12 }}>NO INBODY SCANS LOGGED YET</span>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center', maxWidth: '80%', lineHeight: 1.4 }}>
          Go to the Profile tab and log your InBody scan data to view progression.
        </p>
      </div>
    );
  }

  if (processedScans.length === 1) {
    const single = processedScans[0];
    return (
      <div className="chart-card card" style={{ padding: 16 }}>
        <span className="section-label">INBODY OVERVIEW</span>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '8px 0 16px 0', textAlign: 'center', lineHeight: 1.4 }}>
          Log at least 2 scans to unlock progression charts. Here is your latest scan:
        </p>
        <div className="stat-overview-row" style={{ marginBottom: 0 }}>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ fontSize: 18 }}>{single.weight}{unitPreference}</span>
            <span className="section-label" style={{ fontSize: 9 }}>Weight</span>
          </div>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ color: 'var(--success)', fontSize: 18 }}>{single.smm}{unitPreference}</span>
            <span className="section-label" style={{ fontSize: 9 }}>Muscle</span>
          </div>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ color: 'var(--accent-red)', fontSize: 18 }}>{single.bf}%</span>
            <span className="section-label" style={{ fontSize: 9 }}>Fat</span>
          </div>
          <div className="stat-overview-box">
            <span className="stat-number" style={{ color: 'var(--accent-gold)', fontSize: 18 }}>{single.score}</span>
            <span className="section-label" style={{ fontSize: 9 }}>Score</span>
          </div>
        </div>
      </div>
    );
  }

  // Delta calculations
  const firstScan = processedScans[0];
  const latestScan = processedScans[processedScans.length - 1];
  
  const scoreDelta = latestScan.score - firstScan.score;
  const smmDelta = latestScan.smm - firstScan.smm;
  const bfDelta = latestScan.bf - firstScan.bf;

  const W = 340;
  const H = 120;
  const PAD = 15;

  // Overview mode coordinates
  const smmVals = processedScans.map(s => s.smm);
  let smmMin = Math.min(...smmVals);
  let smmMax = Math.max(...smmVals);
  if (smmMin === smmMax) { smmMin -= 1; smmMax += 1; }
  else { const padding = (smmMax - smmMin) * 0.1 || 1; smmMin -= padding; smmMax += padding; }

  const bfVals = processedScans.map(s => s.bf);
  let bfMin = Math.min(...bfVals);
  let bfMax = Math.max(...bfVals);
  if (bfMin === bfMax) { bfMin -= 1; bfMax += 1; }
  else { const padding = (bfMax - bfMin) * 0.1 || 1; bfMin -= padding; bfMax += padding; }

  const smmPts = processedScans.map((s, i) => {
    const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
    const y = H - PAD - 15 - (((s.smm - smmMin) / (smmMax - smmMin)) * (H - PAD * 2 - 20));
    return [x, y];
  });
  const smmLinePath = smmPts.map(([x, y]) => `${x},${y}`).join(' ');
  const smmAreaPath = `M${smmPts[0][0]},${H - PAD - 5} L${smmLinePath.split(' ').join(' L')} L${smmPts[smmPts.length - 1][0]},${H - PAD - 5} Z`;

  const bfPts = processedScans.map((s, i) => {
    const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
    const y = H - PAD - 15 - (((s.bf - bfMin) / (bfMax - bfMin)) * (H - PAD * 2 - 20));
    return [x, y];
  });
  const bfLinePath = bfPts.map(([x, y]) => `${x},${y}`).join(' ');
  const bfAreaPath = `M${bfPts[0][0]},${H - PAD - 5} L${bfLinePath.split(' ').join(' L')} L${bfPts[bfPts.length - 1][0]},${H - PAD - 5} Z`;

  // Deep Dive Mode computations
  const getDeepDiveData = () => {
    switch (chartMode) {
      case 'score':
        return processedScans.map(s => s.score);
      case 'weight':
        return processedScans.map(s => s.weight);
      case 'smm':
        return processedScans.map(s => s.smm);
      case 'bf':
        return processedScans.map(s => s.bf);
      case 'bfm':
        return processedScans.map(s => Math.round(s.weight * (s.bf / 100) * 10) / 10);
      case 'bmi':
        return processedScans.map(s => calculateBMI(unitPreference === 'lbs' ? lbsToKg(s.weight) : s.weight, height));
      default:
        return [];
    }
  };

  const deepDiveVals = getDeepDiveData();
  let ddMin = Math.min(...deepDiveVals);
  let ddMax = Math.max(...deepDiveVals);
  if (ddMin === ddMax) { ddMin -= 1; ddMax += 1; }
  else { const padding = (ddMax - ddMin) * 0.1 || 1; ddMin -= padding; ddMax += padding; }

  const ddPts = processedScans.map((s, i) => {
    const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
    const val = deepDiveVals[i];
    const y = H - PAD - 15 - (((val - ddMin) / (ddMax - ddMin)) * (H - PAD * 2 - 20));
    return [x, y];
  });
  const ddLinePath = ddPts.map(([x, y]) => `${x},${y}`).join(' ');
  const ddAreaPath = `M${ddPts[0][0]},${H - PAD - 5} L${ddLinePath.split(' ').join(' L')} L${ddPts[ddPts.length - 1][0]},${H - PAD - 5} Z`;

  const getDeepDiveColor = () => {
    if (chartMode === 'score') return 'var(--accent-gold)';
    if (chartMode === 'weight') return 'var(--accent-blue)';
    if (chartMode === 'smm') return 'var(--success)';
    if (chartMode === 'bf' || chartMode === 'bfm') return 'var(--accent-red)';
    return 'var(--text-secondary)';
  };

  const getDeepDiveTitle = () => {
    const titles = {
      score: 'InBody Score',
      weight: `Weight (${unitPreference})`,
      smm: `Muscle - SMM (${unitPreference})`,
      bf: 'Body Fat (%)',
      bfm: `Body Fat Mass (${unitPreference})`,
      bmi: 'Body Mass Index (BMI)'
    };
    return titles[chartMode] || '';
  };

  return (
    <div className="inbody-progression-section">
      {/* 1. Delta Badges */}
      <div className="inbody-delta-row">
        <div className={`delta-badge ${scoreDelta >= 0 ? 'positive' : 'negative'}`}>
          <span className="delta-label">SCORE</span>
          <span className="delta-value">{firstScan.score} → {latestScan.score}</span>
          <span className="delta-diff">{scoreDelta >= 0 ? `▲+${scoreDelta}` : `▼${scoreDelta}`}</span>
        </div>
        <div className={`delta-badge ${smmDelta >= 0 ? 'positive' : 'negative'}`}>
          <span className="delta-label">SMM</span>
          <span className="delta-value" style={{ fontSize: 10 }}>{firstScan.smm} → {latestScan.smm}</span>
          <span className="delta-diff">{smmDelta >= 0 ? `▲+${Math.round(smmDelta*10)/10}` : `▼${Math.round(smmDelta*10)/10}`}</span>
        </div>
        <div className={`delta-badge ${bfDelta <= 0 ? 'positive' : 'negative'}`}>
          <span className="delta-label">BF%</span>
          <span className="delta-value" style={{ fontSize: 10 }}>{firstScan.bf}% → {latestScan.bf}%</span>
          <span className="delta-diff">{bfDelta <= 0 ? `▼${Math.abs(Math.round(bfDelta*10)/10)}%` : `▲+${Math.round(bfDelta*10)/10}%`}</span>
        </div>
      </div>

      {/* 2. Chart Toggle Controls */}
      <div className="inbody-chart-controls mt-16">
        <div className="tab-pills" style={{ margin: 0 }}>
          <button 
            className={`tab-pill ${chartMode === 'overview' ? 'active' : ''}`}
            onClick={() => setChartMode('overview')}
            style={{ fontSize: 10, padding: '4px 8px' }}
          >
            OVERVIEW
          </button>
          <button 
            className={`tab-pill ${chartMode !== 'overview' ? 'active' : ''}`}
            onClick={() => setChartMode('score')}
            style={{ fontSize: 10, padding: '4px 8px' }}
          >
            DEEP DIVE
          </button>
        </div>

        {chartMode !== 'overview' && (
          <select 
            value={chartMode} 
            onChange={e => setChartMode(e.target.value)}
            className="chart-selector-dropdown"
          >
            <option value="score">InBody Score</option>
            <option value="weight">Body Weight</option>
            <option value="smm">Muscle (SMM)</option>
            <option value="bf">Body Fat (%)</option>
            <option value="bfm">Body Fat Mass</option>
            <option value="bmi">BMI</option>
          </select>
        )}
      </div>

      {/* 3. SVG Chart Card */}
      <div className="chart-card card mt-12" style={{ padding: '16px 12px 24px 12px', position: 'relative' }}>
        {chartMode === 'overview' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, padding: '0 4px' }}>
              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>🟢 SMM (Left Y)</span>
              <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>🔴 BF% (Right Y)</span>
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${H + 15}`} className="area-chart">
              <defs>
                <linearGradient id="smmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success)" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="var(--success)" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="bfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-red)" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="var(--accent-red)" stopOpacity="0"/>
                </linearGradient>
              </defs>
              
              {/* Draw SMM Area and Line */}
              <path d={smmAreaPath} fill="url(#smmGrad)"/>
              <polyline points={smmLinePath} fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Draw BF% Area and Line */}
              <path d={bfAreaPath} fill="url(#bfGrad)"/>
              <polyline points={bfLinePath} fill="none" stroke="var(--accent-red)" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" strokeLinejoin="round"/>
              
              {/* Point Circles */}
              {smmPts.map(([x, y], i) => (
                <circle key={`smm-${i}`} cx={x} cy={y} r="3.5" fill="var(--success)"/>
              ))}
              {bfPts.map(([x, y], i) => (
                <circle key={`bf-${i}`} cx={x} cy={y} r="3" fill="var(--accent-red)"/>
              ))}

              {/* X Axis Date Labels */}
              {processedScans.map((scan, i) => {
                const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
                const isBoundary = i === 0 || i === processedScans.length - 1;
                const isMiddle = processedScans.length > 3 && i === Math.floor(processedScans.length / 2);
                if (isBoundary || isMiddle) {
                  return (
                    <text 
                      key={`lbl-${i}`}
                      x={x} 
                      y={H + 10} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="var(--text-muted)" 
                      fontFamily="var(--font-display)"
                      fontWeight="600"
                    >
                      {new Date(scan.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, padding: '0 4px' }}>
              <span style={{ color: getDeepDiveColor(), fontWeight: 'bold' }}>{getDeepDiveTitle().toUpperCase()}</span>
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${H + 15}`} className="area-chart">
              <defs>
                <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={getDeepDiveColor()} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={getDeepDiveColor()} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d={ddAreaPath} fill="url(#ddGrad)"/>
              <polyline points={ddLinePath} fill="none" stroke={getDeepDiveColor()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              {ddPts.map(([x, y], i) => (
                <g key={`dd-pt-${i}`}>
                  <circle cx={x} cy={y} r="4.5" fill="var(--bg-card)" stroke={getDeepDiveColor()} strokeWidth="2"/>
                  <text 
                    x={x} 
                    y={y - 8} 
                    textAnchor="middle" 
                    fontSize="9" 
                    fill="var(--text-primary)" 
                    fontFamily="var(--font-display)"
                    fontWeight="700"
                  >
                    {deepDiveVals[i]}
                  </text>
                </g>
              ))}

              {/* X Axis Date Labels */}
              {processedScans.map((scan, i) => {
                const x = PAD + (i / (processedScans.length - 1)) * (W - PAD * 2);
                const isBoundary = i === 0 || i === processedScans.length - 1;
                const isMiddle = processedScans.length > 3 && i === Math.floor(processedScans.length / 2);
                if (isBoundary || isMiddle) {
                  return (
                    <text 
                      key={`dd-lbl-${i}`}
                      x={x} 
                      y={H + 10} 
                      textAnchor="middle" 
                      fontSize="9" 
                      fill="var(--text-muted)" 
                      fontFamily="var(--font-display)"
                      fontWeight="600"
                    >
                      {new Date(scan.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </text>
                  );
                }
                return null;
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function BodyWeightChart({ data }) {
  const W = 340, H = 80, PAD = 10;
  const vals = data.map(d => d.weight);
  const min = Math.min(...vals) - 2;
  const max = Math.max(...vals) + 2;
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = H - PAD - (((d.weight - min) / (max - min)) * (H - PAD * 2));
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="area-chart">
      <polyline points={pts} fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      {data.map((d, i) => {
        const [x, y] = pts.split(' ')[i].split(',');
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent-gold)"/>;
      })}
    </svg>
  );
}

function OneRepMaxChart({ sets, sessions, exercises }) {
  const [pickedEx, setSelectedEx] = useState('');

  const loggedExerciseIds = useMemo(() => {
    if (!sets) return [];
    const ids = new Set(sets.filter(s => s.completed).map(s => s.exerciseId));
    return Array.from(ids);
  }, [sets]);

  const loggedExercises = useMemo(() => {
    if (!exercises || !loggedExerciseIds.length) return [];
    return loggedExerciseIds.map(id => exercises.find(e => e.id === id)).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  }, [exercises, loggedExerciseIds]);

  // Fall back to the first logged exercise until the user picks one (or if theirs disappears).
  const selectedEx = loggedExercises.some(e => e.name === pickedEx) ? pickedEx : (loggedExercises[0]?.name ?? '');

  const chartData = useMemo(() => {
    const ex = exercises?.find(e => e.name === selectedEx);
    if (!sets || !sessions || !ex) return [];

    // Best estimated 1RM (Epley) per day
    const daily1RM = {};
    sets.forEach(s => {
      if (!s.completed || s.exerciseId !== ex.id) return;
      const session = sessions.find(sess => sess.id === s.sessionId);
      if (!session) return;
      const date = new Date(session.startTime).toISOString().split('T')[0];
      const epley1RM = s.weight * (1 + s.reps / 30);
      if (!daily1RM[date] || epley1RM > daily1RM[date]) {
        daily1RM[date] = epley1RM;
      }
    });

    return Object.keys(daily1RM).sort().map(d => ({ date: d, value: daily1RM[d] }));
  }, [selectedEx, sets, sessions, exercises]);

  const W = 340, H = 100, PAD = 10;
  
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <select 
          value={selectedEx} 
          onChange={e => setSelectedEx(e.target.value)}
          style={{ 
            width: '100%', padding: '10px 12px', 
            background: 'var(--bg-void)', border: '1px solid var(--border)', 
            color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '14px'
          }}
        >
          {loggedExercises.length === 0 ? <option value="">No exercises logged yet</option> : null}
          {loggedExercises.map(ex => (
            <option key={ex.id} value={ex.name}>{ex.name}</option>
          ))}
        </select>
      </div>
      
      {chartData.length < 2 ? (
        <div className="chart-empty"><span className="section-label">MORE DATA NEEDED</span></div>
      ) : (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="area-chart">
          {(() => {
            const vals = chartData.map(d => d.value);
            const min = Math.min(...vals) * 0.9;
            const max = Math.max(...vals) * 1.1;
            const pts = chartData.map((d, i) => {
              const x = PAD + (i / (chartData.length - 1)) * (W - PAD * 2);
              const y = H - PAD - (((d.value - min) / (max - min)) * (H - PAD * 2));
              return `${x},${y}`;
            }).join(' ');
            return (
              <>
                <polyline points={pts} fill="none" stroke="var(--rank-s)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                {chartData.map((d, i) => {
                  const [x, y] = pts.split(' ')[i].split(',');
                  return <circle key={i} cx={x} cy={y} r="3" fill="var(--rank-s)"/>;
                })}
              </>
            );
          })()}
        </svg>
      )}
    </div>
  );
}

/* ── Workout Calendar ─────────────────────────────── */
function WorkoutCalendar({ sessions, viewMode, selectedDate, onDateClick }) {
  const nowMs = useNow();
  const now = useMemo(() => new Date(nowMs), [nowMs]);
  const [currentMonth, setCurrentMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));

  // Get days for weekly view
  const weekDays = useMemo(() => {
    const start = new Date(now);
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
    start.setDate(now.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [now]);

  // Get days for monthly view
  const monthDays = useMemo(() => {
    const start = new Date(currentMonth);
    const firstDay = start.getDay() === 0 ? 6 : start.getDay() - 1;
    start.setDate(start.getDate() - firstDay);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [currentMonth]);

  const activeDates = useMemo(() => {
    const set = new Set();
    (sessions || []).forEach(s => set.add(new Date(s.startTime).toISOString().split('T')[0]));
    return set;
  }, [sessions]);

  const renderDay = (date, isSelected) => {
    const dateStr = date.toISOString().split('T')[0];
    const isActive = activeDates.has(dateStr);
    const isToday = dateStr === now.toISOString().split('T')[0];
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

    return (
      <div
        key={dateStr}
        className={`cal-day ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${!isCurrentMonth && viewMode === 'month' ? 'other-month' : ''}`}
        onClick={() => onDateClick(date)}
      >
        <span className="cal-day-num">{date.getDate()}</span>
        {isActive && <div className="cal-dot" />}
      </div>
    );
  };

  return (
    <div className="workout-calendar">
      {viewMode === 'month' && (
        <div className="cal-month-nav">
          <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
          <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
      
      <div className="cal-days-header">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, idx) => <span key={idx}>{d}</span>)}
      </div>

      <div className={`cal-grid ${viewMode}`}>
        {(viewMode === 'week' ? weekDays : monthDays).map(d => renderDay(d, d.toISOString().split('T')[0] === selectedDate))}
      </div>
    </div>
  );
}
