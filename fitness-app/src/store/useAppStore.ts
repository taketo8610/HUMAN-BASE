import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkoutLog, MealEntry, BodyRecord, TrainingPlan, UserProfile } from '@/types';

interface AppState {
  workoutLogs: WorkoutLog[];
  mealEntries: MealEntry[];
  bodyRecords: BodyRecord[];
  trainingPlans: TrainingPlan[];
  userProfile: UserProfile | null;

  addWorkoutLog: (log: WorkoutLog) => void;
  deleteWorkoutLog: (id: string) => void;

  addMealEntry: (entry: MealEntry) => void;
  deleteMealEntry: (id: string) => void;

  addBodyRecord: (record: BodyRecord) => void;
  deleteBodyRecord: (id: string) => void;

  addTrainingPlan: (plan: TrainingPlan) => void;
  deleteTrainingPlan: (id: string) => void;

  setUserProfile: (profile: UserProfile) => void;
  skipOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workoutLogs: [],
      mealEntries: [],
      bodyRecords: [],
      trainingPlans: [],
      userProfile: null,

      addWorkoutLog: (log) => set((s) => ({ workoutLogs: [log, ...s.workoutLogs] })),
      deleteWorkoutLog: (id) => set((s) => ({ workoutLogs: s.workoutLogs.filter((l) => l.id !== id) })),

      addMealEntry: (entry) => set((s) => ({ mealEntries: [entry, ...s.mealEntries] })),
      deleteMealEntry: (id) => set((s) => ({ mealEntries: s.mealEntries.filter((e) => e.id !== id) })),

      addBodyRecord: (record) => set((s) => ({ bodyRecords: [record, ...s.bodyRecords] })),
      deleteBodyRecord: (id) => set((s) => ({ bodyRecords: s.bodyRecords.filter((r) => r.id !== id) })),

      addTrainingPlan: (plan) => set((s) => ({ trainingPlans: [plan, ...s.trainingPlans] })),
      deleteTrainingPlan: (id) => set((s) => ({ trainingPlans: s.trainingPlans.filter((p) => p.id !== id) })),

      setUserProfile: (profile) => set({ userProfile: profile }),
      skipOnboarding: () =>
        set({
          userProfile: {
            motivation: 'health',
            sex: 'male',
            age: 30,
            height: 170,
            weight: 70,
            activityLevel: 'moderate',
            trainingEnvironment: 'gym',
            targetWeight: 70,
            dailyCalorieTarget: 2000,
            goal: 'maintain',
            onboardingCompleted: true,
          },
        }),
    }),
    { name: 'fitness-app-storage' }
  )
);
