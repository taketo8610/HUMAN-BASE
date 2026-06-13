import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Trash2, X } from 'lucide-react-native';

import { useAppStore } from '@/store/useAppStore';
import { WorkoutSet } from '@/types';
import { genId } from '@/lib/id';
import { colors } from '@/lib/colors';
import { Card, Field, PrimaryButton, EmptyState, inputClass, placeholderColor } from '@/components/ui';
import WorkoutTimer from '@/components/WorkoutTimer';

export default function WorkoutScreen() {
  const { workoutLogs, addWorkoutLog, deleteWorkoutLog } = useAppStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutSet[]>([]);
  const [timerActive, setTimerActive] = useState(false);

  const addExercise = () =>
    setExercises((prev) => [...prev, { id: genId(), exercise: '', sets: 3, reps: 10, weight: 0 }]);

  const updateExercise = (id: string, field: keyof WorkoutSet, value: string | number) =>
    setExercises((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const removeExercise = (id: string) =>
    setExercises((prev) => prev.filter((e) => e.id !== id));

  const handleSubmit = () => {
    if (exercises.length === 0) return;
    addWorkoutLog({ id: genId(), date, exercises, duration: Number(duration) || 0, notes });
    setExercises([]);
    setNotes('');
    setDuration('60');
  };

  const currentExerciseName = exercises.find((e) => e.exercise)?.exercise ?? undefined;

  return (
    <View className="flex-1 bg-gray-950">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: timerActive ? 360 : 20 }}>
        <View className="mb-4 flex-row justify-end">
          {timerActive ? (
            <Pressable
              onPress={() => setTimerActive(false)}
              className="rounded-lg bg-gray-700 px-4 py-2">
              <Text className="text-sm text-white">終了</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setTimerActive(true)}
              className="rounded-lg bg-orange-500 px-4 py-2">
              <Text className="text-sm font-medium text-white">トレーニング開始</Text>
            </Pressable>
          )}
        </View>

        <Card className="mb-8">
          <View className="gap-4">
            <View className="flex-row gap-4">
              <Field label="日付">
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={placeholderColor}
                  className={inputClass}
                />
              </Field>
              <Field label="時間（分）">
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholderTextColor={placeholderColor}
                  className={inputClass}
                />
              </Field>
            </View>

            <View>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-gray-400">種目</Text>
                <Pressable
                  onPress={addExercise}
                  className="flex-row items-center gap-1 rounded-lg bg-orange-500 px-3 py-1">
                  <Plus color="#ffffff" size={12} />
                  <Text className="text-xs text-white">追加</Text>
                </Pressable>
              </View>
              {exercises.map((ex) => (
                <View key={ex.id} className="mb-2 gap-2 rounded-lg bg-gray-700 p-3">
                  <TextInput
                    placeholder="種目名"
                    placeholderTextColor={placeholderColor}
                    value={ex.exercise}
                    onChangeText={(t) => updateExercise(ex.id, 'exercise', t)}
                    className="rounded bg-gray-600 px-2 py-1.5 text-sm text-white"
                  />
                  <View className="flex-row items-end gap-2">
                    <View className="flex-1">
                      <Text className="mb-0.5 text-[10px] text-gray-400">セット</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={String(ex.sets)}
                        onChangeText={(t) => updateExercise(ex.id, 'sets', Number(t) || 0)}
                        className="rounded bg-gray-600 px-2 py-1.5 text-sm text-white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-0.5 text-[10px] text-gray-400">回数</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={String(ex.reps)}
                        onChangeText={(t) => updateExercise(ex.id, 'reps', Number(t) || 0)}
                        className="rounded bg-gray-600 px-2 py-1.5 text-sm text-white"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-0.5 text-[10px] text-gray-400">kg</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={String(ex.weight)}
                        onChangeText={(t) => updateExercise(ex.id, 'weight', Number(t) || 0)}
                        className="rounded bg-gray-600 px-2 py-1.5 text-sm text-white"
                      />
                    </View>
                    <Pressable onPress={() => removeExercise(ex.id)} className="pb-2">
                      <X color={colors.gray400} size={16} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View>
              <Text className="mb-1 text-sm text-gray-400">メモ</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholderTextColor={placeholderColor}
                style={{ textAlignVertical: 'top', minHeight: 56 }}
                className={inputClass}
              />
            </View>

            <PrimaryButton label="記録する" onPress={handleSubmit} disabled={exercises.length === 0} />
          </View>
        </Card>

        <View className="gap-4">
          {workoutLogs.map((log) => (
            <View key={log.id} className="rounded-xl bg-gray-800 p-4">
              <View className="mb-3 flex-row items-start justify-between">
                <View>
                  <Text className="font-semibold text-white">
                    {format(parseISO(log.date), 'yyyy年M月d日(E)', { locale: ja })}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {log.exercises.length}種目 · {log.duration}分
                  </Text>
                </View>
                <Pressable onPress={() => deleteWorkoutLog(log.id)}>
                  <Trash2 color={colors.gray500} size={16} />
                </Pressable>
              </View>
              <View className="gap-1">
                {log.exercises.map((ex) => (
                  <View key={ex.id} className="flex-row gap-3">
                    <Text className="w-28 text-sm font-medium text-gray-200">{ex.exercise}</Text>
                    <Text className="flex-1 text-sm text-gray-400">
                      {ex.sets}セット × {ex.reps}回 {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
          {workoutLogs.length === 0 && <EmptyState text="記録がありません" />}
        </View>
      </ScrollView>

      {timerActive && <WorkoutTimer exerciseName={currentExerciseName} />}
    </View>
  );
}
