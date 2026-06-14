// ナビゲーションバーやグラフなど、className では渡せず JS で色値が必要な箇所のための定数。
// Tailwind 標準パレットと同値（画面の className 側と見た目を揃える）。
export const colors = {
  gray950: '#030712',
  gray900: '#111827',
  gray800: '#1f2937',
  gray700: '#374151',
  gray600: '#4b5563',
  gray500: '#6b7280',
  gray400: '#9ca3af',
  orange500: '#f97316',
  orange400: '#fb923c',
  red400: '#f87171',
  blue400: '#60a5fa',
  yellow400: '#facc15',
  green400: '#4ade80',
} as const;
