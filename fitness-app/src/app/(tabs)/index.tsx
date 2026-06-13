import { ScrollView, View, Text } from 'react-native';
import { format, subDays, isToday, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Dumbbell, Flame, Scale, type LucideIcon } from 'lucide-react-native';

import { useAppStore } from '@/store/useAppStore';
import LineChart from '@/components/LineChart';
import { colors } from '@/lib/colors';

const goalLabel: Record<string, string> = { bulk: '増量', cut: '減量', maintain: '維持' };
const motivationMessages: Record<string, string> = {
  attractive: 'モテボディを目指して頑張りましょう！',
  health: '健康的な体づくりを続けましょう！',
  strength: '筋力アップを目指して頑張りましょう！',
  lose_fat: '体を絞って理想の体型へ！',
  muscle: '筋肉をつけて理想のボディへ！',
  custom: '目標に向かって頑張りましょう！',
};

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  unit,
}: {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  unit: string;
}) {
  return (
    <View className="flex-1 rounded-xl bg-gray-800 p-3">
      <View className={`mb-2 h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon color={iconColor} size={20} />
      </View>
      <Text className="text-[11px] text-gray-400">{label}</Text>
      <Text className="text-xl font-bold text-white">
        {value}
        <Text className="text-xs text-gray-400"> {unit}</Text>
      </Text>
    </View>
  );
}

export default function Dashboard() {
  const { workoutLogs, mealEntries, bodyRecords, userProfile } = useAppStore();

  const todayWorkout = workoutLogs.filter((l) => isToday(parseISO(l.date)));
  const todayMeals = mealEntries.filter((e) => isToday(parseISO(e.date)));
  const todayCalories = todayMeals.reduce((sum, e) => sum + e.calories, 0);
  const latestWeight = bodyRecords[0]?.weight ?? null;

  const weightData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const record = bodyRecords.find((r) => r.date === dateStr);
    return { date: format(d, 'M/d'), weight: record?.weight ?? null };
  }).filter((d): d is { date: string; weight: number } => d.weight !== null);

  const recentLogs = workoutLogs.slice(0, 3);

  return (
    <ScrollView
      className="flex-1 bg-gray-950"
      contentContainerStyle={{ padding: 20, gap: 20 }}>
      <Text className="text-gray-400">
        {format(new Date(), 'yyyy年M月d日(E)', { locale: ja })}
      </Text>

      {userProfile && (
        <View className="flex-row items-center justify-between rounded-xl border border-orange-500/30 bg-gray-800 p-4">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-bold text-orange-400">
              こんにちは！目標: {goalLabel[userProfile.goal] ?? userProfile.goal}
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              {motivationMessages[userProfile.motivation] ?? 'トレーニングを頑張りましょう！'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xl font-bold text-white">
              {userProfile.dailyCalorieTarget} kcal
            </Text>
            <Text className="text-xs text-gray-400">1日の目標カロリー</Text>
          </View>
        </View>
      )}

      <View className="flex-row gap-3">
        <StatCard
          icon={Dumbbell}
          iconColor={colors.orange400}
          iconBg="bg-orange-500/20"
          label="今日のワークアウト"
          value={todayWorkout.length}
          unit="件"
        />
        <StatCard
          icon={Flame}
          iconColor={colors.red400}
          iconBg="bg-red-500/20"
          label="今日の摂取カロリー"
          value={todayCalories}
          unit="kcal"
        />
        <StatCard
          icon={Scale}
          iconColor={colors.blue400}
          iconBg="bg-blue-500/20"
          label="最新体重"
          value={latestWeight ?? '--'}
          unit="kg"
        />
      </View>

      <View className="rounded-xl bg-gray-800 p-4">
        <Text className="mb-4 font-semibold text-white">体重推移（7日間）</Text>
        {weightData.length > 0 ? (
          <LineChart
            count={weightData.length}
            startLabel={weightData[0].date}
            endLabel={weightData[weightData.length - 1].date}
            series={[
              {
                points: weightData.map((d, i) => ({ x: i, y: d.weight })),
                color: colors.orange500,
                name: '体重',
              },
            ]}
          />
        ) : (
          <Text className="py-12 text-center text-sm text-gray-500">体重データがありません</Text>
        )}
      </View>

      <View className="rounded-xl bg-gray-800 p-4">
        <Text className="mb-4 font-semibold text-white">最近のワークアウト</Text>
        {recentLogs.length > 0 ? (
          <View className="gap-3">
            {recentLogs.map((log) => (
              <View key={log.id} className="rounded-lg bg-gray-700 p-3">
                <Text className="text-sm font-medium text-white">
                  {format(parseISO(log.date), 'M月d日(E)', { locale: ja })}
                </Text>
                <Text className="mt-1 text-xs text-gray-400">
                  {log.exercises.length}種目 · {log.duration}分
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className="py-12 text-center text-sm text-gray-500">ワークアウト記録がありません</Text>
        )}
      </View>
    </ScrollView>
  );
}
