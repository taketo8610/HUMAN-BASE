import { isThisWeek, parseISO } from 'date-fns';

import { FitnessGoal, WorkoutLog, BodyRecord } from '@/types';

// ワークアウト記録から、ある種目で挙げた最大重量を求める（種目名は完全一致）。
export function maxWeightForExercise(logs: WorkoutLog[], exercise: string): number {
  let max = 0;
  for (const log of logs) {
    for (const ex of log.exercises) {
      if (ex.exercise === exercise && ex.weight > max) max = ex.weight;
    }
  }
  return max;
}

// 目標種別に応じた「現在値」を記録から算出する。
export function currentForGoal(
  goal: FitnessGoal,
  logs: WorkoutLog[],
  bodyRecords: BodyRecord[]
): number | null {
  switch (goal.kind) {
    case 'lift':
      return goal.exercise ? maxWeightForExercise(logs, goal.exercise) : null;
    case 'weight':
      return bodyRecords[0]?.weight ?? null;
    case 'bodyfat':
      return bodyRecords[0]?.bodyFatPercentage ?? null;
    case 'habit':
      // 今週（月曜始まり）のワークアウト回数
      return logs.filter((l) => isThisWeek(parseISO(l.date), { weekStartsOn: 1 })).length;
    default:
      return null;
  }
}

// lift / habit のように「増やして目標に近づく」種別だけ達成率(%)を返す。
export function progressPctForGoal(goal: FitnessGoal, current: number | null): number | null {
  if (current == null || goal.target <= 0) return null;
  if (goal.kind === 'lift' || goal.kind === 'habit') {
    return Math.min(100, Math.round((current / goal.target) * 100));
  }
  return null;
}
