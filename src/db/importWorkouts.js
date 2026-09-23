import db from './db';
import { parseWorkoutCsv, matchExercises } from '../utils/importCsv';
import { nextCustomExerciseId } from './remap';
import { setVolume } from '../utils/workoutRules';
import { kgToLbs } from '../utils/calorieEngine';
import { toLocalDateString } from '../utils/date';

/**
 * Reads a Hevy or Strong CSV and reports what importing it would do, without writing anything:
 * { format, sessions, sets, matched, unmatched, alreadyImported, skipped, parsed }.
 */
export async function previewWorkoutImport(text) {
  const parsed = parseWorkoutCsv(text);
  const names = [...new Set(parsed.sessions.flatMap(s => s.sets.map(set => set.exerciseName)))];
  const { matched, unmatched } = matchExercises(names, await db.exercises.toArray());

  const existing = new Set((await db.sessions.toArray()).map(s => s.startTime));
  const alreadyImported = parsed.sessions.filter(s => existing.has(s.startTime)).length;

  return {
    format: parsed.format,
    sessions: parsed.sessions.length,
    sets: parsed.sessions.reduce((acc, s) => acc + s.sets.length, 0),
    matched: matched.size,
    unmatched,
    alreadyImported,
    skipped: parsed.skipped,
    parsed,
  };
}

/**
 * Writes a parsed import into the database. Sessions whose start time already exists are skipped,
 * so importing the same file twice is safe. Exercises with no match are created as custom exercises.
 * Weights in the file are kilograms and are converted if the profile uses pounds.
 */
export async function importWorkouts(parsed) {
  const profile = await db.playerProfile.get('profile');
  const toDisplayWeight = profile?.unitPreference === 'lbs' ? kgToLbs : (kg => kg);

  const exercises = await db.exercises.toArray();
  const names = [...new Set(parsed.sessions.flatMap(s => s.sets.map(set => set.exerciseName)))];
  const { matched, unmatched } = matchExercises(names, exercises);

  // Keep unmatched exercises by name so imported history stays readable.
  let nextId = await nextCustomExerciseId(db.exercises);
  const created = unmatched.map(name => ({
    id: nextId++,
    name,
    muscleGroup: 'Other',
    isCustom: true,
    importedFrom: parsed.format,
    instructions: [],
  }));
  const exerciseIdFor = name => matched.get(name)?.id ?? created.find(c => c.name === name)?.id;

  const existing = new Set((await db.sessions.toArray()).map(s => s.startTime));
  let importedSessions = 0;
  let importedSets = 0;

  await db.transaction('rw', db.exercises, db.sessions, db.sets, async () => {
    if (created.length) await db.exercises.bulkPut(created);

    for (const session of parsed.sessions) {
      if (existing.has(session.startTime)) continue;

      const rows = session.sets.map((set, i) => ({
        exerciseId: exerciseIdFor(set.exerciseName),
        setNumber: i + 1,
        weight: Math.round(toDisplayWeight(set.weight) * 100) / 100,
        reps: set.reps,
        rpe: set.rpe,
        type: set.type,
        mode: set.mode || 'reps',
        ...(set.duration ? { duration: set.duration } : {}),
        completed: 1,
      }));

      const volume = rows.reduce((acc, row) => acc + setVolume({ ...row, completed: true }), 0);
      const sessionId = await db.sessions.add({
        planId: null,
        name: session.name,
        startTime: session.startTime,
        endTime: session.endTime ?? session.startTime,
        date: toLocalDateString(session.startTime),
        volume: Math.round(volume),
        xpEarned: 0,
        importedFrom: parsed.format,
      });

      await db.sets.bulkAdd(rows.map(row => ({ ...row, sessionId })));
      importedSessions++;
      importedSets += rows.length;
    }
  });

  return { importedSessions, importedSets, createdExercises: created.length };
}
