import { isThisWeek, parseISO } from 'date-fns';

import { FitnessGoal, WorkoutLog, BodyRecord } from '@/types';

// 種目名の表記揺れを吸収するための正規化（空白除去・小文字化・全角/半角統一）。
export function normalizeExercise(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase().normalize('NFKC');
}

// 2つの種目名が同一とみなせるか（完全一致 or 一方が他方を含む）。
export function isSameExercise(a: string, b: string): boolean {
  const na = normalizeExercise(a);
  const nb = normalizeExercise(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.length >= 2 && nb.length >= 2 && (na.includes(nb) || nb.includes(na));
}

// ワークアウト記録から、ある種目で挙げた最大重量を求める（表記揺れを吸収）。
export function maxWeightForExercise(logs: WorkoutLog[], exercise: string): number {
  let max = 0;
  for (const log of logs) {
    for (const ex of log.exercises) {
      if (isSameExercise(ex.exercise, exercise) && ex.weight > max) max = ex.weight;
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
