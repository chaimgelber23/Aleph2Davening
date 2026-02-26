'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { AmudMode } from '@/components/siddur/AmudMode';
import { AudioSourcePicker } from '@/components/siddur/AudioSourcePicker';

import { LeadDaveningTab } from '@/components/daven/LeadDaveningTab';
import { ChazenPrepHub } from '@/components/daven/ChazenPrepHub';
import AmudPreparation from '@/components/daven/AmudPreparation';
import { SpotlightTour } from '@/components/ui/SpotlightTour';
import { TourReplayButton } from '@/components/ui/TourReplayButton';
import { SpeedPill } from '@/components/ui/SpeedPill';
import { track } from '@/lib/analytics';
import type { TourStep } from '@/components/ui/SpotlightTour';
import type { Prayer, DaveningService, ServiceItem } from '@/types';
import type { AudioSourceId, PrayerAudioEntry } from '@/lib/content/audio-sources';

type Tab = 'services' | 'prayers' | 'lead';
type View = 'list' | 'prayer_reader' | 'service_roadmap' | 'chazan_guide' | 'chazan_prep_hub' | 'amud_preparation' | 'amud_mode';

export default function DavenPage() {
  // Navigation state
  const [view, setView] = useState<View>('list');
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [selectedService, setSelectedService] = useState<DaveningService | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showCoaching, setShowCoaching] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [sectionPositions, setSectionPositions] = useState<Record<string, number>>({});

  // Audio source selection — persisted in user store
  const preferredSource = useUserStore((s) => s.profile.preferredAudioSource) as AudioSourceId | undefined;
  const [selectedAudioSource, setSelectedAudioSource] = useState<AudioSourceId>(preferredSource || 'alex');
  const [selectedAudioEntry, setSelectedAudioEntry] = useState<PrayerAudioEntry | null>(null);

  // Sync from store on mount (hydration)
  useEffect(() => {
    if (preferredSource) setSelectedAudioSource(preferredSource as AudioSourceId);
  }, [preferredSource]);

  // Prayer view mode
  const [showProgressSidebar, setShowProgressSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'section' | 'full'>('section');

  // Store
  const audioSpeed = useUserStore((s) => s.profile.audioSpeed);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const displaySettings = useUserStore((s) => s.displaySettings);
  const updateServicePosition = useUserStore((s) => s.updateServicePosition);

  const handleSelectAudioSource = useCallback((sourceId: AudioSourceId, entry: PrayerAudioEntry | null) => {
    setSelectedAudioSource(sourceId);
    setSelectedAudioEntry(entry);
    updateProfile({ preferredAudioSource: sourceId });
  }, [updateProfile]);

  // Auto-advance state
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(true);
  const autoPlayNextRef = useRef(false);

  // Audio — auto-advance to next section when audio ends (if enabled)
  const handleAudioEnded = useCallback(() => {
    if (!selectedPrayer || !autoAdvanceEnabled) return;
    const total = selectedPrayer.sections.length;
    setCurrentSectionIndex((prev) => {
      if (prev < total - 1) {
        autoPlayNextRef.current = true;
        return prev + 1;
      }
      return prev;
    });
  }, [selectedPrayer, autoAdvanceEnabled]);

  const audioOptions = useMemo(
    () => ({ speed: audioSpeed, onEnded: handleAudioEnded, forceTTS: selectedAudioSource === 'google-tts' }),
    [audioSpeed, handleAudioEnded, selectedAudioSource]
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

  // Auto-play the next section after auto-advance (ref avoids cleanup race condition)
  useEffect(() => {
    if (!autoPlayNextRef.current || !currentSection || !selectedPrayer) return;
    autoPlayNextRef.current = false;
    const timer = setTimeout(() => {
      play(currentSection.hebrewText, 'hebrew', audioSpeed, selectedPrayer.id, currentSection.id);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex]);

  // Auto-scroll to current section in full view
  useEffect(() => {
    if (viewMode === 'full') {
      document.getElementById(`full-section-${currentSectionIndex}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentSectionIndex, viewMode]);

  // Prayer map for AmudMode
  const prayerMap = useMemo(() => {
    const all = getAllPrayers();
    return new Map(all.map((p) => [p.id, p]));
  }, []);

  // Handlers
  const handleSelectPrayer = useCallback((prayer: Prayer) => {
    setSelectedPrayer(prayer);
    // Resume from saved position if available
    const savedPos = sectionPositions[prayer.id];
    setCurrentSectionIndex(savedPos && savedPos > 0 ? savedPos : 0);
    setView('prayer_reader');

    // Track prayer view
    track({
      eventType: 'prayer_view',
      eventCategory: 'prayer',
      prayerId: prayer.id,
    });
  }, [sectionPositions]);

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

  const handleOpenPrepHub = useCallback((service: DaveningService) => {
    setSelectedService(service);
    setView('chazan_prep_hub');
  }, []);

  const handleBack = useCallback(() => {
    stop();
    if (view === 'prayer_reader') {
      // Save section position before leaving
      if (selectedPrayer) {
        setSectionPositions(prev => ({ ...prev, [selectedPrayer.id]: currentSectionIndex }));
      }
      if (selectedService) {
        setView('service_roadmap');
      } else {
        setView('list');
      }
      setSelectedPrayer(null);
    } else if (view === 'service_roadmap') {
      setView('list');
      setSelectedService(null);
    } else if (view === 'chazan_guide') {
      setView('chazan_prep_hub');
    } else if (view === 'chazan_prep_hub') {
      setView('list');
      setSelectedService(null);
    } else if (view === 'amud_preparation' || view === 'amud_mode') {
      setView('chazan_prep_hub');
    } else {
      setView('list');
    }
  }, [view, selectedService, selectedPrayer, currentSectionIndex, stop]);

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
        onOpenPrepHub={handleOpenPrepHub}
      />
    );
  }

  // Service Roadmap
  if (view === 'service_roadmap' && selectedService) {
    return (
      <ServiceRoadmap
        service={selectedService}
        onSelectItem={handleServiceItemSelect}
        onBack={handleBack}
      />
    );
  }

  // Chazan Prep Hub
  if (view === 'chazan_prep_hub' && selectedService) {
    return (
      <ChazenPrepHub
        service={selectedService}
        onOpenPrepSheet={() => setView('chazan_guide')}
        onOpenAmudPreparation={() => setView('amud_preparation')}
        onOpenAmudMode={() => setView('amud_mode')}
        onBack={handleBack}
      />
    );
  }

  // Chazan Guide / Prep Sheet
  if (view === 'chazan_guide' && selectedService) {
    return (
      <TefillahPrepSheet
        service={selectedService}
        onBack={handleBack}
      />
    );
  }

  // Amud Preparation (4-level progressive)
  if (view === 'amud_preparation') {
    return (
      <AmudPreparation onBack={handleBack} />
    );
  }

  // Amud Mode (interactive step-through)
  if (view === 'amud_mode' && selectedService) {
    return (
      <AmudMode
        service={selectedService}
        prayers={prayerMap}
        onBack={handleBack}
      />
    );
  }

  // Prayer Reader
  if (view === 'prayer_reader' && selectedPrayer) {
    const totalSections = selectedPrayer.sections.length;
    const showCompactProgress = totalSections > 12;

    // Service progress: which prayer are we on within the service?
    const serviceItems = selectedService
      ? selectedService.segments.flatMap((seg) => seg.items)
      : [];
    const currentServiceItemIndex = selectedService
      ? serviceItems.findIndex((item) => item.prayerId === selectedPrayer.id)
      : -1;
    const totalServiceItems = serviceItems.length;

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
              {selectedService && (
                <span className="text-[10px] font-medium text-gray-400">
                  {selectedService.name}
                </span>
              )}
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
          {/* Service progress track — only when opened from a service */}
          {selectedService && currentServiceItemIndex >= 0 && totalServiceItems > 1 && (
            <div className="max-w-md mx-auto px-4 pt-2 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                  Prayer {currentServiceItemIndex + 1}/{totalServiceItems}
                </span>
                <div className="flex-1 flex gap-0.5">
                  {serviceItems.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < currentServiceItemIndex
                          ? 'bg-success'
                          : i === currentServiceItemIndex
                            ? 'bg-primary'
                            : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-5 pb-32">
          {/* Prayer Context — always accessible */}
          {displaySettings.showInstructions && selectedPrayer.whenSaid && (
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

          {/* Voice picker — directly on the playing screen for quick switching */}
          <div className="flex items-center justify-center">
            <AudioSourcePicker
              prayerId={selectedPrayer.id}
              selectedSource={selectedAudioSource}
              onSelectSource={handleSelectAudioSource}
            />
          </div>

          {/* Compact Prayer Outline — collapsed by default */}
          <button
            onClick={() => setShowProgressSidebar(!showProgressSidebar)}
            className="w-full flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-2.5 text-left"
          >
            <span className="text-xs font-medium text-gray-500">
              Section {currentSectionIndex + 1} of {totalSections}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showProgressSidebar ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showProgressSidebar && (
            <div className="bg-white rounded-xl border border-gray-200 p-3 -mt-2">
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {selectedPrayer.sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      stop();
                      setCurrentSectionIndex(idx);
                      setShowProgressSidebar(false);
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

          {/* Full Prayer View: All Sections with Audio */}
          {viewMode === 'full' && (
            <div className="space-y-4">
              {/* Audio Controls */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-[60px] z-20 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Replay */}
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

                  {/* Play/Pause */}
                  <button
                    onClick={handleTogglePlay}
                    disabled={isLoading}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg active:scale-95 ${
                      isLoading
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-primary text-white hover:bg-[#163d55]'
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

                  {/* Progress bar */}
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-100"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">
                        Section {currentSectionIndex + 1}/{totalSections}
                      </span>
                      <span className="text-[10px] font-medium text-primary">{audioSpeed}x</span>
                    </div>
                  </div>
                </div>

                {/* Speed pill — Apple Podcasts style */}
                <div className="flex items-center justify-end mt-2">
                  <SpeedPill onSpeedChange={handleSpeedChange} color="primary" />
                </div>
              </div>

              {/* All Sections */}
              {selectedPrayer.sections.map((section, idx) => {
                const isCurrent = idx === currentSectionIndex;
                const sectionWords = section.hebrewText.split(' ');

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      stop();
                      setCurrentSectionIndex(idx);
                    }}
                    className={`w-full text-left rounded-2xl border p-5 transition-all ${
                      isCurrent
                        ? 'border-primary shadow-md bg-white'
                        : 'border-gray-100 bg-white/80 hover:border-gray-200'
                    }`}
                    id={`full-section-${idx}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Section {idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          Now Playing
                        </span>
                      )}
                    </div>

                    {/* Hebrew text — with karaoke highlighting on current section */}
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
                                ${isCurrentWord ? 'bg-primary-light/25 text-primary scale-105' : ''}
                                ${isPast && isPlaying ? 'text-primary/40' : ''}
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
                      <p
                        className="font-[var(--font-hebrew-serif)] text-xl text-[#1A1A2E]/70 leading-[1.8] text-right"
                        dir="rtl"
                      >
                        {section.hebrewText}
                      </p>
                    )}

                    {/* Transliteration with matching highlight on current */}
                    {displaySettings.showTransliteration && section.transliteration && (
                      isCurrent ? (
                        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mt-2">
                          {section.transliteration.split(' ').map((word, i) => (
                            <span
                              key={i}
                              className={`text-sm transition-all duration-200 ${
                                i === currentWordIndex
                                  ? 'text-primary font-semibold'
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

                    {/* Amud cues on current section */}
                    {isCurrent && displaySettings.showAmudCues && section.amud && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {section.amud.instruction && (
                          <p className="text-xs text-primary font-medium text-center">
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

          {/* Section Navigation (only in section view) */}
          {viewMode === 'section' && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  if (currentSectionIndex > 0) {
                    stop();
                    autoPlayNextRef.current = false;
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
                    autoPlayNextRef.current = false;
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

        {/* Coaching overlay — accessible via settings modal or walkthrough */}
        <AnimatePresence>
          {showCoaching && (
            <CoachingOverlay
              prayer={selectedPrayer}
              initialSectionIndex={currentSectionIndex}
              onClose={() => setShowCoaching(false)}
            />
          )}
        </AnimatePresence>

        <PrayerSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          prayerId={selectedPrayer.id}
          selectedAudioSource={selectedAudioSource}
          onSelectAudioSource={handleSelectAudioSource}
          autoAdvanceEnabled={autoAdvanceEnabled}
          onToggleAutoAdvance={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          showProgressSidebar={showProgressSidebar}
          onToggleProgressSidebar={() => setShowProgressSidebar(!showProgressSidebar)}
        />


      </div>
    );
  }

  // Fallback
  return (
    <DavenList
      onSelectPrayer={handleSelectPrayer}
      onSelectService={handleSelectService}
      onOpenPrepHub={handleOpenPrepHub}
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

const DAVEN_TOUR_STEPS: TourStep[] = [
  {
    target: 'daven-tour-tabs',
    title: 'Three Views',
    description: 'Services to follow along, Lead Davening to prepare for the amud, and All Prayers to learn individually.',
  },
  {
    target: 'daven-tour-start',
    title: 'New to Davening?',
    description: 'Tap here to jump straight into Weekday Shacharit — the best place to start.',
  },
  {
    target: 'daven-tour-services',
    title: 'Pick a Service',
    description: 'Each service guides you through every prayer in order, with audio and coaching.',
  },
  {
    target: 'daven-tour-lead',
    title: 'Lead Davening',
    description: 'Step-by-step preparation to confidently lead a minyan — roles, rehearsal, and interactive practice.',
  },
];

function DavenList({
  onSelectPrayer,
  onSelectService,
  onOpenPrepHub,
}: {
  onSelectPrayer: (prayer: Prayer) => void;
  onSelectService: (service: DaveningService) => void;
  onOpenPrepHub: (service: DaveningService) => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const completedTours = useUserStore((s) => s.completedTours);
  const completeTour = useUserStore((s) => s.completeTour);
  const resetTour = useUserStore((s) => s.resetTour);
  const davenTourDone = completedTours.daven === true;

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
            <Link
              href="/settings"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-primary-light hover:text-white hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-2">Daven</h1>
          <p className="text-primary-light text-sm mt-1">
            Follow along with services or learn individual prayers
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-4 pb-28">
        {/* 3-Tab Bar */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6" data-tour="daven-tour-tabs">
          {[
            { id: 'services' as Tab, label: 'Services' },
            { id: 'lead' as Tab, label: 'Lead Davening' },
            { id: 'prayers' as Tab, label: 'All Prayers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
              data-tour={tab.id === 'lead' ? 'daven-tour-lead' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === SERVICES TAB === */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Not sure where to start? */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-3" data-tour="daven-tour-start">
              <span className="text-xs text-gray-400">New to davening?</span>
              <button
                onClick={() => {
                  const shacharit = services.find((s) => s.type === 'weekday' && s.name.toLowerCase().includes('shacharit'));
                  if (shacharit) onSelectService(shacharit);
                }}
                className="text-xs font-semibold text-primary hover:text-primary/80"
              >
                Start with Weekday Shacharit →
              </button>
            </div>

            {/* Weekday Services */}
            <div data-tour="daven-tour-services">
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Weekday
              </h2>
              <p className="text-xs text-gray-400 mb-3">
                Daily prayer services — morning, afternoon, and evening
              </p>
              <div className="space-y-3">
                {services
                  .filter((s) => s.type === 'weekday')
                  .map((service, i) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={onSelectService}
                      index={i}
                    />
                  ))}
              </div>
            </div>

            {/* Shabbat Services */}
            {services.some((s) => s.type === 'shabbat') && (
              <div>
                <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
                  Shabbat
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                  Shabbat services — Friday evening and Saturday
                </p>
                <div className="space-y-3">
                  {services
                    .filter((s) => s.type === 'shabbat')
                    .map((service, i) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onSelect={onSelectService}
                        index={i}
                      />
                    ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* === LEAD DAVENING TAB === */}
        {activeTab === 'lead' && (
          <LeadDaveningTab
            services={services}
            onSelectService={onOpenPrepHub}
          />
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

        {/* Replay tour */}
        {davenTourDone && (
          <div className="mt-4">
            <TourReplayButton onClick={() => resetTour('daven')} accentColor="#1B4965" />
          </div>
        )}
      </div>

      {!davenTourDone && (
        <SpotlightTour
          steps={DAVEN_TOUR_STEPS}
          onComplete={() => completeTour('daven')}
          finishLabel="Got It"
          accentColor="#1B4965"
        />
      )}

      <BottomNav />
    </div>
  );
}
