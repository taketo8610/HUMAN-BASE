import {
  calculateBMR,
  calculateTDEE,
  recommendGoal,
  calculateTargetWeight,
  calculateMacros,
  directionFromWeights,
  planCalories,
  calcAge,
  etaToTargetWeight,
} from './fitness';

describe('calculateBMR', () => {
  it('男性 (Mifflin-St Jeor)', () => {
    expect(calculateBMR('male', 70, 170, 30)).toBe(10 * 70 + 6.25 * 170 - 5 * 30 + 5);
  });
  it('女性', () => {
    expect(calculateBMR('female', 60, 160, 30)).toBe(10 * 60 + 6.25 * 160 - 5 * 30 - 161);
  });
});

describe('calculateTDEE', () => {
  it('頻度×強度の係数を反映', () => {
    expect(calculateTDEE(1600, { frequency: 'w3_4', intensity: 'moderate' })).toBe(
      Math.round(1600 * 1.55)
    );
  });
});

describe('recommendGoal', () => {
  it('低BMIはbulk', () => expect(recommendGoal(45, 170)).toBe('bulk'));
  it('高BMIはcut', () => expect(recommendGoal(90, 170)).toBe('cut'));
  it('標準はmaintain', () => expect(recommendGoal(64, 170)).toBe('maintain'));
});

describe('calculateTargetWeight', () => {
  it('維持は現体重を返す（バグ修正の回帰テスト）', () => {
    expect(calculateTargetWeight(64, 'male', 170, 'maintain')).toBe(64);
  });
  it('増量は現体重より重い', () => {
    expect(calculateTargetWeight(60, 'male', 170, 'bulk')).toBeGreaterThan(60);
  });
});

describe('directionFromWeights', () => {
  it('増量', () => expect(directionFromWeights(70, 75)).toBe('bulk'));
  it('減量', () => expect(directionFromWeights(70, 65)).toBe('cut'));
  it('誤差内は維持', () => expect(directionFromWeights(70, 70.5)).toBe('maintain'));
});

describe('calculateMacros', () => {
  it('PFC のカロリー合計が目標とほぼ一致', () => {
    const m = calculateMacros(2000, 70, 'maintain');
    const kcal = m.protein * 4 + m.carbs * 4 + m.fat * 9;
    expect(Math.abs(kcal - 2000)).toBeLessThan(50);
  });
});

describe('planCalories', () => {
  it('減量は目標カロリーが TDEE 未満', () => {
    const p = planCalories(2200, 70, 66, 8, 1500);
    expect(p.dailyCalorieTarget).toBeLessThan(2200);
    expect(p.pace).not.toBe('maintain');
  });
  it('体重差が小さいと維持', () => {
    const p = planCalories(2000, 70, 70, 8, 1500);
    expect(p.pace).toBe('maintain');
    expect(p.dailyCalorieTarget).toBe(2000);
  });
  it('下限カロリーを下回らない', () => {
    const p = planCalories(1800, 70, 55, 4, 1500);
    expect(p.dailyCalorieTarget).toBeGreaterThanOrEqual(1500);
    expect(p.pace).toBe('extreme');
  });
});

describe('calcAge', () => {
  it('生年月日から年齢を計算', () => {
    const y = new Date().getFullYear() - 25;
    expect(calcAge(`${y}-01-01`)).toBeGreaterThanOrEqual(24);
  });
});

describe('etaToTargetWeight', () => {
  it('計画ペースで残り週数を返す', () => {
    expect(etaToTargetWeight(70, 75, 65, 10)).toBeGreaterThan(0);
  });
  it('期間がなければ null', () => {
    expect(etaToTargetWeight(70, 75, 65, undefined)).toBeNull();
  });
});
