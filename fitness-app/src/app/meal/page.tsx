'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MealEntry, MealType } from '@/types';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

const mealLabels: Record<MealType, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
};

export default function MealPage() {
  const { mealEntries, addMealEntry, deleteMealEntry } = useAppStore();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    date: today,
    meal: 'breakfast' as MealType,
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: MealEntry = { id: crypto.randomUUID(), ...form };
    addMealEntry(entry);
    setForm({ date: today, meal: 'breakfast', name: '', calories: 0, protein: 0, carbs: 0, fat: 0 });
    setShowForm(false);
  };

  const todayEntries = mealEntries.filter((e) => e.date === today);
  const totalCalories = todayEntries.reduce((s, e) => s + e.calories, 0);
  const totalProtein = todayEntries.reduce((s, e) => s + e.protein, 0);
  const totalCarbs = todayEntries.reduce((s, e) => s + e.carbs, 0);
  const totalFat = todayEntries.reduce((s, e) => s + e.fat, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">食事管理</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          食事を追加
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'カロリー', value: `${totalCalories} kcal`, color: 'text-orange-400' },
          { label: 'タンパク質', value: `${totalProtein} g`, color: 'text-blue-400' },
          { label: '炭水化物', value: `${totalCarbs} g`, color: 'text-yellow-400' },
          { label: '脂質', value: `${totalFat} g`, color: 'text-red-400' },
        ].map((item) => (
          <div key={item.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">食事を記録</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">日付</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">食事タイプ</label>
                <select
                  value={form.meal}
                  onChange={(e) => setForm({ ...form, meal: e.target.value as MealType })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  {(Object.entries(mealLabels) as [MealType, string][]).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">食品名</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="鶏むね肉"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'カロリー(kcal)', field: 'calories' as const },
                { label: 'タンパク質(g)', field: 'protein' as const },
                { label: '炭水化物(g)', field: 'carbs' as const },
                { label: '脂質(g)', field: 'fat' as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="text-gray-400 text-sm block mb-1">{label}</label>
                  <input
                    type="number"
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                保存
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">今日の食事</h2>
        </div>
        {todayEntries.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">食事が記録されていません</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {todayEntries.map((entry) => (
              <li key={entry.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-900 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                      {mealLabels[entry.meal]}
                    </span>
                    <span className="text-white font-medium">{entry.name}</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {entry.calories}kcal · P:{entry.protein}g · C:{entry.carbs}g · F:{entry.fat}g
                  </p>
                </div>
                <button onClick={() => deleteMealEntry(entry.id)} className="text-red-400 hover:text-red-300 p-2">
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
