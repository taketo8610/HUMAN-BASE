import { Fragment } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

import { Sex } from '@/types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// BMI × 体脂肪率 × 性別から人型シルエットを生成。
// 輪郭は男女別の形、さらに体脂肪率に応じて腹筋カット・胸ライン・下腹の脂肪影を
// 連続的に出し入れする（無段階・軽量なベクター）。
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
  const bmiF = clamp((bmi - 16) / 16, 0, 1.3);
  const fatF = clamp((bodyFat - 8) / 27, 0, 1.3);
  const muscle = clamp(bmiF - fatF * 0.5, 0, 1);
  const isF = sex === 'female';

  const neck = (isF ? 3.8 : 4.8) + 1.8 * bmiF;
  const headR = (isF ? 11 : 12.5) + 1.4 * bmiF;

  let sh: number;
  let hip: number;
  let thigh: number;
  let midMax: number;
  let chestRef: number;
  let waistRef: number;
  let bellyRef: number;
  let torso: string;

  if (isF) {
    sh = 14 + 6 * bmiF + 1 * muscle;
    const bust = 13.5 + 6 * bmiF + 4.5 * fatF;
    const waist = 8.5 + 6.5 * bmiF + 6.5 * fatF;
    hip = 16.5 + 8 * bmiF + 6 * fatF;
    thigh = 8.5 + 5 * bmiF + 4 * fatF;
    midMax = Math.max(bust, hip);
    chestRef = bust;
    waistRef = waist;
    bellyRef = waist + 1.5 * fatF;
    torso = [
      `M${cx - neck} 44`,
      `L${cx - neck} 50`,
      `C${cx - sh} 51 ${cx - sh} 53 ${cx - sh} 56`,
      `C${cx - bust} 61 ${cx - bust} 69 ${cx - bust} 74`,
      `C${cx - bust + 0.5} 80 ${cx - waist} 85 ${cx - waist} 99`,
      `C${cx - waist} 109 ${cx - hip} 117 ${cx - hip} 129`,
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
    sh = 19 + 8 * bmiF + 4 * muscle;
    const chest = 16 + 7 * bmiF + 3 * muscle;
    const waist = 12 + 9 * bmiF + 8 * fatF;
    const belly = Math.max(waist - 1, waist + 5 * fatF - 3 * muscle);
    hip = 13 + 7 * bmiF + 3 * fatF;
    thigh = 8 + 5 * bmiF + 2.5 * fatF;
    midMax = Math.max(chest, belly, waist);
    chestRef = chest;
    waistRef = waist;
    bellyRef = belly;
    torso = [
      `M${cx - neck} 43`,
      `L${cx - neck} 50`,
      `C${cx - sh} 51 ${cx - sh} 54 ${cx - sh} 57`,
      `C${cx - chest} 65 ${cx - chest} 70 ${cx - chest} 76`,
      `C${cx - waist} 88 ${cx - waist} 95 ${cx - waist} 101`,
      `C${cx - belly} 110 ${cx - belly} 115 ${cx - belly} 120`,
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

  const armInner = midMax + 2.5;
  const armW = (isF ? 3.6 : 4.6) + 2.6 * bmiF + 1.4 * muscle;
  const leftArm = `M${cx - armInner} 59 C${cx - armInner - armW} 65 ${cx - armInner - armW} 86 ${cx - armInner - armW + 0.5} 106 C${cx - armInner - armW} 113 ${cx - armInner + 1.5} 113 ${cx - armInner + 1.5} 106 C${cx - armInner + 1} 86 ${cx - armInner} 70 ${cx - armInner} 61 Z`;
  const rightArm = `M${cx + armInner} 59 C${cx + armInner + armW} 65 ${cx + armInner + armW} 86 ${cx + armInner + armW - 0.5} 106 C${cx + armInner + armW} 113 ${cx + armInner - 1.5} 113 ${cx + armInner - 1.5} 106 C${cx + armInner - 1} 86 ${cx + armInner} 70 ${cx + armInner} 61 Z`;

  // 体脂肪率による陰影：低脂肪＝腹筋のカット、高脂肪＝下腹の脂肪影。
  const absOpacity = clamp((muscle * 1.35 - fatF * 0.9) * (isF ? 0.35 : 1), 0, 0.5);
  const bellyOpacity = clamp(fatF - 0.25, 0, 0.4);
  const hw = waistRef * 0.42; // 腹筋の横線の半幅

  return (
    <Svg width={width} height={(width * 235) / 100} viewBox="0 0 100 235">
      <Path d={leftArm} fill={color} />
      <Path d={rightArm} fill={color} />
      <Path d={leftLeg} fill={color} />
      <Path d={rightLeg} fill={color} />
      <Path d={torso} fill={color} />

      {bellyOpacity > 0.02 && (
        <Path
          d={`M${cx - bellyRef * 0.66} 109 Q${cx} 126 ${cx + bellyRef * 0.66} 109 Q${cx} 118 ${cx - bellyRef * 0.66} 109 Z`}
          fill="#000000"
          opacity={bellyOpacity}
        />
      )}

      {absOpacity > 0.03 && (
        <Fragment>
          {/* 胸の下ライン */}
          <Path
            d={`M${cx - chestRef * 0.5} 74 Q${cx} 79 ${cx + chestRef * 0.5} 74`}
            stroke="#000000"
            strokeWidth={1}
            opacity={absOpacity * 0.8}
            fill="none"
            strokeLinecap="round"
          />
          {/* 腹筋（縦＋横3本） */}
          <Path
            d={`M${cx} 86 L${cx} 117`}
            stroke="#000000"
            strokeWidth={0.9}
            opacity={absOpacity}
            fill="none"
            strokeLinecap="round"
          />
          <Path d={`M${cx - hw} 95 L${cx + hw} 95`} stroke="#000000" strokeWidth={0.8} opacity={absOpacity} fill="none" strokeLinecap="round" />
          <Path d={`M${cx - hw} 103 L${cx + hw} 103`} stroke="#000000" strokeWidth={0.8} opacity={absOpacity} fill="none" strokeLinecap="round" />
          <Path d={`M${cx - hw} 111 L${cx + hw} 111`} stroke="#000000" strokeWidth={0.8} opacity={absOpacity} fill="none" strokeLinecap="round" />
        </Fragment>
      )}

      <Circle cx={cx} cy={28} r={headR} fill={color} />
    </Svg>
  );
}
