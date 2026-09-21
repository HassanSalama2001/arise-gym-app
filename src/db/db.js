import Dexie from 'dexie';
import { migrateLegacyExercises } from './remap';

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

db.version(3).stores({
  videoNotes: null, // delete dead table
  sessions: '++id, planId, name, startTime, endTime, date', // added date index
  sets: '++id, sessionId, exerciseId, [sessionId+exerciseId], setNumber, weight, reps, completed' // added compound index
});

db.version(4).stores({
  userPosturalIssues: '++id, issueId, addedAt, status, targetSessions, completedSessions, position'
});

db.version(5).stores({
  customPosturalIssues: 'id, name, category, icon, severity, timeline, targetSessionsDefault'
});

db.version(6).stores({
  meals: '++id, date, type',
  hydration: '++id, date',
  mealSuggestions: '++id, mealType'
});

db.version(7).stores({
  exerciseNotes: '++id, exerciseId, planId, createdAt',
  exerciseImageCache: 'exerciseId'
});

// v10 refreshed visuals on the old exercise list; v11 replaces that list entirely, so v10 is gone.
// v11 moves pre-2026-07 databases onto the unified dataset's IDs. It originally deleted all workout
// history; it now remaps instead (see docs/MIGRATIONS.md). Only databases below v11 run it.
db.version(11).upgrade(migrateLegacyExercises);

export default db;
