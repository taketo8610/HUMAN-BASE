import type { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';

import { colors } from '@/lib/colors';

// フォーム入力に共通のスタイル（各画面の TextInput に付与）。
export const inputClass = 'rounded-lg bg-gray-700 px-3 py-2 text-sm text-white';
export const placeholderColor = colors.gray500;

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-xl bg-gray-800 p-5 ${className}`}>{children}</View>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="flex-1">
      <Text className="mb-1 text-sm text-gray-400">{label}</Text>
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`rounded-lg py-2.5 ${disabled ? 'bg-orange-500/50' : 'bg-orange-500 active:bg-orange-600'}`}>
      <Text className="text-center font-medium text-white">{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <Text className="py-8 text-center text-gray-500">{text}</Text>;
}
