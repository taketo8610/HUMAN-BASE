'use client';

import { useAppStore } from '@/store/useAppStore';
import OnboardingFlow from './OnboardingFlow';
import { UserProfile } from '@/types';

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { userProfile, setUserProfile, skipOnboarding } = useAppStore();

  function handleComplete(profile: UserProfile) {
    setUserProfile(profile);
  }

  if (!userProfile || !userProfile.onboardingCompleted) {
    return (
      <>
        {children}
        <OnboardingFlow onComplete={handleComplete} onSkip={skipOnboarding} />
      </>
    );
  }

  return <>{children}</>;
}
