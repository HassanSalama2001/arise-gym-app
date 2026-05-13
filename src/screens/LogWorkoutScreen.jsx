import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import db from '../db/db';
import { calculateSetXP } from '../data/progression';
import RestTimerOverlay from '../components/RestTimerOverlay';
import XPToast from '../components/XPToast';
import { playSetCompleteSound } from '../utils/audio';
import { hapticSetComplete } from '../utils/haptics';
import { checkAndUnlockAchievement } from '../utils/achievements';
import './LogWorkoutScreen.css';

/* ── Elapsed Timer ─────────────────────────────── */
function ElapsedTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(iv);
  }, [startTime]);
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

function SetRow({ set, index, onUpdate, onComplete, isActive, onPlateCalc }) {
  const typeColors = { normal: 'var(--text-primary)', warmup: 'var(--accent-gold)', drop: 'var(--accent-red)' };
  const typeLabels = { normal: index + 1, warmup: 'W', drop: 'D' };
  
  const cycleType = () => {
    if (set.completed) return;
    const types = ['normal', 'warmup', 'drop'];
    const current = types.indexOf(set.type || 'normal');
    onUpdate({ type: types[(current + 1) % types.length] });
  };

  return (
    <motion.div
      className={`set-row ${set.completed ? 'set-completed' : ''} ${isActive ? 'set-active' : ''}`}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
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

      <div className="set-inputs">
        <div className="set-input-group">
          <input
            type="number"
            inputMode="decimal"
            className="set-input"
            placeholder="0"
            value={set.weight || ''}
            onChange={e => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
            onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
            disabled={set.completed}
            aria-label="Weight"
            id={`set-weight-${index}`}
          />
          <span className="set-input-label">kg</span>
          {onPlateCalc && (
            <button 
              className="plate-calc-btn" 
              onClick={onPlateCalc}
              disabled={set.completed || !set.weight}
              title="Plate Calculator"
              style={{ padding: 4, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: 2 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
        </div>
        <span className="set-x">×</span>
        <div className="set-input-group">
          <input
            type="number"
            inputMode="decimal"
            className="set-input"
            placeholder="0"
            value={set.reps || ''}
            onChange={e => onUpdate({ reps: parseInt(e.target.value) || 0 })}
            onFocus={e => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
            disabled={set.completed}
            aria-label="Reps"
            id={`set-reps-${index}`}
          />
          <span className="set-input-label">reps</span>
        </div>
        <span className="set-x" style={{ color: 'var(--text-muted)' }}>|</span>
        <div className="set-input-group">
          <select
            className="set-input"
            value={set.rpe || ''}
            onChange={e => onUpdate({ rpe: parseFloat(e.target.value) || 0 })}
            disabled={set.completed}
            id={`set-rpe-${index}`}
            style={{ width: 54, padding: '0 4px', fontSize: 16 }}
          >
            <option value="">-</option>
            {[10, 9.5, 9, 8.5, 8, 7.5, 7, 6.5, 6, 5, 4].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <span className="set-input-label" onClick={() => alert('RPE (Rate of Perceived Exertion):\n10: Max effort (0 reps left)\n9: 1 rep left\n8: 2 reps left\n7-6: Challenging\n<5: Warm-up')} style={{ cursor: 'pointer', textDecoration: 'underline dotted', textDecorationColor: 'var(--text-muted)' }}>RPE</span>
        </div>
      </div>

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
    </motion.div>
  );
}

/* ── Log Setup (pick plan or quick start) ────────── */
function LogSetupScreen({ onStart }) {
  const navigate = useNavigate();
  const plans = useLiveQuery(() => db.workoutPlans.toArray(), []);
  const planExercises = useLiveQuery(() => db.planExercises.toArray(), []);
  const exercises = useLiveQuery(() => db.exercises.toArray(), []);

  const [selectedPlan, setSelectedPlan] = useState(null);

  function getPlanExercises(planId) {
    if (!planExercises || !exercises) return [];
    return planExercises
      .filter(pe => pe.planId === planId)
      .sort((a, b) => a.order - b.order)
      .map(pe => exercises.find(e => e.id === pe.exerciseId))
      .filter(Boolean);
  }

  async function startWithPlan(plan) {
    const exs = getPlanExercises(plan.id);
    if (exs.length === 0) { alert('This plan has no exercises. Add some first!'); return; }
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
  const navigate = useNavigate();
  const [phase, setPhase] = useState('setup'); // 'setup' | 'active'
  const [workoutConfig, setWorkoutConfig] = useState(null);

  // Active workout state
  const [sessionId, setSessionId] = useState(null);
  const [startTime] = useState(() => Date.now());
  const [currentExIdx, setCurrentExIdx] = useState(0);
  const [sets, setSets] = useState({}); // { [exerciseId]: [{ weight, reps, completed }] }
  const [showJump, setShowJump] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState(null);
  const [xpToasts, setXpToasts] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [addExSheet, setAddExSheet] = useState(false);

  // For quick start — dynamic exercise list
  // For quick start — dynamic exercise list
  const [blocks, setBlocks] = useState([]); // Array of blocks. A block is an array of exercises: [ex1, ex2]
  const allExercises = useLiveQuery(() => db.exercises.toArray(), []);

  function showXPToast(amount) {
    const id = Date.now();
    setXpToasts(t => [...t, { id, amount }]);
    setTimeout(() => setXpToasts(t => t.filter(x => x.id !== id)), 2500);
  }

  function getDefaultRestDuration() { return 60; }

  async function handleStart(config) {
    setWorkoutConfig(config);
    // Convert flat exercises list into single-exercise blocks
    const initialBlocks = (config.exercises || []).map(ex => [ex]);
    setBlocks(initialBlocks);
    
    // Create session record
    const sid = await db.sessions.add({
      planId: null,
      name: config.planName,
      startTime: Date.now(),
      endTime: null,
    });
    setSessionId(sid);
    // Init sets for all exercises
    const initSets = {};
    config.exercises.forEach(ex => { initSets[ex.id] = [{ weight: 0, reps: 0, type: 'normal', completed: false }]; });
    setSets(initSets);
    setPhase('active');
  }

  const currentBlock = blocks[currentExIdx] || [];

  function getExSets(exId) { return sets[exId] || [{ weight: 0, reps: 0, type: 'normal', completed: false }]; }

  function updateSet(exId, setIdx, changes) {
    setSets(prev => {
      const exSets = [...(prev[exId] || [])];
      exSets[setIdx] = { ...exSets[setIdx], ...changes };
      return { ...prev, [exId]: exSets };
    });
  }

  async function completeSet(exId, setIdx) {
    const exSets = getExSets(exId);
    const s = exSets[setIdx];
    if (s.completed) return;
    const w = s.weight || 0;
    const r = s.reps || 0;
    const isWarmup = s.type === 'warmup';
    const xp = isWarmup ? 0 : calculateSetXP(w, r);

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
      setTotalXP(prev => prev + earned);
      showXPToast(earned);
    }

    // Play feedback
    playSetCompleteSound();
    hapticSetComplete();

    if (isPR) {
      checkAndUnlockAchievement('pr_first');
    }

    updateSet(exId, setIdx, { completed: true });
    
    // Auto-start rest timer
    setShowRest(true);

    // Auto-add next set row
    setTimeout(() => {
      setSets(prev => {
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
    setSets(prev => {
      const next = { ...prev };
      currentBlock.forEach(ex => {
        const exSets = next[ex.id] || [];
        const lastCompleted = [...exSets].reverse().find(s => s.completed);
        next[ex.id] = [...exSets, { weight: lastCompleted?.weight || 0, reps: 0, type: 'normal', completed: false }];
      });
      return next;
    });
  }

  async function handleFinish() {
    // Calc final XP with streak multiplier and completion bonus
    const profile = await db.playerProfile.get('profile');
    const streakMult = Math.min(1.0 + (profile?.currentStreak || 0) * 0.1, 2.0);
    const finalXP = Math.round((totalXP + 50) * streakMult);

    // Save all sets to DB
    for (const [exIdStr, exSets] of Object.entries(sets)) {
      const exId = parseInt(exIdStr);
      for (let i = 0; i < exSets.length; i++) {
        const s = exSets[i];
        if (s.completed || (s.weight > 0 && s.reps > 0)) {
          await db.sets.add({ sessionId, exerciseId: exId, setNumber: i + 1, weight: s.weight, reps: s.reps, completed: s.completed ? 1 : 0 });
        }
      }
    }

    // Update session end time
    await db.sessions.update(sessionId, { endTime: Date.now() });

    // Update player profile
    const totalVol = Object.values(sets).flat().filter(s => s.completed).reduce((acc, s) => acc + (s.weight * s.reps), 0);
    const today = new Date().toISOString().split('T')[0];
    const lastDate = profile?.lastSessionDate;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastDate === yesterday ? (profile.currentStreak || 0) + 1 : lastDate === today ? (profile.currentStreak || 0) : 1;
    const newTotalXP = (profile?.totalXP || 0) + finalXP;

    await db.playerProfile.update('profile', {
      totalXP: newTotalXP,
      totalSessions: (profile?.totalSessions || 0) + 1,
      totalVolume: (profile?.totalVolume || 0) + totalVol,
      currentStreak: newStreak,
      longestStreak: Math.max(profile?.longestStreak || 0, newStreak),
      lastSessionDate: today,
    });

    // Navigate to mission complete
    navigate('/mission-complete', { state: { sessionId, finalXP, totalVol, duration: Date.now() - startTime, prevXP: profile?.totalXP || 0 } });
  }

  async function handleDiscard() {
    if (!window.confirm('Discard this workout? All progress will be lost.')) return;
    if (sessionId) {
      await db.sets.where('sessionId').equals(sessionId).delete();
      await db.sessions.delete(sessionId);
    }
    navigate('/');
  }

  const completedSetCount = Object.values(sets).flat().filter(s => s.completed).length;

  // ── Render ───
  if (phase === 'setup') {
    return <LogSetupScreen onStart={handleStart} />;
  }

  const maxSets = currentBlock.length > 0 ? Math.max(...currentBlock.map(ex => getExSets(ex.id).length)) : 0;
  const isSuperset = currentBlock.length > 1;

  return (
    <div className="screen" id="active-workout-screen">
      {/* Top Bar */}
      <div className="workout-topbar">
        <div className="workout-topbar-left">
          <span className="mission-label section-label">MISSION IN PROGRESS</span>
          <h2 className="current-ex-name">
            {currentBlock.length > 0 
              ? isSuperset ? `SUPERSET (${currentBlock.length})` : currentBlock[0].name 
              : 'Quick Workout'}
          </h2>
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

        {/* Sets */}
        {currentBlock.length > 0 && (
          <div className="sets-section">
            <div className="sets-header">
              <span className="section-label">SETS</span>
              <button className="add-set-btn" onClick={addSetToBlock} id="add-set-btn">
                + ADD SET
              </button>
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
                          {isSuperset && <div className="ex-sub-label" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, marginTop: 8 }}>{ex.name}</div>}
                          <SetRow
                            set={s}
                            index={roundIdx}
                            isActive={!s.completed && exSets.slice(0, roundIdx).every(prev => prev.completed)}
                            onUpdate={changes => updateSet(ex.id, roundIdx, changes)}
                            onComplete={() => completeSet(ex.id, roundIdx)}
                            onPlateCalc={() => setPlateCalcWeight(s.weight)}
                          />
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ))}
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

        <div style={{ padding: '24px 16px 48px', display: 'flex', justifyContent: 'center', width: '100%' }}>
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
              setBlocks(prev => {
                if (asSuperset && prev.length > 0) {
                  const updated = [...prev];
                  updated[currentExIdx] = [...updated[currentExIdx], ex];
                  return updated;
                } else {
                  const updated = [...prev, [ex]];
                  setCurrentExIdx(updated.length - 1);
                  return updated;
                }
              });
              // Initialize sets for the new exercise to match the current block maxSets or 1
              const initialSetsCount = asSuperset ? (maxSets || 1) : 1;
              const newSets = Array.from({ length: initialSetsCount }, () => ({ weight: 0, reps: 0, type: 'normal', completed: false }));
              setSets(prev => ({ ...prev, [ex.id]: newSets }));
              setAddExSheet(false);
            }}
            onClose={() => setAddExSheet(false)}
          />
        )}
      </AnimatePresence>

      {/* Exercise Jump Sheet */}
      <AnimatePresence>
        {showJump && (
          <ExerciseJumpSheet blocks={blocks} currentIdx={currentExIdx} onSelect={setCurrentExIdx} onClose={() => setShowJump(false)} />
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
          <PlateCalculatorSheet weight={plateCalcWeight} onClose={() => setPlateCalcWeight(null)} />
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
    <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bottom-sheet" style={{ maxHeight: '85vh' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <p className="section-label" style={{ marginBottom: 12 }}>ADD EXERCISE</p>
        
        {hasCurrentBlock && (
          <div className="tab-pills" style={{ marginBottom: 16 }}>
            <button className={`tab-pill ${addMode === 'new' ? 'active' : ''}`} onClick={() => setAddMode('new')}>NEW EXERCISE</button>
            <button className={`tab-pill ${addMode === 'superset' ? 'active' : ''}`} onClick={() => setAddMode('superset')}>SUPERSET</button>
          </div>
        )}

        <input className="search-input" type="search" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
        <div style={{ overflowY: 'auto', maxHeight: '50vh' }}>
          {filtered.map(ex => (
            <button key={ex.id} className="jump-item" onClick={() => onAdd(ex, addMode === 'superset')} id={`add-ex-${ex.id}`}>
              <span className="jump-name">{ex.name}</span>
              <span className="chip chip-blue" style={{ fontSize: 10 }}>{ex.muscleGroup}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Exercise Jump Sheet ──────────────────────── */
function ExerciseJumpSheet({ blocks, currentIdx, onSelect, onClose }) {
  if (!blocks) return null;
  return (
    <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="bottom-sheet" style={{ maxHeight: '85vh' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <p className="section-label" style={{ marginBottom: 16 }}>JUMP TO BLOCK</p>
        <div className="jump-list">
          {blocks.map((block, i) => {
            const isSuperset = block.length > 1;
            const name = isSuperset ? `Superset (${block.length} exercises)` : (block[0]?.name || 'Unknown');
            return (
              <button key={i} className={`jump-item ${i === currentIdx ? 'current' : ''}`} onClick={() => { onSelect(i); onClose(); }} id={`jump-to-${i}`}>
                <span className="jump-num">{i + 1}</span>
                <span className="jump-name">{name}</span>
                {i === currentIdx && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Plate Calculator Sheet ──────────────────────── */
function PlateCalculatorSheet({ weight, onClose }) {
  const barWeight = 20; // Assume 20kg bar
  const platesAvailable = [25, 20, 15, 10, 5, 2.5, 1.25];
  
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
    <motion.div className="bottom-sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ zIndex: 300 }}>
      <motion.div className="bottom-sheet" style={{ maxHeight: '85vh' }} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} onClick={e => e.stopPropagation()}>
        <div className="bottom-sheet-handle" />
        <p className="section-label" style={{ marginBottom: 16 }}>PLATE CALCULATOR</p>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 36, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>{weight} kg</div>
          <div className="section-label">TARGET WEIGHT</div>
        </div>

        {weight < barWeight ? (
          <div className="empty-state" style={{ padding: 20 }}>
            <span style={{ fontSize: 24 }}>⚠️</span>
            <p style={{ marginTop: 8 }}>Weight is less than the bar ({barWeight}kg)</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>Barbell</span>
              <span style={{ color: 'var(--text-muted)' }}>{barWeight} kg</span>
            </div>
            
            <p className="section-label" style={{ margin: '16px 0 8px' }}>LOAD ON EACH SIDE:</p>
            {platesToLoad.length === 0 ? (
              <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', textAlign: 'center' }}>
                Just the bar!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '40vh', overflowY: 'auto' }}>
                {platesToLoad.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                    </div>
                    <span style={{ fontWeight: 600 }}>{p} kg plate</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
