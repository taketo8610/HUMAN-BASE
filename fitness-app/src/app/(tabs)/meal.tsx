import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { format, parseISO, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Trash2, UtensilsCrossed } from 'lucide-react-native';

import { useAppStore } from '@/store/useAppStore';
import { MealType } from '@/types';
import { genId } from '@/lib/id';
import { colors } from '@/lib/colors';
import { Card, Field, PrimaryButton, EmptyState, inputClass, placeholderColor } from '@/components/ui';

const mealLabels: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
};
const mealTypes = Object.keys(mealLabels) as MealType[];

export default function MealScreen() {
  const { mealEntries, addMealEntry, deleteMealEntry } = useAppStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [meal, setMeal] = useState<MealType>('breakfast');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const todayEntries = mealEntries.filter((e) => isToday(parseISO(e.date)));
  const totals = todayEntries.reduce(
    (acc, e) => ({
      cal: acc.cal + e.calories,
      p: acc.p + e.protein,
      c: acc.c + e.carbs,
      f: acc.f + e.fat,
    }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  const handleSubmit = () => {
    if (!name) return;
    addMealEntry({
      id: genId(),
      date,
      meal,
      name,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
    });
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const summary = [
    { label: 'カロリー', value: `${totals.cal} kcal`, color: 'text-orange-400' },
    { label: 'タンパク質', value: `${totals.p} g`, color: 'text-blue-400' },
    { label: '炭水化物', value: `${totals.c} g`, color: 'text-yellow-400' },
    { label: '脂質', value: `${totals.f} g`, color: 'text-red-400' },
  ];

  const macroInputs = [
    { label: 'カロリー(kcal)', value: calories, set: setCalories },
    { label: 'タンパク質(g)', value: protein, set: setProtein },
    { label: '炭水化物(g)', value: carbs, set: setCarbs },
    { label: '脂質(g)', value: fat, set: setFat },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerStyle={{ padding: 20 }}>
      <View className="mb-6 flex-row gap-2">
        {summary.map((s) => (
          <View key={s.label} className="flex-1 items-center rounded-xl bg-gray-800 p-3">
            <Text className="mb-1 text-[10px] text-gray-400">{s.label}</Text>
            <Text className={`text-base font-bold ${s.color}`}>{s.value}</Text>
          </View>
        ))}
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
          </View>

          <View>
            <Text className="mb-1 text-sm text-gray-400">食事区分</Text>
            <View className="flex-row gap-2">
              {mealTypes.map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setMeal(k)}
                  className={`flex-1 rounded-lg py-2 ${meal === k ? 'bg-orange-500' : 'bg-gray-700'}`}>
                  <Text
                    className={`text-center text-sm ${meal === k ? 'text-white' : 'text-gray-300'}`}>
                    {mealLabels[k]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="mb-1 text-sm text-gray-400">食品名</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="例: 鶏むね肉 200g"
              placeholderTextColor={placeholderColor}
              className={inputClass}
            />
          </View>

          <View className="flex-row flex-wrap gap-3">
            {macroInputs.map((m) => (
              <View key={m.label} className="w-[47%]">
                <Text className="mb-1 text-xs text-gray-400">{m.label}</Text>
                <TextInput
                  value={m.value}
                  onChangeText={m.set}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={placeholderColor}
                  className={inputClass}
                />
              </View>
            ))}
          </View>

          <PrimaryButton label="記録する" onPress={handleSubmit} disabled={!name} />
        </View>
      </Card>

      <View className="gap-3">
        {mealEntries.map((entry) => (
          <View
            key={entry.id}
            className="flex-row items-center justify-between rounded-xl bg-gray-800 p-4">
            <View className="flex-1 pr-3">
              <View className="mb-1 flex-row items-center gap-2">
                <View className="rounded-full bg-orange-500/20 px-2 py-0.5">
                  <Text className="text-xs text-orange-400">{mealLabels[entry.meal]}</Text>
                </View>
                <Text className="text-xs text-gray-400">
                  {format(parseISO(entry.date), 'M月d日', { locale: ja })}
                </Text>
              </View>
              <Text className="text-sm font-medium text-white">{entry.name}</Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                {entry.calories}kcal · P:{entry.protein}g C:{entry.carbs}g F:{entry.fat}g
              </Text>
            </View>
            <Pressable
              onPress={() => deleteMealEntry(entry.id)}
              accessibilityRole="button"
              accessibilityLabel="この記録を削除">
              <Trash2 color={colors.gray500} size={16} />
            </Pressable>
          </View>
        ))}
        {mealEntries.length === 0 && (
          <EmptyState
            icon={UtensilsCrossed}
            text="まだ記録がありません"
            hint="食事を記録すると今日の合計に反映されます"
          />
        )}
      </View>
    </ScrollView>
  );
}
