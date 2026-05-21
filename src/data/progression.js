export const RANKS = [
  { rank: 'E', name: 'Awakened', xpRequired: 0, color: 'var(--rank-e)' },
  { rank: 'D', name: 'Iron Hunter', xpRequired: 1000, color: 'var(--rank-d)' },
  { rank: 'C', name: 'Bronze Slayer', xpRequired: 5000, color: 'var(--rank-c)' },
  { rank: 'B', name: 'Silver Raider', xpRequired: 15000, color: 'var(--rank-b)' },
  { rank: 'A', name: 'Gold Monarch', xpRequired: 40000, color: 'var(--rank-a)' },
  { rank: 'S', name: 'Shadow Elite', xpRequired: 100000, color: 'var(--rank-s)' },
  { rank: '★', name: 'National Level Hunter', xpRequired: 250000, color: 'var(--rank-national)' },
];

export function getRankInfo(totalXP) {
  let current = RANKS[0];
  let next = RANKS[1];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= RANKS[i].xpRequired) {
      current = RANKS[i];
      next = RANKS[i + 1] || null;
      break;
    }
  }
  const xpIntoRank = totalXP - current.xpRequired;
  const xpForNext = next ? next.xpRequired - current.xpRequired : 0;
  const progress = next ? Math.min(xpIntoRank / xpForNext, 1) : 1;
  return { current, next, xpIntoRank, xpForNext, progress };
}

export function getRankColor(rank) {
  const r = RANKS.find(r => r.rank === rank);
  return r ? r.color : 'var(--rank-e)';
}

export function calculateSetXP(weight, reps) {
  if (!weight || weight <= 0) {
    // Bodyweight exercises scale by reps
    return Math.max(Math.round(reps * 2), 5);
  }
  const base = Math.round((weight * reps) / 10);
  return Math.max(base, 5);
}

export const QUEST_TEMPLATES = [
  { type: 'chest_sets', description: 'Complete 3 sets of any chest exercise', target: 3, xpReward: 50 },
  { type: 'exercise_count', description: 'Log a workout with 5+ exercises', target: 5, xpReward: 75 },
  { type: 'new_pr', description: 'Hit a new personal record', target: 1, xpReward: 100 },
  { type: 'fast_workout', description: 'Complete a workout in under 45 minutes', target: 1, xpReward: 60 },
  { type: 'total_sets', description: 'Do 20 total sets in one session', target: 20, xpReward: 80 },
  { type: 'train_legs', description: 'Train legs today', target: 1, xpReward: 70 },
  { type: 'back_sets', description: 'Complete 4 sets of any back exercise', target: 4, xpReward: 55 },
  { type: 'shoulder_sets', description: 'Complete 3 sets of any shoulder exercise', target: 3, xpReward: 50 },
  { type: 'arm_sets', description: 'Complete 5 sets of arm exercises', target: 5, xpReward: 45 },
  { type: 'core_work', description: 'Do 3 sets of core exercises', target: 3, xpReward: 50 },
];

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export function generateDailyQuests(date) {
  let seedStr = date;
  if (typeof date === 'string') {
    seedStr = date.split('-').join('');
  }
  let seed = parseInt(seedStr, 10);
  if (isNaN(seed)) seed = Date.now();
  
  const random = mulberry32(seed);
  const shuffled = [...QUEST_TEMPLATES];
  
  // Deterministic Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 3).map(q => ({
    date,
    type: q.type,
    description: q.description,
    target: q.target,
    current: 0,
    completed: false,
    xpReward: q.xpReward
  }));
}
