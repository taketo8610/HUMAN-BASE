import {
  Sex,
  ActivityInput,
  Goal,
  Motivation,
  TrainingFrequency,
  TrainingIntensity,
  Macros,
} from '@/types';

// 生年月日から現在の年齢を計算（誕生日が来れば自動で上がる）
export function calcAge(birthDate: string): number {
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return 0;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return Math.max(0, age);
}

// BMR calculation (Mifflin-St Jeor)
export function calculateBMR(sex: Sex, weight: number, height: number, age: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

// 頻度（週あたりのトレーニング回数）をベースに、1回あたりの強度で微調整する。
// 「頻度＝活動内容」ではない、というフィードバックを反映。
const frequencyBase: Record<TrainingFrequency, number> = {
  none: 1.2,
  w1_2: 1.375,
  w3_4: 1.55,
  w5_6: 1.725,
  daily: 1.9,
};
const intensityAdjust: Record<TrainingIntensity, number> = {
  light: -0.05,
  moderate: 0,
  hard: 0.05,
};

export function activityMultiplier(freq: TrainingFrequency, intensity: TrainingIntensity): number {
  return Math.max(1.2, frequencyBase[freq] + intensityAdjust[intensity]);
}

// TDEE from BMR × activity multiplier
export function calculateTDEE(bmr: number, { frequency, intensity }: ActivityInput): number {
  return Math.round(bmr * activityMultiplier(frequency, intensity));
}

// Recommended calorie-direction (bulk/cut/maintain) based on BMI
export function recommendGoal(weight: number, height: number): Goal {
  const bmi = weight / Math.pow(height / 100, 2);
  if (bmi < 18.5) return 'bulk';
  if (bmi > 25) return 'cut';
  return 'maintain';
}

// 目標体重。維持の場合は現在の体重をそのまま返す（以前は維持でもBMI22で再計算していたバグを修正）。
export function calculateTargetWeight(
  currentWeight: number,
  sex: Sex,
  height: number,
  goal: Goal
): number {
  if (goal === 'maintain') return Math.round(currentWeight);
  const heightM = height / 100;
  const targetBMI = goal === 'bulk' ? 24 : 20;
  const base = Math.round(targetBMI * heightM * heightM);
  return sex === 'female' ? Math.round(base * 0.9) : base;
}

// Daily calorie target (TDEE ± deficit/surplus)
export function calculateDailyCalories(tdee: number, goal: Goal): number {
  if (goal === 'cut') return tdee - 500;
  if (goal === 'bulk') return tdee + 300;
  return tdee;
}

// 目標カロリーと体重から PFC（マクロ）配分を算出
export function calculateMacros(calories: number, weight: number, goal: Goal): Macros {
  const proteinPerKg = goal === 'bulk' ? 2.2 : goal === 'cut' ? 2.4 : 2.0;
  const protein = Math.round(weight * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9); // 脂質は総カロリーの25%
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { protein, fat, carbs };
}

// 目的別の推奨体型ゾーン。
// 「モテたい体型」と「最も健康な体型」は一致しない、というフィードバックを反映し、
// motivation ごとに推奨する BMI / 体脂肪率レンジと説明を出し分ける。
export interface BodyTarget {
  label: string;
  description: string;
  bmiRange: [number, number];
  bodyFatRange: [number, number]; // %
}

const bodyTargets: Record<Motivation, Record<Sex, BodyTarget>> = {
  attractive: {
    male: {
      label: '引き締まった“モテ”体型',
      description: '適度な筋肉と低めの体脂肪。服を着ても脱いでも映えるシルエット。',
      bmiRange: [22, 24],
      bodyFatRange: [10, 15],
    },
    female: {
      label: 'メリハリのある体型',
      description: '過度に絞らず、女性らしいラインを保つバランス。',
      bmiRange: [19, 21],
      bodyFatRange: [20, 25],
    },
  },
  health: {
    male: {
      label: '健康リスクが最も低い体型',
      description: 'BMI・体脂肪ともに標準域。生活習慣病リスクが最小になる範囲。',
      bmiRange: [20, 24],
      bodyFatRange: [12, 20],
    },
    female: {
      label: '健康リスクが最も低い体型',
      description: 'BMI・体脂肪ともに標準域。ホルモンバランスにも無理のない範囲。',
      bmiRange: [19, 23],
      bodyFatRange: [21, 29],
    },
  },
  strength: {
    male: {
      label: 'パワー重視の体型',
      description: '筋量を増やすため BMI は高め。多少の体脂肪は許容して力を伸ばす。',
      bmiRange: [24, 27],
      bodyFatRange: [12, 18],
    },
    female: {
      label: 'パワー重視の体型',
      description: '筋量を増やすため BMI はやや高め。力を出しやすい体づくり。',
      bmiRange: [21, 24],
      bodyFatRange: [20, 26],
    },
  },
  lose_fat: {
    male: {
      label: '絞れた体型',
      description: '体脂肪をしっかり落として腹筋のカットが見える状態。',
      bmiRange: [20, 23],
      bodyFatRange: [8, 13],
    },
    female: {
      label: '絞れた体型',
      description: '健康を保ちつつ引き締まったライン。過度な減量は避ける。',
      bmiRange: [18.5, 21],
      bodyFatRange: [18, 23],
    },
  },
  muscle: {
    male: {
      label: '筋肉量の多い体型',
      description: '増量しながら筋肉をつける。体重・BMI は高めを目指す。',
      bmiRange: [25, 28],
      bodyFatRange: [12, 16],
    },
    female: {
      label: '筋肉量の多い体型',
      description: '増量しながら筋肉をつける。引き締まった厚みのある体。',
      bmiRange: [22, 25],
      bodyFatRange: [20, 25],
    },
  },
  custom: {
    male: {
      label: 'バランス型',
      description: '標準域を基準に、自分の目標に合わせて調整しましょう。',
      bmiRange: [20, 24],
      bodyFatRange: [12, 20],
    },
    female: {
      label: 'バランス型',
      description: '標準域を基準に、自分の目標に合わせて調整しましょう。',
      bmiRange: [19, 23],
      bodyFatRange: [21, 28],
    },
  },
};

export function recommendBodyComposition(motivation: Motivation, sex: Sex): BodyTarget {
  return bodyTargets[motivation][sex];
}

// BMI レンジの中心から目標体重を逆算（体型ゾーンに合わせた目標設定アシスト用）
export function targetWeightFromBMI(bmiRange: [number, number], height: number): number {
  const mid = (bmiRange[0] + bmiRange[1]) / 2;
  const heightM = height / 100;
  return Math.round(mid * heightM * heightM);
}

// 種目別の標準的な目標目安（中級者の体重比）。あくまで参考値で、ユーザーは自由に設定できる。
export function recommendLiftTargets(weight: number): {
  bench: number;
  squat: number;
  deadlift: number;
} {
  return {
    bench: Math.round(weight * 1.0),
    squat: Math.round(weight * 1.25),
    deadlift: Math.round(weight * 1.5),
  };
}

// 目標体重と現在体重の差から、カロリーの方向性（増量/維持/減量）を判定する。
export function directionFromWeights(currentWeight: number, targetWeight: number): Goal {
  const diff = targetWeight - currentWeight;
  if (diff > 1) return 'bulk';
  if (diff < -1) return 'cut';
  return 'maintain';
}

// 体重 1kg の増減に必要なおおよそのカロリー（脂肪・水分等の平均）。
const KCAL_PER_KG = 7200;

export type CaloriePace = 'maintain' | 'safe' | 'aggressive' | 'extreme';

export interface CaloriePlan {
  dailyCalorieTarget: number; // 1日の目標摂取カロリー
  dailyDelta: number; // TDEE からの増減（収支）
  weeklyWeightChange: number; // kg/週
  pace: CaloriePace;
  warning?: string;
}

// 「目標体重まで何週間で」から、必要なカロリー収支を逆算して目標カロリーを出す。
// あわせてペースが安全か（無理がないか）を判定する。
// floor は最低摂取カロリー（BMR や性別下限）で、これを下回らないようガードする。
export function planCalories(
  tdee: number,
  currentWeight: number,
  targetWeight: number,
  weeks: number,
  floor: number
): CaloriePlan {
  const totalChange = targetWeight - currentWeight;
  if (weeks <= 0 || Math.abs(totalChange) < 0.5) {
    return { dailyCalorieTarget: Math.round(tdee), dailyDelta: 0, weeklyWeightChange: 0, pace: 'maintain' };
  }

  const weeklyWeightChange = totalChange / weeks;
  let dailyDelta = (weeklyWeightChange * KCAL_PER_KG) / 7;
  let dailyCalorieTarget = tdee + dailyDelta;
  let pace: CaloriePace = 'safe';
  let warning: string | undefined;

  const weeklyPct = (Math.abs(weeklyWeightChange) / currentWeight) * 100;
  if (totalChange < 0) {
    if (weeklyPct > 1.5) {
      pace = 'extreme';
      warning = 'ペースが速すぎます。筋肉が落ちやすく不健康です。期間を延ばすことをおすすめします。';
    } else if (weeklyPct > 1.0) {
      pace = 'aggressive';
      warning = 'やや速めのペースです。無理のない範囲で進めましょう。';
    }
  } else if (weeklyWeightChange > 0.5) {
    pace = 'extreme';
    warning = '増量が速すぎます。脂肪が増えやすいので期間を延ばすのがおすすめです。';
  } else if (weeklyWeightChange > 0.25) {
    pace = 'aggressive';
    warning = 'やや速めの増量ペースです。';
  }

  if (dailyCalorieTarget < floor) {
    dailyCalorieTarget = floor;
    dailyDelta = dailyCalorieTarget - tdee;
    pace = 'extreme';
    warning = `この期間だと摂取カロリーが下限(${Math.round(floor)}kcal)を下回ります。期間を延ばすか目標を見直しましょう。`;
  }

  return {
    dailyCalorieTarget: Math.round(dailyCalorieTarget),
    dailyDelta: Math.round(dailyDelta),
    weeklyWeightChange,
    pace,
    warning,
  };
}

// 目標体重までの到達見込み週数（計画ペース基準）。
// 達成済み・方向不一致は 0、期間や差が無効なら null を返す。
export function etaToTargetWeight(
  currentWeight: number,
  startWeight: number,
  targetWeight: number,
  targetWeeks?: number
): number | null {
  if (!targetWeeks || targetWeeks <= 0) return null;
  const total = targetWeight - startWeight;
  if (Math.abs(total) < 0.5) return null;
  const weeklyPace = total / targetWeeks;
  const remaining = targetWeight - currentWeight;
  if (Math.abs(remaining) < 0.3) return 0;
  if (Math.sign(remaining) !== Math.sign(weeklyPace)) return 0;
  return Math.ceil(remaining / weeklyPace);
}
