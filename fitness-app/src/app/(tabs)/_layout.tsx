import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import {
  LayoutDashboard,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  CalendarDays,
  Settings,
} from 'lucide-react-native';

import { colors } from '@/lib/colors';

export default function TabsLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.gray900 },
        headerTitleStyle: { color: '#ffffff', fontWeight: '700' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.gray950 },
        tabBarStyle: { backgroundColor: colors.gray900, borderTopColor: colors.gray800 },
        tabBarActiveTintColor: colors.orange400,
        tabBarInactiveTintColor: colors.gray400,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ダッシュボード',
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} />,
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/settings')}
              hitSlop={8}
              style={{ marginRight: 16 }}
              accessibilityRole="button"
              accessibilityLabel="設定を開く">
              <Settings color={colors.gray400} size={22} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'ワークアウト',
          tabBarLabel: 'ワークアウト',
          tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="meal"
        options={{
          title: '食事管理',
          tabBarLabel: '食事',
          tabBarIcon: ({ color, size }) => <UtensilsCrossed color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="body"
        options={{
          title: '体型トラッキング',
          tabBarLabel: '体型',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'トレーニングプラン',
          tabBarLabel: 'プラン',
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
