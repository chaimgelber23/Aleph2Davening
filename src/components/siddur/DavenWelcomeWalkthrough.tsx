'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { AudioSourcePicker } from './AudioSourcePicker';
import type { AudioSourceId, PrayerAudioEntry } from '@/lib/content/audio-sources';

interface DavenWelcomeWalkthroughProps {
  prayerId: string;
  onClose: () => void;
  selectedAudioSource: AudioSourceId;
  onSelectAudioSource: (sourceId: AudioSourceId, entry: PrayerAudioEntry | null) => void;
}

const STEPS = ['welcome', 'audio', 'done'] as const;
type Step = typeof STEPS[number];

export function DavenWelcomeWalkthrough({
  prayerId,
  onClose,
  selectedAudioSource,
  onSelectAudioSource,
}: DavenWelcomeWalkthroughProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const audioSpeed = useUserStore((s) => s.profile.audioSpeed);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const dismissDavenWalkthrough = useUserStore((s) => s.dismissDavenWalkthrough);

  const step = STEPS[stepIndex];

  const handleFinish = () => {
    dismissDavenWalkthrough();
    onClose();
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[60]"
      />

      {/* Bottom sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[70] bg-background rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Step dots + close */}
        <div className="flex items-center justify-between px-6 py-3 shrink-0">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === stepIndex ? 'bg-primary' : i < stepIndex ? 'bg-primary/30' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setShowSkipConfirm(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close walkthrough"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Skip confirmation */}
          {showSkipConfirm && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm text-center space-y-3">
              <p className="text-sm font-semibold text-foreground">Turn off this guide?</p>
              <p className="text-xs text-gray-500">You can always turn it back on in Settings.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSkipConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Keep Going
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Turn Off
                </button>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 'welcome' && (
              <StepContainer key="welcome">
                <div className="text-center pt-4 pb-2 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B4965" strokeWidth="1.5">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">Your Prayer Reader</h2>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                    Here&apos;s what&apos;s included to help you daven:
                  </p>
                </div>

                {/* Feature list */}
                <div className="space-y-2.5 mt-3 mb-6">
                  {[
                    { icon: 'audio', color: '#1B4965', bg: 'bg-primary/8', label: 'Audio for every prayer', desc: 'AI voice + multiple recorded voices' },
                    { icon: 'scroll', color: '#4A7C59', bg: 'bg-success/8', label: 'Auto-scroll & advance', desc: 'Plays through each section hands-free' },
                    { icon: 'text', color: '#5FA8D3', bg: 'bg-primary-light/10', label: 'Transliteration & translation', desc: 'Read along in English, toggle on/off' },
                    { icon: 'coach', color: '#C6973F', bg: 'bg-gold/10', label: 'Coach mode', desc: 'Learn any prayer step by step' },
                  ].map((feature) => (
                    <div key={feature.label} className={`flex items-center gap-3 ${feature.bg} rounded-xl px-3.5 py-2.5`}>
                      <div className="w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center shrink-0">
                        {feature.icon === 'audio' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                          </svg>
                        )}
                        {feature.icon === 'scroll' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2">
                            <polyline points="7 13 12 18 17 13" />
                            <polyline points="7 6 12 11 17 6" />
                          </svg>
                        )}
                        {feature.icon === 'text' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2">
                            <path d="M4 7V4h16v3" />
                            <path d="M9 20h6" />
                            <path d="M12 4v16" />
                          </svg>
                        )}
                        {feature.icon === 'coach' && (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{feature.label}</p>
                        <p className="text-[11px] text-gray-500">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-[#163d55] active:scale-[0.98] transition-all"
                >
                  Set Up Audio
                </button>
              </StepContainer>
            )}

            {step === 'audio' && (
              <StepContainer key="audio">
                <h3 className="text-lg font-bold text-foreground mb-1">Audio</h3>
                <p className="text-xs text-gray-400 mb-5">Choose a voice and set your preferred speed.</p>

                <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
                  {/* Audio voice */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Voice</span>
                    <AudioSourcePicker
                      prayerId={prayerId}
                      selectedSource={selectedAudioSource}
                      onSelectSource={onSelectAudioSource}
                    />
                  </div>

                  <div className="w-full h-px bg-gray-100" />

                  {/* Speed */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Speed</span>
                      <span className="text-sm font-semibold text-primary">{audioSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.25}
                      value={audioSpeed}
                      onChange={(e) => updateProfile({ audioSpeed: parseFloat(e.target.value) })}
                      className="w-full accent-primary h-1"
                    />
                    <div className="flex justify-between text-[10px] text-gray-300 mt-1">
                      <span>Slow</span>
                      <span>Normal</span>
                      <span>Fast</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStepIndex(stepIndex - 1)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-[#163d55] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </StepContainer>
            )}

            {step === 'done' && (
              <StepContainer key="done">
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-success/10 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">You&apos;re All Set</h2>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                    Press play and audio will guide you through each section.
                  </p>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Tap the <strong>gear icon</strong> anytime to switch voices, toggle transliteration, or adjust any setting.
                  </p>
                </div>
                <button
                  onClick={handleFinish}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold bg-success text-white hover:bg-[#3d6a4a] active:scale-[0.98] transition-all"
                >
                  Start Davening
                </button>
              </StepContainer>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}

function StepContainer({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
