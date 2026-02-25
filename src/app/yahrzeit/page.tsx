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

type Tab = 'kaddish' | 'services' | 'guide' | 'observance';
type YahrzeitView = 'tabs' | 'learn_kaddish' | 'service_detail';

export default function YahrzeitPage() {
  const [view, setView] = useState<YahrzeitView>('tabs');
  const [activeTab, setActiveTab] = useState<Tab>('kaddish');
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

  useEffect(() => {
    if (autoPlayNext && currentSection && mournersPrayer) {
      setAutoPlayNext(false);
      const timer = setTimeout(() => {
        play(currentSection.hebrewText, 'hebrew', audioSpeed, mournersPrayer.id, currentSection.id);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPlayNext, currentSection, mournersPrayer, audioSpeed, play]);

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

  const handleBackToTabs = useCallback(() => {
    stop();
    setView('tabs');
    setCurrentSectionIndex(0);
    setSelectedServiceId(null);
  }, [stop]);

  // ============================================================
  // LEARN KADDISH VIEW — full-screen prayer reader
  // ============================================================
  if (view === 'learn_kaddish' && mournersPrayer) {
    const totalSections = mournersPrayer.sections.length;

    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <button onClick={handleBackToTabs} className="flex items-center justify-center w-11 h-11 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
              <span className="sr-only">Back to Kaddish</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-800">Mourner&apos;s Kaddish</span>
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {currentSectionIndex + 1} of {totalSections}
              </span>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center w-11 h-11 -mr-2 text-gray-400 hover:text-[#5C4033] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="max-w-md mx-auto px-6 py-6 space-y-5 pb-32">
          {currentSectionIndex === 0 && displaySettings.showInstructions && (
            <p className="text-xs text-gray-400 text-center">{mournersPrayer.whenSaid}</p>
          )}

          {displaySettings.showAmudCues && currentSection?.amud && (
            <div className="flex items-center justify-center gap-2">
              <AmudBadge role={currentSection.amud.role} />
              {currentSection.amud.physicalActions?.map((action) => (
                <span key={action} className="inline-flex items-center px-2 py-0.5 rounded-full bg-warning/15 text-[#8B6914] text-[10px] font-medium">
                  {action.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {showProgressSidebar && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Outline ({currentSectionIndex + 1}/{totalSections})</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {mournersPrayer.sections.map((section, idx) => (
                  <button
                    key={section.id}
                    onClick={() => { stop(); setCurrentSectionIndex(idx); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      idx === currentSectionIndex ? 'bg-[#5C4033] text-white font-medium' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <span className="font-medium">{idx + 1}.</span> {section.hebrewText.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
          )}

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

          {viewMode === 'full' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-[60px] z-20 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={handleReplay} disabled={isLoading} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isLoading ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                  </button>
                  <button onClick={handleTogglePlay} disabled={isLoading} className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg active:scale-95 ${isLoading ? 'bg-gray-200 text-gray-400' : 'bg-[#5C4033] text-white hover:bg-[#4a3529]'}`}>
                    {isLoading ? (
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" /></svg>
                    ) : isPlaying ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#5C4033] rounded-full transition-all duration-100" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-gray-400">Section {currentSectionIndex + 1}/{totalSections}</span>
                      <span className="text-[10px] font-medium text-[#5C4033]">{audioSpeed}x</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-2">
                  <button
                    onClick={() => {
                      const SPEED_STEPS = [0.75, 1, 1.25, 1.5, 2];
                      const currentIdx = SPEED_STEPS.indexOf(audioSpeed);
                      const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % SPEED_STEPS.length : 1;
                      handleSpeedChange(SPEED_STEPS[nextIdx]);
                    }}
                    className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 text-xs font-bold transition-colors"
                    aria-label="Change speed"
                  >
                    {audioSpeed}x
                  </button>
                </div>
              </div>

              {mournersPrayer.sections.map((section, idx) => {
                const isCurrent = idx === currentSectionIndex;
                const sectionWords = section.hebrewText.split(' ');
                return (
                  <button key={section.id} onClick={() => { stop(); setCurrentSectionIndex(idx); }} className={`w-full text-left rounded-2xl border p-5 transition-all ${isCurrent ? 'border-[#5C4033] shadow-md bg-white' : 'border-gray-100 bg-white/80 hover:border-gray-200'}`} id={`full-section-${idx}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Section {idx + 1}</span>
                      {isCurrent && <span className="text-[10px] font-bold text-[#5C4033] uppercase tracking-wider">Current</span>}
                    </div>
                    {isCurrent ? (
                      <div dir="rtl" className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 leading-[2.2]">
                        {sectionWords.map((word, i) => (
                          <span key={i} className={`font-[var(--font-hebrew-serif)] text-2xl px-1 py-0.5 rounded-lg transition-all duration-200 ${i === currentWordIndex ? 'bg-[#5C4033]/15 text-[#5C4033] scale-105' : ''} ${i < currentWordIndex && isPlaying ? 'text-[#5C4033]/40' : ''} ${i > currentWordIndex && isPlaying ? 'text-[#1A1A2E]' : ''} ${!isPlaying ? 'text-[#1A1A2E]' : ''}`}>{word}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="font-[var(--font-hebrew-serif)] text-xl text-[#1A1A2E]/70 leading-[1.8] text-right" dir="rtl">{section.hebrewText}</p>
                    )}
                    {displaySettings.showTransliteration && section.transliteration && (
                      isCurrent ? (
                        <div className="flex flex-wrap justify-center gap-x-1.5 gap-y-0.5 mt-2">
                          {section.transliteration.split(' ').map((word, i) => (
                            <span key={i} className={`text-sm transition-all duration-200 ${i === currentWordIndex ? 'text-[#5C4033] font-semibold' : 'text-gray-400 italic'}`}>{word}</span>
                          ))}
                        </div>
                      ) : <p className="text-sm text-gray-400 italic mt-2">{section.transliteration}</p>
                    )}
                    {displaySettings.showTranslation && section.translation && (
                      <p className={`text-sm mt-2 ${isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>{section.translation}</p>
                    )}
                    {isCurrent && displaySettings.showAmudCues && section.amud && (
                      <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                        {section.amud.instruction && <p className="text-xs text-[#5C4033] font-medium text-center">{section.amud.instruction}</p>}
                        {section.amud.congregationResponse && (
                          <div className="bg-success/5 rounded-xl p-3">
                            <p className="text-[10px] uppercase tracking-wider text-success font-semibold mb-0.5">Congregation responds</p>
                            <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-base text-success">{section.amud.congregationResponse}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'section' && (
            <div className="flex items-center justify-between">
              <button onClick={() => { if (currentSectionIndex > 0) { stop(); setAutoPlayNext(false); setCurrentSectionIndex(currentSectionIndex - 1); } }} disabled={currentSectionIndex === 0} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentSectionIndex === 0 ? 'text-gray-300' : 'text-[#5C4033] hover:bg-[#5C4033]/5'}`}>Previous</button>
              <div className="flex gap-1">
                {mournersPrayer.sections.map((_, i) => (
                  <button key={i} onClick={() => { stop(); setCurrentSectionIndex(i); }} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentSectionIndex ? 'bg-[#5C4033]' : 'bg-gray-200 hover:bg-gray-300'}`} />
                ))}
              </div>
              <button onClick={() => { if (currentSectionIndex < totalSections - 1) { stop(); setAutoPlayNext(false); setCurrentSectionIndex(currentSectionIndex + 1); } }} disabled={currentSectionIndex === totalSections - 1} className={`px-4 py-2 rounded-lg text-sm font-medium ${currentSectionIndex === totalSections - 1 ? 'text-gray-300' : 'text-[#5C4033] hover:bg-[#5C4033]/5'}`}>Next</button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showCoaching && <CoachingOverlay prayer={mournersPrayer} initialSectionIndex={currentSectionIndex} onClose={() => setShowCoaching(false)} />}
        </AnimatePresence>
        <AnimatePresence>
          {showSettingsModal && (
            <PrayerSettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} prayerId={mournersPrayer.id} selectedAudioSource={selectedAudioSource} onSelectAudioSource={(sourceId: AudioSourceId, entry: PrayerAudioEntry | null) => { setSelectedAudioSource(sourceId); setSelectedAudioEntry(entry); }} autoAdvanceEnabled={autoAdvanceEnabled} onToggleAutoAdvance={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)} viewMode={viewMode} onChangeViewMode={setViewMode} showProgressSidebar={showProgressSidebar} onToggleProgressSidebar={() => setShowProgressSidebar(!showProgressSidebar)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ============================================================
  // SERVICE DETAIL VIEW — full service kaddish map
  // ============================================================
  if (view === 'service_detail' && selectedServiceId) {
    const selectedService = getService(selectedServiceId);
    if (!selectedService) return null;

    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-30">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button onClick={() => { setView('tabs'); setSelectedServiceId(null); }} className="flex items-center justify-center w-10 h-10 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-bold text-gray-800">{selectedService.name}</span>
          </div>
        </div>
        <div className="max-w-md mx-auto px-6 py-6 pb-28">
          <KaddishServiceMap service={selectedService} onLearnKaddish={() => setView('learn_kaddish')} />
        </div>
        <BottomNav />
      </div>
    );
  }

  // ============================================================
  // MAIN TABS VIEW
  // ============================================================
  const tabs: { id: Tab; label: string }[] = [
    { id: 'kaddish', label: 'Kaddish' },
    { id: 'services', label: 'In Services' },
    { id: 'guide', label: 'Print Guide' },
    { id: 'observance', label: 'Observance' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#5C4033] text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white/60 text-sm hover:text-white transition-colors">Home</Link>
            <Link href="/settings" className="text-white/60 text-sm hover:text-white transition-colors">Settings</Link>
          </div>
          <h1 className="text-2xl font-bold mt-2">Yahrzeit & Kaddish</h1>
          <p className="text-white/60 text-sm mt-1">
            A complete guide for honoring a loved one&apos;s memory
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-4 pb-28">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === KADDISH TAB === */}
        {activeTab === 'kaddish' && (
          <div className="space-y-4">
            {/* What to Do Now — urgent action card */}
            <div className="bg-[#5C4033]/5 border-2 border-[#5C4033]/20 rounded-2xl p-5">
              <h2 className="text-sm font-bold text-[#5C4033] mb-1.5">Need to say Kaddish today?</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                Here&apos;s what to do: learn the words (about 5 minutes), then find a minyan (prayer service) to say it at.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setView('learn_kaddish')}
                  className="flex-1 py-2.5 rounded-xl bg-[#5C4033] text-white text-sm font-semibold hover:bg-[#4a3529] transition-colors"
                >
                  Learn the Words
                </button>
                <button
                  onClick={() => { setActiveTab('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-[#5C4033]/20 text-[#5C4033] text-sm font-semibold hover:bg-[#5C4033]/5 transition-colors"
                >
                  When Is It Said?
                </button>
              </div>
            </div>

            {/* Intro */}
            <p className="text-sm text-gray-600 leading-relaxed">
              During davening services, you will hear several versions of Kaddish.
              Only one — the <strong>Mourner&apos;s Kaddish</strong> — is yours to say.
              The others are said by the prayer leader. You just listen and respond &ldquo;Amen.&rdquo;
            </p>

            {/* Learn to Say Kaddish — primary CTA */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-2xl border-2 border-[#5C4033]/15 p-5 shadow-sm">
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#5C4033] mb-1">Your Kaddish</p>
                <h2 className="text-base font-bold text-foreground">Mourner&apos;s Kaddish</h2>
                <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-lg text-[#5C4033]/60 mt-0.5">קַדִּישׁ יָתוֹם</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  The Mourner&apos;s Kaddish never mentions death. It is a declaration of faith — praising God
                  when it is hardest. The congregation stands with you, responding &ldquo;Amen.&rdquo;
                </p>
                <button
                  onClick={() => setView('learn_kaddish')}
                  className="mt-4 w-full py-3 rounded-xl bg-[#5C4033] text-white text-sm font-semibold hover:bg-[#4a3529] transition-colors"
                >
                  Learn to Say Kaddish
                </button>
              </div>
            </motion.div>

            {/* Other types */}
            <div className="pt-1">
              <h3 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 px-1">
                Other Types You&apos;ll Hear
              </h3>
              {KADDISH_TYPES.filter((k) => !k.isYourKaddish).map((kaddish, i) => {
                const isExpanded = expandedKaddish === kaddish.type;
                return (
                  <motion.div
                    key={kaddish.type}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.04 }}
                    className="mb-2"
                  >
                    <button
                      onClick={() => setExpandedKaddish(isExpanded ? null : kaddish.type)}
                      className="w-full rounded-2xl bg-white border border-gray-100 text-left p-4 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{kaddish.nameEnglish}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{kaddish.yourRole}</p>
                        </div>
                        <svg className={`w-3.5 h-3.5 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      {isExpanded && (
                        <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <p className="text-sm text-gray-500 leading-relaxed">{kaddish.beginnerExplanation}</p>
                          {kaddish.key_line && (
                            <div className="bg-gray-50 rounded-lg p-2.5">
                              <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-base text-gray-700">{kaddish.key_line}</p>
                              {kaddish.key_line_transliteration && <p className="text-xs text-gray-400 italic mt-0.5">{kaddish.key_line_transliteration}</p>}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* === SERVICES TAB === */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              On a yahrzeit, attend all three daily services if possible.
              Your Mourner&apos;s Kaddish is said near the end of each one.
            </p>

            {KADDISH_IN_SERVICES.map((service, i) => {
              const mournerCount = service.occurrences.filter((o) => o.type === 'mourners').length;
              return (
                <motion.div
                  key={service.serviceId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  {/* Service header — tap for detailed map */}
                  <button
                    onClick={() => { setSelectedServiceId(service.serviceId); setView('service_detail'); }}
                    className="w-full text-left bg-[#5C4033]/5 px-5 py-3 border-b border-gray-100 hover:bg-[#5C4033]/8 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-bold text-foreground">{service.service}</h3>
                        <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-xs text-gray-400">{service.serviceHebrew}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{service.timeOfDay} ~{service.estimatedMinutes}m</span>
                        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {/* Kaddish occurrences */}
                  <div className="divide-y divide-gray-50">
                    {service.occurrences.map((occ, j) => {
                      const isMourners = occ.type === 'mourners';
                      const typeLabel = occ.type === 'half' ? 'Half' : occ.type === 'full' ? 'Full' : occ.type === 'mourners' ? "Mourner's" : "D'Rabbanan";
                      return (
                        <div key={j} className={`px-5 py-2.5 flex items-start gap-3 ${isMourners ? 'bg-[#5C4033]/4' : ''}`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${isMourners ? 'bg-[#5C4033]' : 'bg-gray-300'}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5">
                              {isMourners && <span className="text-[9px] uppercase tracking-wider font-bold text-[#5C4033]">You</span>}
                              <span className={`text-xs font-medium ${isMourners ? 'text-[#5C4033]' : 'text-gray-600'}`}>{typeLabel}</span>
                            </div>
                            <p className="text-xs text-gray-500">{occ.when}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary footer */}
                  <div className="px-5 py-2 bg-gray-50/50 border-t border-gray-100">
                    <p className="text-[10px] text-[#5C4033] font-medium">
                      You say Mourner&apos;s Kaddish {mournerCount} {mournerCount === 1 ? 'time' : 'times'} in this service
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* === PRINT GUIDE TAB === */}
        {activeTab === 'guide' && (
          <KaddishPrintGuide />
        )}

        {/* === OBSERVANCE TAB === */}
        {activeTab === 'observance' && (
          <div className="space-y-5">
            <p className="text-sm text-gray-600 leading-relaxed">
              A yahrzeit is the annual anniversary of a loved one&apos;s passing,
              observed on the Hebrew date. Here is what you do.
            </p>

            {/* Essential */}
            <div>
              <h2 className="text-[10px] uppercase tracking-widest text-[#5C4033] font-bold mb-3 px-1">Essential</h2>
              <div className="space-y-3">
                {YAHRZEIT_PRACTICES.filter((p) => p.required).sort((a, b) => a.sortOrder - b.sortOrder).map((practice, i) => (
                  <motion.div key={practice.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl border-2 border-[#5C4033]/10 p-5">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-light text-[#5C4033]/30 leading-none mt-0.5">{i + 1}</span>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-foreground">{practice.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{practice.description}</p>
                        {practice.beginnerTip && <p className="text-xs text-[#5C4033]/60 mt-2 italic">{practice.beginnerTip}</p>}
                        {practice.title === 'Say Kaddish' && (
                          <button onClick={() => { setActiveTab('services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-2 text-xs font-semibold text-[#5C4033] hover:text-[#4a3529] transition-colors">
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
              <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3 px-1">Additional Customs</h2>
              <div className="grid grid-cols-2 gap-3">
                {YAHRZEIT_PRACTICES.filter((p) => !p.required).sort((a, b) => a.sortOrder - b.sortOrder).map((practice, i) => (
                  <motion.div key={practice.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i + 2) * 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="text-xs font-semibold text-foreground">{practice.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{practice.description}</p>
                    {practice.beginnerTip && <p className="text-[10px] text-gray-300 mt-1.5 italic">{practice.beginnerTip}</p>}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
