'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { getTefillahPrayers, getAllPrayers } from '@/lib/content/prayers';
import { getAllServices } from '@/lib/content/services';
import { useAudio } from '@/hooks/useAudio';
import { useKaraokeSync } from '@/hooks/useKaraokeSync';
import { useUserStore } from '@/stores/userStore';
import { CoachingOverlay } from '@/components/siddur/CoachingOverlay';
import { PrayerSettingsModal } from '@/components/siddur/PrayerSettingsModal';
import { ServiceCard } from '@/components/siddur/ServiceCard';
import { ServiceRoadmap } from '@/components/siddur/ServiceRoadmap';
import { KaraokePlayer } from '@/components/siddur/KaraokePlayer';
import { AmudBadge } from '@/components/siddur/AmudBadge';
import { TefillahPrepSheet } from '@/components/siddur/TefillahPrepSheet';
import { AudioSourcePicker } from '@/components/siddur/AudioSourcePicker';
import { track } from '@/lib/analytics';
import type { Prayer, DaveningService, ServiceItem } from '@/types';
import type { AudioSourceId, PrayerAudioEntry } from '@/lib/content/audio-sources';

type Tab = 'services' | 'prayers';
type View = 'list' | 'prayer_reader' | 'service_roadmap' | 'chazan_guide';

