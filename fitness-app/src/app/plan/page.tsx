'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TrainingPlan, TrainingDay, PlannedExercise } from '@/types';
import { format } from 'date-fns';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

const emptyExercise = (): PlannedExercise => ({ name: '', sets: 3, reps: 10, weight: undefined });

export default function PlanPage() {
  const { trainingPlans, addTrainingPlan, deleteTrainingPlan } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [days, setDays] = useState<TrainingDay[]>([]);

  const addDay = () => {
    const usedDays = days.map((d) => d.dayOfWeek);
    const nextDay = [1, 2, 3, 4, 5, 6, 0].find((d) => !usedDays.includes(d)) ?? 0;
    setDays([...days, { dayOfWeek: nextDay, exercises: [emptyExercise()] }]);
  };

  const removeDay = (index: number) => setDays(days.filter((_, i) => i !== index));

  const updateDayOfWeek = (index: number, dow: number) =>
    setDays(days.map((d, i) => (i === index ? { ...d, dayOfWeek: dow } : d)));

  const addExToDay = (dayIndex: number) =>
    setDays(days.map((d, i) => i === dayIndex ? { ...d, exercises: [...d.exercises, emptyExercise()] } : d));

  const removeExFromDay = (dayIndex: number, exIndex: number) =>
    setDays(days.map((d, i) => i === dayIndex ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIndex) } : d));

  const updateEx = (dayIndex: number, exIndex: number, field: keyof PlannedExercise, value: string | number) =>
    setDays(days.map((d, i) =>
      i === dayIndex
        ? { ...d, exercises: d.exercises.map((e, j) => j === exIndex ? { ...e, [field]: value } : e) }
        : d
    ));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plan: TrainingPlan = {
      id: crypto.randomUUID(),
      name: planName,
      description: planDescription,
      days,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };
    addTrainingPlan(plan);
    setPlanName('');
    setPlanDescription('');
    setDays([]);
    setShowForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">トレーニングプラン</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          新規プラン
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">プランを作成</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-1">プラン名</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="週3日筋トレプラン"
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">説明</label>
              <textarea
                value={planDescription}
                onChange={(e) => setPlanDescription(e.target.value)}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-400 text-sm">トレーニング日</label>
                <button type="button" onClick={addDay} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
                  <Plus size={16} /> 日を追加
                </button>
              </div>
              <div className="space-y-4">
                {days.map((day, dayIndex) => (
                  <div key={dayIndex} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <select
                        value={day.dayOfWeek}
                        onChange={(e) => updateDayOfWeek(dayIndex, Number(e.target.value))}
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      >
                        {dayNames.map((name, i) => (
                          <option key={i} value={i}>{name}曜日</option>
                        ))}
                      </select>
                      <button type="button" onClick={() => removeDay(dayIndex)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {day.exercises.map((ex, exIndex) => (
                        <div key={exIndex} className="grid grid-cols-5 gap-2 items-end">
                          <div className="col-span-2">
                            <input
                              type="text"
                              value={ex.name}
                              onChange={(e) => updateEx(dayIndex, exIndex, 'name', e.target.value)}
                              placeholder="種目名"
                              className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white text-sm"
                            />
                          </div>
                          <input
                            type="number"
                            value={ex.sets}
                            onChange={(e) => updateEx(dayIndex, exIndex, 'sets', Number(e.target.value))}
                            placeholder="セット"
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white text-sm"
                          />
                          <input
                            type="number"
                            value={ex.reps}
                            onChange={(e) => updateEx(dayIndex, exIndex, 'reps', Number(e.target.value))}
                            placeholder="レップ"
                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white text-sm"
                          />
                          <button type="button" onClick={() => removeExFromDay(dayIndex, exIndex)} className="text-red-400 hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addExToDay(dayIndex)}
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 mt-2"
                      >
                        <Plus size={14} /> 種目を追加
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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

      <div className="space-y-4">
        {trainingPlans.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <p className="text-gray-500">トレーニングプランがありません</p>
          </div>
        ) : (
          trainingPlans.map((plan) => (
            <div key={plan.id} className="bg-gray-800 rounded-xl border border-gray-700">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">{plan.days.length}日/週 · 作成: {plan.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                      className="text-gray-400 hover:text-white p-2"
                    >
                      {expandedPlan === plan.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button onClick={() => deleteTrainingPlan(plan.id)} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
              {expandedPlan === plan.id && (
                <div className="border-t border-gray-700 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plan.days
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((day, i) => (
                        <div key={i} className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-blue-400 font-medium mb-2">{dayNames[day.dayOfWeek]}曜日</h4>
                          <ul className="space-y-1">
                            {day.exercises.map((ex, j) => (
                              <li key={j} className="text-gray-300 text-sm">
                                {ex.name} - {ex.sets}×{ex.reps}
                                {ex.weight != null && ` @ ${ex.weight}kg`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
