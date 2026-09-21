import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  lbsToKg, kgToLbs, calculateAge, calculateBMR, calculateTDEE, determineGoal,
  calculateCalorieTarget, calculateMacroTargets, calculateBMI, calculateInBodyScore,
} from './calorieEngine';

afterEach(() => vi.useRealTimers());

describe('unit conversion', () => {
  it('round-trips kg and lbs', () => {
    expect(lbsToKg(220.462)).toBeCloseTo(100, 2);
    expect(kgToLbs(lbsToKg(185))).toBeCloseTo(185, 10);
  });
});

describe('calculateAge', () => {
  it('counts birthdays that have not happened yet this year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 22));
    expect(calculateAge('2001-09-22')).toBe(25);
    expect(calculateAge('2001-09-23')).toBe(24);
  });

  it('defaults to 30 without a date of birth', () => {
    expect(calculateAge(null)).toBe(30);
  });
});

describe('BMR / TDEE (Mifflin-St Jeor)', () => {
  it('matches the published formula', () => {
    expect(calculateBMR(80, 180, 25, 'male')).toBe(10 * 80 + 6.25 * 180 - 5 * 25 + 5);
    expect(calculateBMR(60, 165, 30, 'Female')).toBe(10 * 60 + 6.25 * 165 - 5 * 30 - 161);
  });

  it('returns 0 when inputs are missing', () => {
    expect(calculateBMR(80, null, 25, 'male')).toBe(0);
  });

  it('applies activity multipliers, defaulting to moderate', () => {
    expect(calculateTDEE(1800, 'sedentary')).toBeCloseTo(2160);
    expect(calculateTDEE(1800, 'ACTIVE')).toBeCloseTo(3105);
    expect(calculateTDEE(1800, undefined)).toBeCloseTo(2790);
  });
});

describe('goals and targets', () => {
  it('picks a goal from body fat by sex', () => {
    expect(determineGoal(26, 'male')).toBe('cut');
    expect(determineGoal(9, 'male')).toBe('bulk');
    expect(determineGoal(20, 'male')).toBe('maintain');
    expect(determineGoal(33, 'female')).toBe('cut');
    expect(determineGoal(17, 'female')).toBe('bulk');
    expect(determineGoal(null, 'male')).toBe('maintain');
  });

  it('adjusts calories for the goal and never goes below 1200', () => {
    expect(calculateCalorieTarget(2500, 'cut')).toBe(2000);
    expect(calculateCalorieTarget(2500, 'bulk')).toBe(2850);
    expect(calculateCalorieTarget(2500, 'maintain')).toBe(2500);
    expect(calculateCalorieTarget(1500, 'cut')).toBe(1200);
  });

  it('splits macros so they add back up to the calorie target', () => {
    const { protein, carbs, fat } = calculateMacroTargets(2500, 80, 'cut');
    expect(protein).toBe(160); // 2.0 g/kg when cutting
    expect(fat).toBe(Math.round((2500 * 0.25) / 9));
    expect(protein * 4 + carbs * 4 + fat * 9).toBeCloseTo(2500, -1);
  });

  it('uses 1.6 g/kg protein at maintenance', () => {
    expect(calculateMacroTargets(2500, 80, 'maintain').protein).toBe(128);
  });
});

describe('body composition', () => {
  it('computes BMI to one decimal', () => {
    expect(calculateBMI(80, 180)).toBe(24.7);
  });

  it('scores an average build around 80', () => {
    // 1.8 m male: standard weight 71.3 kg, SMM ~32 kg, fat ~10.7 kg
    expect(calculateInBodyScore(71.3, 32.1, 15, 180, 'male')).toBeGreaterThanOrEqual(78);
    expect(calculateInBodyScore(71.3, 32.1, 15, 180, 'male')).toBeLessThanOrEqual(82);
  });

  it('stays within the 20–100 InBody scale', () => {
    expect(calculateInBodyScore(110, 55, 6, 180, 'male')).toBe(100);
    expect(calculateInBodyScore(180, 25, 50, 160, 'male')).toBe(20);
  });
});
