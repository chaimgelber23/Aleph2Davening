'use client';

import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { SpotlightTour } from '@/components/ui/SpotlightTour';
import { TourReplayButton } from '@/components/ui/TourReplayButton';
import type { TourStep } from '@/components/ui/SpotlightTour';
import type { DaveningService } from '@/types';

const CHAZEN_TOUR_STEPS: TourStep[] = [
  {
    target: 'chazen-tour-prep',
    title: 'Prepare Step-by-Step',
    description: 'Start here. Learn the roles, then build up to a full rehearsal at your own pace.',
  },
  {
    target: 'chazen-tour-amud',
    title: 'Practice on the Amud',
    description: 'Interactive walk-through of the full service — your lines, congregation responses, and physical actions.',
  },
  {
    target: 'chazen-tour-sheet',
    title: 'Prep Sheet',
    description: 'A printable reference card with everything you need at a glance.',
  },
];

interface ChazenPrepHubProps {
  service: DaveningService;
  onOpenPrepSheet: () => void;
  onOpenAmudPreparation: () => void;
  onOpenAmudMode: () => void;
  onBack: () => void;
}

export function ChazenPrepHub({
  service,
  onOpenPrepSheet,
  onOpenAmudPreparation,
  onOpenAmudMode,
  onBack,
}: ChazenPrepHubProps) {
  const completedTours = useUserStore((s) => s.completedTours);
  const completeTour = useUserStore((s) => s.completeTour);
  const resetTour = useUserStore((s) => s.resetTour);
  const chazenTourDone = completedTours.chazen === true;

  const paths = [
    {
      title: 'Prepare Step-by-Step',
      description: 'Progressive guide from learning the roles to full rehearsal. Perfect for first-timers.',
      time: '5–60 min',
      tourId: 'chazen-tour-prep',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20V10" />
          <path d="M18 20V4" />
          <path d="M6 20v-4" />
        </svg>
      ),
      color: '#1B4965',
      onClick: onOpenAmudPreparation,
      recommended: true,
    },
    {
      title: 'Practice on the Amud',
      description: 'Interactive walk-through of the full service — your part, congregation responses, and actions in real time.',
      time: 'Full service',
      tourId: 'chazen-tour-amud',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M5 7h14l-2 8H7L5 7z" />
          <path d="M8 21h8" />
        </svg>
      ),
      color: '#4A7C59',
      onClick: onOpenAmudMode,
    },
    {
      title: 'Prep Sheet',
      description: 'Printable reference with roles, actions, congregation responses, and service structure.',
      time: 'Reference / Print',
      tourId: 'chazen-tour-sheet',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      ),
      color: '#C6973F',
      onClick: onOpenPrepSheet,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1B4965] to-[#1A3F57] text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold mt-2">
            {service.name}
          </h1>
          <p
            dir="rtl"
            className="font-[var(--font-hebrew-serif)] text-lg text-white/40 mt-0.5"
          >
            {service.nameHebrew}
          </p>
          <p className="text-sm text-white/50 mt-2">
            ~{service.estimatedMinutes} min · {service.segments.length} sections · {service.segments.reduce((acc, seg) => acc + seg.items.length, 0)} items
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-6 space-y-4 pb-12">
        {/* Recommended path hint */}
        <p className="text-xs text-gray-400 text-center">
          New to leading? Start with &ldquo;Prepare Step-by-Step&rdquo; to learn the roles first.
        </p>

        {/* Path cards */}
        {paths.map((path, i) => (
          <motion.button
            key={path.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            onClick={path.onClick}
            className="w-full text-left bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-5"
            data-tour={path.tourId}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: `${path.color}10`, color: path.color }}
              >
                {path.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {path.title}
                  </h3>
                  {path.recommended && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#1B4965]/10 text-[#1B4965] text-[10px] font-semibold">
                      Start here
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {path.description}
                </p>
                <p className="text-[11px] font-medium mt-2" style={{ color: path.color }}>
                  {path.time}
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-300 shrink-0 mt-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.button>
        ))}

        {/* Replay tour */}
        {chazenTourDone && (
          <div className="mt-2">
            <TourReplayButton onClick={() => resetTour('chazen')} accentColor="#1B4965" />
          </div>
        )}
      </div>

      {!chazenTourDone && (
        <SpotlightTour
          steps={CHAZEN_TOUR_STEPS}
          onComplete={() => completeTour('chazen')}
          finishLabel="Got It"
          accentColor="#1B4965"
        />
      )}
    </div>
  );
}
