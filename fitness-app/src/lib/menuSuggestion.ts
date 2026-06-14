import {
  TrainingEnvironment,
  TrainingFrequency,
  Goal,
  TrainingPlan,
  TrainingDay,
  DayOfWeek,
} from '@/types';
import { genId } from '@/lib/id';

type Part = 'chest' | 'back' | 'legs' | 'shoulder' | 'arm' | 'core';

// 環境ごとの部位別種目。複数環境を選んでいる場合はマージする。
const exercisesByEnv: Record<TrainingEnvironment, Record<Part, string[]>> = {
  gym: {
    chest: ['ベンチプレス', 'インクラインダンベルプレス'],
    back: ['ラットプルダウン', 'シーテッドロウ'],
    legs: ['スクワット', 'レッグプレス'],
    shoulder: ['ショルダープレス', 'サイドレイズ'],
    arm: ['バーベルカール', 'トライセプスプレスダウン'],
    core: ['アブクランチ', 'ハンギングレッグレイズ'],
  },
  bodyweight: {
    chest: ['腕立て伏せ', 'ディップス'],
    back: ['懸垂', '逆手懸垂'],
    legs: ['スクワット', 'ブルガリアンスクワット'],
    shoulder: ['パイクプッシュアップ', '逆立ち腕立て'],
    arm: ['ナロープッシュアップ', 'チンアップ'],
    core: ['プランク', 'レッグレイズ'],
  },
  home_equipment: {
    chest: ['ダンベルプレス', 'ダンベルフライ'],
    back: ['ワンハンドロウ', 'ダンベルデッドリフト'],
    legs: ['ダンベルスクワット', 'ダンベルランジ'],
    shoulder: ['ダンベルショルダープレス', 'サイドレイズ'],
    arm: ['ダンベルカール', 'キックバック'],
    core: ['プランク', 'レッグレイズ'],
  },
};

// 頻度ごとの曜日割り当てと分割（どの曜日にどの部位をやるか）。
const splits: Record<TrainingFrequency, { day: DayOfWeek; parts: Part[] }[]> = {
  none: [{ day: 1, parts: ['chest', 'back', 'legs'] }],
  w1_2: [
    { day: 1, parts: ['chest', 'back', 'legs'] },
    { day: 4, parts: ['shoulder', 'legs', 'arm'] },
  ],
  w3_4: [
    { day: 1, parts: ['chest', 'shoulder', 'arm'] },
    { day: 3, parts: ['back', 'arm'] },
    { day: 5, parts: ['legs', 'core'] },
  ],
  w5_6: [
    { day: 1, parts: ['chest'] },
    { day: 2, parts: ['back'] },
    { day: 3, parts: ['legs'] },
    { day: 4, parts: ['shoulder'] },
    { day: 5, parts: ['arm', 'core'] },
  ],
  daily: [
    { day: 1, parts: ['chest'] },
    { day: 2, parts: ['back'] },
    { day: 3, parts: ['legs'] },
    { day: 4, parts: ['shoulder'] },
    { day: 5, parts: ['arm'] },
    { day: 6, parts: ['core'] },
  ],
};

const freqLabels: Record<TrainingFrequency, string> = {
  none: '週1',
  w1_2: '週2',
  w3_4: '週3',
  w5_6: '週5',
  daily: '毎日',
};
const envLabels: Record<TrainingEnvironment, string> = {
  gym: 'ジム',
  bodyweight: '自重',
  home_equipment: '自宅',
};
const goalLabels: Record<Goal, string> = { bulk: '増量', cut: '減量', maintain: '維持' };

const ALL_PARTS: Part[] = ['chest', 'back', 'legs', 'shoulder', 'arm', 'core'];

function mergePool(envs: TrainingEnvironment[]): Record<Part, string[]> {
  const sources = envs.length > 0 ? envs : (['gym'] as TrainingEnvironment[]);
  const pool = {} as Record<Part, string[]>;
  for (const p of ALL_PARTS) {
    const set = new Set<string>();
    for (const e of sources) exercisesByEnv[e][p].forEach((x) => set.add(x));
    pool[p] = Array.from(set);
  }
  return pool;
}

// 運動環境・頻度・目的から、曜日別のトレーニングプランを自動生成する。
export function suggestTrainingPlan(
  envs: TrainingEnvironment[],
  frequency: TrainingFrequency,
  goal: Goal
): TrainingPlan {
  const pool = mergePool(envs);
  const scheme =
    goal === 'bulk' ? { sets: 4, reps: 8 } : goal === 'cut' ? { sets: 3, reps: 12 } : { sets: 3, reps: 10 };

  const days: TrainingDay[] = splits[frequency].map((s) => ({
    dayOfWeek: s.day,
    exercises: s.parts.flatMap((p) =>
      pool[p].slice(0, 2).map((name) => ({ id: genId(), name, sets: scheme.sets, reps: scheme.reps }))
    ),
  }));

  const envLabel = (envs.length > 0 ? envs : (['gym'] as TrainingEnvironment[]))
    .map((e) => envLabels[e])
    .join('・');

  return {
    id: genId(),
    name: `おすすめメニュー（${freqLabels[frequency]}）`,
    description: `${envLabel}・${goalLabels[goal]}向け`,
    days,
    createdAt: new Date().toISOString(),
  };
}
