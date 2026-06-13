'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Plus, Trash2, X } from 'lucide-react';
import { WorkoutSet } from '@/types';

export default function WorkoutPage() {
  const { workoutLogs, addWorkoutLog, deleteWorkoutLog } = useAppStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutSet[]>([]);

  const addExercise = () => {
    setExercises([...exercises, { id: crypto.randomUUID(), exercise: '', sets: 3, reps: 10, weight: 0 }]);
  };

  const updateExercise = (id: string, field: keyof WorkoutSet, value: string | number) => {
    setExercises(exercises.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeExercise = (id: string) => setExercises(exercises.filter((e) => e.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (exercises.length === 0) return;
    addWorkoutLog({ id: crypto.randomUUID(), date, exercises, duration, notes });
    setExercises([]);
    setNotes('');
    setDuration(60);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">ワークアウト記録</h2>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">日付</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">時間（分）</label>
            <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-400">種目</label>
            <button type="button" onClick={addExercise}
              className="text-xs bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-lg flex items-center gap-1">
              <Plus size={12} /> 追加
            </button>
          </div>
          {exercises.map((ex) => (
            <div key={ex.id} className="bg-gray-700 rounded-lg p-3 mb-2 grid grid-cols-5 gap-2 items-center">
              <input placeholder="種目名" value={ex.exercise}
                onChange={(e) => updateExercise(ex.id, 'exercise', e.target.value)}
                className="col-span-2 bg-gray-600 rounded px-2 py-1 text-sm" />
              <input type="number" placeholder="セット" value={ex.sets}
                onChange={(e) => updateExercise(ex.id, 'sets', Number(e.target.value))}
                className="bg-gray-600 rounded px-2 py-1 text-sm" />
              <input type="number" placeholder="回数" value={ex.reps}
                onChange={(e) => updateExercise(ex.id, 'reps', Number(e.target.value))}
                className="bg-gray-600 rounded px-2 py-1 text-sm" />
              <div className="flex gap-2 items-center">
                <input type="number" placeholder="kg" value={ex.weight}
                  onChange={(e) => updateExercise(ex.id, 'weight', Number(e.target.value))}
                  className="w-full bg-gray-600 rounded px-2 py-1 text-sm" />
                <button type="button" onClick={() => removeExercise(ex.id)} className="text-gray-400 hover:text-red-400">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-sm text-gray-400 block mb-1">メモ</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm resize-none" />
        </div>

        <button type="submit" disabled={exercises.length === 0}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 py-2 rounded-lg font-medium">
          記録する
        </button>
      </form>

      <div className="space-y-4">
        {workoutLogs.map((log) => (
          <div key={log.id} className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold">{format(parseISO(log.date), 'yyyy年M月d日(E)', { locale: ja })}</p>
                <p className="text-gray-400 text-xs">{log.exercises.length}種目 · {log.duration}分</p>
              </div>
              <button onClick={() => deleteWorkoutLog(log.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {log.exercises.map((ex) => (
                <div key={ex.id} className="text-sm text-gray-300 flex gap-4">
                  <span className="font-medium w-32">{ex.exercise}</span>
                  <span className="text-gray-400">{ex.sets}セット × {ex.reps}回 {ex.weight > 0 ? `@ ${ex.weight}kg` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {workoutLogs.length === 0 && <p className="text-gray-500 text-center py-8">記録がありません</p>}
      </div>
    </div>
  );
}
