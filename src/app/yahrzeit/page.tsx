'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { KaraokePlayer } from '@/components/siddur/KaraokePlayer';
import { CoachingOverlay } from '@/components/siddur/CoachingOverlay';
import { PrayerSettingsModal } from '@/components/siddur/PrayerSettingsModal';
import { AmudBadge } from '@/components/siddur/AmudBadge';
import { KaddishServiceMap } from '@/components/yahrzeit/KaddishServiceMap';
import { KaddishPrintGuide } from '@/components/yahrzeit/KaddishPrintGuide';
import { getServicePrayer } from '@/lib/content/service-prayers';
import { getService } from '@/lib/content/services';
import {
  KADDISH_TYPES,
  KADDISH_IN_SERVICES,
  YAHRZEIT_PRACTICES,
  CONGREGATION_RESPONSE,
} from '@/lib/content/yahrzeit';
import { useAudio } from '@/hooks/useAudio';
import { useKaraokeSync } from '@/hooks/useKaraokeSync';
import { useUserStore } from '@/stores/userStore';
import type { KaddishType } from '@/types';
import type { AudioSourceId, PrayerAudioEntry } from '@/lib/content/audio-sources';

type YahrzeitView = 'home' | 'learn_kaddish' | 'kaddish_types' | 'service_map' | 'print_guide' | 'observance';

