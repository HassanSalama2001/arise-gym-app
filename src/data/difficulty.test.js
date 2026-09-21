import { describe, it, expect } from 'vitest';
import { deriveDifficulty } from './difficulty';
import { exercises } from './exercises';

describe('deriveDifficulty', () => {
  it('rates skills as advanced', () => {
    expect(deriveDifficulty({ name: 'front lever', equipment: 'body weight' })).toBe('C');
    expect(deriveDifficulty({ name: 'barbell power clean', equipment: 'barbell' })).toBe('C');
  });

  it('does not treat clean-grip as a clean', () => {
    expect(deriveDifficulty({ name: 'barbell clean-grip front squat', equipment: 'barbell' })).toBe('D');
  });

  it('rates free weights as intermediate and machines/bodyweight as beginner', () => {
    expect(deriveDifficulty({ name: 'barbell bench press', equipment: 'barbell' })).toBe('D');
    expect(deriveDifficulty({ name: 'lever leg extension', equipment: 'leverage machine' })).toBe('E');
    expect(deriveDifficulty({ name: 'push-up', equipment: 'body weight' })).toBe('E');
  });

  it('gives the dataset a spread of levels', () => {
    const levels = new Set(exercises.map(deriveDifficulty));
    expect([...levels].sort()).toEqual(['C', 'D', 'E']);
  });
});
