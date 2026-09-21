export function lbsToKg(lbs) {
  return lbs * 0.45359237;
}

export function kgToLbs(kg) {
  return kg / 0.45359237;
}

export function calculateAge(dobString) {
  if (!dobString) return 30; // default age if none provided
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function calculateBMR(weightKg, heightCm, age, gender) {
  if (!weightKg || !heightCm || !age || !gender) return 0;
  
  const isFemale = gender.toLowerCase() === 'female';
  if (isFemale) {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  }
}

export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  const multiplier = multipliers[activityLevel?.toLowerCase()] || 1.55; // moderate is default
  return bmr * multiplier;
}

export function determineGoal(bodyFatPercent, gender) {
  if (!bodyFatPercent || !gender) return 'maintain';
  
  const isFemale = gender.toLowerCase() === 'female';
  const bf = parseFloat(bodyFatPercent);
  
  if (isFemale) {
    if (bf > 32) return 'cut';
    if (bf < 18) return 'bulk';
    return 'maintain';
  } else {
    if (bf > 25) return 'cut';
    if (bf < 10) return 'bulk';
    return 'maintain';
  }
}

export function calculateCalorieTarget(tdee, goal) {
  if (!tdee) return 0;
  
  let target = tdee;
  if (goal === 'cut') {
    target = tdee - 500;
  } else if (goal === 'bulk') {
    target = tdee + 350;
  }
  
  return Math.max(1200, Math.round(target));
}

export function calculateMacroTargets(calorieTarget, weightKg, goal) {
  if (!calorieTarget) return { protein: 0, carbs: 0, fat: 0 };
  
  const kg = parseFloat(weightKg) || 70;
  
  // Protein: 2.0g/kg for cut/bulk, 1.6g/kg for maintain
  let proteinMultiplier = 1.6;
  if (goal === 'cut' || goal === 'bulk') {
    proteinMultiplier = 2.0;
  }
  
  const protein = Math.round(kg * proteinMultiplier);
  
  // Fat: 25% of calories divided by 9 kcal/g
  const fat = Math.round((calorieTarget * 0.25) / 9);
  
  // Carbs: remaining calories divided by 4 kcal/g
  const proteinCal = protein * 4;
  const fatCal = fat * 9;
  const remainingCal = Math.max(0, calorieTarget - proteinCal - fatCal);
  const carbs = Math.round(remainingCal / 4);
  
  return { protein, carbs, fat };
}

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function calculateInBodyScore(weightKg, smmKg, bf, heightCm, gender) {
  if (!weightKg || !smmKg || !bf || !heightCm || !gender) return 80;
  
  const heightM = heightCm / 100;
  const isFemale = gender.toLowerCase() === 'female';
  const bmiStd = isFemale ? 21.5 : 22;
  const wStd = bmiStd * heightM * heightM;
  
  // Standard Skeletal Muscle Mass target (45% of standard weight for males, 38% for females)
  const smmStd = wStd * (isFemale ? 0.38 : 0.45);
  // Standard Body Fat Mass target (15% of standard weight for males, 23% for females)
  const bfmStd = wStd * (isFemale ? 0.23 : 0.15);
  
  const actualBfm = weightKg * (bf / 100);
  
  const smmDev = smmKg - smmStd;
  const bfmDev = actualBfm - bfmStd;
  
  let score = 80;
  
  // Muscle deviation: ±1 point per kg
  score += smmDev * 1.0;
  
  // Fat deviation: -1 point per kg excess, +0.5 point per kg deficit
  if (bfmDev > 0) {
    score -= bfmDev * 1.0;
  } else {
    score += Math.abs(bfmDev) * 0.5;
  }
  
  // InBody scores run 20–100
  return Math.min(100, Math.max(20, Math.round(score)));
}
