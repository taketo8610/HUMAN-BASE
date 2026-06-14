import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';

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

  // Elapsed stopwatch
  useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Rest countdown
  useEffect(() => {
    if (restRemaining === null || restPaused) return;

    if (restRemaining <= 0) {
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

  const handlePauseResume = useCallback(() => setRestPaused((p) => !p), []);
  const handleReset = useCallback(() => {
    setRestRemaining(null);
    setRestPaused(false);
  }, []);

  const restDone = restRemaining !== null && restRemaining <= 0;
  const isResting = restRemaining !== null && restRemaining > 0;

  return (
    <View
      className={`absolute bottom-0 left-0 right-0 rounded-t-2xl pb-3 ${
        flashing ? 'bg-orange-500' : 'bg-gray-800'
      }`}>
      <View className="px-4 pb-2 pt-4">
        {exerciseName ? (
          <Text className="mb-2 text-center text-xs text-gray-400" numberOfLines={1}>
            {exerciseName}
          </Text>
        ) : null}

        <View className="mb-4 flex-row gap-4">
          {/* Elapsed */}
          <View className="flex-1 items-center rounded-xl bg-gray-700 p-3">
            <Text className="mb-1 text-xs text-gray-400">経過時間</Text>
            <Text className="text-3xl font-bold text-white">{formatTime(elapsed)}</Text>
            <Text className="mt-1 text-xs text-gray-500">{setsCompleted}セット完了</Text>
          </View>

          {/* Rest timer */}
          <View className="flex-1 items-center rounded-xl bg-gray-700 p-3">
            <Text className="mb-1 text-xs text-gray-400">休憩タイマー</Text>
            {restRemaining === null ? (
              <Text className="text-3xl font-bold text-green-400">Ready</Text>
            ) : restDone ? (
              <Text className="text-3xl font-bold text-green-400">GO!</Text>
            ) : (
              <Text className={`text-5xl font-bold ${flashing ? 'text-white' : 'text-orange-400'}`}>
                {formatTime(restRemaining)}
              </Text>
            )}

            {restRemaining !== null && !restDone && (
              <View className="mt-2 flex-row justify-center gap-2">
                <Pressable onPress={handlePauseResume} className="rounded-lg bg-gray-600 px-3 py-1">
                  <Text className="text-xs text-white">{restPaused ? '▶ 再開' : '⏸ 一時停止'}</Text>
                </Pressable>
                <Pressable onPress={handleReset} className="rounded-lg bg-gray-600 px-3 py-1">
                  <Text className="text-xs text-white">✕ リセット</Text>
                </Pressable>
              </View>
            )}
            {restDone && (
              <Pressable onPress={handleReset} className="mt-2 rounded-lg bg-green-600 px-3 py-1">
                <Text className="text-xs text-white">✕ クリア</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Rest duration selector */}
        <View className="mb-3 flex-row justify-center gap-2">
          {REST_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                setRestDuration(opt.value);
                if (isResting) setRestRemaining(opt.value);
              }}
              className={`rounded-lg px-3 py-1 ${
                restDuration === opt.value ? 'bg-orange-500' : 'bg-gray-700'
              }`}>
              <Text
                className={`text-xs ${restDuration === opt.value ? 'text-white' : 'text-gray-300'}`}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Set complete button */}
        <Pressable
          onPress={handleSetComplete}
          className="mb-2 rounded-xl bg-orange-500 py-4 active:bg-orange-700">
          <Text className="text-center text-lg font-bold text-white">セット完了 ✓</Text>
        </Pressable>
      </View>
    </View>
  );
}
