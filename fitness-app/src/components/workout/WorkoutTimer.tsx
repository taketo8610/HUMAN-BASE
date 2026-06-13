'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

type RestDuration = 30 | 60 | 90 | 120 | 180;

const REST_OPTIONS: { value: RestDuration; label: string }[] = [
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
  { value: 90, label: '90s' },
  { value: 120, label: '2分' },
  { value: 180, label: '3分' },
];

interface WorkoutTimerProps {
  exerciseName?: string;
}

export default function WorkoutTimer({ exerciseName }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0); // seconds
  const [restDuration, setRestDuration] = useState<RestDuration>(60);
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restPaused, setRestPaused] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [setsCompleted, setSetsCompleted] = useState(0);

  const elapsedRef = useRef(elapsed);
  elapsedRef.current = elapsed;

  const restRef = useRef(restRemaining);
  restRef.current = restRemaining;

  const restPausedRef = useRef(restPaused);
  restPausedRef.current = restPaused;

  // Elapsed stopwatch
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Rest countdown
  useEffect(() => {
    if (restRemaining === null || restPaused) return;

    if (restRemaining <= 0) {
      // Flash orange
      setFlashing(true);
      const flashTimeout = setTimeout(() => setFlashing(false), 2000);
      return () => clearTimeout(flashTimeout);
    }

    const id = setInterval(() => {
      setRestRemaining((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restRemaining, restPaused]);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  const handleSetComplete = useCallback(() => {
    setSetsCompleted((c) => c + 1);
    setRestRemaining(restDuration);
    setRestPaused(false);
  }, [restDuration]);

  const handlePauseResume = useCallback(() => {
    setRestPaused((p) => !p);
  }, []);

  const handleReset = useCallback(() => {
    setRestRemaining(null);
    setRestPaused(false);
  }, []);

  const restDone = restRemaining !== null && restRemaining <= 0;
  const isResting = restRemaining !== null && restRemaining > 0;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 rounded-t-2xl shadow-lg z-50 transition-colors duration-300 ${
        flashing ? 'bg-orange-500' : 'bg-gray-800'
      }`}
    >
      <div className="px-4 pt-4 pb-2">
        {exerciseName && (
          <p className="text-xs text-gray-400 text-center mb-2 truncate">{exerciseName}</p>
        )}

        {/* Two-section row */}
        <div className="flex gap-4 mb-4">
          {/* Elapsed */}
          <div className="flex-1 bg-gray-700 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">経過時間</p>
            <p className="text-3xl font-bold font-mono text-white">{formatTime(elapsed)}</p>
            <p className="text-xs text-gray-500 mt-1">{setsCompleted}セット完了</p>
          </div>

          {/* Rest timer */}
          <div className="flex-1 bg-gray-700 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">休憩タイマー</p>
            {restRemaining === null ? (
              <p className="text-3xl font-bold text-green-400">Ready</p>
            ) : restDone ? (
              <p className="text-3xl font-bold text-green-400 animate-pulse">GO!</p>
            ) : (
              <p
                className={`text-5xl font-bold font-mono transition-colors ${
                  flashing ? 'text-white' : 'text-orange-400'
                }`}
              >
                {formatTime(restRemaining)}
              </p>
            )}
            {/* Pause / Reset controls */}
            {restRemaining !== null && !restDone && (
              <div className="flex gap-2 justify-center mt-2">
                <button
                  onClick={handlePauseResume}
                  className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-lg"
                >
                  {restPaused ? '▶ 再開' : '⏸ 一時停止'}
                </button>
                <button
                  onClick={handleReset}
                  className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded-lg"
                >
                  ✕ リセット
                </button>
              </div>
            )}
            {restDone && (
              <button
                onClick={handleReset}
                className="text-xs bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg mt-2"
              >
                ✕ クリア
              </button>
            )}
          </div>
        </div>

        {/* Rest duration selector */}
        <div className="flex gap-2 justify-center mb-3">
          {REST_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setRestDuration(opt.value);
                if (isResting) setRestRemaining(opt.value);
              }}
              className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                restDuration === opt.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Set complete button */}
        <button
          onClick={handleSetComplete}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold py-4 rounded-xl text-lg mb-2 transition-colors"
        >
          セット完了 ✓
        </button>
      </div>
    </div>
  );
}
