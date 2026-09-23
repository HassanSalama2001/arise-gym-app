// The exercise dataset has no difficulty rating, so derive one.
// Letters match the app's scale: E = Beginner, D = Intermediate, C = Advanced.

const ADVANCED_NAME = /snatch|\bclean\b(?!-grip)|jerk|muscle.?up|pistol|handstand|front lever|back lever|planche|dragon flag|human flag|one arm (push|chin|pull)-?up|archer/i;

const INTERMEDIATE_EQUIPMENT = new Set([
  'barbell', 'ez barbell', 'olympic barbell', 'trap bar', 'dumbbell', 'kettlebell', 'weighted', 'rope', 'tire', 'hammer',
]);

export function deriveDifficulty(exercise) {
  if (exercise.isCorrective) return 'E';
  if (ADVANCED_NAME.test(exercise.name || '')) return 'C';
  if (INTERMEDIATE_EQUIPMENT.has(exercise.equipment)) return 'D';
  return 'E';
}
