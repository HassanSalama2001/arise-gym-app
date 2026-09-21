import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkout } from '../context/useWorkout';
import { useLiveQuery } from 'dexie-react-hooks';
import { AnimatePresence } from 'framer-motion';
import db from '../db/db';
import RestTimerOverlay from '../components/RestTimerOverlay';
import XPToast from '../components/XPToast';
import { playSetCompleteSound } from '../utils/audio';
import { hapticSetComplete } from '../utils/haptics';
import { checkAndUnlockAchievement } from '../utils/achievements';
import {
  setXP, PR_BONUS_XP, summarizeSets, applyQuestProgress,
} from '../utils/workoutRules';
import { recordSetIfPR, countPRsSince } from '../db/records';
import { startWorkoutSession, finishWorkout } from '../db/workoutSession';
import { useAlert } from '../context/useAlert';
import { getToday } from '../utils/date';
import ExerciseDetailsSheet from '../components/ExerciseDetailsSheet';
import ElapsedTimer from '../components/log/ElapsedTimer';
import SetRow from '../components/log/SetRow';
import LogSetupScreen from '../components/log/LogSetupScreen';
import AddExerciseSheet from '../components/log/AddExerciseSheet';
import ExerciseJumpSheet from '../components/log/ExerciseJumpSheet';
import PlateCalculatorSheet from '../components/log/PlateCalculatorSheet';
import RPESelectionSheet from '../components/log/RPESelectionSheet';
import './LogWorkoutScreen.css';

const BARBELL_EQUIPMENT = new Set(['barbell', 'ez barbell', 'olympic barbell', 'trap bar', 'smith machine']);

/* ── Active Workout Screen (main) ─────────────────── */
export default function LogWorkoutScreen() {
  const { showConfirm, showToast } = useAlert();
  const navigate = useNavigate();
  
  // Use global workout context for state persistence
  const { workoutState, startWorkout, updateSets, updateBlocks, setCurrentExIdx, endWorkout, updateTotalXP } = useWorkout();
  const { phase, sessionId, startTime, currentExIdx, sets, blocks, totalXP } = workoutState;

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
      const todayStr = getToday();
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
    const session = await startWorkoutSession(config);
    setInitialQuests(session.todayQuests); // for mid-workout quest toasts
    toastedQuests.current = new Set();
    startWorkout({
      planName: config.planName,
      sessionId: session.sessionId,
      startTime: session.startTime,
      blocks: session.blocks,
      sets: session.sets,
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
    const exercise = allExercises?.find(e => e.id === exId);
    const completedSet = { ...s, completed: true, ...(rpeValue !== undefined ? { rpe: rpeValue } : {}) };

    const isPR = await recordSetIfPR(exId, s);
    const earned = setXP(s, exercise) + (isPR ? PR_BONUS_XP : 0);
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

    // Toast any quest this set completes (progress is saved when the workout finishes)
    try {
      const updatedSets = { ...sets, [exId]: exSets.map((x, i) => (i === setIdx ? completedSet : x)) };
      const exercisesById = Object.fromEntries((allExercises || []).map(e => [e.id, e]));
      const stats = {
        ...summarizeSets(updatedSets, exercisesById),
        newPRs: await countPRsSince(Object.keys(updatedSets), startTime),
      };
      for (const quest of initialQuests) {
        if (quest.completed || toastedQuests.current.has(quest.id)) continue;
        if (applyQuestProgress(quest, stats).completed) {
          toastedQuests.current.add(quest.id);
          showToast(`🎯 QUEST COMPLETE: ${quest.description} (+${quest.xpReward} XP)`);
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
    const result = await finishWorkout({ sessionId, startTime, sets, sessionXP: totalXP });
    endWorkout();
    navigate('/mission-complete', { state: result });
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
  const isBarbellBlock = currentBlock.some(ex => BARBELL_EQUIPMENT.has(ex.equipment));
  // Plate calculator loads the next set to do, or the last weight entered.
  const plateWeight = (currentBlockSets.find(s => !s.completed && s.weight > 0)
    || [...currentBlockSets].reverse().find(s => s.weight > 0))?.weight || 0;
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
                            onDelete={() => deleteSet(ex.id, roundIdx)}
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
              {isBarbellBlock && (
                <button
                  className="add-set-btn"
                  onClick={() => setPlateCalcWeight(plateWeight)}
                  disabled={!plateWeight}
                  title={plateWeight ? `Plates for ${plateWeight}` : 'Enter a weight first'}
                  id="plate-calc-btn"
                  style={{ flex: 1, opacity: plateWeight ? 1 : 0.5 }}
                >
                  PLATES
                </button>
              )}
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
