import { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// ネイティブ版：タップで OS の DatePicker を開く。
export default function BirthDateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [show, setShow] = useState(false);
  const parsed = new Date(value);
  const date = isNaN(parsed.getTime()) ? new Date(2000, 0, 1) : parsed;

  return (
    <View>
      <Pressable
        onPress={() => setShow(true)}
        className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3">
        <Text className="text-white">{value}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          maximumDate={new Date()}
          onChange={(_, selected) => {
            setShow(Platform.OS === 'ios');
            if (selected) {
              const iso = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(
                selected.getDate()
              ).padStart(2, '0')}`;
              onChange(iso);
            }
          }}
        />
      )}
    </View>
  );
}
