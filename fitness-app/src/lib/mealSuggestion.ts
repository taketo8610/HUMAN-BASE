import { Goal } from '@/types';

export interface MealSuggestion {
  emoji: string;
  meal: string;
  items: string;
  kcal: number;
}

type MealItem = { emoji: string; meal: string; items: string };

// 目的（増量/維持/減量）ごとに複数パターンの献立を用意し、日替わりや「別の例」で切り替える。
const menusByGoal: Record<Goal, MealItem[][]> = {
  cut: [
    [
      { emoji: '🌅', meal: '朝食', items: 'オートミール・プロテイン・卵白' },
      { emoji: '☀️', meal: '昼食', items: '鶏むね肉・玄米少なめ・野菜サラダ' },
      { emoji: '🌙', meal: '夕食', items: '白身魚・ブロッコリー・豆腐' },
      { emoji: '🍎', meal: '間食', items: 'プロテイン・素焼きナッツ' },
    ],
    [
      { emoji: '🌅', meal: '朝食', items: 'ギリシャヨーグルト・ベリー・ゆで卵' },
      { emoji: '☀️', meal: '昼食', items: 'サバ缶・もち麦・サラダ' },
      { emoji: '🌙', meal: '夕食', items: 'ささみ・温野菜・味噌汁' },
      { emoji: '🥜', meal: '間食', items: 'プロテイン・アーモンド' },
    ],
    [
      { emoji: '🌅', meal: '朝食', items: '卵白オムレツ・全粒粉トースト' },
      { emoji: '☀️', meal: '昼食', items: '鶏むねうどん・おひたし' },
      { emoji: '🌙', meal: '夕食', items: '豆腐ステーキ・きのこ・野菜' },
      { emoji: '🍵', meal: '間食', items: 'プロテイン・するめ' },
    ],
  ],
  maintain: [
    [
      { emoji: '🌅', meal: '朝食', items: '卵かけご飯・納豆・味噌汁' },
      { emoji: '☀️', meal: '昼食', items: '鶏むね肉定食・野菜サラダ' },
      { emoji: '🌙', meal: '夕食', items: '焼き魚・ブロッコリー・玄米' },
      { emoji: '🍌', meal: '間食', items: 'バナナ・プロテイン' },
    ],
    [
      { emoji: '🌅', meal: '朝食', items: 'トースト・スクランブルエッグ・サラダ' },
      { emoji: '☀️', meal: '昼食', items: '牛赤身丼・味噌汁' },
      { emoji: '🌙', meal: '夕食', items: '鮭の塩焼き・小鉢・ご飯' },
      { emoji: '🥛', meal: '間食', items: 'ヨーグルト・ナッツ' },
    ],
    [
      { emoji: '🌅', meal: '朝食', items: 'おにぎり・ゆで卵・味噌汁' },
      { emoji: '☀️', meal: '昼食', items: '冷製パスタ・チキンサラダ' },
      { emoji: '🌙', meal: '夕食', items: '豚しゃぶ・温野菜・ご飯' },
      { emoji: '🍫', meal: '間食', items: 'プロテイン・高カカオチョコ' },
    ],
  ],
  bulk: [
    [
      { emoji: '🌅', meal: '朝食', items: '卵かけご飯大盛り・納豆・味噌汁' },
      { emoji: '☀️', meal: '昼食', items: '牛丼・サラダ・味噌汁' },
      { emoji: '🌙', meal: '夕食', items: '鶏もも・白米大盛り・ゆで卵' },
      { emoji: '🍙', meal: '間食', items: 'おにぎり・バナナ・プロテイン' },
    ],
    [
      { emoji: '🌅', meal: '朝食', items: 'パンケーキ・卵・牛乳' },
      { emoji: '☀️', meal: '昼食', items: 'カツ丼・豚汁' },
      { emoji: '🌙', meal: '夕食', items: 'ステーキ・白米大盛り・野菜' },
      { emoji: '🥜', meal: '間食', items: 'プロテイン・ナッツ・餅' },
    ],
    [
      { emoji: '🌅', meal: '朝食', items: 'オートミール・卵・バナナ・牛乳' },
      { emoji: '☀️', meal: '昼食', items: '唐揚げ定食・大盛りご飯' },
      { emoji: '🌙', meal: '夕食', items: '牛肉炒め・白米大盛り・味噌汁' },
      { emoji: '🍞', meal: '間食', items: 'プロテイン・おにぎり2個' },
    ],
  ],
};

const ratio = [0.25, 0.35, 0.3, 0.1]; // 朝・昼・夕・間食

export function mealVariantCount(goal: Goal): number {
  return menusByGoal[goal].length;
}

// 目標カロリーと方向、バリエーション番号から各食事のカロリー目標とメニュー例を生成する。
export function suggestMeals(calories: number, goal: Goal, variant = 0): MealSuggestion[] {
  const patterns = menusByGoal[goal];
  const set = patterns[((variant % patterns.length) + patterns.length) % patterns.length];
  return set.map((m, i) => ({ ...m, kcal: Math.round(calories * ratio[i]) }));
}
