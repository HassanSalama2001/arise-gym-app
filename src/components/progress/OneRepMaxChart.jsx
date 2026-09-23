import { useState, useMemo } from 'react';
import { toLocalDateString } from '../../utils/date';

export default function OneRepMaxChart({ sets, sessions, exercises }) {
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
      const date = toLocalDateString(session.startTime);
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
