import { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../db/db';
import { useAlert } from '../context/useAlert';
import BottomSheet from './BottomSheet';
import './SessionDetailModal.css';

export default function SessionDetailModal({ sessionId, onClose }) {
  const { showConfirm, showToast } = useAlert();
  const session = useLiveQuery(() => db.sessions.get(Number(sessionId)), [sessionId]);
  const sessionSets = useLiveQuery(() => db.sets.where('sessionId').equals(Number(sessionId)).toArray(), [sessionId]);
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Only fetch exercises that are actually in this session
  const exercises = useLiveQuery(async () => {
    if (!sessionSets) return [];
    const exIds = [...new Set(sessionSets.map(s => s.exerciseId))];
    return await db.exercises.where('id').anyOf(exIds).toArray();
  }, [sessionSets]);

  if (!session || !sessionSets || !exercises || !profile) return null;

  const unitLabel = profile.unitPreference || 'kg';
  const durationMin = session.endTime ? Math.round((session.endTime - session.startTime) / 60000) : 0;

  // Group sets by exercise
  const setsByExercise = {};
  sessionSets.forEach(s => {
    if (!setsByExercise[s.exerciseId]) {
      setsByExercise[s.exerciseId] = [];
    }
    setsByExercise[s.exerciseId].push(s);
  });

  // Sort sets by setNumber and compute display numbers
  Object.keys(setsByExercise).forEach(exId => {
    const sets = setsByExercise[exId];
    sets.sort((a, b) => a.setNumber - b.setNumber);
    let normalCount = 0;
    sets.forEach(s => {
      if (!s.type || s.type === 'normal') {
        normalCount++;
        s.displayNum = normalCount;
      } else if (s.type === 'warmup') {
        s.displayNum = 'W';
      } else if (s.type === 'drop') {
        s.displayNum = 'D';
      }
    });
  });

  const handleDelete = async () => {
    const confirmed = await showConfirm(
      "Are you sure you want to permanently delete this workout session and all its logged sets? This action cannot be undone.",
      "Delete Workout?",
      { okText: 'DELETE', danger: true }
    );
    if (confirmed) {
      try {
        await db.transaction('rw', [db.sessions, db.sets, db.playerProfile], async () => {
          // Delete sets
          await db.sets.where('sessionId').equals(Number(sessionId)).delete();
          // Delete session
          await db.sessions.delete(Number(sessionId));
          
          // Update profile session count and volume
          const prof = await db.playerProfile.get('profile');
          if (prof) {
            await db.playerProfile.update('profile', {
              totalSessions: Math.max(0, (prof.totalSessions || 0) - 1),
              totalVolume: Math.max(0, (prof.totalVolume || 0) - (session.volume || 0)),
              totalXP: Math.max(0, (prof.totalXP || 0) - (session.xpEarned || 0))
            });
          }
        });
        showToast('Workout session deleted', 'success');
        onClose();
      } catch (error) {
        console.error('Failed to delete session:', error);
        showToast('Failed to delete session', 'error');
      }
    }
  };

  const typeColors = { normal: 'var(--text-secondary)', warmup: 'var(--accent-gold)', drop: 'var(--accent-red)' };

  return (
    <BottomSheet 
      onClose={onClose} 
      title={session.name}
      footer={
        <div style={{ display: 'flex', width: '100%' }}>
          <button className="btn-ghost delete-session-btn w-full" onClick={handleDelete} id="delete-session-btn" style={{ color: 'var(--accent-red)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }} aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            DELETE WORKOUT
          </button>
        </div>
      }
    >
      {/* Subtitle / Date */}
      <span className="section-label" style={{ display: 'block', marginBottom: 12 }}>
        {new Date(session.startTime).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </span>

      {/* Stats Row */}
      <div className="detail-stats-row" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div className="detail-stat-card card" style={{ flex: 1, textAlign: 'center' }}>
          <span className="detail-stat-val" style={{ display: 'block', fontSize: 18, fontWeight: 700 }}>{durationMin}m</span>
          <span className="section-label">DURATION</span>
        </div>
        <div className="detail-stat-card card" style={{ flex: 1, textAlign: 'center' }}>
          <span className="detail-stat-val" style={{ display: 'block', fontSize: 18, fontWeight: 700 }}>{session.volume || 0} {unitLabel}</span>
          <span className="section-label">VOLUME</span>
        </div>
        <div className="detail-stat-card card" style={{ flex: 1, textAlign: 'center' }}>
          <span className="detail-stat-val text-gold" style={{ display: 'block', fontSize: 18, fontWeight: 700, color: 'var(--accent-gold)' }}>+{session.xpEarned || 0}</span>
          <span className="section-label">XP EARNED</span>
        </div>
      </div>

      {/* Exercises List */}
      <div className="detail-exercises-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.keys(setsByExercise).length === 0 ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <p style={{ color: 'var(--text-muted)' }}>No sets were logged in this session.</p>
          </div>
        ) : (
          Object.entries(setsByExercise).map(([exId, sets]) => {
            const ex = exercises.find(e => e.id === Number(exId));
            return (
              <div key={exId} className="detail-ex-group card">
                <div className="detail-ex-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="detail-ex-name" style={{ fontWeight: 700 }}>{ex ? ex.name : 'Unknown Exercise'}</span>
                  <span className="detail-ex-muscle" style={{ color: 'var(--accent-blue)', fontSize: 12 }}>{ex ? ex.muscleGroup.toUpperCase() : ''}</span>
                </div>
                
                <div className="detail-sets-table">
                  <div className="detail-table-header" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', fontSize: 11, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                    <span>SET</span>
                    <span style={{ textAlign: 'right' }}>WEIGHT ({unitLabel})</span>
                    <span style={{ textAlign: 'right' }}>REPS</span>
                    <span style={{ textAlign: 'right' }}>RPE</span>
                  </div>
                  {sets.map((s) => (
                    <div key={s.id} className="detail-table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <span className="detail-set-num" style={{ color: typeColors[s.type || 'normal'] }}>
                        {s.displayNum}
                      </span>
                      <span style={{ textAlign: 'right', fontWeight: 600 }}>{s.weight}</span>
                      <span style={{ textAlign: 'right', fontWeight: 600 }}>
                        {s.mode === 'time' ? `${s.duration || 0}s` : s.perSide ? `${s.reps}/side` : s.reps}
                      </span>
                      <span style={{ textAlign: 'right', color: s.rpe ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {s.rpe || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </BottomSheet>
  );
}
