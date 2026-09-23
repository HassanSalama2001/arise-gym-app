// App-level muscle groups used for filters, stats, quests and achievements.
export const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Corrective', 'Other'];

// Primary groups shown in weekly muscle-frequency stats.
export const TRAINED_MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

// The exercise dataset uses body parts ("upper legs", "waist", ...); map them onto app groups.
const BODY_PART_TO_GROUP = {
  chest: 'Chest',
  back: 'Back',
  'upper legs': 'Legs',
  'lower legs': 'Legs',
  shoulders: 'Shoulders',
  'upper arms': 'Arms',
  'lower arms': 'Arms',
  waist: 'Core',
  cardio: 'Cardio',
  neck: 'Other',
};

export function normalizeMuscleGroup(raw) {
  if (!raw) return 'Other';
  if (MUSCLE_GROUPS.includes(raw)) return raw;
  return BODY_PART_TO_GROUP[String(raw).toLowerCase()] || 'Other';
}
