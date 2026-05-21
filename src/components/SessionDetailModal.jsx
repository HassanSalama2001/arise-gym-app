import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import db from '../db/db';
import { useAlert } from '../context/AlertContext';
import './SessionDetailModal.css';

export default function SessionDetailModal({ sessionId, onClose }) {
  const { showConfirm, showToast } = useAlert();
  const session = useLiveQuery(() => db.sessions.get(Number(sessionId)), [sessionId]);
  const sessionSets = useLiveQuery(() => db.sets.where('sessionId').equals(Number(sessionId)).toArray(), [sessionId]);
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);

  // Only fetch exercises that are actually in this session
  const exercises = useLiveQuery(async () => {
    if (!sessionSets) return [];
    const exIds = [...new Set(sessionSets.map(s => s.exerciseId))];
    return await db.exercises.where('id').anyOf(exIds).toArray();
  }, [sessionSets]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <motion.div 
      className="detail-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      id="session-detail-overlay"
    >
      <motion.div 
        className="detail-modal"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={e => e.stopPropagation()}
        id="session-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div className="bottom-sheet-handle" />
        
        {/* Header */}
        <div className="detail-header">
          <div className="detail-title-group">
            <h2 id="detail-title" className="detail-title">{session.name}</h2>
            <span className="section-label">
              {new Date(session.startTime).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <button className="close-btn" onClick={onClose} id="detail-close-btn" aria-label="Close session details">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Stats Row */}
        <div className="detail-stats-row">
          <div className="detail-stat-card card">
            <span className="detail-stat-val">{durationMin}m</span>
            <span className="section-label">DURATION</span>
          </div>
          <div className="detail-stat-card card">
            <span className="detail-stat-val">{session.volume || 0} {unitLabel}</span>
            <span className="section-label">VOLUME</span>
          </div>
          <div className="detail-stat-card card">
            <span className="detail-stat-val text-gold">+{session.xpEarned || 0}</span>
            <span className="section-label">XP EARNED</span>
          </div>
        </div>

        {/* Exercises List */}
        <div className="detail-exercises-list">
          {Object.keys(setsByExercise).length === 0 ? (
            <div className="empty-state" style={{ padding: 20 }}>
              <p style={{ color: 'var(--text-muted)' }}>No sets were logged in this session.</p>
            </div>
          ) : (
            Object.entries(setsByExercise).map(([exId, sets]) => {
              const ex = exercises.find(e => e.id === Number(exId));
              return (
                <div key={exId} className="detail-ex-group card">
                  <div className="detail-ex-header">
                    <span className="detail-ex-name">{ex ? ex.name : 'Unknown Exercise'}</span>
                    <span className="detail-ex-muscle">{ex ? ex.muscleGroup.toUpperCase() : ''}</span>
                  </div>
                  
                  <div className="detail-sets-table">
                    <div className="detail-table-header">
                      <span>SET</span>
                      <span style={{ textAlign: 'right' }}>WEIGHT ({unitLabel})</span>
                      <span style={{ textAlign: 'right' }}>REPS</span>
                      <span style={{ textAlign: 'right' }}>RPE</span>
                    </div>
                    {sets.map((s) => (
                      <div key={s.id} className="detail-table-row">
                        <span className="detail-set-num" style={{ color: typeColors[s.type || 'normal'] }}>
                          {s.displayNum}
                        </span>
                        <span style={{ textAlign: 'right', fontWeight: 600 }}>{s.weight}</span>
                        <span style={{ textAlign: 'right', fontWeight: 600 }}>{s.reps}</span>
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

        {/* Delete Session Button */}
        <div className="detail-footer">
          <button className="btn-ghost delete-session-btn" onClick={handleDelete} id="delete-session-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }} aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
            DELETE WORKOUT
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
