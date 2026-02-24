'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import {
  PHASE_1_LETTERS,
  PHASE_2_LETTERS,
  PHASE_3_LETTERS,
} from '@/lib/content/letters';
import type { Letter } from '@/types';

function getMasteryClass(masteryLevel: number): string {
  if (masteryLevel >= 0.8) {
    return 'bg-primary text-white shadow-sm shadow-primary/20';
  }
  if (masteryLevel > 0) {
    return 'bg-primary/15 text-primary border border-primary/20';
  }
  return 'bg-gray-50 text-gray-400 border border-gray-200/60';
}

function LetterCell({ letter, mastery }: { letter: Letter; mastery: number }) {
  return (
    <Link
      href="/hebrew/letters"
      className={`
        w-full aspect-square rounded-xl flex items-center justify-center
        font-[var(--font-hebrew-serif)] text-xl
        transition-all duration-300
        ${getMasteryClass(mastery)}
      `}
      title={`${letter.name} (${letter.sound})`}
    >
      {letter.hebrew}
    </Link>
  );
}

export function LetterMasteryGrid() {
  const [isOpen, setIsOpen] = useState(false);
  const skillProgress = useUserStore((s) => s.skillProgress);

  const allLetters = [...PHASE_1_LETTERS, ...PHASE_2_LETTERS, ...PHASE_3_LETTERS];
  const masteredCount = allLetters.filter(
    (l) => (skillProgress[l.id]?.masteryLevel ?? 0) >= 0.8
  ).length;
  const groups = [
    { label: 'Distinct Letters', letters: PHASE_1_LETTERS },
    { label: 'Confusable Pairs', letters: PHASE_2_LETTERS },
    { label: 'Final Forms', letters: PHASE_3_LETTERS },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Letter Mastery
          </h3>
          <span className="text-[10px] text-gray-400 font-medium">
            {masteredCount}/{allLetters.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini progress bar */}
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(masteredCount / allLetters.length) * 100}%` }}
            />
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded grid */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-medium text-gray-300 uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {group.letters.map((letter) => {
                  const progress = skillProgress[letter.id];
                  const mastery = progress?.masteryLevel ?? 0;
                  return (
                    <LetterCell
                      key={letter.id}
                      letter={letter}
                      mastery={mastery}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