export default function DavenPage() {
  // Navigation state
  const [view, setView] = useState<View>('list');
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [selectedService, setSelectedService] = useState<DaveningService | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showCoaching, setShowCoaching] = useState(false);
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [chazanGuideFromList, setChazanGuideFromList] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Audio source selection
  const [selectedAudioSource, setSelectedAudioSource] = useState<AudioSourceId>('siddur-audio');
  const [selectedAudioEntry, setSelectedAudioEntry] = useState<PrayerAudioEntry | null>(null);

  // Prayer view mode
  const [showProgressSidebar, setShowProgressSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'section' | 'full'>('section');

  // Store
  const audioSpeed = useUserStore((s) => s.profile.audioSpeed);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const hasUsedCoaching = useUserStore((s) => s.hasUsedCoaching);
  const isPrayerFullyCoached = useUserStore((s) => s.isPrayerFullyCoached);
  const displaySettings = useUserStore((s) => s.displaySettings);
  const updateServicePosition = useUserStore((s) => s.updateServicePosition);

  // Auto-advance state
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // Audio — auto-advance to next section when audio ends (if enabled)
  const handleAudioEnded = useCallback(() => {
    if (!selectedPrayer || !autoAdvanceEnabled) return;
    const total = selectedPrayer.sections.length;
    setCurrentSectionIndex((prev) => {
      if (prev < total - 1) {
        setAutoPlayNext(true);
        return prev + 1;
      }
      return prev;
    });
  }, [selectedPrayer, autoAdvanceEnabled]);

  const audioOptions = useMemo(
    () => ({ speed: audioSpeed, onEnded: handleAudioEnded }),
    [audioSpeed, handleAudioEnded]
  );
  const { play, stop, isPlaying, isLoading } = useAudio(audioOptions);

  // Current section data
  const currentSection = selectedPrayer?.sections[currentSectionIndex];
  const words = currentSection?.hebrewText.split(' ') || [];

  // Karaoke sync
  const { currentWordIndex, progress } = useKaraokeSync({
    words,
    wordTimings: currentSection?.wordTimings,
    isPlaying,
    speed: audioSpeed,
  });

  // Auto-play the next section after auto-advance
  useEffect(() => {
    if (autoPlayNext && currentSection && selectedPrayer) {
      setAutoPlayNext(false);
      const timer = setTimeout(() => {
        play(currentSection.hebrewText, 'hebrew', audioSpeed, selectedPrayer.id, currentSection.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlayNext, currentSection, selectedPrayer, audioSpeed, play]);

  // Prayer map for AmudMode
  const prayerMap = useMemo(() => {
    const all = getAllPrayers();
    return new Map(all.map((p) => [p.id, p]));
  }, []);

  // Handlers
  const handleSelectPrayer = useCallback((prayer: Prayer) => {
    setSelectedPrayer(prayer);
    setCurrentSectionIndex(0);
    setView('prayer_reader');

    // Track prayer view
    track({
      eventType: 'prayer_view',
      eventCategory: 'prayer',
      prayerId: prayer.id,
    });
  }, []);

  const handleSelectService = useCallback((service: DaveningService) => {
    setSelectedService(service);
    setView('service_roadmap');

    // Track service view
    track({
      eventType: 'service_view',
      eventCategory: 'service',
      serviceId: service.id,
    });
  }, []);

  const handleServiceItemSelect = useCallback(
    (item: ServiceItem, segIdx: number, itemIdx: number) => {
      if (selectedService) {
        updateServicePosition(selectedService.id, {
          serviceId: selectedService.id,
          segmentIndex: segIdx,
          itemIndex: itemIdx,
        });
      }
      if (item.prayerId) {
        const prayer = prayerMap.get(item.prayerId);
        if (prayer) {
          handleSelectPrayer(prayer);
        }
      }
    },
    [selectedService, updateServicePosition, prayerMap, handleSelectPrayer]
  );

  const handleOpenChazanGuide = useCallback(() => {
    setChazanGuideFromList(false);
    setView('chazan_guide');
  }, []);

  const handleBack = useCallback(() => {
    stop();
    if (view === 'prayer_reader') {
      if (selectedService) {
        setView('service_roadmap');
      } else {
        setView('list');
      }
      setSelectedPrayer(null);
      setCurrentSectionIndex(0);
    } else if (view === 'service_roadmap') {
      setView('list');
      setSelectedService(null);
    } else if (view === 'chazan_guide') {
      if (chazanGuideFromList) {
        setView('list');
        setSelectedService(null);
        setChazanGuideFromList(false);
      } else {
        setView('service_roadmap');
      }
    } else {
      setView('list');
    }
  }, [view, selectedService, chazanGuideFromList, stop]);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else if (currentSection && selectedPrayer) {
      play(currentSection.hebrewText, 'hebrew', audioSpeed, selectedPrayer.id, currentSection.id);
    }
  }, [isPlaying, stop, play, currentSection, selectedPrayer, audioSpeed]);

  const handleReplay = useCallback(() => {
    if (currentSection && selectedPrayer) {
      stop();
      play(currentSection.hebrewText, 'hebrew', audioSpeed, selectedPrayer.id, currentSection.id);
    }
  }, [currentSection, selectedPrayer, audioSpeed, stop, play]);

  const handleSpeedChange = useCallback((newSpeed: number) => {
    updateProfile({ audioSpeed: newSpeed });
  }, [updateProfile]);

  // === VIEWS ===

  // List view
  if (view === 'list') {
    return (
      <DavenList
        onSelectPrayer={handleSelectPrayer}
        onSelectService={handleSelectService}
        onOpenChazanGuide={(service: DaveningService) => {
          setSelectedService(service);
          setChazanGuideFromList(true);
          setView('chazan_guide');
        }}
      />
    );
  }

  // Service Roadmap
  if (view === 'service_roadmap' && selectedService) {
    return (
      <ServiceRoadmap
        service={selectedService}
        onSelectItem={handleServiceItemSelect}
        onOpenChazanGuide={handleOpenChazanGuide}
        onBack={handleBack}
      />
    );
  }

  // Chazan Guide (formerly Prep Sheet)
  if (view === 'chazan_guide' && selectedService) {
    return (
      <TefillahPrepSheet
        service={selectedService}
        onBack={handleBack}
      />
    );
  }

  // Prayer Reader
  if (view === 'prayer_reader' && selectedPrayer) {
    const sectionIds = selectedPrayer.sections.map((s) => s.id);
    const isCoached = isPrayerFullyCoached(selectedPrayer.id, sectionIds);
    const showFirstTimeBanner = !hasUsedCoaching && !isCoached && !dismissedBanner;
    const totalSections = selectedPrayer.sections.length;
    const showCompactProgress = totalSections > 12;

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
                {selectedPrayer.nameEnglish}
              </span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {currentSectionIndex + 1} OF {totalSections}
              </span>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center w-10 h-10 -mr-2 text-gray-400 hover:text-primary transition-colors"
              title="View Modes & Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-5 pb-32">
          {/* First-time coaching banner */}
          {showFirstTimeBanner && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gold/10 border border-gold/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">First time?</p>
                <p className="text-xs text-gray-500">
                  Tap &quot;Coach&quot; below to learn this step by step
                </p>
              </div>
              <button
                onClick={() => setDismissedBanner(true)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* Prayer Context */}
          {currentSectionIndex === 0 && displaySettings.showInstructions && (
            <p className="text-xs text-gray-400 text-center">
              {selectedPrayer.whenSaid}
            </p>
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

          {/* Controls row and display toggles have been unified into the View Modes & Settings modal */}

          {/* Progress Sidebar/Outline */}
          {showProgressSidebar && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Prayer Outline ({currentSectionIndex + 1}/{totalSections})</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {selectedPrayer.sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      stop();
                      setCurrentSectionIndex(idx);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${idx === currentSectionIndex
                      ? 'bg-primary text-white font-medium'
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
              prayerId={selectedPrayer.id}
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

          {/* Full Prayer View: All Sections */}
          {viewMode === 'full' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                Viewing full prayer - Switch back to "View Sections" to practice section-by-section
              </div>
              {selectedPrayer.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className={`bg-white rounded-xl border p-6 ${idx === currentSectionIndex ? 'border-primary shadow-md' : 'border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500">Section {idx + 1}/{totalSections}</span>
                    {idx === currentSectionIndex && (
                      <span className="text-xs font-medium text-primary">Current</span>
                    )}
                  </div>
                  <p
                    className="font-['Noto_Serif_Hebrew'] text-2xl text-[#1A1A2E] leading-[1.8] text-right mb-3"
                    dir="rtl"
                  >
                    {section.hebrewText}
                  </p>
                  {displaySettings.showTransliteration && section.transliteration && (
                    <p className="text-sm text-gray-600 italic mb-2">{section.transliteration}</p>
                  )}
                  {displaySettings.showTranslation && section.translation && (
                    <p className="text-sm text-gray-700">{section.translation}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Section Navigation (only in section view) */}
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
                className={`px-4 py-2 rounded-lg text-sm font-medium ${currentSectionIndex === 0
                  ? 'text-gray-300'
                  : 'text-primary hover:bg-primary/5'
                  }`}
              >
                ← Previous
              </button>

              {showCompactProgress ? (
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {currentSectionIndex + 1}/{totalSections}
                  </span>
                </div>
              ) : (
                <div className="flex gap-1">
                  {selectedPrayer.sections.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { stop(); setCurrentSectionIndex(i); }}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentSectionIndex ? 'bg-primary' : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  if (currentSectionIndex < totalSections - 1) {
                    stop();
                    setAutoPlayNext(false);
                    setCurrentSectionIndex(currentSectionIndex + 1);
                  }
                }}
                disabled={currentSectionIndex === totalSections - 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${currentSectionIndex === totalSections - 1
                  ? 'text-gray-300'
                  : 'text-primary hover:bg-primary/5'
                  }`}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Coach me floating button */}
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
              prayer={selectedPrayer}
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
              prayerId={selectedPrayer.id}
              selectedAudioSource={selectedAudioSource}
              onSelectAudioSource={(sourceId, entry) => {
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

  // Fallback
  return (
    <DavenList
      onSelectPrayer={handleSelectPrayer}
      onSelectService={handleSelectService}
      onOpenChazanGuide={(service: DaveningService) => {
        setSelectedService(service);
        setView('chazan_guide');
      }}
    />
  );
}

// ==========================
// Prayer Card
// ==========================

function PrayerCard({ prayer, onSelect }: { prayer: Prayer; onSelect: (p: Prayer) => void }) {
  const isPrayerCoached = useUserStore((s) =>
    s.isPrayerFullyCoached(prayer.id, prayer.sections.map((sec) => sec.id))
  );

  return (
    <button
      onClick={() => onSelect(prayer)}
      className="w-full rounded-2xl border bg-white border-gray-100 hover:shadow-md hover:border-primary-light/30 cursor-pointer p-4 text-left transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPrayerCoached
            ? 'bg-success/10 text-success'
            : 'bg-primary/10 text-primary'
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
      {prayer.sections.length > 4 && (
        <div className="mt-2 flex items-center gap-2 ml-11">
          <span className="text-xs bg-primary/5 text-primary px-2 py-0.5 rounded-full font-medium">
            {prayer.sections.length} sections
          </span>
          {prayer.estimatedReadSeconds >= 60 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              ~{Math.ceil(prayer.estimatedReadSeconds / 60)} min
            </span>
          )}
        </div>
      )}
    </button>
  );
}

// ==========================
// Daven List (2-tab: Services + All Prayers)
// ==========================

function DavenList({
  onSelectPrayer,
  onSelectService,
  onOpenChazanGuide,
}: {
  onSelectPrayer: (prayer: Prayer) => void;
  onSelectService: (service: DaveningService) => void;
  onOpenChazanGuide: (service: DaveningService) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [searchQuery, setSearchQuery] = useState('');

  const services = getAllServices();
  const tefillahPrayers = getTefillahPrayers();

  // Filter prayers by search
  const filteredPrayers = useMemo(() => {
    if (!searchQuery.trim()) return tefillahPrayers;
    const q = searchQuery.toLowerCase();
    return tefillahPrayers.filter(
      (p) =>
        p.nameEnglish.toLowerCase().includes(q) ||
        p.nameHebrew.includes(q) ||
        p.whenSaid.toLowerCase().includes(q)
    );
  }, [tefillahPrayers, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-primary-light text-sm hover:text-white">
              Home
            </Link>
            <Link href="/settings" className="text-primary-light text-sm hover:text-white">
              Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-2">Daven</h1>
          <p className="text-primary-light text-sm mt-1">
            Services, prayers, coaching, and amud mode
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-4 pb-28">
        {/* 2-Tab Bar */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: 'services' as Tab, label: 'Services' },
            { id: 'prayers' as Tab, label: 'All Prayers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === SERVICES TAB === */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Chazan Guide quick-access */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h2 className="text-sm font-bold text-foreground mb-1">Chazan Guide</h2>
              <p className="text-xs text-gray-400 mb-3">
                Full service map with amud cues, congregation responses, and timing
              </p>
              <div className="flex flex-wrap gap-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => onOpenChazanGuide(service)}
                    className="px-4 py-2 rounded-xl text-sm font-medium border border-primary/20 text-primary hover:bg-primary/5 transition-colors"
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekday Services */}
            <div>
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                Weekday
              </h2>
              <div className="space-y-3">
                {services
                  .filter((s) => s.type === 'weekday')
                  .map((service, i) => (
                    <div key={service.id} className="relative">
                      <ServiceCard
                        service={service}
                        onSelect={onSelectService}
                        index={i}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChazanGuide(service);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 shrink-0 border border-gray-100"
                        title="Chazan Guide"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Shabbat Services */}
            {services.some((s) => s.type === 'shabbat') && (
              <div>
                <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">
                  Shabbat
                </h2>
                <div className="space-y-3">
                  {services
                    .filter((s) => s.type === 'shabbat')
                    .map((service, i) => (
                      <div key={service.id} className="relative">
                        <ServiceCard
                          service={service}
                          onSelect={onSelectService}
                          index={i}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChazanGuide(service);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 shrink-0 border border-gray-100"
                          title="Chazan Guide"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                          </svg>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === ALL PRAYERS TAB === */}
        {activeTab === 'prayers' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search prayers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white"
              />
            </div>

            {/* All prayers flat list */}
            <div className="space-y-2">
              {filteredPrayers.map((prayer, i) => (
                <motion.div
                  key={prayer.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <PrayerCard prayer={prayer} onSelect={onSelectPrayer} />
                </motion.div>
              ))}
              {filteredPrayers.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  No prayers match &quot;{searchQuery}&quot;
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
