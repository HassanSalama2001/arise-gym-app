import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../../db/db';
import { useNow } from '../../hooks/useNow';
import { muscleVolume, periodStart, VOLUME_PERIODS } from '../../utils/progressStats';
import { TRAINED_MUSCLE_GROUPS } from '../../data/muscleGroups';

export default function MuscleVolumeChart({ sessions, sets, unitPreference = 'kg' }) {
  const [period, setPeriod] = useState('week');
  const now = useNow();
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  const totals = useMemo(() => {
    if (!exercises) return {};
    const byId = Object.fromEntries(exercises.map(e => [e.id, e]));
    return muscleVolume(sets, sessions, byId, periodStart(period, now));
  }, [sets, sessions, exercises, period, now]);

  const max = Math.max(...TRAINED_MUSCLE_GROUPS.map(g => totals[g] || 0), 1);
  const grand = TRAINED_MUSCLE_GROUPS.reduce((acc, g) => acc + (totals[g] || 0), 0);

  return (
    <div className="card mt-8" style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span className="section-label">VOLUME BY MUSCLE</span>
        <div className="tab-pills" style={{ margin: 0 }}>
          {Object.entries(VOLUME_PERIODS).map(([key, { label }]) => (
            <button
              key={key}
              className={`tab-pill ${period === key ? 'active' : ''}`}
              style={{ padding: '4px 10px', fontSize: 11 }}
              onClick={() => setPeriod(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {grand === 0 ? (
        <div className="chart-empty"><span className="section-label">NO VOLUME LOGGED YET</span></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TRAINED_MUSCLE_GROUPS.map(group => {
            const value = totals[group] || 0;
            return (
              <div key={group} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 64, flexShrink: 0 }}>{group.toUpperCase()}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'var(--bg-void)', overflow: 'hidden' }}>
                  <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, width: 70, textAlign: 'right' }}>
                  {Math.round(value).toLocaleString()} {unitPreference}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
