// Schema as it was before v11 (the unified-dataset migration).
export function declareV7(d) {
  d.version(1).stores({
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
    dailyQuests: '++id, date, type, target, current, completed, xpReward',
  });
  d.version(2).stores({ inbodyScans: '++id, date', measurements: '++id, date' });
  d.version(3).stores({
    videoNotes: null,
    sessions: '++id, planId, name, startTime, endTime, date',
    sets: '++id, sessionId, exerciseId, [sessionId+exerciseId], setNumber, weight, reps, completed',
  });
  d.version(4).stores({ userPosturalIssues: '++id, issueId, addedAt, status, targetSessions, completedSessions, position' });
  d.version(5).stores({ customPosturalIssues: 'id, name, category, icon, severity, timeline, targetSessionsDefault' });
  d.version(6).stores({ meals: '++id, date, type', hydration: '++id, date', mealSuggestions: '++id, mealType' });
  d.version(7).stores({ exerciseNotes: '++id, exerciseId, planId, createdAt', exerciseImageCache: 'exerciseId' });
}
