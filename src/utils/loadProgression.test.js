import { describe, it, expect } from 'vitest';
import { topWorkingSet, suggestNextSet, DEFAULT_PROGRESSION } from './loadProgression';

const set = (weight, reps, extra = {}) => ({ weight, reps, completed: 1, type: 'normal', ...extra });
const linear = { ...DEFAULT_PROGRESSION, type: 'linear', targetReps: 5, increment: 2.5 };
const double = { ...DEFAULT_PROGRESSION, type: 'double', minReps: 8, maxReps: 12, increment: 2.5 };

describe('topWorkingSet', () => {
  it('takes the heaviest working weight and its worst set', () => {
    expect(topWorkingSet([set(60, 5), set(80, 5), set(80, 3), set(100, 5, { type: 'warmup' })]))
      .toEqual({ weight: 80, reps: 3, sets: 2 });
  });

  it('ignores warm-ups, bodyweight and unfinished sets', () => {
    expect(topWorkingSet([set(0, 20), set(60, 5, { completed: 0 }), set(50, 5, { type: 'warmup' })])).toBeNull();
    expect(topWorkingSet([])).toBeNull();
  });
});

describe('linear progression', () => {
  it('adds weight when the target reps were hit', () => {
    expect(suggestNextSet([[set(80, 5), set(80, 5)]], linear)).toMatchObject({ weight: 82.5, reps: 5 });
  });

  it('repeats the weight after a single miss', () => {
    const suggestion = suggestNextSet([[set(80, 4)], [set(77.5, 5)]], linear);
    expect(suggestion).toMatchObject({ weight: 80, reps: 5 });
    expect(suggestion.deload).toBeFalsy();
  });

  it('deloads about 10% after two misses in a row', () => {
    const suggestion = suggestNextSet([[set(80, 4)], [set(80, 3)], [set(77.5, 5)]], linear);
    expect(suggestion).toMatchObject({ weight: 72.5, reps: 5, deload: true });
    expect(suggestion.reason).toMatch(/deload/i);
  });

  it('counts misses only back to the last success', () => {
    const suggestion = suggestNextSet([[set(80, 4)], [set(80, 5)], [set(80, 2)]], linear);
    expect(suggestion).toMatchObject({ weight: 80 });
    expect(suggestion.deload).toBeFalsy();
  });
});

describe('double progression', () => {
  it('adds a rep inside the range', () => {
    expect(suggestNextSet([[set(30, 9)]], double)).toMatchObject({ weight: 30, reps: 10 });
  });

  it('adds weight and resets reps at the top of the range', () => {
    expect(suggestNextSet([[set(30, 12)]], double)).toMatchObject({ weight: 32.5, reps: 8 });
  });

  it('pulls a low rep count up to the bottom of the range', () => {
    expect(suggestNextSet([[set(30, 4)]], double)).toMatchObject({ weight: 30, reps: 8 });
  });
});

describe('no scheme', () => {
  it('repeats the last session', () => {
    expect(suggestNextSet([[set(60, 10)]])).toMatchObject({ weight: 60, reps: 10 });
  });

  it('has nothing to suggest without usable history', () => {
    expect(suggestNextSet([], linear)).toBeNull();
    expect(suggestNextSet([[set(0, 10)]], linear)).toBeNull();
  });
});
