import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';

import {
  UserProfile,
  Motivation,
  Sex,
  TrainingFrequency,
  TrainingIntensity,
  TrainingEnvironment,
  Goal,
  FitnessGoal,
} from '@/types';
import {
  calcAge,
  calculateBMR,
  calculateTDEE,
  calculateDailyCalories,
  calculateTargetWeight,
  calculateMacros,
  recommendGoal,
} from '@/lib/fitness';
import { suggestMeals } from '@/lib/mealSuggestion';
import { genId } from '@/lib/id';
import BodyComposition from '@/components/BodyComposition';
import { placeholderColor } from '@/components/ui';

interface Props {
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

const TOTAL_STEPS = 7;

const motivationOptions: { value: Motivation; emoji: string; label: string; hint: string }[] = [
  { value: 'attractive', emoji: '💪', label: 'モテたい', hint: '映える体型と体重・体脂肪を目標にします' },
  { value: 'health', emoji: '🏥', label: '健康になりたい', hint: '健康リスクが最小の体重・BMIを目標にします' },
  { value: 'strength', emoji: '🏋️', label: '筋力を上げたい', hint: 'ベンチ等の種目重量（BIG3）を目標にします' },
  { value: 'lose_fat', emoji: '🔥', label: '体を絞りたい', hint: '体脂肪を落とす目標を設定します' },
  { value: 'muscle', emoji: '🥩', label: '筋肉をつけたい', hint: '増量と種目重量を目標にします' },
  { value: 'custom', emoji: '✏️', label: 'その他', hint: '自由に目標を設定します' },
];

const frequencyOptions: { value: TrainingFrequency; label: string }[] = [
  { value: 'none', label: 'ほぼ運動しない' },
  { value: 'w1_2', label: '週1〜2回' },
  { value: 'w3_4', label: '週3〜4回' },
  { value: 'w5_6', label: '週5〜6回' },
  { value: 'daily', label: '毎日' },
];

const intensityOptions: { value: TrainingIntensity; label: string; desc: string }[] = [
  { value: 'light', label: '軽め', desc: '息が上がらない程度' },
  { value: 'moderate', label: '普通', desc: '程よく追い込む' },
  { value: 'hard', label: 'ハード', desc: '毎回しっかり追い込む' },
];

const envOptions: { value: TrainingEnvironment; emoji: string; label: string; desc: string }[] = [
  { value: 'gym', emoji: '🏋️', label: 'ジム', desc: 'マシン・フリーウェイト' },
  { value: 'bodyweight', emoji: '🤸', label: '自重', desc: '器具なしでOK' },
  { value: 'home_equipment', emoji: '🏠', label: '自宅（器具あり）', desc: 'ダンベル・バーベル' },
];

const goalLabels: Record<Goal, string> = { bulk: '増量', cut: '減量', maintain: '維持' };
const liftDefs = [
  { key: 'bench', label: 'ベンチプレス' },
  { key: 'squat', label: 'スクワット' },
  { key: 'deadlift', label: 'デッドリフト' },
] as const;

export default function OnboardingFlow({ onComplete, onSkip }: Props) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);
  const [motivation, setMotivation] = useState<Motivation>('health');
  const [motivationCustom, setMotivationCustom] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [frequency, setFrequency] = useState<TrainingFrequency>('w3_4');
  const [intensity, setIntensity] = useState<TrainingIntensity>('moderate');
  const [environments, setEnvironments] = useState<TrainingEnvironment[]>(['gym']);
  const [goalDirection, setGoalDirection] = useState<Goal>('maintain');
  const [lifts, setLifts] = useState<Record<string, string>>({ bench: '', squat: '', deadlift: '' });

  const isLift = motivation === 'strength' || motivation === 'muscle';
  const recommendedDir: Goal =
    motivation === 'lose_fat' ? 'cut' : motivation === 'muscle' ? 'bulk' : recommendGoal(weight, height);

  const age = calcAge(birthDate);
  const bmr = calculateBMR(sex, weight, height, age);
  const tdee = calculateTDEE(bmr, { frequency, intensity });
  const dailyCalorieTarget = calculateDailyCalories(tdee, goalDirection);
  const macros = calculateMacros(dailyCalorieTarget, weight, goalDirection);
  const targetWeight = calculateTargetWeight(weight, sex, height, goalDirection);
  const meals = suggestMeals(dailyCalorieTarget, goalDirection);

  const toggleEnv = (v: TrainingEnvironment) =>
    setEnvironments((prev) => (prev.includes(v) ? prev.filter((e) => e !== v) : [...prev, v]));

  function handleComplete() {
    const goals: FitnessGoal[] = [];
    if (isLift) {
      liftDefs.forEach((l) => {
        const n = Number(lifts[l.key]);
        if (n > 0) goals.push({ id: genId(), kind: 'lift', exercise: l.label, target: n, unit: 'kg', label: l.label });
      });
    }
    if (motivation !== 'strength') {
      goals.push({ id: genId(), kind: 'weight', target: targetWeight, unit: 'kg', label: '目標体重' });
    }

    const profile: UserProfile = {
      motivation,
      motivationCustom: motivation === 'custom' ? motivationCustom : undefined,
      sex,
      birthDate,
      height,
      weight,
      trainingFrequency: frequency,
      trainingIntensity: intensity,
      trainingEnvironments: environments.length > 0 ? environments : ['gym'],
      goalDirection,
      goals,
      targetWeight,
      dailyCalorieTarget,
      macros,
      onboardingCompleted: true,
    };
    onComplete(profile);
  }

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  const numField = 'rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white';
  const selectedMotivation = motivationOptions.find((m) => m.value === motivation);

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
        <View
          className="h-full rounded-full bg-orange-500"
          style={{ width: `${progressPct}%` as `${number}%` }}
        />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}>
        {step === 1 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">目標は何ですか？</Text>
            <Text className="mb-6 text-gray-400">目的に合わせて、設定する目標の種類が変わります</Text>
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
            {selectedMotivation && (
              <View className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
                <Text className="text-sm text-orange-400">➜ {selectedMotivation.hint}</Text>
              </View>
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
              <View>
                <Text className="mb-2 text-sm text-gray-400">生年月日</Text>
                <TextInput
                  value={birthDate}
                  onChangeText={setBirthDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={placeholderColor}
                  className={numField}
                />
                <Text className="mt-1 text-xs text-gray-500">
                  現在の年齢: {age > 0 ? `${age}歳` : '—'}（誕生日が来ると自動で更新されます）
                </Text>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="mb-2 text-sm text-gray-400">身長 (cm)</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={String(height)}
                    onChangeText={(t) => setHeight(Number(t) || 0)}
                    className={numField}
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 text-sm text-gray-400">体重 (kg)</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={String(weight)}
                    onChangeText={(t) => setWeight(Number(t) || 0)}
                    className={numField}
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">活動量</Text>
            <Text className="mb-6 text-gray-400">頻度と強度をそれぞれ教えてください</Text>
            <Text className="mb-2 text-sm text-gray-400">トレーニング頻度</Text>
            <View className="mb-6 gap-2">
              {frequencyOptions.map((opt) => {
                const active = frequency === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setFrequency(opt.value)}
                    className={`rounded-xl border-2 px-4 py-3 ${
                      active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'
                    }`}>
                    <Text className={`font-medium ${active ? 'text-orange-400' : 'text-gray-200'}`}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mb-2 text-sm text-gray-400">1回あたりの強度</Text>
            <View className="flex-row gap-3">
              {intensityOptions.map((opt) => {
                const active = intensity === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setIntensity(opt.value)}
                    className={`flex-1 rounded-xl border-2 p-3 ${
                      active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'
                    }`}>
                    <Text
                      className={`text-center font-medium ${active ? 'text-orange-400' : 'text-gray-200'}`}>
                      {opt.label}
                    </Text>
                    <Text className="mt-1 text-center text-[10px] text-gray-400">{opt.desc}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">運動環境</Text>
            <Text className="mb-6 text-gray-400">あてはまるものをすべて選んでください（複数可）</Text>
            <View className="gap-3">
              {envOptions.map((opt) => {
                const active = environments.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => toggleEnv(opt.value)}
                    className={`flex-row items-center gap-4 rounded-xl border-2 p-4 ${
                      active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-gray-800'
                    }`}>
                    <Text className="text-2xl">{opt.emoji}</Text>
                    <View className="flex-1">
                      <Text className="font-medium text-white">{opt.label}</Text>
                      <Text className="text-sm text-gray-400">{opt.desc}</Text>
                    </View>
                    <View
                      className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                        active ? 'border-orange-500 bg-orange-500' : 'border-gray-600'
                      }`}>
                      {active && <Check color="#ffffff" size={14} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">目標を設定</Text>
            <Text className="mb-6 text-gray-400">
              {isLift ? '目指す重量と方向性を決めましょう' : '目的に合った体型を目安に設定しましょう'}
            </Text>

            <View className="mb-4">
              <BodyComposition motivation={motivation} sex={sex} height={height} currentWeight={weight} />
            </View>

            <Text className="mb-2 text-sm text-gray-400">
              カロリーの方向性（おすすめ: {goalLabels[recommendedDir]}）
            </Text>
            <View className="mb-4 flex-row gap-2">
              {(['bulk', 'maintain', 'cut'] as Goal[]).map((g) => {
                const active = goalDirection === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGoalDirection(g)}
                    className={`flex-1 rounded-lg border-2 py-2 ${
                      active ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700'
                    }`}>
                    <Text
                      className={`text-center text-sm font-medium ${active ? 'text-orange-400' : 'text-gray-300'}`}>
                      {goalLabels[g]}
                      {recommendedDir === g ? ' ★' : ''}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {isLift && (
              <View className="mb-4 gap-3 rounded-xl bg-gray-800 p-4">
                <Text className="text-sm text-gray-400">種目別の目標重量（kg・任意）</Text>
                {liftDefs.map((l) => (
                  <View key={l.key} className="flex-row items-center justify-between gap-3">
                    <Text className="flex-1 text-gray-200">{l.label}</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={lifts[l.key]}
                      onChangeText={(t) => setLifts((prev) => ({ ...prev, [l.key]: t }))}
                      placeholder="kg"
                      placeholderTextColor={placeholderColor}
                      className="w-24 rounded-lg bg-gray-700 px-3 py-2 text-center text-white"
                    />
                  </View>
                ))}
              </View>
            )}

            <View className="rounded-xl bg-gray-800 p-4">
              <Text className="mb-1 text-sm text-gray-400">1日の目標カロリー</Text>
              <Text className="text-3xl font-bold text-orange-400">
                {dailyCalorieTarget}
                <Text className="text-lg text-gray-400"> kcal</Text>
              </Text>
              <Text className="mt-1 text-xs text-gray-500">
                TDEE: {tdee} kcal ・ 目標体重: {targetWeight} kg
              </Text>
            </View>
          </View>
        )}

        {step === 6 && (
          <View>
            <Text className="mb-2 text-2xl font-bold text-white">食事プラン</Text>
            <Text className="mb-6 text-gray-400">目標カロリーと栄養バランスに合わせた目安です</Text>

            <View className="mb-4 flex-row gap-2">
              {[
                { label: 'カロリー', value: `${dailyCalorieTarget}`, unit: 'kcal', color: 'text-orange-400' },
                { label: 'P（たんぱく質）', value: `${macros.protein}`, unit: 'g', color: 'text-blue-400' },
                { label: 'F（脂質）', value: `${macros.fat}`, unit: 'g', color: 'text-red-400' },
                { label: 'C（炭水化物）', value: `${macros.carbs}`, unit: 'g', color: 'text-yellow-400' },
              ].map((m) => (
                <View key={m.label} className="flex-1 items-center rounded-xl bg-gray-800 p-2">
                  <Text className="mb-1 text-center text-[9px] text-gray-400">{m.label}</Text>
                  <Text className={`text-sm font-bold ${m.color}`}>{m.value}</Text>
                  <Text className="text-[9px] text-gray-500">{m.unit}</Text>
                </View>
              ))}
            </View>

            <View className="gap-2 rounded-xl bg-gray-800 p-4">
              <Text className="mb-1 text-sm text-gray-400">{goalLabels[goalDirection]}向けの食事例</Text>
              {meals.map((m) => (
                <View key={m.meal} className="flex-row items-center justify-between">
                  <Text className="flex-1 pr-2 text-sm text-gray-200">
                    {m.emoji} {m.meal} — {m.items}
                  </Text>
                  <Text className="text-sm font-medium text-orange-400">{m.kcal} kcal</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {step === 7 && (
          <View className="items-center">
            <Text className="mb-4 text-6xl">🎉</Text>
            <Text className="mb-2 text-3xl font-bold text-white">設定完了！</Text>
            <Text className="mb-8 text-gray-400">あなたのプロフィールが完成しました</Text>

            <View className="mb-8 w-full gap-3 rounded-xl bg-gray-800 p-5">
              {[
                { label: '目的', value: motivationOptions.find((m) => m.value === motivation)?.label ?? '' },
                { label: '方向性', value: goalLabels[goalDirection] },
                { label: '現在体重', value: `${weight} kg` },
                { label: '目標体重', value: `${targetWeight} kg` },
                { label: '1日の目標カロリー', value: `${dailyCalorieTarget} kcal` },
                { label: 'PFC', value: `${macros.protein} / ${macros.fat} / ${macros.carbs} g` },
                {
                  label: '運動環境',
                  value: environments.map((e) => envOptions.find((o) => o.value === e)?.label).join('・'),
                },
              ].map((row) => (
                <View key={row.label} className="flex-row justify-between gap-3">
                  <Text className="text-gray-400">{row.label}</Text>
                  <Text className="flex-1 text-right font-medium text-white">{row.value}</Text>
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

      {step < TOTAL_STEPS && (
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
