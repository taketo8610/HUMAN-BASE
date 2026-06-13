import { View, Text } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { Motivation, Sex } from '@/types';
import { recommendBodyComposition, targetWeightFromBMI } from '@/lib/fitness';
import { colors } from '@/lib/colors';

// BMI に応じて胴・脚の太さが変わる簡易シルエット。体型の差を直感的に示す。
function Body({ bmi, color }: { bmi: number; color: string }) {
  const cx = 30;
  const torsoW = Math.min(34, Math.max(13, 20 * (bmi / 22)));
  const legW = Math.max(5, torsoW * 0.34);
  const armW = Math.max(4, torsoW * 0.2);
  return (
    <Svg width={64} height={104} viewBox="0 0 60 100">
      <Circle cx={cx} cy={11} r={7} fill={color} />
      <Rect x={cx - torsoW / 2} y={20} width={torsoW} height={36} rx={torsoW * 0.28} fill={color} />
      <Rect x={cx - torsoW / 2 - armW - 1} y={22} width={armW} height={28} rx={armW / 2} fill={color} />
      <Rect x={cx + torsoW / 2 + 1} y={22} width={armW} height={28} rx={armW / 2} fill={color} />
      <Rect x={cx - legW - 1} y={56} width={legW} height={36} rx={legW * 0.4} fill={color} />
      <Rect x={cx + 1} y={56} width={legW} height={36} rx={legW * 0.4} fill={color} />
    </Svg>
  );
}

// 軸上に推奨ゾーンをハイライトし、現在地マーカーを重ねるバー。
function RangeBar({
  axisMin,
  axisMax,
  zone,
  current,
  color,
}: {
  axisMin: number;
  axisMax: number;
  zone: [number, number];
  current?: number;
  color: string;
}) {
  const span = axisMax - axisMin;
  const pct = (v: number) =>
    `${((Math.min(Math.max(v, axisMin), axisMax) - axisMin) / span) * 100}%` as `${number}%`;
  const zoneWidth = `${((zone[1] - zone[0]) / span) * 100}%` as `${number}%`;
  return (
    <View className="relative h-2 justify-center rounded-full bg-gray-700">
      <View
        className="absolute h-2 rounded-full"
        style={{ left: pct(zone[0]), width: zoneWidth, backgroundColor: color }}
      />
      {current != null && (
        <View
          className="absolute h-4 w-1 rounded-full bg-white"
          style={{ left: pct(current) }}
        />
      )}
    </View>
  );
}

interface Props {
  motivation: Motivation;
  sex: Sex;
  height: number;
  currentWeight: number;
}

export default function BodyComposition({ motivation, sex, height, currentWeight }: Props) {
  const target = recommendBodyComposition(motivation, sex);
  const heightM = height / 100;
  const currentBMI = heightM > 0 ? currentWeight / (heightM * heightM) : 0;
  const targetBMI = (target.bmiRange[0] + target.bmiRange[1]) / 2;
  const targetWeight = targetWeightFromBMI(target.bmiRange, height);

  return (
    <View className="gap-4 rounded-xl bg-gray-800 p-4">
      <View>
        <Text className="text-base font-bold text-orange-400">{target.label}</Text>
        <Text className="mt-1 text-sm text-gray-300">{target.description}</Text>
      </View>

      <View className="flex-row items-end justify-center gap-6">
        <View className="items-center">
          <Body bmi={currentBMI} color={colors.gray500} />
          <Text className="mt-1 text-xs text-gray-400">現在 {currentWeight}kg</Text>
          <Text className="text-[10px] text-gray-500">BMI {currentBMI.toFixed(1)}</Text>
        </View>
        <Text className="pb-8 text-2xl text-orange-500">→</Text>
        <View className="items-center">
          <Body bmi={targetBMI} color={colors.orange500} />
          <Text className="mt-1 text-xs text-orange-400">目標 〜{targetWeight}kg</Text>
          <Text className="text-[10px] text-gray-500">BMI {targetBMI.toFixed(1)}</Text>
        </View>
      </View>

      <View className="gap-1.5">
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-400">BMI 推奨ゾーン</Text>
          <Text className="text-xs text-gray-300">
            {target.bmiRange[0]}〜{target.bmiRange[1]}
          </Text>
        </View>
        <RangeBar axisMin={15} axisMax={32} zone={target.bmiRange} current={currentBMI} color={colors.orange500} />
      </View>

      <View className="gap-1.5">
        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-400">体脂肪率の目安</Text>
          <Text className="text-xs text-gray-300">
            {target.bodyFatRange[0]}〜{target.bodyFatRange[1]}%
          </Text>
        </View>
        <RangeBar axisMin={5} axisMax={35} zone={target.bodyFatRange} color={colors.blue400} />
      </View>
    </View>
  );
}
