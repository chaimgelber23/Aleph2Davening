'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, X, LogIn, Shield, User } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { useBootcampStore } from '@/stores/bootcampStore';
import { useProfilePanelStore } from '@/stores/profilePanelStore';
import { WelcomePage } from '@/components/WelcomePage';
import { BottomNav } from '@/components/ui/BottomNav';
import { ContinueHero } from '@/components/home/ContinueHero';
import { DailyWisdom } from '@/components/home/DailyWisdom';
import { QuickActionPills } from '@/components/home/QuickActionPills';
import { TodaysGoals } from '@/components/home/TodaysGoals';
import { AppTour } from '@/components/home/AppTour';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS } from '@/lib/content/vowels';
import {
  getRandomStreakEncouragement,
  getDailyInspiration,
  formatWithName,
} from '@/lib/content/encouragements';

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
  const openProfile = useProfilePanelStore((s) => s.open);
  const hasCompletedAppTour = useUserStore((s) => s.hasCompletedAppTour);
  const resetAppTour = useUserStore((s) => s.resetAppTour);

  // Greeting — Hebrew style
  const userName = profile.displayName?.trim() || '';
  const hour = new Date().getHours();
  const baseGreeting =
    hour < 12 ? 'Boker Tov' : hour < 18 ? 'Tzohorayim Tovim' : 'Erev Tov';
  const greeting = userName ? `${baseGreeting}, ${userName}` : baseGreeting;
  const greetingHebrew =
    hour < 12 ? 'בּוֹקֶר טוֹב' : hour < 18 ? 'צָהֳרַיִם טוֹבִים' : 'עֶרֶב טוֹב';

  // Progress data
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

  // Today
  const today = new Date().toISOString().split('T')[0];
  const todayMinutes =
    todaySession.date === today ? todaySession.minutesStudied : 0;
  const dailyGoalProgress = Math.min(1, todayMinutes / profile.dailyGoalMinutes);

  // Encouragement
  const [streakMessage, setStreakMessage] = useState(
    () => getRandomStreakEncouragement()
  );
  useEffect(() => {
    setStreakMessage(getRandomStreakEncouragement());
  }, []);
  const dailyQuote = useMemo(() => getDailyInspiration(), []);

  // Lapsed user detection
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  useEffect(() => {
    if (profile.lastPracticeDate) {
      const last = new Date(profile.lastPracticeDate + 'T00:00:00');
      const now = new Date();
      const daysSince = Math.floor(
        (now.getTime() - last.getTime()) / 86400000
      );
      if (daysSince >= 3) setShowWelcomeBack(true);
    }
  }, [profile.lastPracticeDate]);

  // Signup prompt — always show for unauthenticated users
  const showSignup = authStatus === 'unauthenticated';

  // Section cards
  const sections = useMemo(
    () => [
      {
        href: '/hebrew',
        title: 'Hebrew',
        titleHebrew: 'עִבְרִית',
        subtitle: bootcampDone
          ? `${masteredLetters}/${totalLetters} letters mastered`
          : bootcampProgress.enrolled
          ? `Bootcamp Day ${bootcampDay} — ${bootcampCompletedDays}/5`
          : `${masteredLetters} letters learned, ${learnedVowels} vowels`,
        accentColor: '#1B4965',
        progress: letterPct / 100,
      },
      {
        href: '/daven',
        title: 'Daven',
        titleHebrew: 'תְּפִלָּה',
        subtitle: 'Services, prayers, and coaching',
        accentColor: '#2D6A4F',
      },
      {
        href: '/yahrzeit',
        title: 'Yahrzeit',
        titleHebrew: 'יאָהרצײַט',
        subtitle: 'Kaddish types and observance guide',
        accentColor: '#5C4033',
      },
      {
        href: '/living',
        title: 'Jewish Living',
        titleHebrew: 'חַיִּים יְהוּדִיִּים',
        subtitle: 'Brachot and Jewish living guides',
        accentColor: '#6B4C9A',
      },
    ],
    [
      masteredLetters,
      totalLetters,
      learnedVowels,
      bootcampDone,
      bootcampProgress.enrolled,
      bootcampDay,
      bootcampCompletedDays,
      letterPct,
    ]
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* ── Header ── */}
      <div className="bg-gradient-to-b from-primary to-[#1A3F57] text-white px-6 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Top row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold tracking-wider text-white/40 uppercase">
              Aleph2Davening
            </span>
            {authStatus === 'authenticated' ? (
              <button
                onClick={openProfile}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1.5"
                aria-label="Open profile"
              >
                <User className="w-3.5 h-3.5 text-white/70" strokeWidth={2} />
                <span className="text-xs font-medium text-white/80">
                  {userName || 'Profile'}
                </span>
              </button>
            ) : (
              <button
                onClick={openProfile}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors rounded-full px-3.5 py-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-white/90" strokeWidth={2} />
                <span className="text-xs font-semibold text-white/90">Sign In</span>
              </button>
            )}
          </div>

          {/* Greeting with Hebrew */}
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-bold leading-tight tracking-tight">
              {greeting}
            </h1>
            <p
              dir="rtl"
              className="font-[var(--font-hebrew-serif)] text-2xl text-white/50"
            >
              {greetingHebrew}
            </p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-5" data-tour="tour-header">
            {/* Streak */}
            <div className="bg-white/[0.08] backdrop-blur-sm rounded-xl px-4 py-2.5 flex-1" data-tour="tour-streak">
              <p className="text-[13px] font-semibold leading-tight">
                {profile.streakDays}{' '}
                {profile.streakDays === 1 ? 'day' : 'days'}
              </p>
              <p className="text-[10px] text-white/40 leading-tight">streak</p>
            </div>

            {/* Daily goal */}
            <div className="flex items-center gap-2 bg-white/[0.08] backdrop-blur-sm rounded-xl px-4 py-2.5 flex-1" data-tour="tour-daily-goal">
              <div className="relative w-8 h-8 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={
                      dailyGoalProgress >= 1
                        ? 'var(--success)'
                        : 'var(--primary-light)'
                    }
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

          {/* Ambient encouragement / quote */}
          <p className="text-[11px] text-white/30 italic mt-4 leading-relaxed">
            {profile.streakDays > 0 ? (
              <>
                <span
                  dir="rtl"
                  className="font-[var(--font-hebrew-serif)] not-italic"
                >
                  {streakMessage.hebrew}
                </span>
                {' — '}
                {formatWithName(streakMessage.english, userName)}
              </>
            ) : (
              <>
                &ldquo;{dailyQuote.english}&rdquo; — {dailyQuote.source}
              </>
            )}
          </p>
        </motion.div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-md mx-auto px-6 pt-5 pb-28 space-y-4">
        {/* Welcome back banner */}
        {showWelcomeBack && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gold/15 p-4 flex items-center gap-3"
          >
            <Sparkles
              className="w-6 h-6 text-gold flex-shrink-0"
              strokeWidth={1.5}
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Welcome back{userName ? `, ${userName}` : ''}!
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Your progress is saved. Pick up where you left off.
              </p>
            </div>
            <button
              onClick={() => setShowWelcomeBack(false)}
              className="text-gray-300 hover:text-gray-500 p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Continue Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <ContinueHero />
        </motion.div>

        {/* Daily Wisdom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <DailyWisdom />
        </motion.div>

        {/* Quick Action Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          data-tour="tour-quick-actions"
        >
          <QuickActionPills />
        </motion.div>

        {/* Today's Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <TodaysGoals />
        </motion.div>

        {/* Section Cards */}
        {sections.map((section, i) => (
          <motion.div
            key={section.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
          >
            <Link
              href={section.href}
              className="block rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-5"
              data-tour={`tour-section-${section.href.slice(1)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-1 h-10 rounded-full"
                    style={{ backgroundColor: section.accentColor }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">
                        {section.title}
                      </h2>
                      <span
                        dir="rtl"
                        className="font-[var(--font-hebrew-serif)] text-xs text-gray-300"
                      >
                        {section.titleHebrew}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {section.subtitle}
                    </p>
                    {section.progress !== undefined && section.progress > 0 && (
                      <div className="h-1 w-24 bg-gray-100 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${section.progress * 100}%`,
                            backgroundColor: section.accentColor,
                          }}
                        />
                      </div>
                    )}
                  </div>
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

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-2.5"
          data-tour="tour-stats"
        >
          {[
            {
              value: masteredLetters,
              label: 'Letters',
              color: 'var(--primary)',
            },
            {
              value: Math.round(todayMinutes),
              label: 'Min Today',
              color: 'var(--success)',
            },
            {
              value: profile.streakDays,
              label: 'Day Streak',
              color: 'var(--gold)',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 py-4 px-3 text-center"
            >
              <p className="text-[22px] font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Replay tour */}
        {hasCompletedAppTour && (
          <button
            onClick={resetAppTour}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-500 transition-colors py-1"
          >
            Replay app tour
          </button>
        )}

        {/* Sign In / Keep Progress Prompt */}
        {showSignup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#1B4965]/[0.04] to-[#5FA8D3]/[0.06] rounded-2xl border border-[#1B4965]/10 p-5"
          >
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-10 h-10 bg-[#1B4965]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-[#1B4965]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">
                  Keep your progress
                </p>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                  Sign in to save your learning, sync across devices, and never lose your streak.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/signup"
                className="flex-1 text-center px-4 py-2.5 rounded-xl bg-[#1B4965] text-white text-sm font-semibold hover:bg-[#163d55] transition-colors shadow-sm"
              >
                Create Free Account
              </Link>
              <Link
                href="/login"
                className="flex-1 text-center px-4 py-2.5 rounded-xl bg-white text-[#1B4965] text-sm font-semibold border border-[#1B4965]/20 hover:border-[#1B4965]/40 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {!hasCompletedAppTour && <AppTour />}

      <BottomNav />
    </div>
  );
}
