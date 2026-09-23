import { useEffect, useEffectEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import db from '../../db/db';
import { useAlert } from '../../context/useAlert';

/* ── Log Setup (pick plan or quick start) ────────── */
export default function LogSetupScreen({ onStart }) {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const plans = useLiveQuery(() => db.workoutPlans.toArray(), []);
  const planExercises = useLiveQuery(() => db.planExercises.toArray(), []);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  const location = useLocation();
  const requestedPlanId = location.state?.planId;

  // Another screen can ask to start a plan by navigating here with { planId }.
  const startRequestedPlan = useEffectEvent(plan => {
    startWithPlan(plan);
    navigate(location.pathname, { replace: true, state: {} }); // don't start it again on back/refresh
  });

  useEffect(() => {
    if (!requestedPlanId || !plans || !planExercises || !exercises) return;
    const plan = plans.find(p => p.id === requestedPlanId);
    if (plan) startRequestedPlan(plan);
  }, [requestedPlanId, plans, planExercises, exercises]);

  function getPlanExercises(planId) {
    if (!planExercises || !exercises) return [];
    return planExercises
      .filter(pe => pe.planId === planId)
      .sort((a, b) => a.order - b.order)
      .map(pe => {
        const ex = exercises.find(e => e.id === pe.exerciseId);
        if (!ex) return null;
        return {
          ...ex,
          groupId: pe.groupId ?? null, // superset link
          progression: pe.progression ?? null,
          targetSets: pe.targetSets !== undefined ? pe.targetSets : 3,
          targetReps: pe.targetReps !== undefined ? pe.targetReps : 10
        };
      })
      .filter(Boolean);
  }

  async function startWithPlan(plan) {
    const exs = getPlanExercises(plan.id);
    if (exs.length === 0) { await showAlert('This plan has no exercises. Add some first!', 'Oops!'); return; }
    onStart({ planName: plan.name, planId: plan.id, exercises: exs });
  }

  async function quickStart() {
    onStart({ planName: 'Quick Workout', exercises: [] });
  }

  return (
    <div className="screen" id="log-setup-screen">
      <div className="screen-content">
        <div className="workouts-header">
          <h1 className="screen-title">BEGIN MISSION</h1>
        </div>

        <button className="quick-start-card card card-glow" onClick={quickStart} id="quick-start-btn">
          <div className="quick-start-inner">
            <div>
              <p className="quick-start-title">QUICK START</p>
              <p className="quick-start-sub">Add exercises as you go</p>
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
        </button>

        {plans && plans.length > 0 && (
          <div className="section mt-24">
            <span className="section-label">FROM A PLAN</span>
            <div className="plan-select-list mt-8">
              {plans.map(plan => {
                const exs = getPlanExercises(plan.id);
                return (
                  <motion.button
                    key={plan.id}
                    className="plan-select-card card"
                    onClick={() => startWithPlan(plan)}
                    whileTap={{ scale: 0.97 }}
                    id={`start-plan-${plan.id}`}
                  >
                    <div className="plan-select-info">
                      <span className="plan-name">{plan.name}</span>
                      <span className="section-label">{exs.length} exercises</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {(!plans || plans.length === 0) && (
          <div className="empty-state" style={{ marginTop: 32 }}>
            <span style={{ fontSize: 36 }}>📋</span>
            <p>No plans yet</p>
            <button className="btn-ghost" style={{ marginTop: 12, width: 'auto', padding: '12px 28px' }} onClick={() => navigate('/workouts')}>CREATE A PLAN</button>
          </div>
        )}
      </div>
    </div>
  );
}
