'use client';

import { useAppStore } from '@/store/useAppStore';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Dumbbell, Flame, Scale } from 'lucide-react';

export default function Dashboard() {
  const { workoutLogs, mealEntries, bodyRecords } = useAppStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayWorkouts = workoutLogs.filter((log) => log.date === today);
  const todayMeals = mealEntries.filter((entry) => entry.date === today);
  const totalCaloriesToday = todayMeals.reduce((sum, m) => sum + m.calories, 0);
  const latestWeight = bodyRecords.length > 0
    ? [...bodyRecords].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const recentWorkouts = [...workoutLogs]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return format(d, 'yyyy-MM-dd');
  });

  const weightChartData = last7Days.map((date) => {
    const record = bodyRecords.find((r) => r.date === date);
    return {
      date: format(new Date(date), 'M/d'),
      weight: record?.weight ?? null,
    };
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-8">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Dumbbell size={20} className="text-white" />
            </div>
            <span className="text-gray-400 text-sm">今日のワークアウト</span>
          </div>
          <p className="text-3xl font-bold text-white">{todayWorkouts.length}</p>
          <p className="text-gray-500 text-sm mt-1">セッション完了</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Flame size={20} className="text-white" />
            </div>
            <span className="text-gray-400 text-sm">今日のカロリー</span>
          </div>
          <p className="text-3xl font-bold text-white">{totalCaloriesToday}</p>
          <p className="text-gray-500 text-sm mt-1">kcal 摂取</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Scale size={20} className="text-white" />
            </div>
            <span className="text-gray-400 text-sm">最新体重</span>
          </div>
          <p className="text-3xl font-bold text-white">
            {latestWeight ? `${latestWeight.weight} kg` : '---'}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            {latestWeight ? latestWeight.date : '記録なし'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">最近のワークアウト</h2>
          {recentWorkouts.length === 0 ? (
            <p className="text-gray-500">ワークアウトがありません</p>
          ) : (
            <ul className="space-y-3">
              {recentWorkouts.map((log) => (
                <li key={log.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{log.date}</span>
                    <span className="text-gray-400 text-sm">{log.duration}分</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {log.exercises.length}種目
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">体重推移（7日間）</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
                itemStyle={{ color: '#60A5FA' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
