import Dexie from 'dexie';
import { migrateLegacyExercises, relocateCustomExercises, collapsePersonalRecords } from './remap';
import { syncStampMiddleware, stampExistingRows } from './syncStamp';

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

// v12: custom exercises used to take the next ID after the dataset, where a future dataset could
// overwrite them. Move them to the custom range (100000+).
db.version(12).upgrade(relocateCustomExercises);

// v13: PRs used to add a new row each time (and compare against the oldest one); keep one merged row
// per exercise holding the best estimated-1RM set plus the heaviest weight.
db.version(13).upgrade(collapsePersonalRecords);

// v14: per-record cloud sync. Every synced row gets a uid (stable across devices) and updatedAt;
// deletes leave a tombstone so they propagate instead of being resurrected by another device.
db.version(14).stores({
  exercises:'++id, name, muscleGroup, difficulty, uid, updatedAt',
  workoutPlans: '++id, name, createdAt, uid, updatedAt',
  planExercises: '++id, planId, exerciseId, order, uid, updatedAt',
  sessions: '++id, planId, name, startTime, endTime, date, uid, updatedAt',
  sets: '++id, sessionId, exerciseId, [sessionId+exerciseId], setNumber, weight, reps, completed, uid, updatedAt',
  personalRecords: '++id, exerciseId, weight, reps, date, uid, updatedAt',
  exerciseNotes: '++id, exerciseId, planId, createdAt, uid, updatedAt',
  achievements: '++id, type, title, date, xpAwarded, uid, updatedAt',
  dailyQuests: '++id, date, type, target, current, completed, xpReward, uid, updatedAt',
  bodyWeight: '++id, date, weight, uid, updatedAt',
  inbodyScans: '++id, date, uid, updatedAt',
  measurements: '++id, date, uid, updatedAt',
  userPosturalIssues: '++id, issueId, addedAt, status, targetSessions, completedSessions, position, uid, updatedAt',
  customPosturalIssues: 'id, name, category, icon, severity, timeline, targetSessionsDefault, uid, updatedAt',
  meals: '++id, date, type, uid, updatedAt',
  hydration: '++id, date, uid, updatedAt',
  playerProfile: 'key, uid, updatedAt',
  settings: 'key, uid, updatedAt',
}).upgrade(stampExistingRows);

db.use(syncStampMiddleware());

export default db;
