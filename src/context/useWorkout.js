import { createContext, useContext } from 'react';

export const WorkoutContext = createContext(null);

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
