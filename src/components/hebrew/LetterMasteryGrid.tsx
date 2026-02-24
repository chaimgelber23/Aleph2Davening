'use client';

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
  const skillProgress = useUserStore((s) => s.skillProgress);

  const groups = [
    { label: 'Distinct Letters', letters: PHASE_1_LETTERS },
    { label: 'Confusable Pairs', letters: PHASE_2_LETTERS },
    { label: 'Final Forms', letters: PHASE_3_LETTERS },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Letter Mastery
      </h3>
      <div className="space-y-4">
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
    </div>
  );
}
