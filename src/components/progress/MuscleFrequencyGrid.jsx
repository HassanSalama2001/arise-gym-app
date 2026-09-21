import { useLiveQuery } from 'dexie-react-hooks';
import db from '../../db/db';
import { TRAINED_MUSCLE_GROUPS } from '../../data/muscleGroups';
import { useNow } from '../../hooks/useNow';
import MuscleGrid from './MuscleGrid';

/* Muscle frequency with exercise DB lookup */
export default function MuscleFrequencyGrid({ sessions, sets }) {
  const exercises = useLiveQuery(() => db.exercises.toArray());
  const now = useNow();
  const weekAgo = now - 7 * 86400000;
  const weekSessions = (sessions || []).filter(s => s.startTime > weekAgo);
  const weekSessionIds = new Set(weekSessions.map(s => s.id));
  const weekSets = (sets || []).filter(s => weekSessionIds.has(s.sessionId) && s.completed);
  const muscles = TRAINED_MUSCLE_GROUPS;
  const data = {};
  muscles.forEach(m => { data[m] = 0; });
  weekSets.forEach(s => {
    const ex = (exercises || []).find(e => e.id === s.exerciseId);
    if (ex && data[ex.muscleGroup] !== undefined) data[ex.muscleGroup]++;
  });
  return <MuscleGrid data={data} />;
}
