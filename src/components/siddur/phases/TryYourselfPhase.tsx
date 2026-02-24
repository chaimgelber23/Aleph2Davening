'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PrayerSection } from '@/types';

interface TryYourselfPhaseProps {
  section: PrayerSection;
  showTranslation: boolean;
  onAdvance: () => void;
}

export function TryYourselfPhase({
  section,
  showTranslation,
  onAdvance,
}: TryYourselfPhaseProps) {
  const [showTransliteration, setShowTransliteration] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      {/* Instruction */}
      <div className="text-center">
        <p className="text-sm text-gray-500">
          Try reading the Hebrew on your own. If you get stuck,
          tap &quot;Peek&quot; to see the transliteration.
        </p>
      </div>

      {/* Text display */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {/* Hebrew */}
        <div dir="rtl" className="text-center">
          <p className="font-[var(--font-hebrew-serif)] text-3xl text-[#1A1A2E] leading-[2]">
            {section.hebrewText}
          </p>
        </div>

        {/* Transliteration — tap to reveal */}
        <div className="text-center">
          {showTransliteration ? (
            <>
              <p className="text-[10px] uppercase tracking-widest text-primary/40 font-semibold mb-0.5">
                How to say it
              </p>
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-medium text-primary italic"
              >
                {section.transliteration}
              </motion.p>
              <button
                onClick={() => setShowTransliteration(false)}
                className="text-[10px] text-gray-400 mt-1 hover:text-gray-600 transition-colors"
              >
                Hide
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowTransliteration(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 active:scale-[0.98] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Peek
            </button>
          )}
        </div>

        {/* Translation — conditional on preference */}
        {showTranslation && (
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-primary/40 font-semibold mb-0.5">What it means</p>
            <p className="text-sm text-gray-300">
              {section.translation}
            </p>
          </div>
        )}
      </div>

      {/* Done button */}
      <button
        onClick={onAdvance}
        className="w-full py-3.5 rounded-xl text-sm font-medium bg-success text-white hover:bg-[#3d6a4a] active:scale-[0.98] transition-all"
      >
        Done
      </button>
    </motion.div>
  );
}
