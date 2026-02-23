'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useBootcampStore } from '@/stores/bootcampStore';
import { WelcomePage } from '@/components/WelcomePage';
import { BottomNav } from '@/components/ui/BottomNav';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS } from '@/lib/content/vowels';

export default function Home() {
  const { onboardingComplete } = useUserStore((s) => s.profile);

  if (!onboardingComplete) {
    return <WelcomePage />;
  }

  return <HomeOverview />;
}

function HomeOverview() {
  const profile = useUserStore((s) => s.profile);
  const skillProgress = useUserStore((s) => s.skillProgress);
  const todaySession = useUserStore((s) => s.todaySession);
  const authStatus = useAuthStore((s) => s.status);
  const bootcampProgress = useBootcampStore((s) => s.progress);
  const isBootcampComplete = useBootcampStore((s) => s.isBootcampComplete);

  // Greeting
  const userName = profile.displayName?.trim() || '';
  const hour = new Date().getHours();
  const baseGreeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const greeting = userName ? `${baseGreeting}, ${userName}` : baseGreeting;

  // Hebrew mastery
  const totalLetters = LETTERS.length;
  const masteredLetters = Object.values(skillProgress).filter(
    (p) => p.masteryLevel >= 0.8
  ).length;
  const letterPct = Math.round((masteredLetters / totalLetters) * 100);

  const totalVowels = VOWELS.length;
  const learnedVowels = VOWELS.filter(
    (v) => skillProgress[v.id]?.timesPracticed > 0
  ).length;

  // Bootcamp
  const bootcampDone = isBootcampComplete();
  const bootcampDay = bootcampProgress.currentDay;
  const bootcampCompletedDays = Object.values(bootcampProgress.dayProgress).filter(
    (d) => d.status === 'completed'
  ).length;

  // Today's study data
  const today = new Date().toISOString().split('T')[0];
  const todayMinutes =
    todaySession.date === today ? todaySession.minutesStudied : 0;
  const dailyGoalProgress = Math.min(1, todayMinutes / profile.dailyGoalMinutes);

  // Section cards data
  const sections = useMemo(() => [
    {
      href: '/hebrew',
      title: 'Hebrew',
      subtitle: bootcampDone
        ? `${masteredLetters}/${totalLetters} letters mastered`
        : bootcampProgress.enrolled
        ? `Bootcamp Day ${bootcampDay} — ${bootcampCompletedDays}/5 complete`
        : `${masteredLetters} letters learned, ${learnedVowels} vowels`,
      color: 'bg-[#1B4965]',
    },
    {
      href: '/daven',
      title: 'Daven',
      subtitle: 'Services, prayers, coaching, and amud mode',
      color: 'bg-[#2D6A4F]',
    },
    {
      href: '/yahrzeit',
      title: 'Yahrzeit',
      subtitle: 'Kaddish types, when to say kaddish, observance',
      color: 'bg-[#5C4033]',
    },
    {
      href: '/living',
      title: 'Daily Living',
      subtitle: 'Brachot and Jewish living guides',
      color: 'bg-[#6B4C9A]',
    },
  ], [masteredLetters, totalLetters, learnedVowels, bootcampDone, bootcampProgress.enrolled, bootcampDay, bootcampCompletedDays]);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary to-[#1A3F57] text-white px-6 pt-8 pb-6">
        <div className="max-w-md mx-auto">
          {/* Top row: app name + settings */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold tracking-wider text-white/40 uppercase">
              Aleph2Davening
            </span>
            {authStatus === 'authenticated' ? (
              <Link
                href="/settings"
                className="text-white/40 hover:text-white/70 transition-colors text-sm"
                aria-label="Settings"
              >
                Settings
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-white/40 hover:text-white/70 transition-colors text-sm"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Greeting */}
          <h1 className="text-2xl font-bold leading-tight">{greeting}</h1>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-4">
            {/* Streak */}
            <div className="bg-white/[0.08] backdrop-blur-sm rounded-xl px-4 py-2.5 flex-1">
              <p className="text-[13px] font-semibold leading-tight">
                {profile.streakDays} {profile.streakDays === 1 ? 'day' : 'days'}
              </p>
              <p className="text-[10px] text-white/40 leading-tight">streak</p>
            </div>

            {/* Daily goal */}
            <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm rounded-xl px-4 py-2.5 flex-1">
              <div className="relative w-8 h-8 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke={dailyGoalProgress >= 1 ? 'var(--success)' : 'var(--primary-light)'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${dailyGoalProgress * 88} 88`}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
                  {Math.round(todayMinutes)}
                </span>
              </div>
              <div>
                <p className="text-[13px] font-semibold leading-tight">
                  {Math.round(todayMinutes)}/{profile.dailyGoalMinutes}m
                </p>
                <p className="text-[10px] text-white/40 leading-tight">today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Cards */}
      <div className="max-w-md mx-auto px-6 py-6 space-y-3 pb-28">
        {sections.map((section, i) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              href={section.href}
              className="block rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${section.color} flex items-center justify-center`}>
                    <span className="text-white text-sm font-bold">
                      {section.title.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {section.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Hebrew mastery overview */}
        {masteredLetters > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-gray-100 p-5"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">Hebrew Progress</h3>
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
