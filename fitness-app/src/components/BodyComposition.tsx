import { View, Text } from 'react-native';

import { Sex } from '@/types';
import { bmiOf, estimateBodyFat, HEALTHY_BMI, healthyBodyFatRange } from '@/lib/fitness';
import { colors } from '@/lib/colors';
import BodySilhouette from '@/components/BodySilhouette';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// 軸上に健康ゾーンを帯で示し、現在(灰)・目標(橙)のマーカーを重ねるバー。
function RangeBar({
  axisMin,
  axisMax,
  zone,
  markers,
}: {
  axisMin: number;
  axisMax: number;
  zone: [number, number];
  markers: { value: number; color: string }[];
}) {
  const span = axisMax - axisMin;
  const pct = (v: number) =>
    `${((clamp(v, axisMin, axisMax) - axisMin) / span) * 100}%` as `${number}%`;
  const zoneWidth = `${((zone[1] - zone[0]) / span) * 100}%` as `${number}%`;
  return (
    <View className="relative h-2 justify-center rounded-full bg-gray-700">
      <View
        className="absolute h-2 rounded-full bg-green-500/40"
        style={{ left: pct(zone[0]), width: zoneWidth }}
      />
      {markers.map((m, i) => (
        <View
          key={i}
          className="absolute h-4 w-1 rounded-full"
          style={{ left: pct(m.value), backgroundColor: m.color }}
        />
      ))}
    </View>
  );
}

interface Props {
  sex: Sex;
  height: number;
  age: number;
  currentWeight: number;
  targetWeight: number;
  currentBodyFat?: number;
  targetBodyFat?: number;
  showBmiZone?: boolean;
  showFatZone?: boolean;
}

export default function BodyComposition({
  sex,
  height,
  age,
  currentWeight,
  targetWeight,
  currentBodyFat,
  targetBodyFat,
  showBmiZone,
  showFatZone,
}: Props) {
  const curBmi = bmiOf(currentWeight, height);
  const tgtBmi = bmiOf(targetWeight, height);
  const curBf = currentBodyFat ?? estimateBodyFat(curBmi, sex, age);
  const tgtBf = targetBodyFat ?? estimateBodyFat(tgtBmi, sex, age);

  return (
    <View className="gap-4 rounded-xl bg-gray-800 p-4">
      <View className="flex-row items-end justify-center gap-3">
        <View className="items-center">
          <BodySilhouette sex={sex} bmi={curBmi} bodyFat={curBf} color={colors.gray500} />
          <Text className="mt-1 text-xs text-gray-400">現在 {currentWeight}kg</Text>
          <Text className="text-[10px] text-gray-500">
            BMI {curBmi.toFixed(1)} / 体脂肪 約{curBf}%
          </Text>
        </View>
        <Text className="pb-14 text-2xl text-orange-500">→</Text>
        <View className="items-center">
          <BodySilhouette sex={sex} bmi={tgtBmi} bodyFat={tgtBf} color={colors.orange400} />
          <Text className="mt-1 text-xs text-orange-400">目標 {Math.round(targetWeight)}kg</Text>
          <Text className="text-[10px] text-gray-500">
            BMI {tgtBmi.toFixed(1)} / 体脂肪 {targetBodyFat != null ? `${targetBodyFat}%` : `約${tgtBf}%`}
          </Text>
        </View>
      </View>

      {showBmiZone && (
        <View className="gap-1.5">
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-400">BMI 推奨ゾーン（標準）</Text>
            <Text className="text-xs text-gray-300">
              {HEALTHY_BMI[0]}〜{HEALTHY_BMI[1]}
            </Text>
          </View>
          <RangeBar
            axisMin={15}
            axisMax={32}
            zone={[HEALTHY_BMI[0], HEALTHY_BMI[1]]}
            markers={[
              { value: curBmi, color: colors.gray400 },
              { value: tgtBmi, color: colors.orange400 },
            ]}
          />
          <Text className="text-[10px] text-gray-500">現在（灰）→ 目標（橙）</Text>
        </View>
      )}

      {showFatZone && (
        <View className="gap-1.5">
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-400">
              健康的な体脂肪率（{sex === 'male' ? '男性' : '女性'}）
            </Text>
            <Text className="text-xs text-gray-300">
              {healthyBodyFatRange(sex)[0]}〜{healthyBodyFatRange(sex)[1]}%
            </Text>
          </View>
          <RangeBar
            axisMin={5}
            axisMax={40}
            zone={healthyBodyFatRange(sex)}
            markers={
              targetBodyFat != null
                ? [
                    { value: curBf, color: colors.gray400 },
                    { value: targetBodyFat, color: colors.orange400 },
                  ]
                : [{ value: curBf, color: colors.gray400 }]
            }
          />
        </View>
      )}
    </View>
  );
}
