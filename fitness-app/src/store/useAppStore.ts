import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutLog, MealEntry, BodyRecord, TrainingPlan } from '@/types';

interface AppState {
  workoutLogs: WorkoutLog[];
  mealEntries: MealEntry[];
  bodyRecords: BodyRecord[];
  trainingPlans: TrainingPlan[];

  addWorkoutLog: (log: WorkoutLog) => void;
  updateWorkoutLog: (id: string, log: Partial<WorkoutLog>) => void;
  deleteWorkoutLog: (id: string) => void;

  addMealEntry: (entry: MealEntry) => void;
  updateMealEntry: (id: string, entry: Partial<MealEntry>) => void;
  deleteMealEntry: (id: string) => void;

  addBodyRecord: (record: BodyRecord) => void;
  updateBodyRecord: (id: string, record: Partial<BodyRecord>) => void;
  deleteBodyRecord: (id: string) => void;

  addTrainingPlan: (plan: TrainingPlan) => void;
  updateTrainingPlan: (id: string, plan: Partial<TrainingPlan>) => void;
  deleteTrainingPlan: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workoutLogs: [],
      mealEntries: [],
      bodyRecords: [],
      trainingPlans: [],

      addWorkoutLog: (log) => set((state) => ({ workoutLogs: [...state.workoutLogs, log] })),
      updateWorkoutLog: (id, log) =>
        set((state) => ({
          workoutLogs: state.workoutLogs.map((l) => (l.id === id ? { ...l, ...log } : l)),
        })),
      deleteWorkoutLog: (id) =>
        set((state) => ({ workoutLogs: state.workoutLogs.filter((l) => l.id !== id) })),

      addMealEntry: (entry) => set((state) => ({ mealEntries: [...state.mealEntries, entry] })),
      updateMealEntry: (id, entry) =>
        set((state) => ({
          mealEntries: state.mealEntries.map((e) => (e.id === id ? { ...e, ...entry } : e)),
        })),
      deleteMealEntry: (id) =>
        set((state) => ({ mealEntries: state.mealEntries.filter((e) => e.id !== id) })),

      addBodyRecord: (record) => set((state) => ({ bodyRecords: [...state.bodyRecords, record] })),
      updateBodyRecord: (id, record) =>
        set((state) => ({
          bodyRecords: state.bodyRecords.map((r) => (r.id === id ? { ...r, ...record } : r)),
        })),
      deleteBodyRecord: (id) =>
        set((state) => ({ bodyRecords: state.bodyRecords.filter((r) => r.id !== id) })),

      addTrainingPlan: (plan) => set((state) => ({ trainingPlans: [...state.trainingPlans, plan] })),
      updateTrainingPlan: (id, plan) =>
        set((state) => ({
          trainingPlans: state.trainingPlans.map((p) => (p.id === id ? { ...p, ...plan } : p)),
        })),
      deleteTrainingPlan: (id) =>
        set((state) => ({ trainingPlans: state.trainingPlans.filter((p) => p.id !== id) })),
    }),
    {
      name: 'fitness-app-storage',
    }
  )
);
