'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Trash2, X } from 'lucide-react';
import { PlannedExercise, TrainingDay, DayOfWeek } from '@/types';

const dayNames: Record<DayOfWeek, string> = { 0: '日', 1: '月', 2: '火', 3: '水', 4: '木', 5: '金', 6: '土' };

export default function PlanPage() {
  const { trainingPlans, addTrainingPlan, deleteTrainingPlan } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState<TrainingDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(1);

  const addDay = () => {
    if (days.find((d) => d.dayOfWeek === selectedDay)) return;
    setDays([...days, { dayOfWeek: selectedDay, exercises: [] }]);
  };

  const addExercise = (dayOfWeek: DayOfWeek) => {
    setDays(days.map((d) =>
      d.dayOfWeek === dayOfWeek
        ? { ...d, exercises: [...d.exercises, { id: crypto.randomUUID(), name: '', sets: 3, reps: 10 }] }
        : d
    ));
  };

  const updateExercise = (dayOfWeek: DayOfWeek, exId: string, field: keyof PlannedExercise, value: string | number) => {
    setDays(days.map((d) =>
      d.dayOfWeek === dayOfWeek
        ? { ...d, exercises: d.exercises.map((e) => (e.id === exId ? { ...e, [field]: value } : e)) }
        : d
    ));
  };

  const removeExercise = (dayOfWeek: DayOfWeek, exId: string) => {
    setDays(days.map((d) =>
      d.dayOfWeek === dayOfWeek ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) } : d
    ));
  };

  const removeDay = (dayOfWeek: DayOfWeek) => setDays(days.filter((d) => d.dayOfWeek !== dayOfWeek));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || days.length === 0) return;
    addTrainingPlan({ id: crypto.randomUUID(), name, description, days, createdAt: new Date().toISOString() });
    setName(''); setDescription(''); setDays([]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">トレーニングプラン</h2>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">プラン名</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 胸・肩・三頭"
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">説明</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-400 block mb-1">曜日を追加</label>
            <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value) as DayOfWeek)}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm">
              {(Object.entries(dayNames) as [string, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}曜日</option>
              ))}
            </select>
          </div>
          <button type="button" onClick={addDay} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">
            <Plus size={16} />
          </button>
        </div>

        {days.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((day) => (
          <div key={day.dayOfWeek} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">{dayNames[day.dayOfWeek]}曜日</h4>
              <div className="flex gap-2">
                <button type="button" onClick={() => addExercise(day.dayOfWeek)}
                  className="text-xs bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded flex items-center gap-1">
                  <Plus size={11} /> 種目
                </button>
                <button type="button" onClick={() => removeDay(day.dayOfWeek)} className="text-gray-400 hover:text-red-400">
                  <X size={16} />
                </button>
              </div>
            </div>
            {day.exercises.map((ex) => (
              <div key={ex.id} className="grid grid-cols-4 gap-2 mb-2 items-center">
                <input placeholder="種目名" value={ex.name}
                  onChange={(e) => updateExercise(day.dayOfWeek, ex.id, 'name', e.target.value)}
                  className="col-span-2 bg-gray-600 rounded px-2 py-1 text-sm" />
                <input type="number" placeholder="セット" value={ex.sets}
                  onChange={(e) => updateExercise(day.dayOfWeek, ex.id, 'sets', Number(e.target.value))}
                  className="bg-gray-600 rounded px-2 py-1 text-sm" />
                <div className="flex gap-1 items-center">
                  <input type="number" placeholder="回数" value={ex.reps}
                    onChange={(e) => updateExercise(day.dayOfWeek, ex.id, 'reps', Number(e.target.value))}
                    className="w-full bg-gray-600 rounded px-2 py-1 text-sm" />
                  <button type="button" onClick={() => removeExercise(day.dayOfWeek, ex.id)}
                    className="text-gray-400 hover:text-red-400"><X size={13} /></button>
                </div>
              </div>
            ))}
            {day.exercises.length === 0 && <p className="text-gray-500 text-xs">種目を追加してください</p>}
          </div>
        ))}

        <button type="submit" disabled={!name || days.length === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-2 rounded-lg font-medium">
          プランを作成
        </button>
      </form>

      <div className="space-y-4">
        {trainingPlans.map((plan) => (
          <div key={plan.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                {plan.description && <p className="text-gray-400 text-sm">{plan.description}</p>}
                <p className="text-gray-500 text-xs mt-1">{format(parseISO(plan.createdAt), 'yyyy年M月d日作成', { locale: ja })}</p>
              </div>
              <button onClick={() => deleteTrainingPlan(plan.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {plan.days.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((d) => (
                <span key={d.dayOfWeek} className="text-xs bg-gray-700 px-2 py-1 rounded">
                  {dayNames[d.dayOfWeek]}曜 ({d.exercises.length}種目)
                </span>
              ))}
            </div>
          </div>
        ))}
        {trainingPlans.length === 0 && <p className="text-gray-500 text-center py-8">プランがありません</p>}
      </div>
    </div>
  );
}
