'use client';

import { useMemo } from 'react';
import { getDailyInspiration } from '@/lib/content/encouragements';

export function DailyWisdom() {
  const quote = useMemo(() => getDailyInspiration(), []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest mb-3">
        Daily Wisdom
      </p>
      <p className="text-[13px] text-gray-600 leading-relaxed italic">
        &ldquo;{quote.english}&rdquo;
      </p>
      <p
        dir="rtl"
        className="font-[var(--font-hebrew-serif)] text-sm text-gray-400 mt-2 leading-relaxed"
      >
        {quote.hebrew}
      </p>
      <p className="text-[11px] text-primary/50 mt-2 font-medium">
        — {quote.source}
      </p>
    </div>
  );
}
