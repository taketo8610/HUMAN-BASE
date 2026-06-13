'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { format, parseISO, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trash2 } from 'lucide-react';

export default function BodyPage() {
  const { bodyRecords, addBodyRecord, deleteBodyRecord } = useAppStore();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState(70);
  const [bodyFat, setBodyFat] = useState<number | ''>('');
  const [muscleMass, setMuscleMass] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBodyRecord({
      id: crypto.randomUUID(), date, weight,
      bodyFatPercentage: bodyFat !== '' ? Number(bodyFat) : undefined,
      muscleMass: muscleMass !== '' ? Number(muscleMass) : undefined,
      notes,
    });
    setNotes('');
  };

  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = subDays(new Date(), 29 - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const record = bodyRecords.find((r) => r.date === dateStr);
    return { date: format(d, 'M/d'), weight: record?.weight, bodyFat: record?.bodyFatPercentage };
  }).filter((d) => d.weight !== undefined);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">体型トラッキング</h2>

      <div className="bg-gray-800 rounded-xl p-4 mb-8">
        <h3 className="font-semibold mb-4">推移グラフ（30日間）</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 40]} stroke="#6b7280" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="weight" name="体重(kg)" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="bodyFat" name="体脂肪率(%)" stroke="#60a5fa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-16 text-sm">データがありません</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-6 mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">日付</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">体重 (kg)</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">体脂肪率 (%)</label>
            <input type="number" step="0.1" value={bodyFat} onChange={(e) => setBodyFat(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="任意" className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">筋肉量 (kg)</label>
            <input type="number" step="0.1" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="任意" className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">メモ</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 py-2 rounded-lg font-medium">
          記録する
        </button>
      </form>

      <div className="space-y-3">
        {bodyRecords.map((r) => (
          <div key={r.id} className="bg-gray-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{format(parseISO(r.date), 'yyyy年M月d日(E)', { locale: ja })}</p>
              <p className="text-gray-400 text-sm mt-0.5">
                体重: {r.weight}kg
                {r.bodyFatPercentage != null && ` · 体脂肪率: ${r.bodyFatPercentage}%`}
                {r.muscleMass != null && ` · 筋肉量: ${r.muscleMass}kg`}
              </p>
            </div>
            <button onClick={() => deleteBodyRecord(r.id)} className="text-gray-500 hover:text-red-400">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {bodyRecords.length === 0 && <p className="text-gray-500 text-center py-8">記録がありません</p>}
      </div>
    </div>
  );
}
