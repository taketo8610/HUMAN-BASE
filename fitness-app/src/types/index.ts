export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Motivation = 'attractive' | 'health' | 'strength' | 'lose_fat' | 'muscle' | 'custom';
export type TrainingEnvironment = 'gym' | 'bodyweight' | 'home_equipment';
export type Sex = 'male' | 'female';
export type Goal = 'bulk' | 'cut' | 'maintain';

// 活動量は「頻度」と「1回あたりの強度」に分離する。
// （週1-2回でもジムでハード、という人を表現できるようにするため）
export type TrainingFrequency = 'none' | 'w1_2' | 'w3_4' | 'w5_6' | 'daily';
export type TrainingIntensity = 'light' | 'moderate' | 'hard';

export interface ActivityInput {
  frequency: TrainingFrequency;
  intensity: TrainingIntensity;
}

// パーソナライズ目標。目的に応じて種類を出し分ける。
export type GoalKind = 'weight' | 'bodyfat' | 'lift' | 'habit';
export interface FitnessGoal {
  id: string;
  kind: GoalKind;
  exercise?: string; // lift（種目重量）の種目名
  target: number;
  unit: string; // 'kg' | '%' | '回/週'
  label: string; // 表示名（例: ベンチプレス）
}

export interface Macros {
  protein: number; // g
  fat: number; // g
  carbs: number; // g
}

export interface UserProfile {
  motivation: Motivation;
  motivationCustom?: string;
  sex: Sex;
  birthDate: string; // ISO 'yyyy-MM-dd'（年齢は都度計算する）
  height: number; // cm
  weight: number; // kg
  trainingFrequency: TrainingFrequency;
  trainingIntensity: TrainingIntensity;
  trainingEnvironments: TrainingEnvironment[]; // 複数選択可
  goalDirection: Goal; // カロリー計算用（増量/維持/減量）
  goals: FitnessGoal[]; // パーソナライズ目標（複数可）
  targetWeight: number; // kg
  targetBodyFat?: number; // %
  dailyCalorieTarget: number; // kcal
  macros: Macros;
  onboardingCompleted: boolean;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface WorkoutSet {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO date string
  exercises: WorkoutSet[];
  duration: number; // minutes
  notes: string;
}

export interface MealEntry {
  id: string;
  date: string;
  meal: MealType;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface BodyRecord {
  id: string;
  date: string;
  weight: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  notes: string;
}

export interface PlannedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface TrainingDay {
  dayOfWeek: DayOfWeek;
  exercises: PlannedExercise[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  days: TrainingDay[];
  createdAt: string;
}
