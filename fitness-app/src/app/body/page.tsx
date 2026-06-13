'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BodyRecord } from '@/types';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function BodyPage() {
  const { bodyRecords, addBodyRecord, deleteBodyRecord } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
    bodyFatPercentage: '' as string | number,
    muscleMass: '' as string | number,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: BodyRecord = {
      id: crypto.randomUUID(),
      date: form.date,
      weight: form.weight,
      bodyFatPercentage: form.bodyFatPercentage !== '' ? Number(form.bodyFatPercentage) : undefined,
      muscleMass: form.muscleMass !== '' ? Number(form.muscleMass) : undefined,
      notes: form.notes !== '' ? form.notes : undefined,
    };
    addBodyRecord(record);
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), weight: 0, bodyFatPercentage: '', muscleMass: '', notes: '' });
    setShowForm(false);
  };

  const sortedRecords = [...bodyRecords].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sortedRecords.map((r) => ({
    date: format(new Date(r.date), 'M/d'),
    weight: r.weight,
    bodyFat: r.bodyFatPercentage,
  }));

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">体型トラッキング</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          記録を追加
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">体型を記録</h2>
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
                <label className="text-gray-400 text-sm block mb-1">体重 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                  required
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">体脂肪率 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.bodyFatPercentage}
                  onChange={(e) => setForm({ ...form, bodyFatPercentage: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">筋肉量 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.muscleMass}
                  onChange={(e) => setForm({ ...form, muscleMass: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-1">メモ</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
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

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">体重推移</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F9FAFB' }}
            />
            <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} name="体重(kg)" />
            <Line type="monotone" dataKey="bodyFat" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 4 }} name="体脂肪率(%)" connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">記録一覧</h2>
        </div>
        {sortedRecords.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">記録がありません</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {[...sortedRecords].reverse().map((record) => (
              <li key={record.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{record.date}</p>
                  <p className="text-gray-400 text-sm">
                    体重: {record.weight}kg
                    {record.bodyFatPercentage != null && ` · 体脂肪: ${record.bodyFatPercentage}%`}
                    {record.muscleMass != null && ` · 筋肉量: ${record.muscleMass}kg`}
                  </p>
                </div>
                <button onClick={() => deleteBodyRecord(record.id)} className="text-red-400 hover:text-red-300 p-2">
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
