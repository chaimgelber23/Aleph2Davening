'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { getBrachotPrayers, getBrachotAchronotPrayers } from '@/lib/content/prayers';
import { GUIDES } from '@/lib/content/guides';
import { GuideCategoryTabs } from '@/components/guide/GuideCategoryTabs';
import { GuideCard } from '@/components/guide/GuideCard';
import { GuideReader } from '@/components/guide/GuideReader';
import { useUserStore } from '@/stores/userStore';
import { useAudio } from '@/hooks/useAudio';
import type { Prayer, Guide, GuideCategory } from '@/types';

type Section = 'brachot' | 'guides';

export default function LivingPage() {
  const [activeSection, setActiveSection] = useState<Section>('guides');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [selectedBracha, setSelectedBracha] = useState<Prayer | null>(null);
  const [guideCategory, setGuideCategory] = useState<GuideCategory | 'all'>('all');
  const [brachaView, setBrachaView] = useState<'before' | 'after'>('before');

  const guideProgress = useUserStore((s) => s.guideProgress);

  const brachotPrayers = getBrachotPrayers();
  const brachotAchronot = getBrachotAchronotPrayers();
  const displayedBrachot = brachaView === 'before' ? brachotPrayers : brachotAchronot;
  // Filter guides by category
  const filteredGuides = useMemo(() => {
    if (guideCategory === 'all') return GUIDES;
    return GUIDES.filter((g) => g.category === guideCategory);
  }, [guideCategory]);

  const handleSelectGuide = useCallback((guide: Guide) => {
    setSelectedGuide(guide);
  }, []);

  const handleNavigateGuide = useCallback((guideId: string) => {
    const guide = GUIDES.find((g) => g.id === guideId);
    if (guide) {
      setSelectedGuide(guide);
    }
  }, []);

  const handleBackFromGuide = useCallback(() => {
    setSelectedGuide(null);
  }, []);

  const handleSelectBracha = useCallback((prayer: Prayer) => {
    setSelectedBracha(prayer);
  }, []);

  const handleBackFromBracha = useCallback(() => {
    setSelectedBracha(null);
  }, []);

  // Bracha Reader view
  if (selectedBracha) {
    return (
      <BrachaReader
        prayer={selectedBracha}
        onBack={handleBackFromBracha}
      />
    );
  }

  // Guide Reader view
  if (selectedGuide) {
    return (
      <GuideReader
        guide={selectedGuide}
        onBack={handleBackFromGuide}
        onNavigate={handleNavigateGuide}
      />
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#6B4C9A] text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white/60 text-sm hover:text-white">
              Home
            </Link>
            <Link href="/settings" className="text-white/60 text-sm hover:text-white">
              Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-2">Jewish Living</h1>
          <p className="text-white/60 text-sm mt-1">
            Daily halachos, brachot, and practical guides
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-4 pb-28">
        {/* Section tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: 'guides' as Section, label: 'How-To' },
            { id: 'brachot' as Section, label: 'Brachot' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeSection === tab.id
                ? 'bg-white text-[#6B4C9A] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === BRACHOT === */}
        {activeSection === 'brachot' && (
          <div className="space-y-3">
            {/* Before / After sub-toggle */}
            <div className="flex items-center gap-2 mb-2">
              {(['before', 'after'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setBrachaView(view)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                    brachaView === view
                      ? 'bg-[#6B4C9A] text-white shadow-sm'
                      : 'bg-[#6B4C9A]/8 text-[#6B4C9A] hover:bg-[#6B4C9A]/15'
                  }`}
                >
                  {view === 'before' ? 'Before Eating' : 'After Eating'}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-400 px-1">
              {brachaView === 'before'
                ? 'Blessings said before food and drink'
                : 'Blessings said after eating — brachot achronot'}
            </p>

            {displayedBrachot.map((prayer, i) => (
              <motion.div
                key={prayer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <BrachaCard prayer={prayer} onSelect={handleSelectBracha} />
              </motion.div>
            ))}

            {displayedBrachot.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">
                No brachot in this category yet
              </p>
            )}
          </div>
        )}

        {/* === GUIDES === */}
        {activeSection === 'guides' && (
          <div className="space-y-4">
            {/* Category filter */}
            <GuideCategoryTabs
              selected={guideCategory}
              onSelect={setGuideCategory}
            />

            {/* Guide cards */}
            <div className="space-y-2">
              {filteredGuides.map((guide, i) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  progress={guideProgress[guide.id]}
                  onClick={() => handleSelectGuide(guide)}
                  index={i}
                />
              ))}
              {filteredGuides.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  No guides in this category yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ==========================
// Bracha Card
// ==========================

function BrachaCard({ prayer, onSelect }: { prayer: Prayer; onSelect: (p: Prayer) => void }) {
  const isPrayerCoached = useUserStore((s) =>
    s.isPrayerFullyCoached(prayer.id, prayer.sections.map((sec) => sec.id))
  );

  return (
    <button
      onClick={() => onSelect(prayer)}
      className="block w-full rounded-2xl border bg-white border-gray-100 hover:shadow-md hover:border-[#6B4C9A]/20 cursor-pointer p-4 text-left transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPrayerCoached
            ? 'bg-success/10 text-success'
            : 'bg-[#6B4C9A]/10 text-[#6B4C9A]'
            }`}>
            {isPrayerCoached ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              prayer.sortOrder
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{prayer.nameEnglish}</h3>
            <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-base text-gray-500">
              {prayer.nameHebrew}
            </p>
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

// ==========================
// Bracha Reader
// ==========================

function BrachaReader({ prayer, onBack }: { prayer: Prayer; onBack: () => void }) {
  const displaySettings = useUserStore((s) => s.displaySettings);
  const audioSpeed = useUserStore((s) => s.profile.audioSpeed);

  // Playback settings
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [loopMode, setLoopMode] = useState(false);
  const [viewMode, setViewMode] = useState<'full' | 'page'>('full');
  const [showSettings, setShowSettings] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Track which section is currently playing
  const [playingSectionIndex, setPlayingSectionIndex] = useState(-1);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const playingSectionIndexRef = useRef(playingSectionIndex);
  playingSectionIndexRef.current = playingSectionIndex;
  const autoAdvanceRef = useRef(autoAdvance);
  autoAdvanceRef.current = autoAdvance;
  const loopModeRef = useRef(loopMode);
  loopModeRef.current = loopMode;

  // Refs for auto-scrolling
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  const handleAudioEnded = useCallback(() => {
    const currentIdx = playingSectionIndexRef.current;
    if (autoAdvanceRef.current && currentIdx >= 0 && currentIdx < prayer.sections.length - 1) {
      // Auto-advance to next section
      setPlayingSectionIndex(currentIdx + 1);
      if (viewMode === 'page') setCurrentPage(currentIdx + 1);
      setAutoPlayNext(true);
    } else if (loopModeRef.current && currentIdx >= 0) {
      // Loop: if at last section, go back to first; otherwise replay current
      if (autoAdvanceRef.current) {
        setPlayingSectionIndex(0);
        if (viewMode === 'page') setCurrentPage(0);
        setAutoPlayNext(true);
      } else {
        // Loop current section
        setAutoPlayNext(true);
      }
    } else {
      setPlayingSectionIndex(-1);
    }
  }, [prayer.sections.length, viewMode]);

  const audioOptions = useMemo(
    () => ({ speed: audioSpeed, onEnded: handleAudioEnded }),
    [audioSpeed, handleAudioEnded]
  );
  const { play, stop, pause, resume, seek, isPlaying, isLoading, currentTime, duration } = useAudio(audioOptions);

  // Auto-play the next section after advance
  useEffect(() => {
    if (autoPlayNext && playingSectionIndex >= 0) {
      setAutoPlayNext(false);
      const section = prayer.sections[playingSectionIndex];
      if (section) {
        const timer = setTimeout(() => {
          play(section.hebrewText, 'hebrew', audioSpeed, prayer.id, section.id);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [autoPlayNext, playingSectionIndex, prayer, audioSpeed, play]);

  // Auto-scroll to active section when it changes (full view)
  useEffect(() => {
    if (viewMode === 'full' && playingSectionIndex >= 0 && sectionRefs.current[playingSectionIndex]) {
      sectionRefs.current[playingSectionIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [playingSectionIndex, viewMode]);

  // Auto-scroll to active word during playback
  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentTime]);

  const handlePlaySection = useCallback((sectionIndex: number) => {
    if (isPlaying && playingSectionIndex === sectionIndex) {
      pause();
    } else if (!isPlaying && playingSectionIndex === sectionIndex) {
      resume();
    } else {
      const section = prayer.sections[sectionIndex];
      setPlayingSectionIndex(sectionIndex);
      play(section.hebrewText, 'hebrew', audioSpeed, prayer.id, section.id);
    }
  }, [isPlaying, playingSectionIndex, pause, resume, play, audioSpeed, prayer]);

  // Calculate active word index for a section
  const getActiveWordIndex = useCallback((sectionIndex: number, words: string[]) => {
    if (playingSectionIndex !== sectionIndex || !isPlaying || duration <= 0) return -1;
    const progress = Math.min(currentTime / duration, 1);
    return Math.min(Math.floor(progress * words.length), words.length - 1);
  }, [playingSectionIndex, isPlaying, currentTime, duration]);

  const progressPercent = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  // Which sections to show
  const visibleSections = viewMode === 'page'
    ? [{ section: prayer.sections[currentPage], idx: currentPage }]
    : prayer.sections.map((section, idx) => ({ section, idx }));

  // Render a single section card with big play button
  const renderSectionCard = (section: typeof prayer.sections[0], idx: number) => {
    const isSectionPlaying = isPlaying && playingSectionIndex === idx;
    const isSectionPaused = !isPlaying && playingSectionIndex === idx;
    const isSectionDone = playingSectionIndex > idx && playingSectionIndex >= 0;
    const words = section.hebrewText.split(/\s+/);
    const activeWordIdx = getActiveWordIndex(idx, words);
    const isActive = isSectionPlaying || isSectionPaused;

    return (
      <div
        key={section.id}
        ref={(el) => { sectionRefs.current[idx] = el; }}
        className={`bg-white rounded-2xl border relative transition-all ${
          isSectionPlaying
            ? 'border-[#6B4C9A]/40 shadow-md ring-1 ring-[#6B4C9A]/10'
            : isSectionDone
              ? 'border-[#4A7C59]/20 bg-[#4A7C59]/3'
              : 'border-gray-100'
        }`}
      >
        {/* Section indicator */}
        {prayer.sections.length > 1 && (
          <div className="flex items-center justify-between px-6 pt-4 pb-0">
            <span className="text-[10px] font-medium text-gray-300 uppercase tracking-wider">
              Part {idx + 1} of {prayer.sections.length}
            </span>
            {isSectionDone && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        )}

        {/* Hebrew text with word highlighting */}
        <div className="px-6 pt-4 pb-2">
          <p
            className="font-['Noto_Serif_Hebrew'] text-2xl text-[#1A1A2E] leading-[2.2] text-right"
            dir="rtl"
          >
            {words.map((word, wi) => {
              const isActiveWord = isSectionPlaying && wi === activeWordIdx;
              const isReadWord = isSectionPlaying && wi < activeWordIdx;
              const isDoneSection = isSectionDone;
              return (
                <span
                  key={wi}
                  ref={isActiveWord ? (el) => { activeWordRef.current = el; } : undefined}
                  className={
                    isActiveWord
                      ? 'bg-[#6B4C9A]/20 text-[#6B4C9A] rounded-md px-1 py-0.5 transition-colors duration-200'
                      : isReadWord
                        ? 'text-[#6B4C9A]/50 transition-colors duration-200'
                        : isDoneSection
                          ? 'text-[#4A7C59]/70'
                          : ''
                  }
                >
                  {word}{wi < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </p>
        </div>

        {/* Big centered play button */}
        <div className="flex items-center justify-center py-4">
          {isActive && (
            <div className="w-full px-6 mb-2">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6B4C9A] rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center pb-5 -mt-2">
          <button
            onClick={() => handlePlaySection(idx)}
            disabled={isLoading && playingSectionIndex === idx}
            className={`flex items-center justify-center rounded-full transition-all shadow-lg active:scale-95 ${
              isSectionPlaying
                ? 'w-16 h-16 bg-[#6B4C9A] text-white hover:bg-[#5a3d85]'
                : isSectionPaused
                  ? 'w-16 h-16 bg-[#6B4C9A] text-white hover:bg-[#5a3d85]'
                  : 'w-16 h-16 bg-[#6B4C9A] text-white hover:bg-[#5a3d85]'
            }`}
          >
            {isLoading && playingSectionIndex === idx ? (
              <svg className="w-7 h-7 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : isSectionPlaying ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Transliteration */}
        {displaySettings.showTransliteration && section.transliteration && (
          <div className="px-6 pb-2">
            <p className="text-sm text-gray-500 italic">{section.transliteration}</p>
          </div>
        )}

        {/* Translation */}
        {displaySettings.showTranslation && section.translation && (
          <div className="px-6 pb-2">
            <p className="text-sm text-gray-600">{section.translation}</p>
          </div>
        )}

        {/* Notes */}
        {displaySettings.showInstructions && section.notes && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">{section.notes}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={() => { stop(); onBack(); }}
            className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="sr-only">Back</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-gray-800">
              {prayer.nameEnglish}
            </span>
            <span dir="rtl" className="text-xs font-[var(--font-hebrew-serif)] text-gray-400">
              {prayer.nameHebrew}
            </span>
          </div>
          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center justify-center w-10 h-10 -mr-2 rounded-lg transition-colors ${
              showSettings ? 'text-[#6B4C9A] bg-[#6B4C9A]/10' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Panel (collapsible) */}
      {showSettings && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-md mx-auto px-6 py-4 space-y-3">
            {/* Auto-advance toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Auto-advance</p>
                <p className="text-[11px] text-gray-400">Play next section automatically</p>
              </div>
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  autoAdvance ? 'bg-[#6B4C9A]' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  autoAdvance ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>

            {/* Loop toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Loop</p>
                <p className="text-[11px] text-gray-400">Repeat when finished</p>
              </div>
              <button
                onClick={() => setLoopMode(!loopMode)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  loopMode ? 'bg-[#6B4C9A]' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  loopMode ? 'translate-x-5' : ''
                }`} />
              </button>
            </div>

            {/* View mode toggle */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">View</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('full')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === 'full'
                      ? 'bg-[#6B4C9A] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Full View
                </button>
                <button
                  onClick={() => { setViewMode('page'); setCurrentPage(0); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    viewMode === 'page'
                      ? 'bg-[#6B4C9A] text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  One at a Time
                </button>
              </div>
            </div>

            {/* Display toggles */}
            <div className="pt-1 border-t border-gray-50 space-y-2">
              <p className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Display</p>
              {[
                { key: 'showTransliteration' as const, label: 'Transliteration' },
                { key: 'showTranslation' as const, label: 'Translation' },
                { key: 'showInstructions' as const, label: 'Notes & Tips' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{label}</p>
                  <button
                    onClick={() => {
                      const update: Partial<typeof displaySettings> = {};
                      update[key] = !displaySettings[key];
                      useUserStore.getState().updateDisplaySettings(update);
                    }}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      displaySettings[key] ? 'bg-[#6B4C9A]' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      displaySettings[key] ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto px-6 py-6 space-y-5 pb-32">
        {/* Context */}
        <div className="bg-[#6B4C9A]/5 rounded-2xl p-4">
          <p className="text-sm font-medium text-[#6B4C9A] mb-1">When to say</p>
          <p className="text-sm text-gray-600">{prayer.whenSaid}</p>
        </div>

        {/* Why we say it */}
        {prayer.whySaid && (
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Why we say it</p>
            <p className="text-sm text-gray-500">{prayer.whySaid}</p>
          </div>
        )}

        {/* Sections */}
        {visibleSections.map(({ section, idx }) => renderSectionCard(section, idx))}

        {/* Page navigation (page mode only) */}
        {viewMode === 'page' && prayer.sections.length > 1 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 text-[#6B4C9A] hover:bg-[#6B4C9A]/5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Previous
            </button>
            <span className="text-xs text-gray-400 font-medium">
              {currentPage + 1} / {prayer.sections.length}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(prayer.sections.length - 1, currentPage + 1))}
              disabled={currentPage === prayer.sections.length - 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-30 text-[#6B4C9A] hover:bg-[#6B4C9A]/5"
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}

        {/* Inspiration */}
        {prayer.inspirationText && (
          <div className="bg-[#C6973F]/5 border border-[#C6973F]/15 rounded-2xl p-4">
            <p className="text-sm text-gray-600 italic">{prayer.inspirationText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
