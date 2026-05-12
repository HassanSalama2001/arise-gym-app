import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import './ExerciseDetailScreen.css';

const DIFFICULTY_LABEL = { E: 'Beginner', D: 'Intermediate', C: 'Advanced' };

export default function ExerciseDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('guide');
  const [addingToPlan, setAddingToPlan] = useState(null);

  const exercise = useLiveQuery(() => db.exercises.get(Number(id)), [id]);
  const plans = useLiveQuery(() => db.workoutPlans.toArray(), []);
  const planExercises = useLiveQuery(() =>
    db.planExercises.where('exerciseId').equals(Number(id)).toArray(), [id]
  );

  const addedPlanIds = new Set((planExercises || []).map(pe => pe.planId));

  async function togglePlan(planId) {
    setAddingToPlan(planId);
    if (addedPlanIds.has(planId)) {
      await db.planExercises
        .where('planId').equals(planId)
        .and(pe => pe.exerciseId === Number(id))
        .delete();
    } else {
      const count = await db.planExercises.where('planId').equals(planId).count();
      await db.planExercises.add({ planId, exerciseId: Number(id), order: count });
    }
    setAddingToPlan(null);
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
              <span className={`chip ${exercise.difficulty === 'E' ? 'chip-green' : exercise.difficulty === 'D' ? 'chip-gold' : 'chip-red'}`}>{diff}</span>
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

        {/* Tabs */}
        <div className="tab-pills" style={{ marginTop: 16 }}>
          <button className={`tab-pill ${activeTab === 'guide' ? 'active' : ''}`} onClick={() => setActiveTab('guide')} id="tab-guide">FORM GUIDE</button>
          <button className={`tab-pill ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')} id="tab-videos">VIDEOS</button>
          <button className={`tab-pill ${activeTab === 'plans' ? 'active' : ''}`} onClick={() => setActiveTab('plans')} id="tab-add-plan">ADD TO PLAN</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'guide' && (
            <motion.div key="guide" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {/* How To Do It */}
              <div className="guide-section">
                <span className="section-label">HOW TO DO IT</span>
                <div className="steps-list">
                  {(exercise.instructions || []).map((step, i) => (
                    <div key={i} className="step-row">
                      <div className="step-number">{i + 1}</div>
                      <p className="step-text">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

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

          {activeTab === 'plans' && (
            <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <div style={{ marginTop: 16 }}>
                {plans && plans.length > 0 ? (
                  <div className="plan-toggle-list">
                    {plans.map(plan => (
                      <div key={plan.id} className="plan-toggle-row card">
                        <span className="plan-toggle-name">{plan.name}</span>
                        <motion.button
                          className={`plan-toggle-btn ${addedPlanIds.has(plan.id) ? 'added' : ''}`}
                          onClick={() => togglePlan(plan.id)}
                          disabled={addingToPlan === plan.id}
                          whileTap={{ scale: 0.9 }}
                          id={`toggle-plan-${plan.id}`}
                        >
                          {addedPlanIds.has(plan.id) ? '✓ Added' : '+ Add'}
                        </motion.button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <span style={{ fontSize: 36 }}>📋</span>
                    <p>No plans yet</p>
                    <button className="btn-primary" style={{ marginTop: 12, width: 'auto', padding: '12px 28px' }} onClick={() => navigate('/workouts')}>CREATE A PLAN</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
