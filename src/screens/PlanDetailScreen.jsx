import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Reorder } from 'framer-motion';
import db from '../db/db';
import { useAlert } from '../context/AlertContext';
import { playClickSound } from '../utils/audio';
import EditPlanModal from '../components/EditPlanModal';
import AddExerciseToPlanSheet from '../components/AddExerciseToPlanSheet';
import ExerciseThumbnail from '../components/ExerciseThumbnail';
import './PlanDetailScreen.css';

export default function PlanDetailScreen() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { showConfirm, showToast } = useAlert();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false); // For Phase 3A

  const plan = useLiveQuery(() => db.workoutPlans.get(Number(planId)), [planId]);
  
  const rawPlanExercises = useLiveQuery(() => 
    db.planExercises.where('planId').equals(Number(planId)).toArray(), 
  [planId]);

  const exercises = useLiveQuery(() => db.exercises.toArray(), []);
  const exerciseNotes = useLiveQuery(() => db.exerciseNotes.toArray(), []);

  // Hydrate plan exercises with exercise details and sort by order
  const planExercises = useMemo(() => {
    if (!rawPlanExercises || !exercises) return [];
    
    return rawPlanExercises
      .map(pe => ({
        ...pe,
        exercise: exercises.find(ex => ex.id === pe.exerciseId)
      }))
      .filter(pe => pe.exercise) // Remove orphans if any
      .sort((a, b) => a.order - b.order);
  }, [rawPlanExercises, exercises]);

  if (plan === undefined || rawPlanExercises === undefined) {
    return <div className="screen"><div className="screen-content loading-screen">Loading...</div></div>;
  }

  if (plan === null) {
    return (
      <div className="screen">
        <div className="screen-content empty-state">
          <h2>Plan Not Found</h2>
          <button className="btn-primary" onClick={() => navigate('/workouts')}>Go Back</button>
        </div>
      </div>
    );
  }

  const handleReorder = async (newOrder) => {
    // newOrder is an array of planExercise objects in the new order
    // Update the DB
    try {
      await db.transaction('rw', db.planExercises, async () => {
        for (let i = 0; i < newOrder.length; i++) {
          const pe = newOrder[i];
          if (pe.order !== i) {
            await db.planExercises.update(pe.id, { order: i });
          }
        }
      });
    } catch (err) {
      console.error('Failed to reorder:', err);
      showToast('Error saving order', 'error');
    }
  };

  const handleRemoveExercise = async (peId, exName) => {
    const confirmed = await showConfirm(`Remove ${exName} from this plan?`, 'Remove Exercise');
    if (confirmed) {
      await db.planExercises.delete(peId);
      showToast('Exercise removed');
    }
  };

  const handleSavePlan = async (updates) => {
    await db.workoutPlans.update(plan.id, updates);
    showToast('Plan updated');
  };

  const startWorkout = () => {
    if (planExercises.length === 0) {
      showToast('Add some exercises first!', 'error');
      return;
    }
    playClickSound();
    navigate('/log', { state: { planId: plan.id } });
  };

  return (
    <div className="screen" id="plan-detail-screen">
      <div className="screen-content" style={{ paddingBottom: 100 }}>
        
        {/* Top Nav */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <button className="btn-icon" onClick={() => navigate(-1)} style={{ marginLeft: -8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <span style={{ marginLeft: 8, fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>MY PLANS</span>
        </div>

        {/* Header */}
        <div className="plan-detail-header">
          <div className="plan-detail-title-row">
            <h1 className="plan-detail-title">{plan.name}</h1>
            <button className="btn-icon" onClick={() => setShowEditModal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          </div>
          
          <div className="plan-detail-meta">
            <span>{planExercises.length} {planExercises.length === 1 ? 'Exercise' : 'Exercises'}</span>
            {plan.lastUsed && (
              <span>• Last used {new Date(plan.lastUsed).toLocaleDateString()}</span>
            )}
          </div>

          {plan.description && (
            <div className="plan-detail-description">
              {plan.description}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: 24 }}>
          <button 
            className="btn-ghost" 
            style={{ width: '100%', border: '1px dashed var(--accent-gold)', color: 'var(--accent-gold)' }}
            onClick={() => setShowAddSheet(true)}
          >
            + ADD EXERCISE
          </button>
        </div>

        {/* Exercise List */}
        {planExercises.length > 0 ? (
          <Reorder.Group 
            axis="y" 
            values={planExercises} 
            onReorder={handleReorder}
            className="reorder-list"
          >
            {planExercises.map((pe) => (
              <Reorder.Item 
                key={pe.id} 
                value={pe}
                className="reorder-item"
              >
                <div className="reorder-handle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </div>
                
                <div className="reorder-content" onClick={() => navigate(`/exercise/${pe.exercise.id}`)} style={{ display: 'flex', gap: 12 }}>
                  <ExerciseThumbnail 
                    exercise={pe.exercise} 
                    style={{ width: 50, height: 50, flexShrink: 0 }} 
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div className="reorder-title">{pe.exercise.name}</div>
                    <div className="reorder-meta">
                      <span className="reorder-sets">{pe.targetSets || 3} sets</span>
                      <span className="chip" style={{ fontSize: 10, padding: '2px 6px' }}>{pe.exercise.muscleGroup}</span>
                    </div>
                  </div>
                </div>
                <div style={{ paddingLeft: 62 }}>
                  {exerciseNotes && (() => {
                    const notes = exerciseNotes.filter(n => n.exerciseId === pe.exerciseId && (!n.planId || n.planId === Number(planId)));
                    if (notes.length === 0) return null;
                    return (
                      <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {notes.slice(0, 2).map(n => (
                          <div key={n.id} style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                            <span className={`chip ${n.type === 'Hint' ? 'chip-green' : n.type === 'Cue' ? 'chip-gold' : 'chip-blue'}`} style={{ fontSize: 9, padding: '1px 4px' }}>{n.type}</span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.text}</span>
                          </div>
                        ))}
                        {notes.length > 2 && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>+{notes.length - 2} more notes</span>}
                      </div>
                    );
                  })()}
                </div>

                <div className="reorder-actions">
                  <button 
                    className="btn-icon danger" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveExercise(pe.id, pe.exercise.name);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                  <button 
                    className="btn-icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/exercise/${pe.exercise.id}`);
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="empty-state" style={{ marginTop: 40 }}>
            <span style={{ fontSize: 40 }}>🏋️‍♂️</span>
            <p>No exercises yet</p>
            <span className="section-label">Add exercises to start building your plan.</span>
          </div>
        )}

      </div>

      {/* Sticky Footer CTA */}
      <div className="plan-sticky-footer">
        <button className="btn-primary" onClick={startWorkout}>
          START WORKOUT
        </button>
      </div>

      <EditPlanModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        plan={plan}
        onSave={handleSavePlan}
      />

      <AddExerciseToPlanSheet 
        isOpen={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        planId={Number(planId)}
        onExerciseAdded={(id) => showToast('Exercise added!')}
      />
    </div>
  );
}
