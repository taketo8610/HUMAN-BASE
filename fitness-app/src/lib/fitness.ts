import { Sex, ActivityLevel, Goal } from '@/types';

// BMR calculation (Mifflin-St Jeor)
export function calculateBMR(sex: Sex, weight: number, height: number, age: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// TDEE from BMR × activity multiplier
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

// Recommended goal based on BMI
export function recommendGoal(weight: number, height: number): Goal {
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) return 'bulk';
  if (bmi > 25) return 'cut';
  return 'maintain';
}

// Target weight based on goal and current stats
export function calculateTargetWeight(sex: Sex, height: number, goal: Goal): number {
  const heightM = height / 100;
  // Ideal BMI midpoints: 22 normal, 20 for cut target lean, 24 for bulk target
  const targetBMI = goal === 'bulk' ? 24 : goal === 'cut' ? 20 : 22;
  const base = Math.round(targetBMI * heightM * heightM);
  // slight sex adjustment
  return sex === 'female' ? Math.round(base * 0.9) : base;
}

// Daily calorie target (TDEE ± deficit/surplus)
export function calculateDailyCalories(tdee: number, goal: Goal): number {
  if (goal === 'cut') return tdee - 500;
  if (goal === 'bulk') return tdee + 300;
  return tdee;
}
