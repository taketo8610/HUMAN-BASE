'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WorkoutLog, WorkoutSet } from '@/types';
import { format } from 'date-fns';
import { Plus, Trash2, X } from 'lucide-react';

const emptyExercise = (): WorkoutSet => ({
  id: crypto.randomUUID(),
  exercise: '',
  sets: 3,
  reps: 10,
  weight: 0,
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
});

export default function WorkoutPage() {
  const { workoutLogs, addWorkoutLog, deleteWorkoutLog } = useAppStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutSet[]>([emptyExercise()]);
  const [showForm, setShowForm] = useState(false);

  const addExercise = () => setExercises([...exercises, emptyExercise()]);

  const removeExercise = (id: string) =>
    setExercises(exercises.filter((e) => e.id !== id));

  const updateExercise = (id: string, field: keyof WorkoutSet, value: string | number) =>
    setExercises(exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const log: WorkoutLog = {
      id: crypto.randomUUID(),
      date,
      exercises,
      duration,
      notes,
    };
    addWorkoutLog(log);
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setDuration(60);
    setNotes('');
    setExercises([emptyExercise()]);
    setShowForm(false);
  };

  const sortedLogs = [...workoutLogs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">ワークアウトログ</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          新規追加
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">ワークアウトを記録</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">日付</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">時間（分）</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-400 text-sm">エクササイズ</label>
                <button
                  type="button"
                  onClick={addExercise}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  <Plus size={16} /> 追加
                </button>
              </div>
              <div className="space-y-3">
                {exercises.map((ex) => (
                  <div key={ex.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="grid grid-cols-5 gap-3 items-end">
                      <div className="col-span-2">
                        <label className="text-gray-400 text-xs block mb-1">種目名</label>
                        <input
                          type="text"
                          value={ex.exercise}
                          onChange={(e) => updateExercise(ex.id, 'exercise', e.target.value)}
                          placeholder="ベンチプレス"
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">セット</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(ex.id, 'sets', Number(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs block mb-1">レップ</label>
                        <input
                          type="number"
                          value={ex.reps}
                          onChange={(e) => updateExercise(ex.id, 'reps', Number(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white text-sm"
                        />
                      </div>
                      <div className="flex gap-2 items-end">
                        <div className="flex-1">
                          <label className="text-gray-400 text-xs block mb-1">重量(kg)</label>
                          <input
                            type="number"
                            value={ex.weight}
                            onChange={(e) => updateExercise(ex.id, 'weight', Number(e.target.value))}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1.5 text-white text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExercise(ex.id)}
                          className="text-red-400 hover:text-red-300 mb-1.5"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-1">メモ</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {sortedLogs.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <p className="text-gray-500">ワークアウトログがありません</p>
          </div>
        ) : (
          sortedLogs.map((log) => (
            <div key={log.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white font-semibold text-lg">{log.date}</h3>
                  <p className="text-gray-400 text-sm">{log.duration}分 · {log.exercises.length}種目</p>
                </div>
                <button
                  onClick={() => deleteWorkoutLog(log.id)}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {log.exercises.map((ex) => (
                  <div key={ex.id} className="bg-gray-700 rounded-lg p-3">
                    <p className="text-white font-medium">{ex.exercise}</p>
                    <p className="text-gray-400 text-sm">
                      {ex.sets}セット × {ex.reps}レップ · {ex.weight}kg
                    </p>
                  </div>
                ))}
              </div>
              {log.notes && (
                <p className="text-gray-400 text-sm mt-3 border-t border-gray-700 pt-3">{log.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
