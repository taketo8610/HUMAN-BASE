export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
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
