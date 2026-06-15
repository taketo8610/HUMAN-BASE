import Svg, { Path, Circle } from 'react-native-svg';

import { Sex } from '@/types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// BMI × 体脂肪率 × 性別から各部位の幅を連続的に決め、人型シルエットを描く。
// 値を少し変えるだけで滑らかに体型が変わる（無段階）。ベクターなので軽量。
export default function BodySilhouette({
  sex,
  bmi,
  bodyFat,
  color,
  width = 88,
}: {
  sex: Sex;
  bmi: number;
  bodyFat: number;
  color: string;
  width?: number;
}) {
  const cx = 50;
  const bmiF = clamp((bmi - 16) / 16, 0, 1.3); // 痩せ0 〜 肥満1.3
  const fatF = clamp((bodyFat - 8) / 27, 0, 1.3); // 体脂肪の高さ
  const muscle = clamp(bmiF - fatF * 0.5, 0, 1); // 高BMI×低脂肪＝筋肉質
  const isM = sex === 'male';

  // 中心からの片側幅（部位ごとに BMI/体脂肪/筋肉で増減）
  const neck = 4.5 + 2 * bmiF;
  const shoulder = (isM ? 19 : 15.5) + 8 * bmiF + (isM ? 4 : 2) * muscle;
  const chest = (isM ? 16 : 14.5) + 7 * bmiF + (isM ? 2 : 1) * muscle;
  const waist = (isM ? 11 : 9.5) + 9 * bmiF + 9 * fatF; // 体脂肪でウエストが太く（くびれ減）
  const belly = Math.max(waist - 1, waist + 6 * fatF - 3 * muscle); // 下腹の出っ張り
  const hip = (isM ? 13 : 17.5) + 8 * bmiF + 4 * fatF; // 女性は広め
  const thigh = (isM ? 7.5 : 8.5) + 4.5 * bmiF + 3 * fatF;
  const calf = 5 + 2.5 * bmiF + 1.5 * fatF;
  const ankle = 3 + 0.8 * bmiF;
  const arm = (isM ? 4.5 : 4) + 2.8 * bmiF + 1.2 * muscle;
  const headR = 12 + 1.5 * bmiF;

  const torso = [
    `M${cx - neck} 43`,
    `L${cx - neck} 49`,
    `C${cx - shoulder} 50 ${cx - shoulder} 53 ${cx - shoulder} 56`,
    `C${cx - chest} 64 ${cx - chest} 67 ${cx - chest} 72`,
    `C${cx - waist} 84 ${cx - waist} 92 ${cx - waist} 99`,
    `C${cx - belly} 108 ${cx - belly} 113 ${cx - belly} 118`,
    `C${cx - hip} 126 ${cx - hip} 130 ${cx - hip} 135`,
    `L${cx - hip + 1} 146`,
    `L${cx + hip - 1} 146`,
    `L${cx + hip} 135`,
    `C${cx + belly} 130 ${cx + belly} 126 ${cx + belly} 118`,
    `C${cx + waist} 113 ${cx + waist} 108 ${cx + waist} 99`,
    `C${cx + chest} 92 ${cx + chest} 84 ${cx + chest} 72`,
    `C${cx + shoulder} 67 ${cx + shoulder} 64 ${cx + shoulder} 56`,
    `C${cx + shoulder} 53 ${cx + shoulder} 50 ${cx + neck} 49`,
    `L${cx + neck} 43`,
    'Z',
  ].join(' ');

  const leftLeg = `M${cx - hip + 1} 144 C${cx - thigh} 156 ${cx - thigh} 168 ${cx - thigh + 0.5} 176 C${cx - calf} 188 ${cx - ankle} 205 ${cx - ankle} 224 L${cx - 1.5} 224 L${cx - 1.5} 146 Z`;
  const rightLeg = `M${cx + hip - 1} 144 C${cx + thigh} 156 ${cx + thigh} 168 ${cx + thigh - 0.5} 176 C${cx + calf} 188 ${cx + ankle} 205 ${cx + ankle} 224 L${cx + 1.5} 224 L${cx + 1.5} 146 Z`;

  // 腕は胴から少し離して配置し、太さ（筋肉量）が見えるようにする。
  const armInner = Math.max(chest, belly, waist) + 2.5; // 胴の外側 + 隙間
  const armW = arm + muscle * 1.4; // 腕の太さ（筋肉で増える）
  const leftArm = `M${cx - armInner} 59 C${cx - armInner - armW} 65 ${cx - armInner - armW} 86 ${cx - armInner - armW + 0.5} 106 C${cx - armInner - armW} 113 ${cx - armInner + 1.5} 113 ${cx - armInner + 1.5} 106 C${cx - armInner + 1} 86 ${cx - armInner} 70 ${cx - armInner} 61 Z`;
  const rightArm = `M${cx + armInner} 59 C${cx + armInner + armW} 65 ${cx + armInner + armW} 86 ${cx + armInner + armW - 0.5} 106 C${cx + armInner + armW} 113 ${cx + armInner - 1.5} 113 ${cx + armInner - 1.5} 106 C${cx + armInner - 1} 86 ${cx + armInner} 70 ${cx + armInner} 61 Z`;

  const height = (width * 235) / 100;
  return (
    <Svg width={width} height={height} viewBox="0 0 100 235">
      <Path d={leftArm} fill={color} />
      <Path d={rightArm} fill={color} />
      <Path d={leftLeg} fill={color} />
      <Path d={rightLeg} fill={color} />
      <Path d={torso} fill={color} />
      <Circle cx={cx} cy={28} r={headR} fill={color} />
    </Svg>
  );
}
