'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, parseISO, isToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { MealType } from '@/types';

const mealLabels: Record<MealType, string> = {
  breakfast: '朝食', lunch: '昼食', dinner: '夕食', snack: '間食',
};

export default function MealPage() {
  const { mealEntries, addMealEntry, deleteMealEntry } = useAppStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [meal, setMeal] = useState<MealType>('breakfast');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);

  const todayEntries = mealEntries.filter((e) => isToday(parseISO(e.date)));
  const todayTotals = todayEntries.reduce(
    (acc, e) => ({ cal: acc.cal + e.calories, p: acc.p + e.protein, c: acc.c + e.carbs, f: acc.f + e.fat }),
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addMealEntry({ id: crypto.randomUUID(), date, meal, name, calories, protein, carbs, fat });
    setName(''); setCalories(0); setProtein(0); setCarbs(0); setFat(0);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">食事管理</h2>

      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'カロリー', value: `${todayTotals.cal} kcal`, color: 'text-orange-400' },
          { label: 'タンパク質', value: `${todayTotals.p} g`, color: 'text-blue-400' },
          { label: '炭水化物', value: `${todayTotals.c} g`, color: 'text-yellow-400' },
          { label: '脂質', value: `${todayTotals.f} g`, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className={`font-bold text-lg ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">日付</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">食事区分</label>
            <select value={meal} onChange={(e) => setMeal(e.target.value as MealType)}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm">
              {(Object.keys(mealLabels) as MealType[]).map((k) => (
                <option key={k} value={k}>{mealLabels[k]}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">食品名</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 鶏むね肉 200g"
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'カロリー(kcal)', val: calories, set: setCalories },
            { label: 'タンパク質(g)', val: protein, set: setProtein },
            { label: '炭水化物(g)', val: carbs, set: setCarbs },
            { label: '脂質(g)', val: fat, set: setFat },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="text-xs text-gray-400 block mb-1">{label}</label>
              <input type="number" value={val} onChange={(e) => set(Number(e.target.value))}
                className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
            </div>
          ))}
        </div>
        <button type="submit" disabled={!name}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-2 rounded-lg font-medium">
          記録する
        </button>
      </form>

      <div className="space-y-3">
        {mealEntries.map((entry) => (
          <div key={entry.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{mealLabels[entry.meal]}</span>
                <span className="text-xs text-gray-400">{format(parseISO(entry.date), 'M月d日', { locale: ja })}</span>
              </div>
              <p className="font-medium text-sm">{entry.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{entry.calories}kcal · P:{entry.protein}g C:{entry.carbs}g F:{entry.fat}g</p>
            </div>
            <button onClick={() => deleteMealEntry(entry.id)} className="text-gray-500 hover:text-red-400">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {mealEntries.length === 0 && <p className="text-gray-500 text-center py-8">記録がありません</p>}
      </div>
    </div>
  );
}
