'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  X,
  User,
  LogOut,
  Shield,
  ChevronRight,
  Volume2,
  BookOpen,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { useProfilePanelStore } from '@/stores/profilePanelStore';
import type { Nusach, TransliterationMode, GuideLevel } from '@/types';

export function ProfilePanel() {
  const { isOpen, close } = useProfilePanelStore();
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useUserStore((s) => s.profile);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const displaySettings = useUserStore((s) => s.displaySettings);
  const updateDisplaySettings = useUserStore((s) => s.updateDisplaySettings);
  const router = useRouter();

  const [nusachNote, setNusachNote] = useState('');
  const isAuth = authStatus === 'authenticated';
  const userName = profile.displayName?.trim() || '';
  const userEmail = user?.email || '';
  const initials = userName
    ? userName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : userEmail
    ? userEmail[0].toUpperCase()
    : '?';

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    close();
    router.replace('/');
  };

  // Floating trigger button — only show when authenticated and panel is closed
  const FloatingButton = isAuth && !isOpen ? (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => useProfilePanelStore.getState().open()}
      className="fixed right-4 top-1/3 z-40 w-11 h-11 rounded-full bg-[#1B4965] text-white shadow-lg shadow-[#1B4965]/25 flex items-center justify-center hover:bg-[#163d55] active:scale-95 transition-all"
      aria-label="Open profile"
    >
      <span className="text-sm font-bold leading-none">{initials}</span>
    </motion.button>
  ) : null;

  return (
    <>
      {FloatingButton}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={close}
              className="fixed inset-0 bg-black/40 z-50"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-[#FAF9F6] z-50 shadow-2xl overflow-y-auto overscroll-contain"
            >
              {/* ── Header ── */}
              <div className="bg-gradient-to-b from-[#1B4965] to-[#1A3F57] text-white px-5 pt-12 pb-6">
                <button
                  onClick={close}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                </button>

                {isAuth ? (
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center shrink-0 ring-2 ring-white/20">
                      <span className="text-xl font-bold leading-none">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold truncate">
                        {userName || 'Your Profile'}
                      </p>
                      <p className="text-sm text-white/50 truncate">{userEmail}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3">
                      <User className="w-7 h-7 text-white/50" strokeWidth={1.5} />
                    </div>
                    <p className="text-lg font-bold">Welcome</p>
                    <p className="text-sm text-white/50 mt-0.5">
                      Sign in to save your progress
                    </p>
                  </div>
                )}
              </div>

              <div className="px-5 py-5 space-y-4 pb-24">
                {/* ── Guest: Sign In Prompt ── */}
                {!isAuth && (
                  <div className="space-y-2.5">
                    <Link
                      href="/signup"
                      onClick={close}
                      className="block w-full text-center px-4 py-3 rounded-xl bg-[#1B4965] text-white text-sm font-semibold hover:bg-[#163d55] transition-colors shadow-sm"
                    >
                      Create Free Account
                    </Link>
                    <Link
                      href="/login"
                      onClick={close}
                      className="block w-full text-center px-4 py-3 rounded-xl bg-white text-[#1B4965] text-sm font-semibold border border-[#1B4965]/20 hover:border-[#1B4965]/40 transition-colors"
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {/* ── Quick Stats (auth only) ── */}
                {isAuth && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: profile.streakDays, label: 'Streak', color: '#C6973F' },
                      {
                        value: Math.round(profile.totalStudyMinutes),
                        label: 'Minutes',
                        color: '#1B4965',
                      },
                      {
                        value: profile.totalWordsMastered,
                        label: 'Mastered',
                        color: '#4A7C59',
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-white rounded-xl border border-gray-100 py-3 px-2 text-center"
                      >
                        <p className="text-lg font-bold" style={{ color: stat.color }}>
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Learning Preferences ── */}
                <PanelSection icon={BookOpen} title="Learning">
                  {/* Nusach */}
                  <SettingLabel>Nusach</SettingLabel>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['ashkenaz', 'sefard', 'edot'] as Nusach[]).map((n) => (
                      <OptionChip
                        key={n}
                        active={profile.nusach === n}
                        onClick={() => {
                          if (n !== 'ashkenaz') {
                            setNusachNote('Currently the app only supports Ashkenaz nusach. Sefard and Edot HaMizrach are coming soon!');
                            setTimeout(() => setNusachNote(''), 4000);
                          } else {
                            setNusachNote('');
                            updateProfile({ nusach: n });
                          }
                        }}
                      >
                        {n === 'ashkenaz' ? 'Ashkenaz' : n === 'sefard' ? 'Sefard' : 'Edot'}
                      </OptionChip>
                    ))}
                  </div>
                  {nusachNote && (
                    <p className="text-xs text-[#D4A373] leading-relaxed mt-1">{nusachNote}</p>
                  )}

                  {/* Voice */}
                  <SettingLabel>Voice</SettingLabel>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['male', 'female'] as const).map((v) => (
                      <OptionChip
                        key={v}
                        active={(profile.voiceGender || 'male') === v}
                        onClick={() => updateProfile({ voiceGender: v })}
                      >
                        {v === 'male' ? 'Male' : 'Female'}
                      </OptionChip>
                    ))}
                  </div>

                  {/* Guide Level */}
                  <SettingLabel>Guide Detail</SettingLabel>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      { value: 'beginner' as GuideLevel, label: 'Starting' },
                      { value: 'intermediate' as GuideLevel, label: 'Practicing' },
                      { value: 'advanced' as GuideLevel, label: 'Full' },
                    ]).map((opt) => (
                      <OptionChip
                        key={opt.value}
                        active={(profile.guideContentLevel || 'beginner') === opt.value}
                        onClick={() => updateProfile({ guideContentLevel: opt.value })}
                      >
                        {opt.label}
                      </OptionChip>
                    ))}
                  </div>

                  {/* Daily Goal */}
                  <SettingLabel>Daily Goal</SettingLabel>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[3, 5, 10, 15].map((mins) => (
                      <OptionChip
                        key={mins}
                        active={profile.dailyGoalMinutes === mins}
                        onClick={() => updateProfile({ dailyGoalMinutes: mins })}
                      >
                        {mins}m
                      </OptionChip>
                    ))}
                  </div>

                  {/* Transliteration */}
                  <SettingLabel>Transliteration</SettingLabel>
                  <div className="grid grid-cols-2 gap-1.5">
                    {([
                      { value: 'full' as TransliterationMode, label: 'Full' },
                      { value: 'faded' as TransliterationMode, label: 'Faded' },
                      { value: 'tap' as TransliterationMode, label: 'Tap' },
                      { value: 'off' as TransliterationMode, label: 'Off' },
                    ]).map((opt) => (
                      <OptionChip
                        key={opt.value}
                        active={profile.transliterationMode === opt.value}
                        onClick={() => updateProfile({ transliterationMode: opt.value })}
                      >
                        {opt.label}
                      </OptionChip>
                    ))}
                  </div>
                </PanelSection>

                {/* ── Audio ── */}
                <PanelSection icon={Volume2} title="Audio">
                  <SettingLabel>Speed: {profile.audioSpeed}x</SettingLabel>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.25}
                    value={profile.audioSpeed}
                    onChange={(e) =>
                      updateProfile({ audioSpeed: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#1B4965]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 -mt-1">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>2x</span>
                  </div>
                </PanelSection>

                {/* ── Display ── */}
                <PanelSection icon={Eye} title="Display">
                  {([
                    { key: 'showTransliteration' as const, label: 'Transliteration' },
                    { key: 'showTranslation' as const, label: 'Translation' },
                    { key: 'showInstructions' as const, label: 'Instructions' },
                    { key: 'showAmudCues' as const, label: 'Amud Cues' },
                  ]).map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-gray-700">{label}</span>
                      <button
                        onClick={() =>
                          updateDisplaySettings({ [key]: !displaySettings[key] })
                        }
                        className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
                          displaySettings[key] ? 'bg-[#1B4965]' : 'bg-gray-300'
                        }`}
                        style={{ width: 40, height: 22 }}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform ${
                            displaySettings[key] ? 'translate-x-[18px]' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </PanelSection>

                {/* ── Account & Security link ── */}
                {isAuth && (
                  <Link
                    href="/settings"
                    onClick={close}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4.5 h-4.5 text-gray-400" style={{ width: 18, height: 18 }} />
                      <span className="text-sm font-medium text-gray-700">
                        Account &amp; Security
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                )}

                {/* ── Sign Out ── */}
                {isAuth && (
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:border-[#C17767] hover:text-[#C17767] transition-colors"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={2} />
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Sub-components ── */

function PanelSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="text-[#1B4965]" style={{ width: 16, height: 16 }} />
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SettingLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium text-gray-500 mt-1">{children}</p>
  );
}

function OptionChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
        active
          ? 'border-[#1B4965] bg-[#1B4965]/5 text-[#1B4965]'
          : 'border-gray-200 text-gray-500 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
}
