'use client';
import { useAppStore } from '@/store/useAppStore';
import { format, subDays, isToday, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Dumbbell, Flame, Scale } from 'lucide-react';

export default function Dashboard() {
  const { workoutLogs, mealEntries, bodyRecords } = useAppStore();

  const todayWorkout = workoutLogs.filter((l) => isToday(parseISO(l.date)));
  const todayMeals = mealEntries.filter((e) => isToday(parseISO(e.date)));
  const todayCalories = todayMeals.reduce((sum, e) => sum + e.calories, 0);
  const latestWeight = bodyRecords[0]?.weight ?? null;

  const weightData = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const record = bodyRecords.find((r) => r.date === dateStr);
    return { date: format(d, 'M/d'), weight: record?.weight ?? null };
  }).filter((d) => d.weight !== null);

  const recentLogs = workoutLogs.slice(0, 3);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">ダッシュボード</h2>
      <p className="text-gray-400 mb-6">{format(new Date(), 'yyyy年M月d日(E)', { locale: ja })}</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-orange-500/20 p-3 rounded-lg"><Dumbbell className="text-orange-400" size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm">今日のワークアウト</p>
            <p className="text-2xl font-bold">{todayWorkout.length}<span className="text-sm text-gray-400 ml-1">件</span></p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-red-500/20 p-3 rounded-lg"><Flame className="text-red-400" size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm">今日の摂取カロリー</p>
            <p className="text-2xl font-bold">{todayCalories}<span className="text-sm text-gray-400 ml-1">kcal</span></p>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
          <div className="bg-blue-500/20 p-3 rounded-lg"><Scale className="text-blue-400" size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm">最新体重</p>
            <p className="text-2xl font-bold">{latestWeight ?? '--'}<span className="text-sm text-gray-400 ml-1">kg</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold mb-4">体重推移（7日間）</h3>
          {weightData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis domain={['auto', 'auto']} stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-16">体重データがありません</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold mb-4">最近のワークアウト</h3>
          {recentLogs.length > 0 ? (
            <ul className="space-y-3">
              {recentLogs.map((log) => (
                <li key={log.id} className="bg-gray-700 rounded-lg p-3">
                  <p className="font-medium text-sm">{format(parseISO(log.date), 'M月d日(E)', { locale: ja })}</p>
                  <p className="text-gray-400 text-xs mt-1">{log.exercises.length}種目 · {log.duration}分</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm text-center py-16">ワークアウト記録がありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
