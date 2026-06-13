export interface WorkoutSet {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
  notes?: string;
}

export interface WorkoutLog {
  id: string;
  date: string;
  exercises: WorkoutSet[];
  duration: number;
  notes?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

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
  notes?: string;
}

export interface PlannedExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
}

export interface TrainingDay {
  dayOfWeek: number;
  exercises: PlannedExercise[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  days: TrainingDay[];
  createdAt: string;
}
