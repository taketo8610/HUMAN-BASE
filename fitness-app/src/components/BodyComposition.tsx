import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Motivation, Sex } from '@/types';
import { recommendBodyComposition, targetWeightFromBMI } from '@/lib/fitness';
import { colors } from '@/lib/colors';

// BMI に応じて肩・ウエスト・腰の幅が変わる人型シルエット。男女で体型差を出す。
function Body({ bmi, sex, color }: { bmi: number; sex: Sex; color: string }) {
  const cx = 50;
  const f = Math.min(1.55, Math.max(0.78, bmi / 22)); // BMI22 を基準にした太さ係数
  const sh = (sex === 'male' ? 34 : 29) * f; // 肩幅
  const wa = (sex === 'male' ? 22 : 18) * f; // ウエスト幅
  const hp = (sex === 'male' ? 24 : 28) * f; // 腰幅

  const torso = `M${cx - sh / 2},44 C${cx - sh / 2 - 1},62 ${cx - wa / 2},70 ${cx - wa / 2},86 C${cx - wa / 2},94 ${cx - hp / 2},98 ${cx - hp / 2},104 L${cx + hp / 2},104 C${cx + hp / 2},98 ${cx + wa / 2},94 ${cx + wa / 2},86 C${cx + wa / 2},70 ${cx + sh / 2 + 1},62 ${cx + sh / 2},44 Z`;
  const leftLeg = `M${cx - hp / 2 + 1},103 L${cx - 2},103 L${cx - 4},170 L${cx - hp / 2 + 3},170 Z`;
  const rightLeg = `M${cx + hp / 2 - 1},103 L${cx + 2},103 L${cx + 4},170 L${cx + hp / 2 - 3},170 Z`;
  const armW = sh * 0.16;
  const leftArm = `M${cx - sh / 2 + 2},48 C${cx - sh / 2 - 6},66 ${cx - sh / 2 - 5},84 ${cx - sh / 2 - 1},98 L${cx - sh / 2 - 1 + armW},98 C${cx - sh / 2 - 4 + armW},82 ${cx - sh / 2 - 4 + armW},66 ${cx - sh / 2 + 2 + armW},50 Z`;
  const rightArm = `M${cx + sh / 2 - 2},48 C${cx + sh / 2 + 6},66 ${cx + sh / 2 + 5},84 ${cx + sh / 2 + 1},98 L${cx + sh / 2 + 1 - armW},98 C${cx + sh / 2 + 4 - armW},82 ${cx + sh / 2 + 4 - armW},66 ${cx + sh / 2 - 2 - armW},50 Z`;

  return (
    <Svg width={70} height={120} viewBox="0 0 100 175">
      <Circle cx={cx} cy={22} r={13} fill={color} />
      <Path d={`M${cx - 5},33 L${cx + 5},33 L${cx + 5},46 L${cx - 5},46 Z`} fill={color} />
      <Path d={leftArm} fill={color} />
      <Path d={rightArm} fill={color} />
      <Path d={torso} fill={color} />
      <Path d={leftLeg} fill={color} />
      <Path d={rightLeg} fill={color} />
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
          <Body bmi={currentBMI} sex={sex} color={colors.gray500} />
          <Text className="mt-1 text-xs text-gray-400">現在 {currentWeight}kg</Text>
          <Text className="text-[10px] text-gray-500">BMI {currentBMI.toFixed(1)}</Text>
        </View>
        <Text className="pb-8 text-2xl text-orange-500">→</Text>
        <View className="items-center">
          <Body bmi={targetBMI} sex={sex} color={colors.orange500} />
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
