'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface TourStep {
  target: string;
  title: string;
  description: string;
}

interface SpotlightTourProps {
  steps: TourStep[];
  onComplete: () => void;
  /** Label for the final step CTA. Default: "Got It" */
  finishLabel?: string;
  /** Accent color for the Next button. Default: #1B4965 */
  accentColor?: string;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SpotlightTour({
  steps,
  onComplete,
  finishLabel = 'Got It',
  accentColor = '#1B4965',
}: SpotlightTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [visible, setVisible] = useState(false);
  const measuring = useRef(false);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const measureTarget = useCallback(
    (targetId: string) => {
      if (measuring.current) return;
      measuring.current = true;

      const el = document.querySelector(`[data-tour="${targetId}"]`);
      if (!el) {
        measuring.current = false;
        setRect(null);
        return;
      }

      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

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
    },
    []
  );

  // Show after short delay for page to settle
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      measureTarget(steps[0].target);
    }, 600);
    return () => clearTimeout(timer);
  }, [measureTarget, steps]);

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
      measureTarget(steps[index].target);
    },
    [measureTarget, steps]
  );

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      goTo(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) goTo(currentStep - 1);
  };

  if (!visible) return null;

  // Tooltip positioning
  const tooltipPosition = (() => {
    if (!rect) return { top: '50%', transform: 'translateY(-50%)' } as const;

    const vh =
      typeof window !== 'undefined' ? window.innerHeight : 800;
    const spaceBelow = vh - (rect.top + rect.height);
    const tooltipH = 200;
    const gap = 12;

    if (spaceBelow > tooltipH + gap) {
      return { top: rect.top + rect.height + gap } as const;
    }
    return { top: Math.max(12, rect.top - tooltipH - gap) } as const;
  })();

  return (
    <div className="fixed inset-0 z-[80]">
      {/* Spotlight cutout */}
      {rect ? (
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
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Click-through overlay */}
      <div
        className="absolute inset-0"
        onClick={handleNext}
        style={{ pointerEvents: 'auto' }}
      />

      {/* X close */}
      <button
        onClick={onComplete}
        className="absolute top-4 right-4 z-[90] w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-colors"
        aria-label="Close tour"
        style={{ pointerEvents: 'auto' }}
      >
        <X className="w-5 h-5 text-white" strokeWidth={2} />
      </button>

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute left-4 right-4 max-w-sm mx-auto z-[90]"
          style={{
            top:
              typeof tooltipPosition.top === 'number'
                ? tooltipPosition.top
                : tooltipPosition.top,
            transform:
              'transform' in tooltipPosition
                ? tooltipPosition.transform
                : undefined,
            pointerEvents: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5">
            {/* Step counter */}
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {currentStep + 1} of {steps.length}
            </p>

            <h3 className="text-lg font-bold text-[#2D3142] mb-1">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Nav */}
            <div className="flex items-center justify-between">
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

              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        i === currentStep
                          ? accentColor
                          : i < currentStep
                          ? `${accentColor}4D`
                          : '#e5e7eb',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{
                  backgroundColor: isLast ? '#4A7C59' : accentColor,
                }}
              >
                {isLast ? finishLabel : 'Next'}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}