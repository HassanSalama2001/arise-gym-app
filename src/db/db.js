import Dexie from 'dexie';

const db = new Dexie('AriseDB');

db.version(1).stores({
  exercises: '++id, name, muscleGroup, difficulty',
  workoutPlans: '++id, name, createdAt',
  planExercises: '++id, planId, exerciseId, order',
  sessions: '++id, planId, name, startTime, endTime',
  sets: '++id, sessionId, exerciseId, setNumber, weight, reps, completed',
  bodyWeight: '++id, date, weight',
  personalRecords: '++id, exerciseId, weight, reps, date',
  settings: 'key',
  videoNotes: '++id, exerciseId, videoUri, uploadedAt',
  playerProfile: 'key',
  achievements: '++id, type, title, date, xpAwarded',
  dailyQuests: '++id, date, type, target, current, completed, xpReward'
});

db.version(2).stores({
  inbodyScans: '++id, date',
  measurements: '++id, date'
});

export default db;
