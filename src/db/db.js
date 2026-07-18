import Dexie from 'dexie';
import defaultExercises from '../data/exercises.js';

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

db.version(10).upgrade(async tx => {
  console.log("Running DB migration v10 for exercise visual URLs...");
  const allExercises = await tx.exercises.toArray();
  for (let dbEx of allExercises) {
    const match = defaultExercises.find(e => e.name === dbEx.name);
    if (match) {
      if (match.gifUrl !== undefined) dbEx.gifUrl = match.gifUrl;
      if (match.imageUrls !== undefined) dbEx.imageUrls = match.imageUrls;
      await tx.exercises.put(dbEx);
    }
  }
  console.log("Migration v10 complete!");
});

export default db;
