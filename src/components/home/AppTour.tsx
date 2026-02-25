'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';

interface TourStep {
  target: string;
  title: string;
  description: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'tour-header',
    title: 'Your Dashboard',
    description:
      'Your greeting, streak, and daily study progress — all at a glance.',
  },
  {
    target: 'tour-streak',
    title: 'Streak Tracker',
    description:
      'Practice each day to build your streak. Shabbat is automatically skipped!',
  },
  {
    target: 'tour-daily-goal',
    title: 'Daily Goal',
    description: 'Track your study minutes toward your daily target.',
  },
  {
    target: 'tour-quick-actions',
    title: 'Quick Actions',
    description:
      'Tap any pill for instant access to practice, lessons, or prayers.',
  },
  {
    target: 'tour-section-hebrew',
    title: 'Hebrew',
    description:
      'Learn to read Hebrew letters and vowels step by step, with audio for everything.',
  },
  {
    target: 'tour-section-daven',
    title: 'Daven',
    description:
      'Follow along with real prayer services — audio, transliteration, and coaching included.',
  },
  {
    target: 'tour-section-yahrzeit',
    title: 'Yahrzeit',
    description:
      'Kaddish guides, mourner\'s observance, and finding your place in services.',
  },
  {
    target: 'tour-section-living',
    title: 'Jewish Living',
    description:
      'Brachot and 30+ guides for Shabbat, holidays, and daily Jewish life.',
  },
];

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function AppTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [visible, setVisible] = useState(false);
  const completeAppTour = useUserStore((s) => s.completeAppTour);
  const measuring = useRef(false);

  const step = TOUR_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const measureTarget = useCallback((targetId: string) => {
    if (measuring.current) return;
    measuring.current = true;

    const el = document.querySelector(`[data-tour="${targetId}"]`);
    if (!el) {
      measuring.current = false;
      setRect(null);
      return;
    }

    // Scroll element into view first
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Wait for scroll to settle, then measure
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const padding = 6;
      setRect({
        top: r.top - padding,
        left: r.left - padding,
        width: r.width + padding * 2,
        height: r.height + padding * 2,
      });
      measuring.current = false;
    }, 350);
  }, []);

  // Initial delay before showing tour
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      measureTarget(TOUR_STEPS[0].target);
    }, 600);
    return () => clearTimeout(timer);
  }, [measureTarget]);

  // Re-measure on resize
  useEffect(() => {
    if (!visible) return;
    const handleResize = () => measureTarget(step.target);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visible, step.target, measureTarget]);

  const goTo = useCallback(
    (index: number) => {
      setCurrentStep(index);
      measureTarget(TOUR_STEPS[index].target);
    },
    [measureTarget]
  );

  const handleNext = () => {
    if (isLast) {
      completeAppTour();
    } else {
      goTo(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) goTo(currentStep - 1);
  };

  const handleDismiss = () => {
    completeAppTour();
  };

  if (!visible) return null;

  // Tooltip position: below the spotlight if room, otherwise above
  const tooltipPosition = (() => {
    if (!rect) return { top: '50%', transform: 'translateY(-50%)' };

    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    const spaceBelow = viewportHeight - (rect.top + rect.height);
    const tooltipHeight = 200; // estimated
    const gap = 12;

    if (spaceBelow > tooltipHeight + gap) {
      // Place below
      return { top: rect.top + rect.height + gap };
    } else {
      // Place above
      return { top: Math.max(12, rect.top - tooltipHeight - gap) };
    }
  })();

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Dark overlay with spotlight cutout */}
      {rect && (
        <div
          className="absolute transition-all duration-300 ease-out rounded-2xl"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* If no rect measured yet, just show dark overlay */}
      {!rect && (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Click layer — clicking overlay area advances or dismisses */}
      <div
        className="absolute inset-0"
        onClick={handleNext}
        style={{ pointerEvents: 'auto' }}
      />

      {/* X close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 z-[90] w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
        aria-label="Close tour"
        style={{ pointerEvents: 'auto' }}
      >
        <X className="w-5 h-5 text-white" strokeWidth={2} />
      </button>

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 right-4 max-w-sm mx-auto z-[90]"
          style={{
            top: typeof tooltipPosition.top === 'number' ? tooltipPosition.top : undefined,
            ...(typeof tooltipPosition.top === 'string'
              ? { top: tooltipPosition.top, transform: (tooltipPosition as { transform?: string }).transform }
              : {}),
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
            {/* Step counter */}
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {currentStep + 1} of {TOUR_STEPS.length}
            </p>

            {/* Title & description */}
            <h3 className="text-lg font-bold text-[#2D3142] mb-1">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {/* Back button */}
              {!isFirst ? (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {/* Dots */}
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentStep
                        ? 'bg-[#1B4965]'
                        : i < currentStep
                        ? 'bg-[#1B4965]/30'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Next / Finish button */}
              <button
                onClick={handleNext}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isLast
                    ? 'bg-[#4A7C59] text-white hover:bg-[#3d6a4a]'
                    : 'bg-[#1B4965] text-white hover:bg-[#163d55]'
                }`}
              >
                {isLast ? 'Start Learning' : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
