'use client';

import { useUserStore } from '@/stores/userStore';
import { useBootcampStore } from '@/stores/bootcampStore';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS } from '@/lib/content/vowels';

export function StatsStrip() {
  const skillProgress = useUserStore((s) => s.skillProgress);
  const bootcampProgress = useBootcampStore((s) => s.progress);
  const isBootcampComplete = useBootcampStore((s) => s.isBootcampComplete);

  const totalLetters = LETTERS.length;
  const masteredLetters = Object.values(skillProgress).filter(
    (p) => p.masteryLevel >= 0.8
  ).length;

  const totalVowels = VOWELS.length;
  const learnedVowels = VOWELS.filter(
    (v) => skillProgress[v.id]?.timesPracticed > 0
  ).length;

  const bootcampDone = isBootcampComplete();
  const bootcampDay = bootcampProgress.currentDay;

  // Overall accuracy
  const allPracticed = Object.values(skillProgress).filter(
    (p) => p.timesPracticed > 0
  );
  const overallAccuracy =
    allPracticed.length > 0
      ? Math.round(
          (allPracticed.reduce(
            (sum, p) => sum + p.timesCorrect / Math.max(p.timesPracticed, 1),
            0
          ) /
            allPracticed.length) *
            100
        )
      : 0;

  const stats = [
    {
      label: 'Letters',
      value: `${masteredLetters}/${totalLetters}`,
      color: 'var(--primary)',
    },
    {
      label: 'Vowels',
      value: `${learnedVowels}/${totalVowels}`,
      color: '#8B5CF6',
    },
    {
      label: bootcampDone ? 'Accuracy' : 'Bootcamp',
      value: bootcampDone ? `${overallAccuracy}%` : `Day ${bootcampDay}/5`,
      color: 'var(--gold)',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center"
        >
          <p className="text-lg font-bold" style={{ color: stat.color }}>
            {stat.value}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
