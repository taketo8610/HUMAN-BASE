import { Fragment, useState } from 'react';
import { View, Text } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';

export interface ChartSeries {
  // x は 0..count-1 のインデックス（時間軸上の位置）。欠損日はスキップしてよい。
  points: { x: number; y: number }[];
  color: string;
  name: string;
}

interface Props {
  count: number; // x 軸の目盛り数（= 期間の日数など）
  startLabel: string;
  endLabel: string;
  series: ChartSeries[];
  height?: number;
}

// react-native-svg による軽量折れ線グラフ。Expo Go / Web どちらでも動く。
// 各系列を自身の min–max で正規化して重ね描き、推移の「形」を見せる。
export default function LineChart({ count, startLabel, endLabel, series, height = 200 }: Props) {
  const [width, setWidth] = useState(0);
  const padX = 8;
  const padTop = 12;
  const padBottom = 8;
  const chartW = Math.max(0, width - padX * 2);
  const chartH = Math.max(0, height - padTop - padBottom);

  const xAt = (x: number) => (count <= 1 ? padX + chartW / 2 : padX + (x / (count - 1)) * chartW);

  return (
    <View>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            {series.map((s, si) => {
              const ys = s.points.map((p) => p.y);
              const min = Math.min(...ys);
              const max = Math.max(...ys);
              const range = max - min || 1;
              const yAt = (v: number) => padTop + chartH - ((v - min) / range) * chartH;
              const polyPoints = s.points.map((p) => `${xAt(p.x)},${yAt(p.y)}`).join(' ');
              return (
                <Fragment key={si}>
                  {s.points.length > 1 && (
                    <Polyline points={polyPoints} fill="none" stroke={s.color} strokeWidth={2} />
                  )}
                  {s.points.map((p) => (
                    <Circle key={p.x} cx={xAt(p.x)} cy={yAt(p.y)} r={3} fill={s.color} />
                  ))}
                </Fragment>
              );
            })}
          </Svg>
        )}
      </View>

      <View className="mt-1 flex-row justify-between">
        <Text className="text-[10px] text-gray-500">{startLabel}</Text>
        <Text className="text-[10px] text-gray-500">{endLabel}</Text>
      </View>

      {series.length > 1 && (
        <View className="mt-2 flex-row justify-center gap-4">
          {series.map((s) => (
            <View key={s.name} className="flex-row items-center gap-1.5">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
              <Text className="text-xs text-gray-400">{s.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
