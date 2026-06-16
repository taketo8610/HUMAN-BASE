import Svg, { Path, Circle } from 'react-native-svg';

import { Sex } from '@/types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// BMI × 体脂肪率 × 性別から人型シルエットを生成する。
// 男女で輪郭の作り（肩・バスト・くびれ・ヒップ）を変え、値で無段階に変形する。軽量なベクター。
export default function BodySilhouette({
  sex,
  bmi,
  bodyFat,
  color,
  width = 90,
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
  const isF = sex === 'female';

  const neck = (isF ? 3.8 : 4.8) + 1.8 * bmiF;
  const headR = (isF ? 11 : 12.5) + 1.4 * bmiF;

  // 共通で参照する幅（腕配置などに使う）
  let sh: number;
  let hip: number;
  let thigh: number;
  let midMax: number; // 胴のいちばん広い部分
  let torso: string;

  if (isF) {
    sh = 14 + 6 * bmiF + 1 * muscle; // 肩は狭め
    const bust = 13.5 + 6 * bmiF + 4.5 * fatF; // バストの張り
    const waist = 8.5 + 6.5 * bmiF + 6.5 * fatF; // 細いウエスト
    hip = 16.5 + 8 * bmiF + 6 * fatF; // 広い骨盤
    thigh = 8.5 + 5 * bmiF + 4 * fatF;
    midMax = Math.max(bust, hip);
    torso = [
      `M${cx - neck} 44`,
      `L${cx - neck} 50`,
      `C${cx - sh} 51 ${cx - sh} 53 ${cx - sh} 56`, // なだらかな肩
      `C${cx - bust} 61 ${cx - bust} 69 ${cx - bust} 74`, // バスト
      `C${cx - bust + 0.5} 80 ${cx - waist} 85 ${cx - waist} 99`, // くびれ
      `C${cx - waist} 109 ${cx - hip} 117 ${cx - hip} 129`, // 広がるヒップ
      `C${cx - hip} 135 ${cx - hip} 140 ${cx - hip + 1} 147`,
      `L${cx + hip - 1} 147`,
      `C${cx + hip} 140 ${cx + hip} 135 ${cx + hip} 129`,
      `C${cx + hip} 117 ${cx + waist} 109 ${cx + waist} 99`,
      `C${cx + waist} 85 ${cx + bust - 0.5} 80 ${cx + bust} 74`,
      `C${cx + bust} 69 ${cx + sh} 61 ${cx + sh} 56`,
      `C${cx + sh} 53 ${cx + sh} 51 ${cx + neck} 50`,
      `L${cx + neck} 44`,
      'Z',
    ].join(' ');
  } else {
    sh = 19 + 8 * bmiF + 4 * muscle; // 広い肩（逆三角）
    const chest = 16 + 7 * bmiF + 3 * muscle; // 胸板
    const waist = 12 + 9 * bmiF + 8 * fatF; // くびれ弱め
    const belly = Math.max(waist - 1, waist + 5 * fatF - 3 * muscle); // 下腹
    hip = 13 + 7 * bmiF + 3 * fatF; // 狭いヒップ
    thigh = 8 + 5 * bmiF + 2.5 * fatF;
    midMax = Math.max(chest, belly, waist);
    torso = [
      `M${cx - neck} 43`,
      `L${cx - neck} 50`,
      `C${cx - sh} 51 ${cx - sh} 54 ${cx - sh} 57`, // 角張った肩
      `C${cx - chest} 65 ${cx - chest} 70 ${cx - chest} 76`, // 胸板
      `C${cx - waist} 88 ${cx - waist} 95 ${cx - waist} 101`, // ゆるいウエスト
      `C${cx - belly} 110 ${cx - belly} 115 ${cx - belly} 120`, // 腹
      `C${cx - hip} 127 ${cx - hip} 132 ${cx - hip + 1} 147`,
      `L${cx + hip - 1} 147`,
      `C${cx + hip} 132 ${cx + hip} 127 ${cx + belly} 120`,
      `C${cx + belly} 115 ${cx + waist} 110 ${cx + waist} 101`,
      `C${cx + waist} 95 ${cx + chest} 88 ${cx + chest} 76`,
      `C${cx + chest} 70 ${cx + sh} 65 ${cx + sh} 57`,
      `C${cx + sh} 54 ${cx + sh} 51 ${cx + neck} 50`,
      `L${cx + neck} 43`,
      'Z',
    ].join(' ');
  }

  const calf = 5 + 2.5 * bmiF + 1.5 * fatF;
  const ankle = 3 + 0.8 * bmiF;
  const leftLeg = `M${cx - hip + 1} 145 C${cx - thigh} 158 ${cx - thigh} 170 ${cx - thigh + 0.5} 178 C${cx - calf} 192 ${cx - ankle} 210 ${cx - ankle} 226 L${cx - 1.5} 226 L${cx - 1.5} 147 Z`;
  const rightLeg = `M${cx + hip - 1} 145 C${cx + thigh} 158 ${cx + thigh} 170 ${cx + thigh - 0.5} 178 C${cx + calf} 192 ${cx + ankle} 210 ${cx + ankle} 226 L${cx + 1.5} 226 L${cx + 1.5} 147 Z`;

  // 腕は胴から少し離して、太さ（筋肉量）が見えるように。
  const armInner = midMax + 2.5;
  const armW = (isF ? 3.6 : 4.6) + 2.6 * bmiF + 1.4 * muscle;
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
