import { View, TextInput } from 'react-native';

import { placeholderColor } from '@/components/ui';
import { toIntInput } from '@/lib/num';

const field = 'rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white';

// Web 版：年/月/日の3入力。半角数字のみ受け付ける（かな・全角を除去して NaN 表示を防ぐ）。
export default function BirthDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [y = '', m = '', d = ''] = value.split('-');
  const update = (ny: string, nm: string, nd: string) =>
    onChange(`${ny || '2000'}-${(nm || '1').padStart(2, '0')}-${(nd || '1').padStart(2, '0')}`);

  return (
    <View className="flex-row gap-3">
      <View className="flex-[1.4]">
        <TextInput
          inputMode="numeric"
          keyboardType="numeric"
          value={y}
          onChangeText={(t) => update(toIntInput(t), m, d)}
          placeholder="年"
          maxLength={4}
          placeholderTextColor={placeholderColor}
          className={field}
        />
      </View>
      <View className="flex-1">
        <TextInput
          inputMode="numeric"
          keyboardType="numeric"
          value={m ? String(Number(m)) : ''}
          onChangeText={(t) => update(y, toIntInput(t), d)}
          placeholder="月"
          maxLength={2}
          placeholderTextColor={placeholderColor}
          className={field}
        />
      </View>
      <View className="flex-1">
        <TextInput
          inputMode="numeric"
          keyboardType="numeric"
          value={d ? String(Number(d)) : ''}
          onChangeText={(t) => update(y, m, toIntInput(t))}
          placeholder="日"
          maxLength={2}
          placeholderTextColor={placeholderColor}
          className={field}
        />
      </View>
    </View>
  );
}
