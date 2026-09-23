import { describe, it, expect } from 'vitest';
import { exercises } from './exercises';
import { correctiveExercises, CORRECTIVE_ID_START } from './correctiveExercises';
import templates from './templates.json';
import posturalIssues from './posturalIssues';
import { MUSCLE_GROUPS, normalizeMuscleGroup } from './muscleGroups';
import { NAME_ALIASES } from '../utils/importCsv';

const allExercises = [...exercises, ...correctiveExercises];
const byId = new Map(allExercises.map(ex => [ex.id, ex]));

describe('static exercise references', () => {
  it('has no duplicate exercise IDs', () => {
    expect(byId.size).toBe(allExercises.length);
  });

  it('keeps the dataset out of the reserved corrective ID range', () => {
    const clash = exercises.filter(ex => ex.id >= CORRECTIVE_ID_START);
    expect(clash).toEqual([]);
  });

  it('every template exercise exists', () => {
    const missing = templates.flatMap(tpl =>
      tpl.exercises
        .filter(e => !byId.has(e.exerciseId))
        .map(e => `${tpl.name}: ${e.name} (${e.exerciseId})`)
    );
    expect(missing).toEqual([]);
  });

  it('every template entry names the exercise it points at', () => {
    const mismatched = templates.flatMap(tpl =>
      tpl.exercises
        .filter(e => byId.get(e.exerciseId)?.name !== e.name)
        .map(e => `${tpl.name}: ${e.name} -> ${byId.get(e.exerciseId)?.name}`)
    );
    expect(mismatched).toEqual([]);
  });

  it('every corrective protocol exercise exists', () => {
    const missing = posturalIssues.flatMap(issue =>
      (issue.correctiveProtocol || [])
        .filter(p => !byId.has(p.exerciseId))
        .map(p => `${issue.name}: ${p.name} (${p.exerciseId})`)
    );
    expect(missing).toEqual([]);
  });
});

describe('import aliases', () => {
  it('every alias points at an exercise that exists', () => {
    const names = new Set(allExercises.map(ex => ex.name));
    const missing = Object.entries(NAME_ALIASES).filter(([, target]) => !names.has(target));
    expect(missing).toEqual([]);
  });
});

describe('muscle groups', () => {
  it('maps every dataset body part onto an app muscle group', () => {
    const unmapped = [...new Set(exercises.map(ex => ex.muscleGroup))]
      .filter(raw => normalizeMuscleGroup(raw) === 'Other' && raw !== 'neck');
    expect(unmapped).toEqual([]);
  });

  it('only produces known groups', () => {
    for (const ex of allExercises) {
      expect(MUSCLE_GROUPS).toContain(normalizeMuscleGroup(ex.muscleGroup));
    }
  });
});
