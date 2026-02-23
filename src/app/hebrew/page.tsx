'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import { useBootcampStore } from '@/stores/bootcampStore';
import { BottomNav } from '@/components/ui/BottomNav';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS } from '@/lib/content/vowels';

export default function HebrewPage() {
  const skillProgress = useUserStore((s) => s.skillProgress);
  const bootcampProgress = useBootcampStore((s) => s.progress);
  const isBootcampComplete = useBootcampStore((s) => s.isBootcampComplete);

  // Letter progress
  const totalLetters = LETTERS.length;
  const masteredLetters = Object.values(skillProgress).filter(
    (p) => p.masteryLevel >= 0.8
  ).length;
  const letterPct = Math.round((masteredLetters / totalLetters) * 100);

  // Vowel progress
  const totalVowels = VOWELS.length;
  const learnedVowels = VOWELS.filter(
    (v) => skillProgress[v.id]?.timesPracticed > 0
  ).length;

  // Bootcamp
  const bootcampDone = isBootcampComplete();
  const bootcampEnrolled = bootcampProgress.enrolled;
  const bootcampDay = bootcampProgress.currentDay;
  const bootcampCompletedDays = Object.values(bootcampProgress.dayProgress).filter(
    (d) => d.status === 'completed'
  ).length;

  const sections = useMemo(() => [
    {
      href: '/hebrew/bootcamp',
      title: '5-Day Bootcamp',
      subtitle: bootcampDone
        ? 'Completed'
        : bootcampEnrolled
        ? `Day ${bootcampDay} — ${bootcampCompletedDays}/5 done`
        : 'Learn the aleph-bet in 5 days',
      status: bootcampDone ? 'done' : bootcampEnrolled ? 'active' : 'start',
    },
    {
      href: '/hebrew/letters',
      title: 'Letters',
      subtitle: `${masteredLetters}/${totalLetters} mastered (${letterPct}%)`,
      status: masteredLetters > 0 ? 'active' : 'start',
    },
    {
      href: '/hebrew/vowels',
      title: 'Vowels',
      subtitle: `${learnedVowels}/${totalVowels} learned`,
      status: learnedVowels > 0 ? 'active' : 'start',
    },
    {
      href: '/hebrew/practice',
      title: 'Practice',
      subtitle: 'Spaced repetition drills',
      status: Object.keys(skillProgress).length > 0 ? 'active' : 'start',
    },
  ], [bootcampDone, bootcampEnrolled, bootcampDay, bootcampCompletedDays, masteredLetters, totalLetters, letterPct, learnedVowels, totalVowels, skillProgress]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <Link href="/" className="text-primary-light text-sm hover:text-white">
            Home
          </Link>
          <h1 className="text-2xl font-bold mt-2">Learn Hebrew</h1>
          <p className="text-primary-light text-sm mt-1">
            Letters, vowels, bootcamp, and practice drills
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-3 pb-28">
        {sections.map((section, i) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
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
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {section.subtitle}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Progress overview */}
        {masteredLetters > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 mt-4"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">Overall Progress</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Letters</span>
                  <span className="text-primary font-medium">{letterPct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${letterPct}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Vowels</span>
                  <span className="text-primary font-medium">{learnedVowels}/{totalVowels}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(learnedVowels / totalVowels) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
