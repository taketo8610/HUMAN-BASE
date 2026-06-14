import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';

import { useAppStore } from '@/store/useAppStore';
import { TrainingFrequency, TrainingIntensity, Motivation, Sex, TrainingEnvironment } from '@/types';
import {
  calcAge,
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  planCalories,
  directionFromWeights,
} from '@/lib/fitness';
import { colors } from '@/lib/colors';
import { Card, PrimaryButton, inputClass, placeholderColor } from '@/components/ui';

const goalLabels: Record<string, string> = { bulk: '増量', cut: '減量', maintain: '維持' };
const freqOpts: { value: TrainingFrequency; label: string }[] = [
  { value: 'none', label: '運動なし' },
  { value: 'w1_2', label: '週1-2' },
  { value: 'w3_4', label: '週3-4' },
  { value: 'w5_6', label: '週5-6' },
  { value: 'daily', label: '毎日' },
];
const intOpts: { value: TrainingIntensity; label: string }[] = [
  { value: 'light', label: '軽め' },
  { value: 'moderate', label: '普通' },
  { value: 'hard', label: 'ハード' },
];
const motivationOpts: { value: Motivation; label: string }[] = [
  { value: 'attractive', label: 'モテたい' },
  { value: 'health', label: '健康' },
  { value: 'strength', label: '筋力' },
  { value: 'lose_fat', label: '絞る' },
  { value: 'muscle', label: '筋肥大' },
  { value: 'custom', label: 'その他' },
];
const envOpts: { value: TrainingEnvironment; label: string }[] = [
  { value: 'gym', label: 'ジム' },
  { value: 'bodyweight', label: '自重' },
  { value: 'home_equipment', label: '自宅' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const profile = useAppStore((s) => s.userProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const resetProfile = useAppStore((s) => s.resetProfile);

  const [weight, setWeight] = useState(profile ? String(profile.weight) : '70');
  const [targetWeight, setTargetWeight] = useState(profile ? String(profile.targetWeight) : '70');
  const [weeks, setWeeks] = useState(profile?.targetWeeks ?? 12);
  const [frequency, setFrequency] = useState<TrainingFrequency>(profile?.trainingFrequency ?? 'w3_4');
  const [intensity, setIntensity] = useState<TrainingIntensity>(profile?.trainingIntensity ?? 'moderate');
  const [sex, setSex] = useState<Sex>(profile?.sex ?? 'male');
  const [height, setHeight] = useState(profile ? String(profile.height) : '170');
  const [motivation, setMotivation] = useState<Motivation>(profile?.motivation ?? 'health');
  const [environments, setEnvironments] = useState<TrainingEnvironment[]>(
    profile?.trainingEnvironments ?? ['gym']
  );

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Stack.Screen options={headerOptions} />
        <Text className="text-gray-400">プロフィールがありません</Text>
      </View>
    );
  }

  const w = Number(weight) || profile.weight;
  const tw = Number(targetWeight) || profile.targetWeight;
  const h = Number(height) || profile.height;
  const age = calcAge(profile.birthDate);
  const bmr = calculateBMR(sex, w, h, age);
  const tdee = calculateTDEE(bmr, { frequency, intensity });
  const direction = directionFromWeights(w, tw);
  const floor = Math.max(Math.round(bmr), sex === 'male' ? 1500 : 1200);
  const plan = planCalories(tdee, w, tw, weeks, floor);
  const macros = calculateMacros(plan.dailyCalorieTarget, w, direction);
  const showWeeks = Math.abs(tw - w) >= 0.5;
  const toggleEnv = (v: TrainingEnvironment) =>
    setEnvironments((prev) => (prev.includes(v) ? prev.filter((e) => e !== v) : [...prev, v]));

  function save() {
    updateProfile({
      weight: w,
      height: h,
      sex,
      motivation,
      trainingEnvironments: environments.length > 0 ? environments : ['gym'],
      targetWeight: Math.round(tw),
      targetWeeks: showWeeks ? weeks : undefined,
      trainingFrequency: frequency,
      trainingIntensity: intensity,
      goalDirection: direction,
      dailyCalorieTarget: plan.dailyCalorieTarget,
      macros,
    });
    router.back();
  }

  function restart() {
    const run = () => {
      resetProfile();
      router.back();
    };
    if (Platform.OS === 'web') {
      // react-native-web では Alert のボタンコールバックが効かないため confirm を使う。
      if (typeof window !== 'undefined' && window.confirm('目標・基本情報をすべて設定し直しますか？\n記録データ（ワークアウト・食事・体型）は消えません。')) {
        run();
      }
    } else {
      Alert.alert('設定をやり直しますか？', '記録データ（ワークアウト・食事・体型）は消えません。', [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'やり直す', style: 'destructive', onPress: run },
      ]);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Stack.Screen options={headerOptions} />

      {/* 基本情報 */}
      <Card>
        <Text className="mb-4 font-semibold text-white">基本情報</Text>
        <View className="gap-4">
          <View>
            <Text className="mb-1 text-sm text-gray-400">目的</Text>
            <View className="flex-row flex-wrap gap-2">
              {motivationOpts.map((o) => {
                const active = motivation === o.value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => setMotivation(o.value)}
                    className={`rounded-lg px-3 py-2 ${active ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <Text className={`text-xs ${active ? 'text-white' : 'text-gray-300'}`}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="mb-1 text-sm text-gray-400">性別</Text>
              <View className="flex-row gap-2">
                {(['male', 'female'] as Sex[]).map((s) => {
                  const active = sex === s;
                  return (
                    <Pressable
                      key={s}
                      onPress={() => setSex(s)}
                      className={`flex-1 rounded-lg py-2 ${active ? 'bg-orange-500' : 'bg-gray-700'}`}>
                      <Text className={`text-center text-xs ${active ? 'text-white' : 'text-gray-300'}`}>
                        {s === 'male' ? '男性' : '女性'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-sm text-gray-400">身長 (cm)</Text>
              <TextInput
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </View>
          </View>
          <View>
            <Text className="mb-1 text-sm text-gray-400">運動環境（複数可）</Text>
            <View className="flex-row gap-2">
              {envOpts.map((o) => {
                const active = environments.includes(o.value);
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => toggleEnv(o.value)}
                    className={`flex-1 rounded-lg py-2 ${active ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <Text className={`text-center text-xs ${active ? 'text-white' : 'text-gray-300'}`}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Card>

      {/* クイック編集 */}
      <Card>
        <Text className="mb-4 font-semibold text-white">目標の調整</Text>
        <View className="gap-4">
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="mb-1 text-sm text-gray-400">現在体重 (kg)</Text>
              <TextInput
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-sm text-gray-400">目標体重 (kg)</Text>
              <TextInput
                keyboardType="numeric"
                value={targetWeight}
                onChangeText={setTargetWeight}
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </View>
          </View>

          {showWeeks && (
            <View>
              <View className="mb-1 flex-row items-end justify-between">
                <Text className="text-sm text-gray-400">達成までの期間</Text>
                <Text className="font-bold text-white">
                  {weeks}週間
                  <Text className="text-xs text-gray-400"> (約{Math.max(1, Math.round(weeks / 4.345))}ヶ月)</Text>
                </Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={4}
                maximumValue={52}
                step={1}
                value={weeks}
                onValueChange={(v) => setWeeks(Math.round(v))}
                minimumTrackTintColor={colors.orange500}
                maximumTrackTintColor={colors.gray700}
                thumbTintColor={colors.orange400}
              />
            </View>
          )}

          <View>
            <Text className="mb-1 text-sm text-gray-400">トレーニング頻度</Text>
            <View className="flex-row gap-2">
              {freqOpts.map((o) => {
                const active = frequency === o.value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => setFrequency(o.value)}
                    className={`flex-1 rounded-lg py-2 ${active ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <Text className={`text-center text-xs ${active ? 'text-white' : 'text-gray-300'}`}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="mb-1 text-sm text-gray-400">強度</Text>
            <View className="flex-row gap-2">
              {intOpts.map((o) => {
                const active = intensity === o.value;
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => setIntensity(o.value)}
                    className={`flex-1 rounded-lg py-2 ${active ? 'bg-orange-500' : 'bg-gray-700'}`}>
                    <Text className={`text-center text-xs ${active ? 'text-white' : 'text-gray-300'}`}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Card>

      {/* 再計算プレビュー */}
      <Card>
        <Text className="mb-2 text-sm text-gray-400">この設定での目標カロリー</Text>
        <Text className="text-3xl font-bold text-orange-400">
          {plan.dailyCalorieTarget}
          <Text className="text-base text-gray-400"> kcal</Text>
        </Text>
        <Text className="mt-1 text-xs text-gray-500">
          消費目安(TDEE) {tdee} {plan.dailyDelta >= 0 ? '＋' : '－'} {Math.abs(plan.dailyDelta)} kcal（
          {goalLabels[direction]}）・ P{macros.protein}/F{macros.fat}/C{macros.carbs}g
        </Text>
        {plan.warning && (
          <Text
            className={`mt-2 text-sm ${plan.pace === 'extreme' ? 'text-red-400' : 'text-yellow-400'}`}>
            ⚠️ {plan.warning}
          </Text>
        )}
      </Card>

      <PrimaryButton label="保存する" onPress={save} />

      {/* 現在の目標一覧 */}
      {profile.goals.length > 0 && (
        <Card>
          <Text className="mb-3 font-semibold text-white">設定中の目標</Text>
          <View className="gap-2">
            {profile.goals.map((g) => (
              <View key={g.id} className="flex-row justify-between">
                <Text className="text-gray-300">{g.label}</Text>
                <Text className="font-medium text-orange-400">
                  {g.target}
                  {g.unit}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* すべて設定し直す */}
      <Pressable onPress={restart} className="mt-2 rounded-lg border border-gray-700 py-3">
        <Text className="text-center font-medium text-gray-300">目標・基本情報をすべて設定し直す</Text>
      </Pressable>
      <Text className="mb-4 text-center text-xs text-gray-500">
        記録データ（ワークアウト・食事・体型）は消えません
      </Text>
    </ScrollView>
  );
}

const headerOptions = {
  headerShown: true,
  title: '設定',
  headerStyle: { backgroundColor: colors.gray900 },
  headerTitleStyle: { color: '#ffffff' },
  headerTintColor: '#ffffff',
  headerShadowVisible: false,
} as const;
