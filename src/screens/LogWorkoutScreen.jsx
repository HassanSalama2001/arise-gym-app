import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkout } from '../context/WorkoutContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { calculateSetXP } from '../data/progression';
import posturalIssues from '../data/posturalIssues';
import RestTimerOverlay from '../components/RestTimerOverlay';
import XPToast from '../components/XPToast';
import { playSetCompleteSound } from '../utils/audio';
import { hapticSetComplete } from '../utils/haptics';
import { checkAndUnlockAchievement } from '../utils/achievements';
import { useAlert } from '../context/AlertContext';
import BottomSheet from '../components/BottomSheet';
import ExerciseDetailsSheet from '../components/ExerciseDetailsSheet';
import './LogWorkoutScreen.css';

/* ── Elapsed Timer ─────────────────────────────── */
function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  if (!startTime) return null;
  const s = Math.floor(elapsed / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const fmt = (n) => String(n).padStart(2, '0');
  return (
    <span className="elapsed-timer">
      {h > 0 ? `${fmt(h)}:` : ''}{fmt(m)}:{fmt(sec)}
    </span>
  );
}

function SetRow({ set, index, onUpdate, onComplete, isActive, onPlateCalc, onDelete, unitPreference, onRpeClick, lastSetData }) {
  const typeColors = { normal: 'var(--text-primary)', warmup: 'var(--accent-gold)', drop: 'var(--accent-red)' };
  const typeLabels = { normal: index + 1, warmup: 'W', drop: 'D' };
  
  const cycleType = () => {
    if (set.completed) return;
    const types = ['normal', 'warmup', 'drop'];
    const current = types.indexOf(set.type || 'normal');
    onUpdate({ type: types[(current + 1) % types.length] });
  };

  return (
    <div
      className={`set-row ${set.completed ? 'set-completed' : ''} ${isActive ? 'set-active' : ''}`}
    >
      <button 
        className="set-number-badge" 
        onClick={cycleType} 
        disabled={set.completed}
        style={{ color: typeColors[set.type || 'normal'], borderColor: typeColors[set.type || 'normal'], cursor: set.completed ? 'default' : 'pointer', background: 'transparent' }}
        id={`set-type-toggle-${index}`}
        title="Tap to change set type"
      >
        {typeLabels[set.type || 'normal']}
      </button>

      <div className="weight-input-wrapper">
        <input
          type="number"
          inputMode="decimal"
          className="set-input weight-input"
          placeholder={lastSetData ? `${lastSetData.weight}` : "0"}
          value={set.weight || ''}
          onChange={e => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
          disabled={set.completed}
          aria-label="Weight"
          id={`set-weight-${index}`}
        />
      </div>

      <input
        type="number"
        inputMode="decimal"
        className="set-input reps-input"
        placeholder={lastSetData ? `${lastSetData.reps}` : "0"}
        value={set.reps || ''}
        onChange={e => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        disabled={set.completed}
        aria-label="Reps"
        id={`set-reps-${index}`}
      />

      <button
        className={`set-rpe-badge-btn ${set.completed ? 'completed' : ''}`}
        onClick={onRpeClick}
        disabled={!set.completed}
        title={set.completed ? "Edit RPE" : "Mark set done to rate RPE"}
      >
        {set.completed ? (set.rpe || '-') : '-'}
      </button>

      <motion.button
        className={`set-complete-btn ${set.completed ? 'done' : ''}`}
        onClick={() => !set.completed && onComplete()}
        whileTap={!set.completed ? { scale: 0.85 } : {}}
        aria-label={set.completed ? 'Completed' : 'Complete set'}
        id={`complete-set-${index}`}
      >
        {set.completed ? (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"/>
          </motion.svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        )}
      </motion.button>

      {onDelete && (
        <button
          className="set-delete-btn"
          onClick={onDelete}
          disabled={set.completed}
          title="Delete set"
          aria-label="Delete set"
          id={`delete-set-${index}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Log Setup (pick plan or quick start) ────────── */
function LogSetupScreen({ onStart }) {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const plans = useLiveQuery(() => db.workoutPlans.toArray(), []);
  const planExercises = useLiveQuery(() => db.planExercises.toArray(), []);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.planId && plans && planExercises && exercises) {
      const plan = plans.find(p => p.id === location.state.planId);
      if (plan) {
        startWithPlan(plan);
        // Clear navigation state
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, plans, planExercises, exercises, navigate]);

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
          targetSets: pe.targetSets !== undefined ? pe.targetSets : 3,
          targetReps: pe.targetReps !== undefined ? pe.targetReps : 10
        };
      })
      .filter(Boolean);
  }

  async function startWithPlan(plan) {
    const exs = getPlanExercises(plan.id);
    if (exs.length === 0) { await showAlert('This plan has no exercises. Add some first!', 'Oops!'); return; }
    onStart({ planName: plan.name, exercises: exs });
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

/* ── Active Workout Screen (main) ─────────────────── */
export default function LogWorkoutScreen() {
  const { showAlert, showConfirm, showToast } = useAlert();
  const navigate = useNavigate();
  
  // Use global workout context for state persistence
  const { workoutState, startWorkout, updateSets, updateBlocks, setCurrentExIdx, endWorkout, updateTotalXP } = useWorkout();
  const { phase, sessionId, startTime, currentExIdx, sets, blocks, totalXP } = workoutState;

  const [workoutConfig, setWorkoutConfig] = useState(null);
  const [initialQuests, setInitialQuests] = useState([]);
  const toastedQuests = useRef(new Set());

  // Active workout UI state
  const [showJump, setShowJump] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState(null);
  const [xpToasts, setXpToasts] = useState([]);
  const [addExSheet, setAddExSheet] = useState(false);
  const [rpePrompt, setRpePrompt] = useState(null); // { exId, setIdx }
  const [selectedExerciseDetails, setSelectedExerciseDetails] = useState(null);

  // Sync initialQuests on mount if active workout is running
  useEffect(() => {
    if (phase === 'active' && initialQuests.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      db.dailyQuests.where('date').equals(todayStr).toArray().then(quests => {
        setInitialQuests(quests);
      }).catch(err => console.error('Failed to load initial quests on reload:', err));
    }
  }, [phase, initialQuests.length]);

  const [lastWorkoutSets, setLastWorkoutSets] = useState({}); // { [exerciseId]: [{ weight, reps }] }

  // Fetch last completed session's sets for exercises in the current block
  useEffect(() => {
    if (!blocks || blocks.length === 0 || !blocks[currentExIdx]) return;
    
    const currentBlockExs = blocks[currentExIdx];
    let active = true;

    async function fetchLastSets() {
      const results = {};
      try {
        for (const ex of currentBlockExs) {
          // Find completed sets for this exercise, excluding current session
          const allCompletedSets = await db.sets
            .where('exerciseId')
            .equals(ex.id)
            .filter(s => s.completed === 1 && s.sessionId !== sessionId)
            .toArray();

          if (allCompletedSets.length > 0) {
            // Group by sessionId to find the most recent session
            const maxSessionId = Math.max(...allCompletedSets.map(s => s.sessionId));
            
            const lastSets = allCompletedSets
              .filter(s => s.sessionId === maxSessionId)
              .sort((a, b) => a.setNumber - b.setNumber);

            results[ex.id] = lastSets.map(s => ({
              weight: s.weight,
              reps: s.reps
            }));
          }
        }
        if (active) {
          setLastWorkoutSets(prev => ({ ...prev, ...results }));
        }
      } catch (err) {
        console.error('Failed to fetch last workout sets:', err);
      }
    }

    fetchLastSets();

    return () => {
      active = false;
    };
  }, [blocks, currentExIdx, sessionId]);

  const allExercises = useLiveQuery(() => db.exercises.toArray(), []);
  const profile = useLiveQuery(() => db.playerProfile.get('profile'));

  function showXPToast(amount) {
    const id = Date.now();
    setXpToasts(t => [...t, { id, amount }]);
    setTimeout(() => setXpToasts(t => t.filter(x => x.id !== id)), 2500);
  }

  function getDefaultRestDuration() { return profile?.defaultRestDuration ?? 60; }

  async function handleStart(config) {
    setWorkoutConfig(config);
    
    // Load initial daily quests for mid-workout progress tracking
    const todayStr = new Date().toISOString().split('T')[0];
    const todayQuests = await db.dailyQuests.where('date').equals(todayStr).toArray();
    setInitialQuests(todayQuests);
    toastedQuests.current = new Set();
    
    // Fetch active corrective protocols
    const activeCorrectives = await db.userPosturalIssues.where('status').equals('active').toArray();
    const customIssues = await db.customPosturalIssues.toArray() || [];
    const allPosturalIssues = [...posturalIssues, ...customIssues];
    const allExsList = await db.exercises.toArray();
    
    const warmupCorrectiveExs = [];
    const cooldownCorrectiveExs = [];
    const correctiveSets = {};
    
    if (activeCorrectives && activeCorrectives.length > 0) {
      activeCorrectives.forEach(record => {
        const issueData = allPosturalIssues.find(p => p.id === record.issueId);
        if (!issueData) return;
        
        issueData.correctiveProtocol.forEach(protoEx => {
          const matchedEx = allExsList.find(e => e.id === protoEx.exerciseId);
          if (!matchedEx) return;
          
          // Mark exercise object in-memory with issue context
          const exCopy = { 
            ...matchedEx, 
            isCorrective: true, 
            issueId: record.issueId,
            protoNote: protoEx.notes 
          };
          
          // Determine placement
          if (record.position === 'warmup' || record.position === 'both') {
            if (!warmupCorrectiveExs.some(e => e.id === exCopy.id)) {
              warmupCorrectiveExs.push(exCopy);
            }
          }
          if (record.position === 'cooldown' || record.position === 'both') {
            if (!cooldownCorrectiveExs.some(e => e.id === exCopy.id)) {
              cooldownCorrectiveExs.push(exCopy);
            }
          }
          
          // Initialize correct number of sets
          const setsCount = parseInt(protoEx.sets) || 2;
          const repsMatch = protoEx.reps.match(/\d+/);
          const defaultReps = repsMatch ? parseInt(repsMatch[0]) : 10;
          
          correctiveSets[matchedEx.id] = Array.from({ length: setsCount }, () => ({
            weight: 0,
            reps: defaultReps,
            type: 'normal',
            completed: false
          }));
        });
      });
    }

    // Convert flat exercises list into single-exercise blocks
    const planBlocks = (config.exercises || []).map(ex => [ex]);
    
    // Combine: Warmups + Plan + Cooldowns
    const warmupBlocks = warmupCorrectiveExs.map(ex => [ex]);
    const cooldownBlocks = cooldownCorrectiveExs.map(ex => [ex]);
    const initialBlocks = [...warmupBlocks, ...planBlocks, ...cooldownBlocks];
    
    const now = Date.now();
    
    // Create session record
    const sid = await db.sessions.add({
      planId: null,
      name: config.planName,
      startTime: now,
      endTime: null,
    });
    
    // Init sets for all exercises based on template targets
    const initSets = {};
    (config.exercises || []).forEach(ex => { 
      const setsCount = ex.targetSets || 3;
      const targetReps = ex.targetReps || 10;
      initSets[ex.id] = Array.from({ length: setsCount }, () => ({
        weight: 0,
        reps: targetReps,
        type: 'normal',
        completed: false
      })); 
    });
    
    // Merge corrective sets
    const finalSets = { ...initSets, ...correctiveSets };
    
    startWorkout({
      planName: config.planName,
      sessionId: sid,
      startTime: now,
      blocks: initialBlocks,
      sets: finalSets
    });
  }

  const currentBlock = blocks[currentExIdx] || [];

  function getExSets(exId) { return sets[exId] || [{ weight: 0, reps: 0, type: 'normal', completed: false }]; }

  function updateSet(exId, setIdx, changes) {
    updateSets(prev => {
      const exSets = [...(prev[exId] || [])];
      exSets[setIdx] = { ...exSets[setIdx], ...changes };
      return { ...prev, [exId]: exSets };
    });
  }

  const handleSelectRpe = async (rpeVal) => {
    if (!rpePrompt) return;
    const { exId, setIdx } = rpePrompt;
    
    const exSets = getExSets(exId);
    const s = exSets[setIdx];
    
    if (s.completed) {
      updateSet(exId, setIdx, { rpe: rpeVal });
    } else {
      await completeSet(exId, setIdx, rpeVal);
    }
    
    setRpePrompt(null);
  };

  async function completeSet(exId, setIdx, rpeValue) {
    const exSets = getExSets(exId);
    const s = exSets[setIdx];
    if (s.completed) return;
    const w = s.weight || 0;
    const r = s.reps || 0;
    const matchedEx = allExercises?.find(e => e.id === exId);
    const isCorrectiveEx = matchedEx?.isCorrective || matchedEx?.muscleGroup === 'Corrective';
    const isWarmup = s.type === 'warmup';
    const xp = isWarmup ? 0 : isCorrectiveEx ? 5 : calculateSetXP(w, r);

    // Check PR
    const prRecord = await db.personalRecords.where('exerciseId').equals(exId).first();
    let isPR = false;
    if (!isWarmup && (!prRecord || w > prRecord.weight || (w === prRecord.weight && r > prRecord.reps))) {
      if (w > 0 && r > 0) {
        isPR = true;
        await db.personalRecords.put({ exerciseId: exId, weight: w, reps: r, date: Date.now() });
      }
    }

    const bonus = isPR ? 100 : 0;
    const earned = xp + bonus;
    if (earned > 0) {
      updateTotalXP(prev => prev + earned);
      showXPToast(earned);
    }

    // Play feedback
    playSetCompleteSound();
    hapticSetComplete();

    if (isPR) {
      checkAndUnlockAchievement('pr_first');
    }

    updateSet(exId, setIdx, { completed: true, ...(rpeValue !== undefined ? { rpe: rpeValue } : {}) });

    // Evaluate quest completions for mid-workout toasts
    try {
      const exerciseMap = {};
      allExercises?.forEach(e => { exerciseMap[e.id] = e; });

      let legSetsCount = 0;
      let backSetsCount = 0;
      let shoulderSetsCount = 0;
      let armSetsCount = 0;
      let coreSetsCount = 0;
      let totalCompletedSetsCount = 0;
      let totalVol = 0;

      const updatedSets = { ...sets };
      const currentExSets = [...(sets[exId] || [])];
      currentExSets[setIdx] = { ...currentExSets[setIdx], completed: true, ...(rpeValue !== undefined ? { rpe: rpeValue } : {}) };
      updatedSets[exId] = currentExSets;

      for (const [eIdStr, exSets] of Object.entries(updatedSets)) {
        const eId = parseInt(eIdStr);
        const ex = exerciseMap[eId];
        if (!ex) continue;
        
        const compSets = exSets.filter(s => s.completed);
        totalCompletedSetsCount += compSets.length;
        totalVol += compSets.reduce((acc, s) => acc + ((s.weight || 0) * (s.reps || 0)), 0);

        if (ex.muscleGroup === 'Legs') legSetsCount += compSets.length;
        if (ex.muscleGroup === 'Back') backSetsCount += compSets.length;
        if (ex.muscleGroup === 'Shoulders') shoulderSetsCount += compSets.length;
        if (ex.muscleGroup === 'Arms') armSetsCount += compSets.length;
        if (ex.muscleGroup === 'Core') coreSetsCount += compSets.length;
      }

      let newPRsCount = 0;
      for (const eIdStr of Object.keys(updatedSets)) {
        const eId = parseInt(eIdStr);
        const prRecord = await db.personalRecords.where('exerciseId').equals(eId).first();
        if (prRecord && prRecord.date >= startTime) {
          newPRsCount++;
        } else if (eId === exId && isPR) {
          newPRsCount++;
        }
      }

      for (const quest of initialQuests) {
        if (quest.completed || toastedQuests.current.has(quest.id)) continue;

        let progress = 0;
        if (quest.type === 'total_volume') {
          progress = totalVol;
        } else if (quest.type === 'new_pr') {
          progress = newPRsCount;
        } else if (quest.type === 'total_sets') {
          progress = totalCompletedSetsCount;
        } else if (quest.type === 'train_legs') {
          if (legSetsCount > 0) progress = 1;
        } else if (quest.type === 'back_sets') {
          progress = backSetsCount;
        } else if (quest.type === 'shoulder_sets') {
          progress = shoulderSetsCount;
        } else if (quest.type === 'arm_sets') {
          progress = armSetsCount;
        } else if (quest.type === 'core_work') {
          progress = coreSetsCount;
        }

        if (quest.current + progress >= quest.target) {
          toastedQuests.current.add(quest.id);
          showToast(`🎯 QUEST COMPLETE: ${quest.target} ${quest.type.replace('_', ' ').toUpperCase()} (+${quest.xpReward} XP)`);
        }
      }
    } catch (err) {
      console.error('Failed to check mid-workout quest progress:', err);
    }
    
    // Auto-start rest timer
    setShowRest(true);

    // Auto-add next set row
    setTimeout(() => {
      updateSets(prev => {
        const exSets = [...(prev[exId] || [])];
        const allDone = exSets.every(s => s.completed);
        if (allDone) {
          return { ...prev, [exId]: [...exSets, { weight: exSets[exSets.length - 1]?.weight || 0, reps: 0, type: 'normal', completed: false }] };
        }
        return prev;
      });
    }, 300);
  }

  function addSetToBlock() {
    updateSets(prev => {
      const next = { ...prev };
      currentBlock.forEach(ex => {
        const exSets = next[ex.id] || [];
        const lastCompleted = [...exSets].reverse().find(s => s.completed);
        next[ex.id] = [...exSets, { weight: lastCompleted?.weight || 0, reps: 0, type: 'normal', completed: false }];
      });
      return next;
    });
  }

  function deleteSet(exId, setIdx) {
    updateSets(prev => {
      const next = { ...prev };
      if (currentBlock.length > 1) {
        // Superset block: delete this round (setIdx) for all exercises in the current block
        currentBlock.forEach(ex => {
          const exSets = [...(next[ex.id] || [])];
          if (exSets.length > 1) {
            exSets.splice(setIdx, 1);
            next[ex.id] = exSets;
          } else {
            next[ex.id] = [{ weight: 0, reps: 0, type: 'normal', completed: false }];
          }
        });
      } else {
        // Single exercise block
        const exSets = [...(next[exId] || [])];
        if (exSets.length > 1) {
          exSets.splice(setIdx, 1);
          next[exId] = exSets;
        } else {
          next[exId] = [{ weight: 0, reps: 0, type: 'normal', completed: false }];
        }
      }
      return next;
    });
  }

  async function deleteBlock(blockIdx) {
    const confirmed = await showConfirm("Are you sure you want to remove this exercise block?", "Remove Exercise?");
    if (!confirmed) {
      return;
    }
    const blockExs = blocks[blockIdx] || [];
    updateBlocks(prev => prev.filter((_, idx) => idx !== blockIdx));
    updateSets(prev => {
      const next = { ...prev };
      blockExs.forEach(ex => {
        delete next[ex.id];
      });
      return next;
    });
    setCurrentExIdx(prev => Math.max(0, Math.min(blocks.length - 2, prev)));
  }

  async function handleFinish() {
    const profile = await db.playerProfile.get('profile');
    const today = new Date().toISOString().split('T')[0];
    const prevAchievements = await db.achievements.toArray();

    // Calc final XP with streak multiplier and completion bonus
    const streakMult = Math.min(1.0 + (profile?.currentStreak || 0) * 0.1, 2.0);
    const finalXP = Math.round((totalXP + 50) * streakMult);

    // Save all sets to DB
    for (const [exIdStr, exSets] of Object.entries(sets)) {
      const exId = parseInt(exIdStr);
      for (let i = 0; i < exSets.length; i++) {
        const s = exSets[i];
        if (s.completed || (s.weight > 0 && s.reps > 0)) {
          await db.sets.add({ 
            sessionId, 
            exerciseId: exId, 
            setNumber: i + 1, 
            weight: s.weight, 
            reps: s.reps, 
            rpe: s.rpe || null,
            type: s.type || 'normal',
            completed: s.completed ? 1 : 0 
          });
        }
      }
    }

    // Calculate total volume
    const totalVol = Object.values(sets).flat().filter(s => s.completed).reduce((acc, s) => acc + (s.weight * s.reps), 0);

    // Evaluate Daily Quests progress
    const exercisesList = await db.exercises.toArray();
    const exerciseMap = {};
    exercisesList.forEach(e => { exerciseMap[e.id] = e; });

    let legSetsCount = 0;
    let backSetsCount = 0;
    let shoulderSetsCount = 0;
    let armSetsCount = 0;
    let coreSetsCount = 0;
    let totalCompletedSetsCount = 0;

    for (const [exIdStr, exSets] of Object.entries(sets)) {
      const exId = parseInt(exIdStr);
      const ex = exerciseMap[exId];
      if (!ex) continue;
      
      const compSets = exSets.filter(s => s.completed);
      totalCompletedSetsCount += compSets.length;

      if (ex.muscleGroup === 'Legs') legSetsCount += compSets.length;
      if (ex.muscleGroup === 'Back') backSetsCount += compSets.length;
      if (ex.muscleGroup === 'Shoulders') shoulderSetsCount += compSets.length;
      if (ex.muscleGroup === 'Arms') armSetsCount += compSets.length;
      if (ex.muscleGroup === 'Core') coreSetsCount += compSets.length;
    }

    // Check PRs
    let newPRsCount = 0;
    for (const exIdStr of Object.keys(sets)) {
      const exId = parseInt(exIdStr);
      const prRecord = await db.personalRecords.where('exerciseId').equals(exId).first();
      if (prRecord && prRecord.date >= startTime) {
        newPRsCount++;
      }
    }

    const durationMinutes = (Date.now() - startTime) / 60000;

    const todayQuests = await db.dailyQuests.where('date').equals(today).toArray();
    const prevQuests = JSON.parse(JSON.stringify(todayQuests));
    let questXPEarned = 0;

    for (const quest of todayQuests) {
      if (quest.completed) continue;

      let progress = 0;
      if (quest.type === 'workout_count') {
        progress = 1;
      } else if (quest.type === 'total_volume') {
        progress = totalVol;
      } else if (quest.type === 'new_pr') {
        progress = newPRsCount;
      } else if (quest.type === 'fast_workout') {
        if (durationMinutes < 45) progress = 1;
      } else if (quest.type === 'total_sets') {
        progress = totalCompletedSetsCount;
      } else if (quest.type === 'train_legs') {
        if (legSetsCount > 0) progress = 1;
      } else if (quest.type === 'back_sets') {
        progress = backSetsCount;
      } else if (quest.type === 'shoulder_sets') {
        progress = shoulderSetsCount;
      } else if (quest.type === 'arm_sets') {
        progress = armSetsCount;
      } else if (quest.type === 'core_work') {
        progress = coreSetsCount;
      }

      const newCurrent = Math.min(quest.current + progress, quest.target);
      const completed = newCurrent >= quest.target;
      
      await db.dailyQuests.update(quest.id, {
        current: newCurrent,
        completed
      });

      if (completed) {
        questXPEarned += quest.xpReward;
      }
    }

    // Update session stats
    await db.sessions.update(sessionId, {
      endTime: Date.now(),
      volume: totalVol,
      xpEarned: finalXP + questXPEarned
    });

    // Update player profile
    const lastDate = profile?.lastSessionDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastDate === yesterday ? (profile.currentStreak || 0) + 1 : lastDate === today ? (profile.currentStreak || 0) : 1;
    const newTotalXP = (profile?.totalXP || 0) + finalXP + questXPEarned;
    const newTotalSessions = (profile?.totalSessions || 0) + 1;

    await db.playerProfile.update('profile', {
      totalXP: newTotalXP,
      totalSessions: newTotalSessions,
      totalVolume: (profile?.totalVolume || 0) + totalVol,
      currentStreak: newStreak,
      longestStreak: Math.max(profile?.longestStreak || 0, newStreak),
      lastSessionDate: today,
    });

    // Check and Unlock Achievements
    if (newTotalSessions >= 10) await checkAndUnlockAchievement('sessions_10');
    if (newTotalSessions >= 50) await checkAndUnlockAchievement('sessions_50');
    
    if (newStreak >= 7) await checkAndUnlockAchievement('streak_7');
    if (newStreak >= 30) await checkAndUnlockAchievement('streak_30');

    if (newTotalXP >= 1000) await checkAndUnlockAchievement('rank_d');
    if (newTotalXP >= 5000) await checkAndUnlockAchievement('rank_c');
    if (newTotalXP >= 15000) await checkAndUnlockAchievement('rank_b');
    if (newTotalXP >= 40000) await checkAndUnlockAchievement('rank_a');
    if (newTotalXP >= 100000) await checkAndUnlockAchievement('rank_s');

    // ── Corrective Exercises Session Logging ───
    try {
      const activeCorrectives = await db.userPosturalIssues.where('status').equals('active').toArray();
      const customIssues = await db.customPosturalIssues.toArray() || [];
      const allPosturalIssues = [...posturalIssues, ...customIssues];

      if (activeCorrectives && activeCorrectives.length > 0) {
        const completedExIds = Object.entries(sets)
          .filter(([_, exSets]) => exSets.some(s => s.completed))
          .map(([exIdStr]) => parseInt(exIdStr));

        for (const record of activeCorrectives) {
          const issueData = allPosturalIssues.find(p => p.id === record.issueId);
          if (!issueData) continue;

          // Check if any exercise in the protocol was completed
          const hasDoneCorrective = issueData.correctiveProtocol.some(protoEx => 
            completedExIds.includes(protoEx.exerciseId)
          );

          if (hasDoneCorrective) {
            const nextCompleted = record.completedSessions + 1;
            const isNowResolved = nextCompleted >= record.targetSessions;
            
            await db.userPosturalIssues.update(record.id, {
              completedSessions: nextCompleted,
              status: isNowResolved ? 'resolved' : 'active'
            });

            if (isNowResolved) {
              const currentProfile = await db.playerProfile.get('profile');
              if (currentProfile) {
                await db.playerProfile.update('profile', {
                  totalXP: currentProfile.totalXP + 200
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to log corrective progress:', err);
    }

    const finalXPApplied = finalXP + questXPEarned;
    const finalDuration = Date.now() - startTime;

    // Reset global workout state
    endWorkout();

    // Navigate to mission complete
    navigate('/mission-complete', { 
      state: { 
        sessionId, 
        finalXP: finalXPApplied, 
        totalVol, 
        duration: finalDuration, 
        prevXP: profile?.totalXP || 0, 
        prevProfile: profile,
        prevQuests,
        prevAchievements
      } 
    });
  }

  async function handleDiscard() {
    const confirmed = await showConfirm('Discard this workout? All progress will be lost.', 'Discard Workout?', { danger: true });
    if (!confirmed) return;
    if (sessionId) {
      await db.sets.where('sessionId').equals(sessionId).delete();
      await db.sessions.delete(sessionId);
    }
    endWorkout();
    navigate('/');
  }

  const completedSetCount = Object.values(sets).flat().filter(s => s.completed).length;

  // ── Render ───
  if (phase === 'setup') {
    return <LogSetupScreen onStart={handleStart} />;
  }

  const maxSets = currentBlock.length > 0 ? Math.max(...currentBlock.map(ex => getExSets(ex.id).length)) : 0;
  const isSuperset = currentBlock.length > 1;
  const currentBlockSets = currentBlock.length > 0 ? getExSets(currentBlock[0].id) : [];
  const completedBlockSets = currentBlockSets.filter(s => s.completed).length;
  const totalBlockSets = currentBlockSets.length;

  return (
    <div className="screen" id="active-workout-screen">
      {/* Top Bar */}
      <div className="workout-topbar">
        <div className="workout-topbar-left">
          <span className="mission-label section-label">MISSION IN PROGRESS</span>
          {currentBlock.length > 0 && !isSuperset ? (
            <button 
              className="current-ex-name" 
              onClick={() => setSelectedExerciseDetails(currentBlock[0])} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', appearance: 'none', color: 'inherit', font: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 6 }}
              title="View Exercise Details"
            >
              {currentBlock[0].name}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.8}}>
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
              </svg>
            </button>
          ) : (
            <h2 className="current-ex-name">
              {currentBlock.length > 0 
                ? isSuperset ? `SUPERSET (${currentBlock.length})` : currentBlock[0].name 
                : 'Quick Workout'}
            </h2>
          )}
          <ElapsedTimer startTime={startTime} />
        </div>
        <button className="complete-workout-btn" onClick={handleFinish} id="finish-workout-btn">
          FINISH
        </button>
      </div>

      <div className="workout-scroll-area">
        {/* Exercise Nav */}
        {blocks.length > 0 && (
          <div className="ex-nav-bar">
            <button
              className="ex-nav-btn"
              onClick={() => setCurrentExIdx(i => Math.max(0, i - 1))}
              disabled={currentExIdx === 0}
              aria-label="Previous block"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button className="ex-nav-title" onClick={() => setShowJump(true)} id="exercise-nav-title">
              Block {currentExIdx + 1} of {blocks.length}
            </button>
            <button
              className="ex-nav-btn"
              onClick={() => setCurrentExIdx(i => Math.min(blocks.length - 1, i + 1))}
              disabled={currentExIdx === blocks.length - 1}
              aria-label="Next block"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
        {/* Corrective Warning/Tip */}
        {currentBlock.length === 1 && (currentBlock[0]?.isCorrective || currentBlock[0]?.muscleGroup === 'Corrective') && (
          <div className="card" style={{ margin: '12px 16px 0', border: '1px dashed var(--accent-gold)', background: 'rgba(255, 179, 0, 0.05)', padding: 12 }}>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: 12, fontFamily: 'var(--font-display)', display: 'block', letterSpacing: '0.05em' }}>🩺 CORRECTIVE EXERCISE</span>
            {currentBlock[0].protoNote && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
                <strong>Goal:</strong> {currentBlock[0].protoNote}
              </p>
            )}
          </div>
        )}

        {/* Sets */}
        {currentBlock.length > 0 && (
          <div className="sets-section">
            <div className="sets-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-label">SETS</span>
              {totalBlockSets > 0 && (
                <span className="section-label" style={{ color: completedBlockSets === totalBlockSets ? 'var(--success)' : 'var(--text-muted)' }}>
                  {completedBlockSets} OF {totalBlockSets} COMPLETED
                </span>
              )}
            </div>

            {/* Set Grid Headers */}
            <div className="set-row-header">
              <span className="header-label">SET</span>
              <span className="header-label">WEIGHT</span>
              <span className="header-label">REPS</span>
              <span className="header-label">RPE</span>
              <span className="header-label" style={{ textAlign: 'center' }}>DONE</span>
              <span className="header-label"></span>
            </div>

            <div className="sets-list">
              {[...Array(maxSets)].map((_, roundIdx) => (
                <div key={`round-${roundIdx}`} className={isSuperset ? "superset-round-card" : ""}>
                  {isSuperset && <div className="section-label" style={{ marginBottom: 8, marginTop: roundIdx > 0 ? 16 : 0 }}>ROUND {roundIdx + 1}</div>}
                  <AnimatePresence>
                    {currentBlock.map(ex => {
                      const exSets = getExSets(ex.id);
                      const s = exSets[roundIdx];
                      if (!s) return null;
                      return (
                        <div key={`ex-${ex.id}-set-${roundIdx}`}>
                          {isSuperset && (
                            <button 
                              className="ex-sub-label" 
                              onClick={() => setSelectedExerciseDetails(ex)}
                              style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, marginTop: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                              title="View Exercise Details"
                            >
                              {ex.name}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                              </svg>
                            </button>
                          )}
                          <SetRow
                            set={s}
                            index={roundIdx}
                            isActive={!s.completed && exSets.slice(0, roundIdx).every(prev => prev.completed)}
                            onUpdate={changes => updateSet(ex.id, roundIdx, changes)}
                            onComplete={() => setRpePrompt({ exId: ex.id, setIdx: roundIdx })}
                            onRpeClick={() => setRpePrompt({ exId: ex.id, setIdx: roundIdx })}
                            onPlateCalc={() => setPlateCalcWeight(s.weight)}
                            onDelete={() => deleteSet(ex.id, roundIdx)}
                            unitPreference={profile?.unitPreference || 'kg'}
                            lastSetData={lastWorkoutSets[ex.id] ? (lastWorkoutSets[ex.id][roundIdx] || lastWorkoutSets[ex.id][lastWorkoutSets[ex.id].length - 1]) : null}
                          />
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            <div className="sets-actions-bar" style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button className="add-set-btn" onClick={addSetToBlock} id="add-set-btn" style={{ flex: 1 }}>
                + ADD SET
              </button>
              <button 
                className="remove-block-btn" 
                onClick={() => deleteBlock(currentExIdx)} 
                title="Remove this exercise block"
                style={{
                  flex: 1,
                  background: 'none',
                  color: 'var(--accent-red)',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 23, 68, 0.2)',
                  height: 40
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                REMOVE BLOCK
              </button>
            </div>

            {/* XP Preview */}
            <div className="xp-preview">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>approx. {totalXP} XP earned this session</span>
            </div>
          </div>
        )}

        {/* Quick start — no exercises yet */}
        {blocks.length === 0 && (
          <div className="empty-state" style={{ marginTop: 32 }}>
            <span style={{ fontSize: 36 }}>🏋️</span>
            <p>No exercises added</p>
            <button className="btn-primary" style={{ marginTop: 16, width: 'auto', padding: '12px 28px' }} onClick={() => setAddExSheet(true)} id="add-exercise-btn">
              + ADD EXERCISE
            </button>
          </div>
        )}

        {/* Rest Timer Pill */}
        <div className="rest-timer-pill-wrapper">
          <button className="rest-timer-pill" onClick={() => setShowRest(true)} id="rest-timer-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            HOLD — REST TIMER
          </button>
        </div>

        {/* Session stats */}
        <div className="session-stats card" style={{ margin: '0 16px 16px' }}>
          <div className="session-stat-row">
            <span className="section-label">COMPLETED SETS</span>
            <span className="stat-number" style={{ fontSize: 20 }}>{completedSetCount}</span>
          </div>
          <div className="session-stat-row">
            <span className="section-label">XP EARNED</span>
            <span className="stat-number" style={{ fontSize: 20, color: 'var(--accent-gold)' }}>{totalXP}</span>
          </div>
        </div>

        <div style={{ padding: '24px 16px 120px', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button className="btn-ghost" style={{ width: '100%', maxWidth: '360px', color: 'var(--accent-red)', margin: '0 auto' }} onClick={handleDiscard} id="discard-workout-btn">
            DISCARD WORKOUT
          </button>
        </div>
      </div>

      {/* Add Exercise Sheet (quick start) */}
      <AnimatePresence>
        {addExSheet && (
          <AddExerciseSheet
            allExercises={allExercises || []}
            hasCurrentBlock={blocks.length > 0}
            onAdd={(ex, asSuperset) => {
              const joinCurrent = asSuperset && blocks.length > 0;
              if (joinCurrent) {
                updateBlocks(prev => prev.map((b, i) => (i === currentExIdx ? [...b, ex] : b)));
              } else {
                updateBlocks(prev => [...prev, [ex]]);
                setCurrentExIdx(blocks.length);
              }
              // Initialize sets for the new exercise to match the current block maxSets or 1
              const initialSetsCount = joinCurrent ? (maxSets || 1) : 1;
              const newSets = Array.from({ length: initialSetsCount }, () => ({ weight: 0, reps: 0, type: 'normal', completed: false }));
              updateSets(prev => ({ ...prev, [ex.id]: newSets }));
              setAddExSheet(false);
            }}
            onClose={() => setAddExSheet(false)}
          />
        )}
      </AnimatePresence>

      {/* Exercise Jump Sheet */}
      <AnimatePresence>
        {showJump && (
          <ExerciseJumpSheet blocks={blocks} currentIdx={currentExIdx} onSelect={setCurrentExIdx} onDeleteBlock={deleteBlock} onClose={() => setShowJump(false)} />
        )}
      </AnimatePresence>

      {/* Rest Timer Overlay */}
      <AnimatePresence>
        {showRest && (
          <RestTimerOverlay
            defaultDuration={getDefaultRestDuration()}
            onClose={() => setShowRest(false)}
          />
        )}
      </AnimatePresence>

      {/* Plate Calculator Sheet */}
      <AnimatePresence>
        {plateCalcWeight !== null && (
          <PlateCalculatorSheet weight={plateCalcWeight} unitPreference={profile?.unitPreference || 'kg'} onClose={() => setPlateCalcWeight(null)} />
        )}
      </AnimatePresence>

      {/* RPE Selection Sheet */}
      <AnimatePresence>
        {rpePrompt !== null && (
          <RPESelectionSheet
            exId={rpePrompt.exId}
            setIdx={rpePrompt.setIdx}
            onSelect={handleSelectRpe}
            onClose={() => setRpePrompt(null)}
          />
        )}
      </AnimatePresence>

      {/* Exercise Details Sheet */}
      <AnimatePresence>
        {selectedExerciseDetails !== null && (
          <ExerciseDetailsSheet
            exercise={selectedExerciseDetails}
            onClose={() => setSelectedExerciseDetails(null)}
          />
        )}
      </AnimatePresence>

      {/* XP Toasts */}
      <div className="xp-toast-stack">
        <AnimatePresence>
          {xpToasts.map(t => <XPToast key={t.id} amount={t.amount} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Add Exercise Sheet ─────────────────────────── */
function AddExerciseSheet({ allExercises, onAdd, onClose, hasCurrentBlock }) {
  const [search, setSearch] = useState('');
  const [addMode, setAddMode] = useState('new'); // 'new' | 'superset'
  const filtered = allExercises.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <BottomSheet
      onClose={onClose}
      title="ADD EXERCISE"
    >
      {hasCurrentBlock && (
        <div className="tab-pills" style={{ marginBottom: 16 }}>
          <button className={`tab-pill ${addMode === 'new' ? 'active' : ''}`} onClick={() => setAddMode('new')}>NEW EXERCISE</button>
          <button className={`tab-pill ${addMode === 'superset' ? 'active' : ''}`} onClick={() => setAddMode('superset')}>SUPERSET</button>
        </div>
      )}

      <input className="search-input" type="search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(ex => (
          <button key={ex.id} className="jump-item" onClick={() => onAdd(ex, addMode === 'superset')} id={`add-ex-${ex.id}`}>
            <span className="jump-name">{ex.name}</span>
            <span className="chip chip-blue" style={{ fontSize: 10 }}>{ex.muscleGroup}</span>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}

/* ── Exercise Jump Sheet ──────────────────────── */
function ExerciseJumpSheet({ blocks, currentIdx, onSelect, onDeleteBlock, onClose }) {
  if (!blocks) return null;
  return (
    <BottomSheet
      onClose={onClose}
      title="JUMP TO BLOCK"
    >
      <div className="jump-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {blocks.map((block, i) => {
          const isSuperset = block.length > 1;
          const name = isSuperset ? `Superset (${block.length} exercises)` : (block[0]?.name || 'Unknown');
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
              <button 
                className={`jump-item ${i === currentIdx ? 'current' : ''}`} 
                onClick={() => { onSelect(i); onClose(); }} 
                id={`jump-to-${i}`}
                style={{ flex: 1, margin: 0 }}
              >
                <span className="jump-num">{i + 1}</span>
                <span className="jump-name">{name}</span>
                {i === currentIdx && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
              <button
                className="delete-jump-btn"
                onClick={(e) => { e.stopPropagation(); onDeleteBlock(i); }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-red-dim)',
                  border: '1px solid rgba(255, 23, 68, 0.2)',
                  color: 'var(--accent-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
                title="Remove exercise block"
                id={`delete-block-${i}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
}

/* ── Plate Calculator Sheet ──────────────────────── */
function PlateCalculatorSheet({ weight, unitPreference, onClose }) {
  const isLbs = unitPreference === 'lbs';
  const barWeight = isLbs ? 45 : 20;
  const platesAvailable = isLbs ? [45, 35, 25, 10, 5, 2.5] : [25, 20, 15, 10, 5, 2.5, 1.25];
  const unitLabel = isLbs ? 'lbs' : 'kg';
  
  let targetPerSide = (weight - barWeight) / 2;
  const platesToLoad = [];
  
  if (targetPerSide > 0) {
    let currentTarget = targetPerSide;
    for (const p of platesAvailable) {
      while (currentTarget >= p) {
        platesToLoad.push(p);
        currentTarget -= p;
        currentTarget = Math.round(currentTarget * 100) / 100; // handle float precision
      }
    }
  }

  return (
    <BottomSheet
      onClose={onClose}
      title="PLATE CALCULATOR"
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>{weight} {unitLabel}</div>
        <div className="section-label">TARGET WEIGHT</div>
      </div>

      {weight < barWeight ? (
        <div className="empty-state" style={{ padding: 20 }}>
          <span style={{ fontSize: 24 }}>⚠️</span>
          <p style={{ marginTop: 8 }}>Weight is less than the bar ({barWeight}{unitLabel})</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
            <span style={{ fontWeight: 600 }}>Barbell</span>
            <span style={{ color: 'var(--text-muted)' }}>{barWeight} {unitLabel}</span>
          </div>
          
          <p className="section-label" style={{ margin: '16px 0 8px' }}>LOAD ON EACH SIDE:</p>
          {platesToLoad.length === 0 ? (
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Just the bar!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {platesToLoad.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                  </div>
                  <span style={{ fontWeight: 600 }}>{p} {unitLabel} plate</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </BottomSheet>
  );
}

/* ── RPE Selection Sheet ──────────────────────── */
function RPESelectionSheet({ exId, setIdx, onSelect, onClose }) {
  const options = [
    { value: 10, label: '10', desc: 'Max Effort / 0 reps left' },
    { value: 9.5, label: '9.5', desc: 'Maybe 1 rep left' },
    { value: 9, label: '9', desc: '1 rep left' },
    { value: 8.5, label: '8.5', desc: 'Maybe 2 reps left' },
    { value: 8, label: '8', desc: '2 reps left' },
    { value: 7.5, label: '7.5', desc: 'Maybe 3 reps left' },
    { value: 7, label: '7', desc: '3 reps left' },
    { value: 6, label: '6', desc: 'Challenging' },
    { value: 5, label: '5', desc: 'Easy / Warm-up' }
  ];

  return (
    <BottomSheet
      onClose={onClose}
      title="RATE YOUR EFFORT (RPE)"
    >
      <div className="rpe-prompt-info" style={{ textAlign: 'center', marginBottom: 20 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          How hard was that set? Rate the intensity of your effort.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
        {options.map(opt => (
          <button
            key={opt.value}
            className="jump-item"
            onClick={() => onSelect(opt.value)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}
          >
            <span style={{ fontSize: 16, fontWeight: '700', color: 'var(--accent-blue)' }}>RPE {opt.label}</span>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{opt.desc}</span>
          </button>
        ))}
        
        <button
          className="jump-item"
          onClick={() => onSelect(null)}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 16px', border: '1px dashed var(--border)', background: 'transparent', marginTop: 8 }}
        >
          <span style={{ fontSize: 15, fontWeight: '600', color: 'var(--text-secondary)' }}>Skip / No RPE</span>
        </button>
      </div>
    </BottomSheet>
  );
}

