import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { format, parseISO, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Trash2, TrendingUp } from 'lucide-react-native';

import { useAppStore } from '@/store/useAppStore';
import { genId } from '@/lib/id';
import { colors } from '@/lib/colors';
import LineChart, { ChartSeries } from '@/components/LineChart';
import { Card, Field, PrimaryButton, EmptyState, inputClass, placeholderColor } from '@/components/ui';

const CHART_DAYS = 30;

export default function BodyScreen() {
  const { bodyRecords, addBodyRecord, deleteBodyRecord } = useAppStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('70');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    addBodyRecord({
      id: genId(),
      date,
      weight: Number(weight) || 0,
      bodyFatPercentage: bodyFat !== '' ? Number(bodyFat) : undefined,
      muscleMass: muscleMass !== '' ? Number(muscleMass) : undefined,
      notes,
    });
    setNotes('');
  };

  const days = Array.from({ length: CHART_DAYS }, (_, i) => {
    const d = subDays(new Date(), CHART_DAYS - 1 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const rec = bodyRecords.find((r) => r.date === dateStr);
    return { x: i, weight: rec?.weight, bodyFat: rec?.bodyFatPercentage };
  });
  const weightPts = days
    .filter((d) => d.weight != null)
    .map((d) => ({ x: d.x, y: d.weight as number }));
  const bodyFatPts = days
    .filter((d) => d.bodyFat != null)
    .map((d) => ({ x: d.x, y: d.bodyFat as number }));

  const series: ChartSeries[] = [
    { points: weightPts, color: colors.orange500, name: '体重(kg)' },
    ...(bodyFatPts.length > 0
      ? [{ points: bodyFatPts, color: colors.blue400, name: '体脂肪率(%)' }]
      : []),
  ];

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerStyle={{ padding: 20 }}>
      <Card className="mb-8 p-4">
        <Text className="mb-4 font-semibold text-white">推移グラフ（30日間）</Text>
        {weightPts.length > 0 ? (
          <LineChart
            count={CHART_DAYS}
            startLabel={format(subDays(new Date(), CHART_DAYS - 1), 'M/d')}
            endLabel={format(new Date(), 'M/d')}
            height={220}
            series={series}
          />
        ) : (
          <Text className="py-12 text-center text-sm text-gray-500">データがありません</Text>
        )}
      </Card>

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
            <Field label="体重 (kg)">
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </Field>
          </View>
          <View className="flex-row gap-4">
            <Field label="体脂肪率 (%)">
              <TextInput
                value={bodyFat}
                onChangeText={setBodyFat}
                keyboardType="numeric"
                placeholder="任意"
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </Field>
            <Field label="筋肉量 (kg)">
              <TextInput
                value={muscleMass}
                onChangeText={setMuscleMass}
                keyboardType="numeric"
                placeholder="任意"
                placeholderTextColor={placeholderColor}
                className={inputClass}
              />
            </Field>
          </View>
          <View>
            <Text className="mb-1 text-sm text-gray-400">メモ</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={placeholderColor}
              className={inputClass}
            />
          </View>
          <PrimaryButton label="記録する" onPress={handleSubmit} />
        </View>
      </Card>

      <View className="gap-3">
        {bodyRecords.map((r) => (
          <View
            key={r.id}
            className="flex-row items-center justify-between rounded-xl bg-gray-800 p-4">
            <View className="flex-1 pr-3">
              <Text className="font-medium text-white">
                {format(parseISO(r.date), 'yyyy年M月d日(E)', { locale: ja })}
              </Text>
              <Text className="mt-0.5 text-sm text-gray-400">
                体重: {r.weight}kg
                {r.bodyFatPercentage != null ? ` · 体脂肪率: ${r.bodyFatPercentage}%` : ''}
                {r.muscleMass != null ? ` · 筋肉量: ${r.muscleMass}kg` : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => deleteBodyRecord(r.id)}
              accessibilityRole="button"
              accessibilityLabel="この記録を削除">
              <Trash2 color={colors.gray500} size={16} />
            </Pressable>
          </View>
        ))}
        {bodyRecords.length === 0 && (
          <EmptyState
            icon={TrendingUp}
            text="まだ記録がありません"
            hint="体重を記録して変化を追いましょう"
          />
        )}
      </View>
    </ScrollView>
  );
}
