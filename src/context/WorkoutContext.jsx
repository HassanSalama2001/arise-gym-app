import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkoutContext = createContext(null);

export function WorkoutProvider({ children }) {
  const [workoutState, setWorkoutState] = useState(() => {
    const saved = localStorage.getItem('active_workout_state');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse active workout state from localStorage:', e);
      }
    }
    return {
      isActive: false,
      planName: '',
      sessionId: null,
      startTime: null,
      currentExIdx: 0,
      sets: {},
      blocks: [],
      totalXP: 0,
      phase: 'setup',
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (workoutState.isActive) {
      localStorage.setItem('active_workout_state', JSON.stringify(workoutState));
    } else {
      localStorage.removeItem('active_workout_state');
    }
  }, [workoutState]);

  const startWorkout = (config) => {
    setWorkoutState({
      isActive: true,
      planName: config.planName,
      sessionId: config.sessionId,
      startTime: config.startTime,
      currentExIdx: 0,
      sets: config.sets || {},
      blocks: config.blocks || [],
      totalXP: 0,
      phase: 'active',
    });
  };

  const updateSets = (newSets) => {
    setWorkoutState((prev) => ({
      ...prev,
      sets: typeof newSets === 'function' ? newSets(prev.sets) : newSets,
    }));
  };

  const updateBlocks = (newBlocks) => {
    setWorkoutState((prev) => ({
      ...prev,
      blocks: typeof newBlocks === 'function' ? newBlocks(prev.blocks) : newBlocks,
    }));
  };

  const setCurrentExIdx = (idx) => {
    setWorkoutState((prev) => ({
      ...prev,
      currentExIdx: typeof idx === 'function' ? idx(prev.currentExIdx) : idx,
    }));
  };

  const updateTotalXP = (xp) => {
    setWorkoutState((prev) => ({
      ...prev,
      totalXP: typeof xp === 'function' ? xp(prev.totalXP) : xp,
    }));
  };

  const endWorkout = () => {
    setWorkoutState({
      isActive: false,
      planName: '',
      sessionId: null,
      startTime: null,
      currentExIdx: 0,
      sets: {},
      blocks: [],
      totalXP: 0,
      phase: 'setup',
    });
    localStorage.removeItem('active_workout_state');
  };

  return (
    <WorkoutContext.Provider
      value={{
        workoutState,
        startWorkout,
        updateSets,
        updateBlocks,
        setCurrentExIdx,
        updateTotalXP,
        endWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
