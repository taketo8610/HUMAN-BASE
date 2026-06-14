import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Trash2, X, Sparkles } from 'lucide-react-native';

import { useAppStore } from '@/store/useAppStore';
import { PlannedExercise, TrainingDay, DayOfWeek } from '@/types';
import { genId } from '@/lib/id';
import { colors } from '@/lib/colors';
import { suggestTrainingPlan } from '@/lib/menuSuggestion';
import { Card, Field, PrimaryButton, EmptyState, inputClass, placeholderColor } from '@/components/ui';

const dayList: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: '日' },
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
];
const dayLabel = (d: DayOfWeek) => dayList[d].label;

export default function PlanScreen() {
  const { trainingPlans, addTrainingPlan, deleteTrainingPlan, userProfile } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<TrainingDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1);

  const addDay = () => {
    if (days.find((d) => d.dayOfWeek === selectedDay)) return;
    setDays((prev) => [...prev, { dayOfWeek: selectedDay, exercises: [] }]);
  };

  const addExercise = (dayOfWeek: DayOfWeek) =>
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, exercises: [...d.exercises, { id: genId(), name: '', sets: 3, reps: 10 }] }
          : d
      )
    );

  const updateExercise = (
    dayOfWeek: DayOfWeek,
    exId: string,
    field: keyof PlannedExercise,
    value: string | number
  ) =>
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, [field]: value } : e)) }
          : d
      )
    );

  const removeExercise = (dayOfWeek: DayOfWeek, exId: string) =>
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) }
          : d
      )
    );

  const removeDay = (dayOfWeek: DayOfWeek) =>
    setDays((prev) => prev.filter((d) => d.dayOfWeek !== dayOfWeek));

  const handleSubmit = () => {
    if (!name || days.length === 0) return;
    addTrainingPlan({
      id: genId(),
      name,
      description,
      days,
      createdAt: new Date().toISOString(),
    });
    setName('');
    setDescription('');
    setDays([]);
  };

  const sortedDays = [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const handleGenerate = () => {
    if (!userProfile) return;
    addTrainingPlan(
      suggestTrainingPlan(
        userProfile.trainingEnvironments,
        userProfile.trainingFrequency,
        userProfile.goalDirection
      )
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerStyle={{ padding: 20 }}>
      {userProfile && (
        <Pressable
          onPress={handleGenerate}
          className="mb-6 flex-row items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 py-3 active:bg-orange-500/20">
          <Sparkles color={colors.orange400} size={18} />
          <Text className="font-medium text-orange-400">あなたに合うメニューを自動生成</Text>
        </Pressable>
      )}

      <Card className="mb-8">
        <View className="gap-4">
          <View className="flex-row gap-4">
            <Field label="プラン名">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="例: 胸・肩・三頭"
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </Field>
            <Field label="説明">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </Field>
          </View>

          <View>
            <Text className="mb-1 text-sm text-gray-400">曜日を追加</Text>
            <View className="flex-row items-center gap-2">
              <View className="flex-1 flex-row gap-1">
                {dayList.map((d) => (
                  <Pressable
                    key={d.value}
                    onPress={() => setSelectedDay(d.value)}
                    className={`flex-1 rounded-lg py-2 ${
                      selectedDay === d.value ? 'bg-orange-500' : 'bg-gray-700'
                    }`}>
                    <Text
                      className={`text-center text-sm ${
                        selectedDay === d.value ? 'text-white' : 'text-gray-300'
                      }`}>
                      {d.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={addDay} className="rounded-lg bg-gray-700 px-4 py-2">
                <Plus color="#ffffff" size={16} />
              </Pressable>
            </View>
          </View>

          {sortedDays.map((day) => (
            <View key={day.dayOfWeek} className="rounded-lg bg-gray-700 p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-medium text-white">{dayLabel(day.dayOfWeek)}曜日</Text>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={() => addExercise(day.dayOfWeek)}
                    className="flex-row items-center gap-1 rounded bg-orange-500 px-2 py-1">
                    <Plus color="#ffffff" size={11} />
                    <Text className="text-xs text-white">種目</Text>
                  </Pressable>
                  <Pressable onPress={() => removeDay(day.dayOfWeek)}>
                    <X color={colors.gray400} size={16} />
                  </Pressable>
                </View>
              </View>
              {day.exercises.map((ex) => (
                <View key={ex.id} className="mb-2 flex-row items-end gap-2">
                  <View className="flex-[2]">
                    <TextInput
                      placeholder="種目名"
                      placeholderTextColor={placeholderColor}
                      value={ex.name}
                      onChangeText={(t) => updateExercise(day.dayOfWeek, ex.id, 'name', t)}
                      className="rounded bg-gray-600 px-2 py-1.5 text-sm text-white"
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      placeholder="セット"
                      placeholderTextColor={placeholderColor}
                      keyboardType="numeric"
                      value={String(ex.sets)}
                      onChangeText={(t) => updateExercise(day.dayOfWeek, ex.id, 'sets', Number(t) || 0)}
                      className="rounded bg-gray-600 px-2 py-1.5 text-sm text-white"
                    />
                  </View>
                  <View className="flex-1">
                    <TextInput
                      placeholder="回数"
                      placeholderTextColor={placeholderColor}
                      keyboardType="numeric"
                      value={String(ex.reps)}
                      onChangeText={(t) => updateExercise(day.dayOfWeek, ex.id, 'reps', Number(t) || 0)}
                      className="rounded bg-gray-600 px-2 py-1.5 text-sm text-white"
                    />
                  </View>
                  <Pressable onPress={() => removeExercise(day.dayOfWeek, ex.id)} className="pb-2">
                    <X color={colors.gray400} size={13} />
                  </Pressable>
                </View>
              ))}
              {day.exercises.length === 0 && (
                <Text className="text-xs text-gray-500">種目を追加してください</Text>
              )}
            </View>
          ))}

          <PrimaryButton
            label="プランを作成"
            onPress={handleSubmit}
            disabled={!name || days.length === 0}
          />
        </View>
      </Card>

      <View className="gap-4">
        {trainingPlans.map((plan) => (
          <View key={plan.id} className="rounded-xl bg-gray-800 p-4">
            <View className="mb-2 flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="font-semibold text-white">{plan.name}</Text>
                {plan.description ? (
                  <Text className="text-sm text-gray-400">{plan.description}</Text>
                ) : null}
                <Text className="mt-1 text-xs text-gray-500">
                  {format(parseISO(plan.createdAt), 'yyyy年M月d日作成', { locale: ja })}
                </Text>
              </View>
              <Pressable onPress={() => deleteTrainingPlan(plan.id)}>
                <Trash2 color={colors.gray500} size={16} />
              </Pressable>
            </View>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {[...plan.days]
                .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                .map((d) => (
                  <View key={d.dayOfWeek} className="rounded bg-gray-700 px-2 py-1">
                    <Text className="text-xs text-gray-200">
                      {dayLabel(d.dayOfWeek)}曜 ({d.exercises.length}種目)
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        ))}
        {trainingPlans.length === 0 && <EmptyState text="プランがありません" />}
      </View>
    </ScrollView>
  );
}