export default function YahrzeitPage() {
  const [view, setView] = useState<YahrzeitView>('home');
  const [expandedKaddish, setExpandedKaddish] = useState<KaddishType | null>('mourners');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // === Learn Kaddish state ===
  const mournersPrayer = useMemo(() => getServicePrayer('kaddish-mourners'), []);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showCoaching, setShowCoaching] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [viewMode, setViewMode] = useState<'section' | 'full'>('section');
  const [showProgressSidebar, setShowProgressSidebar] = useState(false);
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [selectedAudioSource, setSelectedAudioSource] = useState<AudioSourceId>('siddur-audio');
  const [selectedAudioEntry, setSelectedAudioEntry] = useState<PrayerAudioEntry | null>(null);

  const audioSpeed = useUserStore((s) => s.profile.audioSpeed);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const displaySettings = useUserStore((s) => s.displaySettings);

  // Audio
  const handleAudioEnded = useCallback(() => {
    if (!mournersPrayer || !autoAdvanceEnabled) return;
    const total = mournersPrayer.sections.length;
    setCurrentSectionIndex((prev) => {
      if (prev < total - 1) {
        setAutoPlayNext(true);
        return prev + 1;
      }
      return prev;
    });
  }, [mournersPrayer, autoAdvanceEnabled]);

  const audioOptions = useMemo(
    () => ({ speed: audioSpeed, onEnded: handleAudioEnded }),
    [audioSpeed, handleAudioEnded]
  );
  const { play, stop, isPlaying, isLoading } = useAudio(audioOptions);

  const currentSection = mournersPrayer?.sections[currentSectionIndex];
  const words = currentSection?.hebrewText.split(' ') || [];

  const { currentWordIndex, progress } = useKaraokeSync({
    words,
    wordTimings: currentSection?.wordTimings,
    isPlaying,
    speed: audioSpeed,
  });

  // Auto-play next section
  useEffect(() => {
    if (autoPlayNext && currentSection && mournersPrayer) {
      setAutoPlayNext(false);
      const timer = setTimeout(() => {
        play(currentSection.hebrewText, 'hebrew', audioSpeed, mournersPrayer.id, currentSection.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlayNext, currentSection, mournersPrayer, audioSpeed, play]);

  // Auto-scroll in full view
  useEffect(() => {
    if (view === 'learn_kaddish' && viewMode === 'full') {
      document.getElementById(`full-section-${currentSectionIndex}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentSectionIndex, viewMode, view]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else if (currentSection && mournersPrayer) {
      play(currentSection.hebrewText, 'hebrew', audioSpeed, mournersPrayer.id, currentSection.id);
    }
  }, [isPlaying, stop, play, currentSection, mournersPrayer, audioSpeed]);

  const handleReplay = useCallback(() => {
    if (currentSection && mournersPrayer) {
      stop();
      play(currentSection.hebrewText, 'hebrew', audioSpeed, mournersPrayer.id, currentSection.id);
    }
  }, [currentSection, mournersPrayer, audioSpeed, stop, play]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    updateProfile({ audioSpeed: newSpeed });
  }, [updateProfile]);

  const handleBack = useCallback(() => {
    stop();
    setView('home');
    setCurrentSectionIndex(0);
    setSelectedServiceId(null);
  }, [stop]);

  // === HOME VIEW ===
  if (view === 'home') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-[#5C4033] text-white px-6 py-8 rounded-b-3xl">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-white/60 text-sm hover:text-white transition-colors">
                Home
              </Link>
              <Link href="/settings" className="text-white/60 text-sm hover:text-white transition-colors">
                Settings
              </Link>
            </div>
            <h1 className="text-2xl font-bold mt-2">Yahrzeit & Kaddish</h1>
            <p className="text-white/60 text-sm mt-1">
              A complete guide for honoring a loved one&apos;s memory
            </p>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-5 space-y-4 pb-28">
          {/* Hero CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-2xl border border-[#5C4033]/10 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground">
                Learn to Say Mourner&apos;s Kaddish
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Step-by-step audio coaching. Hear each line, follow along, and practice at your own pace.
              </p>
              <button
                onClick={() => setView('learn_kaddish')}
                className="mt-4 w-full py-3.5 rounded-xl bg-[#5C4033] text-white text-sm font-semibold hover:bg-[#4a3529] transition-colors"
              >
                Start Learning
              </button>
            </div>
          </motion.div>

          {/* Congregation Response quick reference */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="bg-[#5C4033]/5 rounded-2xl p-5 border border-[#5C4033]/8">
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#5C4033] mb-2">
                Key Response — Say This During Every Kaddish
              </p>
              <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-xl text-[#5C4033] leading-relaxed">
                {CONGREGATION_RESPONSE.hebrew}
              </p>
              <p className="text-sm text-[#5C4033]/70 italic mt-1">
                {CONGREGATION_RESPONSE.transliteration}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                &ldquo;{CONGREGATION_RESPONSE.translation}&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Section Cards */}
          {[
            {
              title: 'What Is Kaddish?',
              subtitle: 'The four types and what each one means',
              view: 'kaddish_types' as YahrzeitView,
            },
            {
              title: 'Kaddish in the Services',
              subtitle: 'Where you say YOUR Kaddish in Shacharit, Mincha, and Maariv',
              view: 'service_map' as YahrzeitView,
            },
            {
              title: 'Printable Service Guide',
              subtitle: 'A reference to bring to shul',
              view: 'print_guide' as YahrzeitView,
            },
            {
              title: 'Yahrzeit Observance',
              subtitle: 'What to do on the anniversary',
              view: 'observance' as YahrzeitView,
            },
          ].map((card, i) => (
            <motion.div
              key={card.view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
            >
              <button
                onClick={() => setView(card.view)}
                className="w-full text-left block rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      {card.title}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {card.subtitle}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </motion.div>
          ))}
        </div>

        <BottomNav />
      </div>
    );
  }

  // === LEARN KADDISH VIEW ===
  if (view === 'learn_kaddish' && mournersPrayer) {
    const totalSections = mournersPrayer.sections.length;

    return (
      <div className="min-h-screen bg-background">
        {/* Top Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button onClick={handleBack} className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
              <span className="sr-only">Back</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-800">
                Mourner&apos;s Kaddish
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {currentSectionIndex + 1} of {totalSections}
              </span>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center w-10 h-10 -mr-2 text-gray-400 hover:text-[#5C4033] transition-colors"
              title="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-5 pb-32">
          {/* Context for first section */}
          {currentSectionIndex === 0 && displaySettings.showInstructions && (
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-400">
                {mournersPrayer.whenSaid}
              </p>
              <p className="text-xs text-[#5C4033]/60 italic">
                {mournersPrayer.inspirationText?.slice(0, 120)}...
              </p>
            </div>
          )}

          {/* Amud Badge */}
          {displaySettings.showAmudCues && currentSection?.amud && (
            <div className="flex items-center justify-center gap-2">
              <AmudBadge role={currentSection.amud.role} />
              {currentSection.amud.physicalActions?.map((action) => (
                <span
                  key={action}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-warning/15 text-[#8B6914] text-[10px] font-medium"
                >
                  {action.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Progress Sidebar/Outline */}
          {showProgressSidebar && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Kaddish Outline ({currentSectionIndex + 1}/{totalSections})</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {mournersPrayer.sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => { stop(); setCurrentSectionIndex(idx); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      idx === currentSectionIndex
                        ? 'bg-[#5C4033] text-white font-medium'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="font-medium">{idx + 1}.</span> {section.hebrewText.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Section View: Karaoke Player */}
          {viewMode === 'section' && currentSection && (
            <KaraokePlayer
              section={currentSection}
              prayerId={mournersPrayer.id}
              currentWordIndex={currentWordIndex}
              progress={progress}
              onTogglePlay={handleTogglePlay}
              onReplay={handleReplay}
              onSpeedChange={handleSpeedChange}
              onWordTap={handleReplay}
              isPlaying={isPlaying}
              isLoading={isLoading}
            />
          )}

          {/* Full Prayer View */}
          {viewMode === 'full' && (
            <div className="space-y-4">
              {/* Audio Controls */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-[60px] z-20 shadow-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReplay}
                    disabled={isLoading}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isLoading ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="1 4 1 10 7 10" />
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                  </button>
                  <button
                    onClick={handleTogglePlay}
                    disabled={isLoading}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md ${
                      isPlaying
                        ? 'bg-error text-white'
                        : isLoading
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-[#5C4033] text-white hover:bg-[#4a3529]'
                    }`}
                  >
                    {isLoading ? (
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                      </svg>
                    ) : isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#5C4033] rounded-full transition-all duration-100"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">
                        Section {currentSectionIndex + 1}/{totalSections}
                      </span>
                      <span className="text-[10px] font-medium text-[#5C4033]">{audioSpeed}x</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-300">Slow</span>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.25}
                    value={audioSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="flex-1 accent-[#5C4033] h-1"
                  />
                  <span className="text-[10px] text-gray-300">Fast</span>
                </div>
              </div>

              {/* All Sections */}
              {mournersPrayer.sections.map((section, idx) => {
                const isCurrent = idx === currentSectionIndex;
                const sectionWords = section.hebrewText.split(' ');

                return (
                  <button
                    key={section.id}
                    onClick={() => { stop(); setCurrentSectionIndex(idx); }}
                    className={`w-full text-left rounded-2xl border p-5 transition-all ${
                      isCurrent
                        ? 'border-[#5C4033] shadow-md bg-white'
                        : 'border-gray-100 bg-white/80 hover:border-gray-200'
                    }`}
                    id={`full-section-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Section {idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-[#5C4033] uppercase tracking-wider">
                          Now Playing
                        </span>
                      )}
                    </div>

                    {isCurrent ? (
                      <div dir="rtl" className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 leading-[2.2]">
                        {sectionWords.map((word, i) => {
                          const isPast = i < currentWordIndex;
                          const isCurrentWord = i === currentWordIndex;
                          const isFuture = i > currentWordIndex;
                          return (
                            <span
                              key={i}
                              className={`
                                font-[var(--font-hebrew-serif)] text-2xl px-1 py-0.5 rounded-lg transition-all duration-200
                                ${isCurrentWord ? 'bg-[#5C4033]/15 text-[#5C4033] scale-105' : ''}
                                ${isPast && isPlaying ? 'text-[#5C4033]/40' : ''}
                                ${isFuture && isPlaying ? 'text-[#1A1A2E]' : ''}
                                ${!isPlaying ? 'text-[#1A1A2E]' : ''}
                              `}
                            >
                              {word}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="font-[var(--font-hebrew-serif)] text-xl text-[#1A1A2E]/70 leading-[1.8] text-right" dir="rtl">
                        {section.hebrewText}
                      </p>
                    )}

                    {displaySettings.showTransliteration && section.transliteration && (
                      isCurrent ? (
                        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mt-2">
                          {section.transliteration.split(' ').map((word, i) => (
                            <span
                              key={i}
                              className={`text-sm transition-all duration-200 ${
                                i === currentWordIndex
                                  ? 'text-[#5C4033] font-semibold'
                                  : 'text-gray-400 italic'
                              }`}
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic mt-2">{section.transliteration}</p>
                      )
                    )}

                    {displaySettings.showTranslation && section.translation && (
                      <p className={`text-sm mt-2 ${isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                        {section.translation}
                      </p>
                    )}

                    {isCurrent && displaySettings.showAmudCues && section.amud && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {section.amud.instruction && (
                          <p className="text-xs text-[#5C4033] font-medium text-center">
                            {section.amud.instruction}
                          </p>
                        )}
                        {section.amud.congregationResponse && (
                          <div className="bg-success/5 rounded-xl p-3">
                            <p className="text-[10px] uppercase tracking-wider text-success font-semibold mb-0.5">
                              Congregation responds
                            </p>
                            <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-base text-success">
                              {section.amud.congregationResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Section Navigation (section view only) */}
          {viewMode === 'section' && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentSectionIndex > 0) {
                    stop();
                    setAutoPlayNext(false);
                    setCurrentSectionIndex(currentSectionIndex - 1);
                  }
                }}
                disabled={currentSectionIndex === 0}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  currentSectionIndex === 0 ? 'text-gray-300' : 'text-[#5C4033] hover:bg-[#5C4033]/5'
                }`}
              >
                Previous
              </button>

              <div className="flex gap-1">
                {mournersPrayer.sections.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { stop(); setCurrentSectionIndex(i); }}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentSectionIndex ? 'bg-[#5C4033]' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (currentSectionIndex < totalSections - 1) {
                    stop();
                    setAutoPlayNext(false);
                    setCurrentSectionIndex(currentSectionIndex + 1);
                  }
                }}
                disabled={currentSectionIndex === totalSections - 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  currentSectionIndex === totalSections - 1 ? 'text-gray-300' : 'text-[#5C4033] hover:bg-[#5C4033]/5'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Coach floating button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => { stop(); setShowCoaching(true); }}
          className="fixed bottom-24 right-6 bg-gold text-white px-5 py-3 rounded-full shadow-lg hover:bg-[#b8892f] active:scale-95 transition-all flex items-center gap-2 z-20"
        >
          <span className="text-sm font-medium">Coach</span>
        </motion.button>

        {/* Coaching overlay */}
        <AnimatePresence>
          {showCoaching && (
            <CoachingOverlay
              prayer={mournersPrayer}
              initialSectionIndex={currentSectionIndex}
              onClose={() => setShowCoaching(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSettingsModal && (
            <PrayerSettingsModal
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
              prayerId={mournersPrayer.id}
              selectedAudioSource={selectedAudioSource}
              onSelectAudioSource={(sourceId: AudioSourceId, entry: PrayerAudioEntry | null) => {
                setSelectedAudioSource(sourceId);
                setSelectedAudioEntry(entry);
              }}
              autoAdvanceEnabled={autoAdvanceEnabled}
              onToggleAutoAdvance={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              showProgressSidebar={showProgressSidebar}
              onToggleProgressSidebar={() => setShowProgressSidebar(!showProgressSidebar)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // === KADDISH TYPES VIEW ===
  if (view === 'kaddish_types') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button onClick={handleBack} className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-800">What Is Kaddish?</span>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-4 pb-28">
          <p className="text-sm text-gray-600 leading-relaxed">
            There are four different versions of Kaddish said during services.
            Only one — the Mourner&apos;s Kaddish — is yours to say. The other three
            are said by the prayer leader (chazzan). You just listen and respond
            &ldquo;Amen&rdquo; when he pauses.
          </p>

          {KADDISH_TYPES.map((kaddish, i) => {
            const isExpanded = expandedKaddish === kaddish.type;
            const isMourners = kaddish.isYourKaddish;

            return (
              <motion.div
                key={kaddish.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setExpandedKaddish(isExpanded ? null : kaddish.type)}
                  className={`w-full rounded-2xl bg-white text-left p-5 transition-all ${
                    isMourners
                      ? 'border-2 border-[#5C4033]/20 shadow-sm'
                      : 'border border-gray-100 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isMourners && (
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#5C4033] mb-1">
                          Your Kaddish
                        </p>
                      )}
                      <h3 className={`font-semibold ${isMourners ? 'text-base text-foreground' : 'text-sm text-foreground'}`}>
                        {kaddish.nameEnglish}
                      </h3>
                      <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-lg text-gray-400 mt-0.5">
                        {kaddish.nameHebrew}
                      </p>
                      <p className={`text-xs mt-1 ${isMourners ? 'text-[#5C4033]/70 font-medium' : 'text-gray-400'}`}>
                        {kaddish.yourRole}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-300 transition-transform mt-1 ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {kaddish.description}
                      </p>

                      {kaddish.key_line && (
                        <div className={`rounded-xl p-3 ${isMourners ? 'bg-[#5C4033]/5' : 'bg-gray-50'}`}>
                          <p className={`text-[10px] uppercase tracking-wider font-semibold mb-1 ${
                            isMourners ? 'text-[#5C4033]' : 'text-gray-500'
                          }`}>
                            Key line
                          </p>
                          <p dir="rtl" className={`font-[var(--font-hebrew-serif)] text-xl ${
                            isMourners ? 'text-[#5C4033]' : 'text-gray-700'
                          }`}>
                            {kaddish.key_line}
                          </p>
                          {kaddish.key_line_transliteration && (
                            <p className={`text-sm italic mt-1 ${
                              isMourners ? 'text-[#5C4033]/60' : 'text-gray-400'
                            }`}>
                              {kaddish.key_line_transliteration}
                            </p>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">When it is said</p>
                        <ul className="space-y-1">
                          {kaddish.whenSaid.map((when, j) => (
                            <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-gray-300 mt-1 shrink-0">-</span>
                              <span>{when}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {isMourners && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setView('learn_kaddish');
                          }}
                          className="w-full py-3 rounded-xl bg-[#5C4033] text-white text-sm font-semibold hover:bg-[#4a3529] transition-colors mt-2"
                        >
                          Learn to Say It
                        </button>
                      )}
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>

        <BottomNav />
      </div>
    );
  }

  // === SERVICE MAP VIEW ===
  if (view === 'service_map') {
    const selectedService = selectedServiceId ? getService(selectedServiceId) : null;

    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button
              onClick={() => {
                if (selectedServiceId) {
                  setSelectedServiceId(null);
                } else {
                  handleBack();
                }
              }}
              className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-800">
              {selectedService ? selectedService.name : 'Kaddish in the Services'}
            </span>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 pb-28">
          {!selectedService ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                On a yahrzeit, attend all three daily services if possible.
                If you can only make one, Shacharit (morning) is the most important.
              </p>

              {KADDISH_IN_SERVICES.map((service, i) => (
                <motion.div
                  key={service.serviceId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedServiceId(service.serviceId)}
                    className="w-full text-left rounded-2xl bg-white border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-base font-semibold text-foreground">
                            {service.service}
                          </h3>
                          <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-gray-400">
                            {service.serviceHebrew}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {service.timeOfDay} — ~{service.estimatedMinutes} min
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {service.occurrences.filter((o) => o.type === 'mourners').length} Mourner&apos;s Kaddish
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </motion.div>
              ))}

              {/* Quick reference: In Services */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                  Quick Reference
                </h3>
                {KADDISH_IN_SERVICES.map((service) => (
                  <div key={service.serviceId} className="mb-4">
                    <p className="text-xs font-semibold text-foreground mb-1.5">
                      {service.service}
                    </p>
                    <div className="space-y-1">
                      {service.occurrences.map((occ, j) => {
                        const isMourners = occ.type === 'mourners';
                        return (
                          <div
                            key={j}
                            className={`flex items-center gap-2 text-xs ${
                              isMourners ? 'text-[#5C4033] font-medium' : 'text-gray-500'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isMourners ? 'bg-[#5C4033]' : 'bg-gray-300'
                            }`} />
                            <span>
                              {isMourners ? 'YOUR KADDISH — ' : ''}
                              {occ.when}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <KaddishServiceMap
              service={selectedService}
              onLearnKaddish={() => setView('learn_kaddish')}
            />
          )}
        </div>

        <BottomNav />
      </div>
    );
  }

  // === PRINT GUIDE VIEW ===
  if (view === 'print_guide') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30 no-print">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button onClick={handleBack} className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-800">Printable Guide</span>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 pb-28">
          <KaddishPrintGuide onBack={handleBack} />
        </div>

        <div className="no-print">
          <BottomNav />
        </div>
      </div>
    );
  }

  // === OBSERVANCE VIEW ===
  if (view === 'observance') {
    const essentialPractices = YAHRZEIT_PRACTICES.filter((p) => p.required).sort((a, b) => a.sortOrder - b.sortOrder);
    const customPractices = YAHRZEIT_PRACTICES.filter((p) => !p.required).sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button onClick={handleBack} className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-bold text-gray-800">Yahrzeit Observance</span>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-6 pb-28">
          <p className="text-sm text-gray-600 leading-relaxed">
            A yahrzeit is the annual anniversary of a loved one&apos;s passing,
            observed on the Hebrew date. Here is what you do.
          </p>

          {/* Essential */}
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-[#5C4033] font-bold mb-3 px-1">
              Essential
            </h2>
            <div className="space-y-3">
              {essentialPractices.map((practice, i) => (
                <motion.div
                  key={practice.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border-2 border-[#5C4033]/10 p-5"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl font-light text-[#5C4033]/30 leading-none mt-0.5">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-foreground">{practice.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">{practice.description}</p>
                      {practice.beginnerTip && (
                        <p className="text-xs text-[#5C4033]/60 mt-2 italic">
                          {practice.beginnerTip}
                        </p>
                      )}
                      {practice.title === 'Say Kaddish' && (
                        <button
                          onClick={() => setView('service_map')}
                          className="mt-2 text-xs font-semibold text-[#5C4033] hover:text-[#4a3529] transition-colors"
                        >
                          See when you say Kaddish in each service
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Customs */}
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 px-1">
              Additional Customs
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {customPractices.map((practice, i) => (
                <motion.div
                  key={practice.title}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i + 2) * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 p-4"
                >
                  <h3 className="text-xs font-semibold text-foreground">{practice.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{practice.description}</p>
                  {practice.beginnerTip && (
                    <p className="text-[10px] text-gray-300 mt-1.5 italic">
                      {practice.beginnerTip}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <button onClick={handleBack} className="text-sm text-[#5C4033]">
        Back to Yahrzeit
      </button>
    </div>
  );
}
