import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  UserProfile,
  Motivation,
  Sex,
  ActivityLevel,
  TrainingEnvironment,
  Goal,
} from '@/types';
import {
  calculateBMR,
  calculateTDEE,
  recommendGoal,
  calculateTargetWeight,
  calculateDailyCalories,
} from '@/lib/fitness';
import { placeholderColor } from '@/components/ui';

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
  return {
    breakfast: Math.round(calories * 0.25),
    lunch: Math.round(calories * 0.35),
    dinner: Math.round(calories * 0.3),
    snack: Math.round(calories * 0.1),
  };
}

export default function OnboardingFlow({ onComplete, onSkip }: Props) {
  const insets = useSafeAreaInsets();
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
    onComplete({
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
    });
  }

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const numField =
    'rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white';

  return (
    <View
      className="absolute inset-0 bg-gray-900"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="flex-row items-center justify-between px-6 pb-2 pt-4">
        <Text className="text-sm text-gray-400">
          ステップ {step} / {TOTAL_STEPS}
        </Text>
        <Pressable onPress={onSkip} hitSlop={8}>
          <Text className="text-sm text-gray-400">スキップ</Text>
        </Pressable>
      </View>

      <View className="mx-6 mb-6 h-1.5 rounded-full bg-gray-700">
        <View className="h-full rounded-full bg-orange-500" style={{ width: `${progressPct}%` }} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        {step === 1 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">目標は何ですか？</Text>
            <Text className="mb-6 text-gray-400">あなたのモチベーションを教えてください</Text>
            <View className="flex-row flex-wrap gap-3">
              {motivationOptions.map((opt) => {
                const active = motivation === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setMotivation(opt.value)}
                    className={`w-[47%] rounded-xl border-2 p-4 ${
                      active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'
                    }`}>
                    <Text className="mb-2 text-3xl">{opt.emoji}</Text>
                    <Text className="text-sm font-medium text-white">{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
            {motivation === 'custom' && (
              <TextInput
                value={motivationCustom}
                onChangeText={setMotivationCustom}
                placeholder="目標を入力してください"
                placeholderTextColor={placeholderColor}
                className={`mt-4 ${numField}`}
              />
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">基本情報</Text>
            <Text className="mb-6 text-gray-400">あなたの身体情報を入力してください</Text>
            <View className="gap-5">
              <View>
                <Text className="mb-2 text-sm text-gray-400">性別</Text>
                <View className="flex-row gap-3">
                  {(['male', 'female'] as Sex[]).map((s) => {
                    const active = sex === s;
                    return (
                      <Pressable
                        key={s}
                        onPress={() => setSex(s)}
                        className={`flex-1 rounded-lg border-2 py-3 ${
                          active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'
                        }`}>
                        <Text
                          className={`text-center font-medium ${active ? 'text-orange-400' : 'text-gray-300'}`}>
                          {s === 'male' ? '男性' : '女性'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              {(
                [
                  { label: '年齢', value: age, set: setAge },
                  { label: '身長 (cm)', value: height, set: setHeight },
                  { label: '体重 (kg)', value: weight, set: setWeight },
                ] as const
              ).map((f) => (
                <View key={f.label}>
                  <Text className="mb-2 text-sm text-gray-400">{f.label}</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={String(f.value)}
                    onChangeText={(t) => f.set(Number(t) || 0)}
                    className={numField}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">活動量</Text>
            <Text className="mb-6 text-gray-400">普段の運動量を教えてください</Text>
            <View className="gap-3">
              {activityOptions.map((opt) => {
                const active = activityLevel === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setActivityLevel(opt.value)}
                    className={`flex-row items-center gap-4 rounded-xl border-2 p-4 ${
                      active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'
                    }`}>
                    <Text className="text-2xl">{opt.emoji}</Text>
                    <View className="flex-1">
                      <Text className="font-medium text-white">{opt.label}</Text>
                      <Text className="text-sm text-gray-400">{opt.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">運動環境</Text>
            <Text className="mb-6 text-gray-400">どこでトレーニングしますか？</Text>
            <View className="gap-3">
              {envOptions.map((opt) => {
                const active = trainingEnvironment === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setTrainingEnvironment(opt.value)}
                    className={`flex-row items-center gap-4 rounded-xl border-2 p-4 ${
                      active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'
                    }`}>
                    <Text className="text-2xl">{opt.emoji}</Text>
                    <View className="flex-1">
                      <Text className="font-medium text-white">{opt.label}</Text>
                      <Text className="text-sm text-gray-400">{opt.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">あなたの目標プラン</Text>
            <Text className="mb-6 text-gray-400">計算結果に基づいた推奨プランです</Text>

            <View className="mb-4 rounded-xl bg-gray-800 p-4">
              <Text className="mb-1 text-sm text-gray-400">推奨ゴール</Text>
              <Text className="mb-1 text-2xl font-bold text-orange-400">
                {goalLabels[suggestedGoal]}
              </Text>
              <Text className="text-sm text-gray-300">{goalDescriptions[suggestedGoal]}</Text>
            </View>

            <View className="mb-4 rounded-xl bg-gray-800 p-4">
              <Text className="mb-2 text-sm text-gray-400">ゴールを選択</Text>
              <View className="flex-row gap-2">
                {(['bulk', 'maintain', 'cut'] as Goal[]).map((g) => {
                  const active = goal === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => setGoal(g)}
                      className={`flex-1 rounded-lg border-2 py-2 ${
                        active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'
                      }`}>
                      <Text
                        className={`text-center text-sm font-medium ${active ? 'text-orange-400' : 'text-gray-300'}`}>
                        {goalLabels[g]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mb-4 rounded-xl bg-gray-800 p-4">
              <Text className="mb-3 text-sm text-gray-400">現在 → 目標</Text>
              <View className="flex-row items-center justify-between">
                <View className="items-center">
                  <Text className="text-2xl font-bold text-white">
                    {weight}
                    <Text className="text-sm text-gray-400"> kg</Text>
                  </Text>
                  <Text className="text-xs text-gray-400">BMI {bmi.toFixed(1)}</Text>
                </View>
                <Text className="text-2xl text-orange-500">→</Text>
                <View className="items-center">
                  <Text className="text-2xl font-bold text-orange-400">
                    {targetWeight}
                    <Text className="text-sm text-gray-400"> kg</Text>
                  </Text>
                  <Text className="text-xs text-gray-400">BMI {targetBMI.toFixed(1)}</Text>
                </View>
              </View>
            </View>

            <View className="mb-4 rounded-xl bg-gray-800 p-4">
              <Text className="mb-1 text-sm text-gray-400">1日の目標カロリー</Text>
              <Text className="text-3xl font-bold text-orange-400">
                {dailyCalorieTarget}
                <Text className="text-lg text-gray-400"> kcal</Text>
              </Text>
              <Text className="mt-1 text-xs text-gray-500">TDEE: {tdee} kcal</Text>
            </View>

            <View className="rounded-xl bg-gray-800 p-4">
              <Text className="mb-3 text-sm text-gray-400">サンプル食事プラン</Text>
              <View className="gap-2">
                {[
                  { label: '🌅 朝食 — 卵かけご飯・納豆・味噌汁', kcal: mealPlan.breakfast },
                  { label: '☀️ 昼食 — 鶏胸肉定食・野菜サラダ', kcal: mealPlan.lunch },
                  { label: '🌙 夕食 — 焼き魚・ブロッコリー・玄米', kcal: mealPlan.dinner },
                  { label: '🍌 間食 — バナナ・プロテイン', kcal: mealPlan.snack },
                ].map((m) => (
                  <View key={m.label} className="flex-row items-center justify-between">
                    <Text className="flex-1 pr-2 text-sm text-gray-200">{m.label}</Text>
                    <Text className="text-sm font-medium text-orange-400">{m.kcal} kcal</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {step === 6 && (
          <View className="items-center">
            <Text className="mb-4 text-6xl">🎉</Text>
            <Text className="mb-2 text-3xl font-bold text-white">設定完了！</Text>
            <Text className="mb-8 text-gray-400">あなたのプロフィールが完成しました</Text>

            <View className="mb-8 w-full gap-3 rounded-xl bg-gray-800 p-5">
              {[
                { label: 'ゴール', value: goalLabels[goal] },
                { label: '現在体重', value: `${weight} kg` },
                { label: '目標体重', value: `${targetWeight} kg` },
                { label: '1日の目標カロリー', value: `${dailyCalorieTarget} kcal` },
                {
                  label: '運動環境',
                  value: envOptions.find((e) => e.value === trainingEnvironment)?.label ?? '',
                },
              ].map((row) => (
                <View key={row.label} className="flex-row justify-between">
                  <Text className="text-gray-400">{row.label}</Text>
                  <Text className="font-medium text-white">{row.value}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={handleComplete}
              className="w-full rounded-xl bg-orange-500 py-4 active:bg-orange-600">
              <Text className="text-center text-lg font-bold text-white">さっそく始める</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {step < 6 && (
        <View className="flex-row gap-3 px-6 pb-4 pt-2">
          {step > 1 && (
            <Pressable
              onPress={() => setStep((s) => s - 1)}
              className="flex-1 rounded-xl border-2 border-gray-700 py-3">
              <Text className="text-center font-medium text-gray-300">前へ</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setStep((s) => s + 1)}
            className="flex-1 rounded-xl bg-orange-500 py-3 active:bg-orange-600">
            <Text className="text-center font-bold text-white">次へ</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
