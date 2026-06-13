'use client';

import { useState } from 'react';
import { UserProfile, Motivation, Sex, ActivityLevel, TrainingEnvironment, Goal } from '@/types';
import {
  calculateBMR,
  calculateTDEE,
  recommendGoal,
  calculateTargetWeight,
  calculateDailyCalories,
} from '@/lib/fitness';

interface Props {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

const TOTAL_STEPS = 6;

const motivationOptions: { value: Motivation; emoji: string; label: string }[] = [
  { value: 'attractive', emoji: '💪', label: 'モテたい' },
  { value: 'health', emoji: '🏥', label: '健康になりたい' },
  { value: 'strength', emoji: '🏋️', label: '筋力を上げたい' },
  { value: 'lose_fat', emoji: '🔥', label: '体を絞りたい' },
  { value: 'muscle', emoji: '💿', label: '筋肉をつけたい' },
  { value: 'custom', emoji: '✏️', label: 'その他' },
];

const activityOptions: { value: ActivityLevel; emoji: string; label: string; desc: string }[] = [
  { value: 'sedentary', emoji: '🛋️', label: 'ほぼ運動しない', desc: 'デスクワーク中心' },
  { value: 'light', emoji: '🚶', label: '週1〜2回', desc: '軽い運動・散歩' },
  { value: 'moderate', emoji: '🏃', label: '週3〜4回', desc: '定期的に運動' },
  { value: 'active', emoji: '⚡', label: 'ほぼ毎日', desc: 'ハードなトレーニング' },
  { value: 'very_active', emoji: '🔥', label: '毎日2回以上', desc: 'アスリートレベル' },
];

const envOptions: { value: TrainingEnvironment; emoji: string; label: string; desc: string }[] = [
  { value: 'gym', emoji: '🏋️', label: 'ジム', desc: 'マシン・フリーウェイト' },
  { value: 'bodyweight', emoji: '🤸', label: '自重のみ', desc: '器具なしでOK' },
  { value: 'home_equipment', emoji: '🏠', label: '自宅（器具あり）', desc: 'ダンベル・バーベル' },
];

const goalLabels: Record<Goal, string> = { bulk: '増量', cut: '減量', maintain: '維持' };
const goalDescriptions: Record<Goal, string> = {
  bulk: 'BMIが低めなので、筋肉をつけてボディメイクしましょう',
  cut: 'BMIがやや高めなので、体脂肪を減らすことをおすすめします',
  maintain: 'BMIが理想的な範囲です。体型を維持しましょう',
};

function getMealPlan(calories: number) {
  const breakfast = Math.round(calories * 0.25);
  const lunch = Math.round(calories * 0.35);
  const dinner = Math.round(calories * 0.30);
  const snack = Math.round(calories * 0.10);
  return { breakfast, lunch, dinner, snack };
}

export default function OnboardingFlow({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(1);
  const [motivation, setMotivation] = useState<Motivation>('health');
  const [motivationCustom, setMotivationCustom] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [trainingEnvironment, setTrainingEnvironment] = useState<TrainingEnvironment>('gym');

  const bmi = weight / Math.pow(height / 100, 2);
  const suggestedGoal = recommendGoal(weight, height);
  const [goal, setGoal] = useState<Goal>(suggestedGoal);
  const bmr = calculateBMR(sex, weight, height, age);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetWeight = calculateTargetWeight(sex, height, goal);
  const dailyCalorieTarget = calculateDailyCalories(tdee, goal);
  const targetBMI = targetWeight / Math.pow(height / 100, 2);
  const mealPlan = getMealPlan(dailyCalorieTarget);

  function handleComplete() {
    const profile: UserProfile = {
      motivation,
      motivationCustom: motivation === 'custom' ? motivationCustom : undefined,
      sex,
      age,
      height,
      weight,
      activityLevel,
      trainingEnvironment,
      targetWeight,
      dailyCalorieTarget,
      goal,
      onboardingCompleted: true,
    };
    onComplete(profile);
  }

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <span className="text-gray-400 text-sm">ステップ {step} / {TOTAL_STEPS}</span>
        <button
          onClick={onSkip}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          スキップ
        </button>
      </div>
      {/* Progress bar */}
      <div className="mx-6 h-1.5 bg-gray-700 rounded-full mb-8">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 max-w-2xl mx-auto w-full">
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">目標は何ですか？</h2>
            <p className="text-gray-400 mb-6">あなたのモチベーションを教えてください</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {motivationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMotivation(opt.value)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    motivation === opt.value
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{opt.emoji}</div>
                  <div className="font-medium text-sm">{opt.label}</div>
                </button>
              ))}
            </div>
            {motivation === 'custom' && (
              <input
                type="text"
                value={motivationCustom}
                onChange={(e) => setMotivationCustom(e.target.value)}
                placeholder="目標を入力してください"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">基本情報</h2>
            <p className="text-gray-400 mb-6">あなたの身体情報を入力してください</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">性別</label>
                <div className="flex gap-3">
                  {(['male', 'female'] as Sex[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSex(s)}
                      className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                        sex === s
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {s === 'male' ? '男性' : '女性'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">年齢</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  min={10}
                  max={100}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">身長 (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min={100}
                  max={250}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  min={30}
                  max={300}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">活動量</h2>
            <p className="text-gray-400 mb-6">普段の運動量を教えてください</p>
            <div className="space-y-3">
              {activityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActivityLevel(opt.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    activityLevel === opt.value
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">運動環境</h2>
            <p className="text-gray-400 mb-6">どこでトレーニングしますか？</p>
            <div className="space-y-3">
              {envOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTrainingEnvironment(opt.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    trainingEnvironment === opt.value
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <div>
                    <div className="font-medium">{opt.label}</div>
                    <div className="text-sm text-gray-400">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">あなたの目標プラン</h2>
            <p className="text-gray-400 mb-6">計算結果に基づいた推奨プランです</p>

            {/* Recommended goal */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-400 mb-1">推奨ゴール</div>
              <div className="text-2xl font-bold text-orange-400 mb-1">{goalLabels[suggestedGoal]}</div>
              <div className="text-sm text-gray-300">{goalDescriptions[suggestedGoal]}</div>
            </div>

            {/* Adjust goal */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-400 mb-2">ゴールを選択</div>
              <div className="flex gap-2">
                {(['bulk', 'maintain', 'cut'] as Goal[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                      goal === g
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {goalLabels[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* Current -> Target */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-400 mb-3">現在 → 目標</div>
              <div className="flex items-center justify-between text-center">
                <div>
                  <div className="text-2xl font-bold">{weight}<span className="text-sm text-gray-400 ml-1">kg</span></div>
                  <div className="text-xs text-gray-400">BMI {bmi.toFixed(1)}</div>
                </div>
                <div className="text-orange-500 text-2xl">→</div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">{targetWeight}<span className="text-sm text-gray-400 ml-1">kg</span></div>
                  <div className="text-xs text-gray-400">BMI {targetBMI.toFixed(1)}</div>
                </div>
              </div>
            </div>

            {/* Daily calorie */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4">
              <div className="text-sm text-gray-400 mb-1">1日の目標カロリー</div>
              <div className="text-3xl font-bold text-orange-400">{dailyCalorieTarget}<span className="text-lg text-gray-400 ml-1">kcal</span></div>
              <div className="text-xs text-gray-500 mt-1">TDEE: {tdee} kcal</div>
            </div>

            {/* Meal plan */}
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-sm text-gray-400 mb-3">サンプル食事プラン</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>🌅 朝食 — 卵かけご飯・納豆・味噌汁</span>
                  <span className="text-orange-400 font-medium">{mealPlan.breakfast} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>☀️ 昼食 — 鶏胸肉定食・野菜サラダ</span>
                  <span className="text-orange-400 font-medium">{mealPlan.lunch} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🌙 夕食 — 焼き魚・ブロッコリー・玄米</span>
                  <span className="text-orange-400 font-medium">{mealPlan.dinner} kcal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>🍌 間食 — バナナ・プロテイン</span>
                  <span className="text-orange-400 font-medium">{mealPlan.snack} kcal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">設定完了！</h2>
            <p className="text-gray-400 mb-8">あなたのプロフィールが完成しました</p>

            <div className="bg-gray-800 rounded-xl p-5 text-left space-y-3 mb-8">
              <div className="flex justify-between">
                <span className="text-gray-400">ゴール</span>
                <span className="font-medium text-orange-400">{goalLabels[goal]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">現在体重</span>
                <span className="font-medium">{weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">目標体重</span>
                <span className="font-medium">{targetWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">1日の目標カロリー</span>
                <span className="font-medium">{dailyCalorieTarget} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">運動環境</span>
                <span className="font-medium">{envOptions.find((e) => e.value === trainingEnvironment)?.label}</span>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
            >
              さっそく始める
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 6 && (
        <div className="flex gap-3 px-6 pb-8 max-w-2xl mx-auto w-full">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-3 rounded-xl border-2 border-gray-700 text-gray-300 font-medium hover:border-gray-500 transition-colors"
            >
              前へ
            </button>
          )}
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
