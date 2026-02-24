'use client';

import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useBootcampStore } from '@/stores/bootcampStore';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS } from '@/lib/content/vowels';

export function NextUpSpotlight() {
  const skillProgress = useUserStore((s) => s.skillProgress);
  const bootcampProgress = useBootcampStore((s) => s.progress);
  const isBootcampComplete = useBootcampStore((s) => s.isBootcampComplete);

  const bootcampDone = isBootcampComplete();
  const bootcampEnrolled = bootcampProgress.enrolled;
  const bootcampDay = bootcampProgress.currentDay;
  const bootcampCompletedDays = Object.values(
    bootcampProgress.dayProgress
  ).filter((d) => d.status === 'completed').length;

  const totalLetters = LETTERS.length;
  const masteredLetters = Object.values(skillProgress).filter(
    (p) => p.masteryLevel >= 0.8
  ).length;

  const totalVowels = VOWELS.length;
  const learnedVowels = VOWELS.filter(
    (v) => skillProgress[v.id]?.timesPracticed > 0
  ).length;

  const nextLetter = LETTERS.find((l) => {
    const p = skillProgress[l.id];
    return !p || p.masteryLevel < 0.8;
  });

  const nextVowel = VOWELS.find((v) => {
    const p = skillProgress[v.id];
    return !p || p.timesPracticed === 0;
  });

  // Mid-bootcamp
  if (bootcampEnrolled && !bootcampDone) {
    return (
      <Link href="/hebrew/bootcamp">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-gold/20 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gold font-semibold uppercase tracking-widest">
                Next Up
              </p>
              <h3 className="text-base font-serif font-bold text-foreground mt-1">
                Continue Day {bootcampDay}
              </h3>
              {/* Progress dots */}
              <div className="flex gap-1.5 mt-2">
                {[1, 2, 3, 4, 5].map((day) => (
                  <div
                    key={day}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      bootcampProgress.dayProgress[day]?.status === 'completed'
                        ? 'bg-gold'
                        : day === bootcampDay
                        ? 'bg-primary'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="bg-gold text-white w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-gold/20">
              <Play className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Letters in progress
  if (nextLetter && masteredLetters < totalLetters) {
    return (
      <Link href="/hebrew/letters">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-primary/15 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-primary font-semibold uppercase tracking-widest">
                Next Up
              </p>
              <h3 className="text-base font-semibold text-foreground mt-1">
                Learn: {nextLetter.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {masteredLetters}/{totalLetters} mastered — sounds like &ldquo;{nextLetter.sound}&rdquo;
              </p>
            </div>
            <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
              <span className="font-[var(--font-hebrew-serif)] text-3xl text-primary">
                {nextLetter.hebrew}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Vowels in progress
  if (nextVowel && learnedVowels < totalVowels) {
    return (
      <Link href="/hebrew/vowels">
        <div className="bg-white rounded-2xl shadow-sm border-2 border-[#8B5CF6]/15 p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#8B5CF6] font-semibold uppercase tracking-widest">
                Next Up
              </p>
              <h3 className="text-base font-semibold text-foreground mt-1">
                Learn: {nextVowel.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {learnedVowels}/{totalVowels} learned — sounds like &ldquo;{nextVowel.sound}&rdquo;
              </p>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${nextVowel.color}15` }}
            >
              <span
                className="font-[var(--font-hebrew-serif)] text-3xl"
                style={{ color: nextVowel.color }}
              >
                {nextVowel.hebrew}
              </span>
            </div>
          </div>
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
              All Mastered
            </p>
            <h3 className="text-base font-semibold text-foreground mt-1">
              Keep Practicing
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Daily review keeps your skills sharp
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" strokeWidth={2} />
        </div>
      </div>
    </Link>
  );
}
