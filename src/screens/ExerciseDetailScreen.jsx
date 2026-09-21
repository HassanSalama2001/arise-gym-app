import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { useExerciseVisual } from '../hooks/useExerciseVisual';
import BottomSheet from '../components/BottomSheet';
import './ExerciseDetailScreen.css';

const DIFFICULTY_LABEL = { E: 'Beginner', D: 'Intermediate', C: 'Advanced' };

export default function ExerciseDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('guide');
  const [addingToPlan, setAddingToPlan] = useState(null);
  const [showAddToPlan, setShowAddToPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [localSets, setLocalSets] = useState(3);
  const [localReps, setLocalReps] = useState(10);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('Note'); // Hint, Note, Cue
  const [noteScope, setNoteScope] = useState('Global'); // Global, Plan-specific
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  

  const exercise = useLiveQuery(() => db.exercises.get(Number(id)), [id]);
  const plans = useLiveQuery(() => db.workoutPlans.toArray(), []);
  const planExercises = useLiveQuery(() =>
    db.planExercises.where('exerciseId').equals(Number(id)).toArray(), [id]
  );
  const sessionSets = useLiveQuery(() => db.sets.where('exerciseId').equals(Number(id)).toArray(), [id]);
  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  const profile = useLiveQuery(() => db.playerProfile.get('profile'), []);
  const exerciseNotes = useLiveQuery(() => db.exerciseNotes.where('exerciseId').equals(Number(id)).toArray(), [id]);

  const { url: visualUrl, loading: visualsLoading } = useExerciseVisual(exercise);

  const addedPlanIds = new Set((planExercises || []).map(pe => pe.planId));

  const historyData = useMemo(() => {
    if (!sessionSets || !sessions) return { prWeight: 0, prVolume: 0, prOneRepMax: 0, sessionsHistory: [] };

    const setsBySession = {};
    let prWeight = 0;
    let prOneRepMax = 0;

    sessionSets.forEach(s => {
      if (s.completed) {
        if (s.weight > prWeight) prWeight = s.weight;
        const epley = s.weight * (1 + s.reps / 30);
        if (epley > prOneRepMax) prOneRepMax = Math.round(epley * 10) / 10;

        if (!setsBySession[s.sessionId]) {
          setsBySession[s.sessionId] = [];
        }
        setsBySession[s.sessionId].push(s);
      }
    });

    let prVolume = 0;
    const sessionsHistory = [];

    Object.entries(setsBySession).forEach(([sessId, sets]) => {
      const sessionInfo = sessions.find(sess => sess.id === Number(sessId));
      if (!sessionInfo) return;

      const volume = sets.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0);
      if (volume > prVolume) prVolume = volume;

      sessionsHistory.push({
        sessionId: Number(sessId),
        sessionName: sessionInfo.name,
        date: sessionInfo.startTime,
        volume,
        sets: sets.sort((a, b) => a.setNumber - b.setNumber)
      });
    });

    sessionsHistory.sort((a, b) => b.date - a.date);

    return {
      prWeight,
      prVolume: Math.round(prVolume * 10) / 10,
      prOneRepMax: Math.round(prOneRepMax * 10) / 10,
      sessionsHistory
    };
  }, [sessionSets, sessions]);

  const unitLabel = profile?.unitPreference || 'kg';

  async function togglePlan(planId) {
    setAddingToPlan(planId);
    if (addedPlanIds.has(planId)) {
      await db.planExercises
        .where('planId').equals(planId)
        .and(pe => pe.exerciseId === Number(id))
        .delete();
    } else {
      const count = await db.planExercises.where('planId').equals(planId).count();
      await db.planExercises.add({ planId, exerciseId: Number(id), order: count, targetSets: 3, targetReps: 10 });
    }
    setAddingToPlan(null);
  }

  function handleStartEdit(planId, setsCount, repsCount) {
    setEditingPlanId(planId);
    setLocalSets(setsCount);
    setLocalReps(repsCount);
  }

  function handleCancelEdit() {
    setEditingPlanId(null);
  }

  async function handleSaveTargets(planId) {
    setAddingToPlan(planId);
    const peRecord = planExercises?.find(pe => pe.planId === planId);
    if (peRecord) {
      await db.planExercises.update(peRecord.id, {
        targetSets: localSets,
        targetReps: localReps
      });
    } else {
      const count = await db.planExercises.where('planId').equals(planId).count();
      await db.planExercises.add({
        planId,
        exerciseId: Number(id),
        order: count,
        targetSets: localSets,
        targetReps: localReps
      });
    }
    setEditingPlanId(null);
    setAddingToPlan(null);
  }

  async function handleSaveNote() {
    if (!noteText.trim()) return;
    await db.exerciseNotes.add({
      exerciseId: Number(id),
      planId: noteScope === 'Global' ? null : selectedPlanId,
      text: noteText.trim(),
      type: noteType,
      createdAt: Date.now()
    });
    setNoteText('');
    setShowAddNote(false);
  }

  async function handleDeleteNote(noteId) {
    await db.exerciseNotes.delete(noteId);
  }

  if (!exercise) {
    return (
      <div className="screen">
        <div className="screen-content">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="loading-screen">Loading...</div>
        </div>
      </div>
    );
  }

  const diff = DIFFICULTY_LABEL[exercise.difficulty] || 'Beginner';

  return (
    <div className="screen" id="exercise-detail-screen">
      <div className="screen-content">
        {/* Header */}
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate(-1)} id="back-btn" aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="detail-title-area">
            <h1 className="detail-exercise-name">{exercise.name}</h1>
            <div className="detail-chips">
              <span className="chip chip-blue">{exercise.muscleGroup}</span>
              <span className={`chip ${exercise.difficulty === 'C' ? 'chip-red' : exercise.difficulty === 'D' ? 'chip-gold' : 'chip-green'}`}>{diff}</span>
            </div>
          </div>
        </div>

        {/* Secondary muscles */}
        {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
          <div className="muscles-row">
            <span className="section-label">SECONDARY: </span>
            {exercise.secondaryMuscles.map(m => (
              <span key={m} className="chip chip-blue" style={{ fontSize: 10, padding: '3px 8px' }}>{m}</span>
            ))}
          </div>
        )}

        {/* Add to Plan Button */}
        <div style={{ marginTop: 16 }}>
          <button 
            className="btn-ghost" 
            style={{ width: '100%', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)' }}
            onClick={() => setShowAddToPlan(true)}
            id="add-to-plan-btn"
          >
            + ADD TO PLAN
          </button>
        </div>

        {/* Tabs */}
        <div className="tab-pills" style={{ marginTop: 16 }}>
          <button className={`tab-pill ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')} id="tab-guide">FORM GUIDE</button>
          <button className={`tab-pill ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')} id="tab-history">HISTORY</button>
          <button className={`tab-pill ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')} id="tab-notes">MY NOTES</button>
          <button className={`tab-pill ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')} id="tab-videos">VIDEOS</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'guide' && (
            <motion.div key="guide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* Media Player */}
              {visualsLoading ? (
                <div className="guide-section">
                  <div className="card" style={{ padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Loading visual guide...</span>
                  </div>
                </div>
              ) : visualUrl ? (
                <div className="guide-section">
                  <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', gap: 4, background: '#fff' }}>
                      <img 
                        src={visualUrl} 
                        alt={`${exercise.name} animation`} 
                        style={{ width: '100%', objectFit: 'contain', background: 'white' }}
                        loading="lazy"
                      />
                  </div>
                </div>
              ) : (
                <div className="guide-section">
                  <div className="card" style={{ padding: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>No visuals available for this exercise.</span>
                  </div>
                </div>
              )}

              {/* How To Do It */}
              <div className="guide-section">
                <span className="section-label">HOW TO DO IT</span>
                {typeof exercise.instructions === 'string' ? (
                  <div className="card">
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 14 }}>
                      {exercise.instructions || 'No instructions provided.'}
                    </p>
                  </div>
                ) : (
                  <div className="steps-list">
                    {(exercise.instructions || []).map((step, i) => (
                      <div key={i} className="step-row">
                        <div className="step-number">{i + 1}</div>
                        <p className="step-text">{step}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* External Guide Link */}
              {exercise.externalLink && (
                <div className="guide-section">
                  <span className="section-label">EXTERNAL REFERENCE GUIDE</span>
                  <div className="card" style={{ display: 'flex', alignItems: 'center' }}>
                    <a 
                      href={exercise.externalLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        color: 'var(--accent-blue)', 
                        textDecoration: 'none', 
                        fontWeight: 'bold', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 6,
                        fontFamily: 'var(--font-display)',
                        fontSize: 14
                      }}
                      id="exercise-external-link"
                    >
                      <span>Learn more on how to perform this exercise</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>
                  </div>
                </div>
              )}

              {/* Equipment */}
              {exercise.equipment && (
                <div className="guide-section">
                  <span className="section-label">EQUIPMENT REQUIRED</span>
                  <div className="card">
                    <p style={{ color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 600 }}>{exercise.equipment}</p>
                  </div>
                </div>
              )}

              {/* Common Mistakes */}
              {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
                <div className="guide-section">
                  <span className="section-label">COMMON MISTAKES</span>
                  <div className="mistakes-list">
                    {exercise.commonMistakes.map((m, i) => (
                      <div key={i} className="mistake-card">
                        <span className="mistake-icon">⚠</span>
                        <p className="mistake-text">{m}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pro Tips */}
              {exercise.proTips && exercise.proTips.length > 0 && (
                <div className="guide-section">
                  <span className="section-label">PRO TIPS</span>
                  <div className="tips-list">
                    {exercise.proTips.map((t, i) => (
                      <div key={i} className="tip-card">
                        <span className="tip-icon">💡</span>
                        <p className="tip-text">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {/* PR Stats Card Grid */}
              <div className="history-pr-grid">
                <div className="card history-pr-card">
                  <span className="section-label" style={{ fontSize: 10, marginBottom: 4 }}>MAX WEIGHT</span>
                  <span className="history-pr-val">{historyData.prWeight || '--'} <span style={{ fontSize: 11, fontWeight: 500 }}>{unitLabel}</span></span>
                </div>
                <div className="card history-pr-card">
                  <span className="section-label" style={{ fontSize: 10, marginBottom: 4 }}>MAX VOLUME</span>
                  <span className="history-pr-val">{historyData.prVolume || '--'} <span style={{ fontSize: 11, fontWeight: 500 }}>{unitLabel}</span></span>
                </div>
                <div className="card history-pr-card">
                  <span className="section-label" style={{ fontSize: 10, marginBottom: 4 }}>EST. 1RM</span>
                  <span className="history-pr-val text-gold">{historyData.prOneRepMax || '--'} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>{unitLabel}</span></span>
                </div>
              </div>

              {/* History list */}
              <div className="history-log-title">
                <span className="section-label">LOGGED HISTORY ({historyData.sessionsHistory.length})</span>
              </div>
              {historyData.sessionsHistory.length > 0 ? (
                <div className="history-sessions-list">
                  {historyData.sessionsHistory.map(session => (
                    <div key={session.sessionId} className="card history-session-card">
                      <div className="history-session-header">
                        <span className="history-session-name">{session.sessionName}</span>
                        <span className="history-session-date">{new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="history-sets-table">
                        <div className="history-set-row table-header">
                          <span>SET</span>
                          <span>WEIGHT</span>
                          <span>REPS</span>
                          <span>RPE</span>
                        </div>
                        {session.sets.map((set, idx) => (
                          <div key={set.id} className="history-set-row">
                            <span>{idx + 1}</span>
                            <span>{set.weight} {unitLabel}</span>
                            <span>{set.reps} reps</span>
                            <span>@{set.rpe || '--'}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                        Volume: <strong>{session.volume} {unitLabel}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ marginTop: 16 }}>
                  <span style={{ fontSize: 32 }}>💪</span>
                  <p>No history for this exercise yet</p>
                  <span className="section-label">Your logged sets will appear here</span>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginTop: 16 }}>
                <button 
                  className="btn-ghost" 
                  style={{ width: '100%', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)' }}
                  onClick={() => setShowAddNote(true)}
                >
                  + ADD NOTE OR HINT
                </button>
              </div>

              <div className="section mt-16">
                <span className="section-label">GLOBAL NOTES</span>
              </div>
              <div className="notes-list" style={{ marginTop: 8 }}>
                {exerciseNotes && exerciseNotes.filter(n => !n.planId).length > 0 ? (
                  exerciseNotes.filter(n => !n.planId).map(note => (
                    <div key={note.id} className="card" style={{ padding: 12, marginBottom: 12, position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className={`chip ${note.type === 'Hint' ? 'chip-green' : note.type === 'Cue' ? 'chip-gold' : 'chip-blue'}`} style={{ fontSize: 10 }}>
                          {note.type}
                        </span>
                        <button className="btn-icon danger" onClick={() => handleDeleteNote(note.id)} style={{ padding: 4 }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{note.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="empty-state" style={{ padding: '24px 0', minHeight: 'auto' }}>
                    <p style={{ margin: 0 }}>No global notes yet</p>
                  </div>
                )}
              </div>

              <div className="section mt-16">
                <span className="section-label">PLAN-SPECIFIC NOTES</span>
              </div>
              <div className="notes-list" style={{ marginTop: 8 }}>
                {exerciseNotes && exerciseNotes.filter(n => n.planId).length > 0 ? (
                  exerciseNotes.filter(n => n.planId).map(note => {
                    const planName = plans?.find(p => p.id === note.planId)?.name || 'Unknown Plan';
                    return (
                      <div key={note.id} className="card" style={{ padding: 12, marginBottom: 12, position: 'relative', borderLeft: '3px solid var(--accent-purple)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span className={`chip ${note.type === 'Hint' ? 'chip-green' : note.type === 'Cue' ? 'chip-gold' : 'chip-blue'}`} style={{ fontSize: 10 }}>
                              {note.type}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>in {planName}</span>
                          </div>
                          <button className="btn-icon danger" onClick={() => handleDeleteNote(note.id)} style={{ padding: 4 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{note.text}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state" style={{ padding: '24px 0', minHeight: 'auto' }}>
                    <p style={{ margin: 0 }}>No plan-specific notes</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'videos' && (
            <motion.div key="videos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div className="videos-info card" style={{ marginTop: 16 }}>
                <p className="videos-desc">Record your sets and upload them for posture analysis on your laptop using ARISE-CV.</p>
              </div>

              <button className="btn-primary" style={{ marginTop: 16 }} id="upload-video-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginRight: 8 }}>
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                </svg>
                UPLOAD VIDEO
              </button>

              <div className="analyze-card card" style={{ marginTop: 16 }}>
                <div className="analyze-header">
                  <span className="section-label">ANALYZE ON LAPTOP</span>
                  <span className="chip chip-red" style={{ fontSize: 10 }}>Laptop Required</span>
                </div>
                <div className="analyze-steps">
                  {[
                    'Connect iPhone to Mac via USB cable',
                    'Open Finder → Trust this iPhone',
                    'Navigate to ARISE app media folder',
                    'Copy video to Desktop',
                    'Run: python arise_cv.py --video your_set.mp4',
                    'PDF report saved to same folder'
                  ].map((step, i) => (
                    <div key={i} className="analyze-step">
                      <div className="step-number step-number-sm">{i + 1}</div>
                      <p className="step-text">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="cv-info-box">
                  <p className="cv-info-text">
                    ARISE-CV uses MediaPipe Pose for skeleton extraction + custom CNN trained per exercise. Output: timestamped posture error PDF report. No cloud. No LLM. Just math.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Add to Plan Bottom Sheet */}
      <AnimatePresence>
        {showAddToPlan && (
          <BottomSheet
            onClose={() => {
              setShowAddToPlan(false);
              setEditingPlanId(null);
            }}
            title="ADD TO PLAN"
          >
            <div style={{ marginTop: 8 }}>
              {plans && plans.length > 0 ? (
                <div className="plan-toggle-list">
                  {plans.map(plan => {
                    const peRecord = planExercises?.find(pe => pe.planId === plan.id);
                    const isEditing = editingPlanId === plan.id;
                    
                    return (
                      <div key={plan.id} className="plan-toggle-row card" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span className="plan-toggle-name">{plan.name}</span>
                          {!isEditing ? (
                            addedPlanIds.has(plan.id) ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 13, color: 'var(--accent-gold)', fontWeight: 600 }}>
                                  {peRecord?.targetSets || 3} sets × {peRecord?.targetReps || 10} reps
                                </span>
                                <button
                                  onClick={() => handleStartEdit(plan.id, peRecord?.targetSets || 3, peRecord?.targetReps || 10)}
                                  style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
                                  title="Edit target sets/reps"
                                  id={`edit-targets-${plan.id}`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                </button>
                                <button
                                  onClick={() => togglePlan(plan.id)}
                                  disabled={addingToPlan === plan.id}
                                  style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
                                  title="Remove from plan"
                                  id={`remove-from-plan-${plan.id}`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>
                              </div>
                            ) : (
                              <button
                                className="plan-toggle-btn"
                                onClick={() => handleStartEdit(plan.id, 3, 10)}
                                disabled={addingToPlan === plan.id}
                                id={`toggle-plan-${plan.id}`}
                              >
                                + Add
                              </button>
                            )
                          ) : null}
                        </div>
                        
                        {isEditing && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                            <div style={{ display: 'flex', gap: 16 }}>
                              <div style={{ flex: 1 }}>
                                <label className="section-label" style={{ fontSize: 10 }}>SETS</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={localSets}
                                  onChange={e => setLocalSets(Math.max(1, parseInt(e.target.value) || 0))}
                                  style={{ width: '100%', marginTop: 4, height: 38, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}
                                  id={`input-sets-${plan.id}`}
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label className="section-label" style={{ fontSize: 10 }}>REPS</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={localReps}
                                  onChange={e => setLocalReps(Math.max(1, parseInt(e.target.value) || 0))}
                                  style={{ width: '100%', marginTop: 4, height: 38, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}
                                  id={`input-reps-${plan.id}`}
                                />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                className="btn-ghost"
                                onClick={handleCancelEdit}
                                style={{ flex: 1, height: 36, padding: '0 8px', fontSize: 12 }}
                                id={`cancel-edit-${plan.id}`}
                              >
                                CANCEL
                              </button>
                              <button
                                className="btn-primary"
                                onClick={() => handleSaveTargets(plan.id)}
                                style={{ flex: 2, height: 36, padding: '0 8px', fontSize: 12 }}
                                id={`save-targets-${plan.id}`}
                              >
                                SAVE
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <span style={{ fontSize: 36 }}>📋</span>
                  <p>No plans yet</p>
                  <button className="btn-primary" style={{ marginTop: 12, width: 'auto', padding: '12px 28px' }} onClick={() => navigate('/workouts')}>CREATE A PLAN</button>
                </div>
              )}
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Add Note Bottom Sheet */}
      <AnimatePresence>
        {showAddNote && (
          <BottomSheet onClose={() => setShowAddNote(false)} title="ADD NOTE OR HINT">
            <div style={{ marginTop: 16 }}>
              <label className="section-label" style={{ marginBottom: 8, display: 'block' }}>TYPE</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['Hint', 'Note', 'Cue'].map(t => (
                  <button
                    key={t}
                    className={`tab-pill ${noteType === t ? 'active' : ''}`}
                    onClick={() => setNoteType(t)}
                    style={{ flex: 1, padding: '8px 0', fontSize: 13 }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <label className="section-label" style={{ marginBottom: 8, display: 'block' }}>SCOPE</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button
                  className={`tab-pill ${noteScope === 'Global' ? 'active' : ''}`}
                  onClick={() => setNoteScope('Global')}
                  style={{ flex: 1, padding: '8px 0', fontSize: 13 }}
                >
                  🌍 Global
                </button>
                <button
                  className={`tab-pill ${noteScope === 'Plan-specific' ? 'active' : ''}`}
                  onClick={() => setNoteScope('Plan-specific')}
                  style={{ flex: 1, padding: '8px 0', fontSize: 13 }}
                >
                  📋 This Plan Only
                </button>
              </div>

              {noteScope === 'Plan-specific' && (
                <div style={{ marginBottom: 16 }}>
                  <label className="section-label" style={{ marginBottom: 8, display: 'block' }}>SELECT PLAN</label>
                  <select 
                    value={selectedPlanId || ''} 
                    onChange={e => setSelectedPlanId(Number(e.target.value))}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      background: 'var(--surface)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit'
                    }}
                  >
                    <option value="" disabled>Select a plan...</option>
                    {plans?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <label className="section-label" style={{ marginBottom: 8, display: 'block' }}>CONTENT</label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="E.g. Keep elbows tucked in..."
                style={{ 
                  width: '100%', 
                  minHeight: '100px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  marginBottom: 24
                }}
                autoFocus
              />

              <button 
                className="btn-primary" 
                style={{ width: '100%' }}
                onClick={handleSaveNote}
                disabled={!noteText.trim() || (noteScope === 'Plan-specific' && !selectedPlanId)}
              >
                SAVE NOTE
              </button>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>
    </div>
  );
}
