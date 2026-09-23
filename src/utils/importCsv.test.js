import { describe, it, expect } from 'vitest';
import { parseCsv, detectFormat, parseWorkoutCsv, normalizeExerciseName, matchExercises } from './importCsv';

const hevyCsv = `title,start_time,end_time,description,exercise_title,superset_id,exercise_notes,set_index,set_type,weight_kg,reps,distance_km,duration_seconds,rpe
"Push Day",2026-09-20T18:00:00,2026-09-20T19:10:00,,"Bench Press (Barbell)",,,0,warmup,40,10,,,
"Push Day",2026-09-20T18:00:00,2026-09-20T19:10:00,,"Bench Press (Barbell)",,,1,normal,80,5,,,8
"Push Day",2026-09-20T18:00:00,2026-09-20T19:10:00,,"Plank",,,0,normal,0,,,60,
"Leg Day",2026-09-22T17:00:00,2026-09-22T18:00:00,,"Squat (Barbell)",,,0,normal,100,5,,,9`;

const strongCsv = `Date;Workout Name;Duration;Exercise Name;Set Order;Weight;Weight Unit;Reps;RPE;Distance;Seconds;Notes
2026-09-20 18:00:00;Push Day;70m;Bench Press (Barbell);1;176.37;lbs;5;8;;;
2026-09-20 18:00:00;Push Day;70m;"Incline Bench Press, Dumbbell";2;60;lbs;10;;;;
2026-09-22 17:00:00;Leg Day;60m;Squat (Barbell);1;100;kg;5;;;;`;

describe('parseCsv', () => {
  it('handles quoted fields, embedded delimiters and CRLF', () => {
    const rows = parseCsv('a,b\r\n"x,1","y ""q"""\r\n');
    expect(rows).toEqual([['a', 'b'], ['x,1', 'y "q"']]);
  });

  it('detects a semicolon-delimited file', () => {
    expect(parseCsv('a;b\n1;2')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

describe('detectFormat', () => {
  it('recognises both exports and rejects anything else', () => {
    expect(detectFormat(parseCsv(hevyCsv)[0])).toBe('hevy');
    expect(detectFormat(parseCsv(strongCsv)[0])).toBe('strong');
    expect(detectFormat(['name', 'value'])).toBeNull();
  });
});

describe('parseWorkoutCsv', () => {
  it('groups Hevy rows into sessions with set details', () => {
    const { format, sessions } = parseWorkoutCsv(hevyCsv);
    expect(format).toBe('hevy');
    expect(sessions).toHaveLength(2);

    const [push, legs] = sessions;
    expect(push).toMatchObject({ name: 'Push Day' });
    expect(push.endTime - push.startTime).toBe(70 * 60000);
    expect(push.sets).toEqual([
      { exerciseName: 'Bench Press (Barbell)', weight: 40, reps: 10, rpe: null, type: 'warmup' },
      { exerciseName: 'Bench Press (Barbell)', weight: 80, reps: 5, rpe: 8, type: 'normal' },
      { exerciseName: 'Plank', weight: 0, reps: 0, rpe: null, type: 'normal', mode: 'time', duration: 60 },
    ]);
    expect(legs.sets[0]).toMatchObject({ exerciseName: 'Squat (Barbell)', weight: 100, rpe: 9 });
  });

  it('converts Strong pounds to kilograms', () => {
    const { format, sessions } = parseWorkoutCsv(strongCsv);
    expect(format).toBe('strong');
    expect(sessions[0].sets[0].weight).toBeCloseTo(80, 1); // 176.37 lbs
    expect(sessions[0].sets[1].exerciseName).toBe('Incline Bench Press, Dumbbell');
    expect(sessions[1].sets[0].weight).toBe(100); // already kg
  });

  it('skips rows with no exercise, date or work done', () => {
    const csv = hevyCsv + '\n"Push Day",2026-09-20T18:00:00,,,"",,,0,normal,0,,,,';
    expect(parseWorkoutCsv(csv).skipped).toBe(1);
  });

  it('explains what to do with an unknown file', () => {
    expect(() => parseWorkoutCsv('a,b\n1,2')).toThrow(/Hevy or Strong/);
    expect(() => parseWorkoutCsv('')).toThrow(/no rows/);
  });
});

describe('matchExercises', () => {
  const exercises = [
    { id: 25, name: 'barbell bench press' },
    { id: 43, name: 'barbell full squat' },
    { id: 314, name: 'dumbbell incline bench press' },
  ];

  it('normalises names, ignoring case, punctuation and bracketed qualifiers', () => {
    expect(normalizeExerciseName('Bench Press (Barbell)')).toBe('bench press');
    const { matched, unmatched } = matchExercises(['barbell bench press', 'Barbell Full Squat', 'Sled Push'], exercises);
    expect(matched.get('barbell bench press').id).toBe(25);
    expect(matched.get('Barbell Full Squat').id).toBe(43);
    expect(unmatched).toEqual(['Sled Push']);
  });

  it("matches Hevy's naming, where the equipment trails in brackets", () => {
    const { matched, unmatched } = matchExercises(['Bench Press (Barbell)', 'Incline Bench Press (Dumbbell)'], exercises);
    expect(matched.get('Bench Press (Barbell)').id).toBe(25);
    expect(matched.get('Incline Bench Press (Dumbbell)').id).toBe(314);
    expect(unmatched).toEqual([]);
  });

  it('knows common names from those apps that word things differently', () => {
    const { matched } = matchExercises(['Squat (Barbell)'], exercises);
    expect(matched.get('Squat (Barbell)').id).toBe(43); // "barbell full squat"
  });

  it('reports names it cannot place', () => {
    const { matched, unmatched } = matchExercises(['Prowler Sled Push'], exercises);
    expect(matched.size).toBe(0);
    expect(unmatched).toEqual(['Prowler Sled Push']);
  });
});
