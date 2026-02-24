'use client';

import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useBootcampStore } from '@/stores/bootcampStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS } from '@/lib/content/vowels';

export function ContinueHero() {
  const profile = useUserStore((s) => s.profile);
  const skillProgress = useUserStore((s) => s.skillProgress);
  const bootcampProgress = useBootcampStore((s) => s.progress);
  const isBootcampComplete = useBootcampStore((s) => s.isBootcampComplete);

  const totalLetters = LETTERS.length;
  const masteredLetters = Object.values(skillProgress).filter(
    (p) => p.masteryLevel >= 0.8
  ).length;
  const letterProgress = masteredLetters / totalLetters;

  const totalVowels = VOWELS.length;
  const learnedVowels = VOWELS.filter(
    (v) => skillProgress[v.id]?.timesPracticed > 0
  ).length;

  const bootcampDone = isBootcampComplete();
  const bootcampEnrolled = bootcampProgress.enrolled;
  const bootcampDay = bootcampProgress.currentDay;
  const bootcampCompletedDays = Object.values(bootcampProgress.dayProgress).filter(
    (d) => d.status === 'completed'
  ).length;

  const isNewUser = !bootcampEnrolled && Object.keys(skillProgress).length === 0;

  // New user — hasn't started anything
  if (isNewUser) {
    return (
      <Link href="/hebrew/bootcamp">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gold/20 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gold font-semibold uppercase tracking-widest">
                Your Journey Begins
              </p>
              <h2 className="text-lg font-serif font-bold text-foreground mt-1.5">
                Start Learning Hebrew
              </h2>
              <p className="text-[13px] text-gray-400 mt-1">
                Learn to read the aleph-bet in 5 short sessions
              </p>
            </div>
            <div className="bg-gold text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-gold/25">
              <Play className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Mid-bootcamp
  if (bootcampEnrolled && !bootcampDone) {
    return (
      <Link href="/hebrew/bootcamp">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-primary/15 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-primary font-semibold uppercase tracking-widest">
                Continue Bootcamp
              </p>
              <h2 className="text-lg font-serif font-bold text-foreground mt-1.5">
                Day {bootcampDay} of 5
              </h2>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {bootcampCompletedDays} day{bootcampCompletedDays !== 1 ? 's' : ''} completed
              </p>
            </div>
            <div className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
              <Play className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
          <ProgressBar
            value={bootcampCompletedDays / 5}
            color="var(--primary)"
            size="sm"
            className="mt-4"
          />
        </div>
      </Link>
    );
  }

  // Letters in progress
  if (masteredLetters < totalLetters) {
    return (
      <Link href="/hebrew/letters">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-primary/15 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-primary font-semibold uppercase tracking-widest">
                Continue Learning
              </p>
              <h2 className="text-lg font-serif font-bold text-foreground mt-1.5">
                Level {profile.currentLevel} — Letters
              </h2>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {masteredLetters} of {totalLetters} letters mastered
              </p>
            </div>
            <div className="bg-primary text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
              <Play className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
          <ProgressBar
            value={letterProgress}
            color="var(--primary)"
            size="sm"
            className="mt-4"
          />
        </div>
      </Link>
    );
  }

  // Vowels in progress
  if (learnedVowels < totalVowels) {
    return (
      <Link href="/hebrew/vowels">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-[#8B5CF6]/15 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#8B5CF6] font-semibold uppercase tracking-widest">
                Continue Learning
              </p>
              <h2 className="text-lg font-serif font-bold text-foreground mt-1.5">
                Vowels (Nekudot)
              </h2>
              <p className="text-[13px] text-gray-400 mt-0.5">
                {learnedVowels} of {totalVowels} learned
              </p>
            </div>
            <div className="bg-[#8B5CF6] text-white w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-[#8B5CF6]/25">
              <Play className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
          <ProgressBar
            value={learnedVowels / totalVowels}
            color="#8B5CF6"
            size="sm"
            className="mt-4"
          />
        </div>
      </Link>
    );
  }

  // Everything done — practice
  return (
    <Link href="/hebrew/practice">
      <div className="bg-white rounded-2xl shadow-sm border-2 border-success/15 p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-success font-semibold uppercase tracking-widest">
              Keep Going
            </p>
            <h2 className="text-lg font-serif font-bold text-foreground mt-1.5">
              Practice & Review
            </h2>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Keep your skills sharp with daily practice
            </p>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-300 shrink-0" strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
