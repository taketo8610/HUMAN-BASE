import { Goal } from '@/types';

export interface MealSuggestion {
  emoji: string;
  meal: string;
  items: string;
  kcal: number;
}

// 目的（増量/維持/減量）でメニューの方向性を変える。
const menusByGoal: Record<Goal, { emoji: string; meal: string; items: string }[]> = {
  cut: [
    { emoji: '🌅', meal: '朝食', items: 'オートミール・プロテイン・卵白' },
    { emoji: '☀️', meal: '昼食', items: '鶏むね肉・玄米少なめ・野菜サラダ' },
    { emoji: '🌙', meal: '夕食', items: '白身魚・ブロッコリー・豆腐' },
    { emoji: '🍎', meal: '間食', items: 'プロテイン・素焼きナッツ' },
  ],
  maintain: [
    { emoji: '🌅', meal: '朝食', items: '卵かけご飯・納豆・味噌汁' },
    { emoji: '☀️', meal: '昼食', items: '鶏むね肉定食・野菜サラダ' },
    { emoji: '🌙', meal: '夕食', items: '焼き魚・ブロッコリー・玄米' },
    { emoji: '🍌', meal: '間食', items: 'バナナ・プロテイン' },
  ],
  bulk: [
    { emoji: '🌅', meal: '朝食', items: '卵かけご飯大盛り・納豆・味噌汁' },
    { emoji: '☀️', meal: '昼食', items: '牛丼・サラダ・味噌汁' },
    { emoji: '🌙', meal: '夕食', items: '鶏もも・白米大盛り・ゆで卵' },
    { emoji: '🍙', meal: '間食', items: 'おにぎり・バナナ・プロテイン' },
  ],
};

const ratio = [0.25, 0.35, 0.3, 0.1]; // 朝・昼・夕・間食

// 目標カロリーと方向から、各食事のカロリー目標とメニュー例を生成する。
export function suggestMeals(calories: number, goal: Goal): MealSuggestion[] {
  return menusByGoal[goal].map((m, i) => ({ ...m, kcal: Math.round(calories * ratio[i]) }));
}
