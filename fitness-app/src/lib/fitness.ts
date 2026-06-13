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
