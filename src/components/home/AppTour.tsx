'use client';

import { SpotlightTour } from '@/components/ui/SpotlightTour';
import { useUserStore } from '@/stores/userStore';
import type { TourStep } from '@/components/ui/SpotlightTour';

const HOME_TOUR_STEPS: TourStep[] = [
  {
    target: 'tour-header',
    title: 'Your Dashboard',
    description:
      'Your greeting, streak, and daily study progress — all at a glance.',
  },
  {
    target: 'tour-streak',
    title: 'Streak Tracker',
    description:
      'Practice each day to build your streak. Shabbat is automatically skipped!',
  },
  {
    target: 'tour-daily-goal',
    title: 'Daily Goal',
    description: 'Track your study minutes toward your daily target.',
  },
  {
    target: 'tour-quick-actions',
    title: 'Quick Actions',
    description:
      'Tap any pill for instant access to practice, lessons, or prayers.',
  },
  {
    target: 'tour-section-hebrew',
    title: 'Hebrew',
    description:
      'Learn to read Hebrew letters and vowels step by step, with audio for everything.',
  },
  {
    target: 'tour-section-daven',
    title: 'Daven',
    description:
      'Follow along with real prayer services — audio, transliteration, and coaching included.',
  },
  {
    target: 'tour-section-yahrzeit',
    title: 'Yahrzeit',
    description:
      "Kaddish guides, mourner's observance, and finding your place in services.",
  },
  {
    target: 'tour-section-living',
    title: 'Jewish Living',
    description:
      'Brachot and 30+ guides for Shabbat, holidays, and daily Jewish life.',
  },
];

export function AppTour() {
  const completeAppTour = useUserStore((s) => s.completeAppTour);

  return (
    <SpotlightTour
      steps={HOME_TOUR_STEPS}
      onComplete={completeAppTour}
      finishLabel="Start Learning"
    />
  );
}