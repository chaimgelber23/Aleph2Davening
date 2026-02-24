'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import { useBootcampStore } from '@/stores/bootcampStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { StatsStrip } from '@/components/hebrew/StatsStrip';
import { NextUpSpotlight } from '@/components/hebrew/NextUpSpotlight';
import { LetterMasteryGrid } from '@/components/hebrew/LetterMasteryGrid';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS, VOWEL_COLORS } from '@/lib/content/vowels';

export default function HebrewPage() {
  const skillProgress = useUserStore((s) => s.skillProgress);
  const bootcampProgress = useBootcampStore((s) => s.progress);
  const isBootcampComplete = useBootcampStore((s) => s.isBootcampComplete);

  // Letter progress
  const totalLetters = LETTERS.length;
  const masteredLetters = Object.values(skillProgress).filter(
    (p) => p.masteryLevel >= 0.8
  ).length;

  // Vowel progress
  const totalVowels = VOWELS.length;
  const learnedVowels = VOWELS.filter(
    (v) => skillProgress[v.id]?.timesPracticed > 0
  ).length;

  // Bootcamp
  const bootcampDone = isBootcampComplete();
  const bootcampEnrolled = bootcampProgress.enrolled;
  const bootcampDay = bootcampProgress.currentDay;
  const bootcampCompletedDays = Object.values(
    bootcampProgress.dayProgress
  ).filter((d) => d.status === 'completed').length;

  // Next letters preview for Letters card
  const nextLetters = useMemo(
    () =>
      LETTERS.filter((l) => {
        const p = skillProgress[l.id];
        return !p || p.masteryLevel < 0.8;
      }).slice(0, 3),
    [skillProgress]
  );

  // Practice due count
  const dueCount = Object.values(skillProgress).filter((p) => {
    if (!p.lastPracticed) return false;
    return Date.now() - new Date(p.lastPracticed).getTime() > 86400000;
  }).length;

  // Section cards
  const sections = useMemo(
    () => [
      {
        href: '/hebrew/bootcamp',
        title: '5-Day Bootcamp',
        subtitle: bootcampDone
          ? 'Completed'
          : bootcampEnrolled
          ? `Day ${bootcampDay} — ${bootcampCompletedDays}/5 done`
          : 'Learn the aleph-bet in 5 days',
        status: bootcampDone
          ? ('done' as const)
          : bootcampEnrolled
          ? ('active' as const)
          : ('start' as const),
      },
      {
        href: '/hebrew/letters',
        title: 'Letters',
        subtitle: `${masteredLetters}/${totalLetters} mastered`,
        status: (masteredLetters > 0 ? 'active' : 'start') as
          | 'active'
          | 'start',
      },
      {
        href: '/hebrew/vowels',
        title: 'Vowels',
        subtitle: `${learnedVowels}/${totalVowels} learned`,
        status: (learnedVowels > 0 ? 'active' : 'start') as
          | 'active'
          | 'start',
      },
      {
        href: '/hebrew/practice',
        title: 'Practice',
        subtitle: 'Spaced repetition drills',
        status: (Object.keys(skillProgress).length > 0
          ? 'active'
          : 'start') as 'active' | 'start',
      },
    ],
    [
      bootcampDone,
      bootcampEnrolled,
      bootcampDay,
      bootcampCompletedDays,
      masteredLetters,
      totalLetters,
      learnedVowels,
      totalVowels,
      skillProgress,
    ]
  );

  const vowelGroupColors = Object.values(VOWEL_COLORS);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mt-2">Learn Hebrew</h1>
          <p className="text-primary-light text-sm mt-1">
            Letters, vowels, bootcamp, and practice drills
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-5 space-y-4 pb-28">
        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsStrip />
        </motion.div>

        {/* Next Up Spotlight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <NextUpSpotlight />
        </motion.div>

        {/* Letter Mastery Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LetterMasteryGrid />
        </motion.div>

        {/* Enhanced Section Cards */}
        {sections.map((section, i) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
          >
            <Link
              href={section.href}
              className="block rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-foreground">
                      {section.title}
                    </h2>
                    {section.status === 'done' && (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                        Complete
                      </span>
                    )}
                    {section.title === 'Practice' && dueCount > 0 && (
                      <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full font-semibold">
                        {dueCount} due
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {section.subtitle}
                  </p>

                  {/* Visual indicators per section */}
                  {section.title === '5-Day Bootcamp' && (
                    <div className="flex gap-1.5 mt-2">
                      {[1, 2, 3, 4, 5].map((day) => (
                        <div
                          key={day}
                          className={`w-2 h-2 rounded-full ${
                            bootcampProgress.dayProgress[day]?.status ===
                            'completed'
                              ? 'bg-gold'
                              : bootcampProgress.dayProgress[day]?.status ===
                                'in_progress'
                              ? 'bg-primary'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {section.title === 'Letters' && nextLetters.length > 0 && (
                    <div className="flex gap-1.5 mt-2" dir="rtl">
                      {nextLetters.map((l) => (
                        <span
                          key={l.id}
                          className="font-[var(--font-hebrew-serif)] text-sm text-primary/50"
                        >
                          {l.hebrew}
                        </span>
                      ))}
                      <span className="text-[10px] text-gray-300 self-center">
                        next
                      </span>
                    </div>
                  )}

                  {section.title === 'Vowels' && (
                    <div className="flex gap-1 mt-2">
                      {vowelGroupColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <svg
                  className="w-4 h-4 text-gray-300 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
