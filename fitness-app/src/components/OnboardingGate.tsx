import type { ReactNode } from 'react';

import { useAppStore } from '@/store/useAppStore';
import OnboardingFlow from '@/components/OnboardingFlow';

// プロフィール未設定（オンボーディング未完了）の場合に、アプリ画面の上に
// オンボーディングをオーバーレイ表示する。AsyncStorage の読み込み完了
// (_hasHydrated) を待ってから判定し、既存ユーザーへの一瞬の表示を防ぐ。
export default function OnboardingGate({ children }: { children: ReactNode }) {
  const userProfile = useAppStore((s) => s.userProfile);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const setUserProfile = useAppStore((s) => s.setUserProfile);
  const skipOnboarding = useAppStore((s) => s.skipOnboarding);

  const needOnboarding = hasHydrated && (!userProfile || !userProfile.onboardingCompleted);

  return (
    <>
      {children}
      {needOnboarding && <OnboardingFlow onComplete={setUserProfile} onSkip={skipOnboarding} />}
    </>
  );
}
