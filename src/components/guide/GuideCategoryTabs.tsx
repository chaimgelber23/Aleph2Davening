'use client';

import { useRef, useEffect } from 'react';
import type { GuideCategory } from '@/types';
import { GUIDE_CATEGORIES } from '@/lib/content/guides';

interface GuideCategoryTabsProps {
  selected: GuideCategory | 'all';
  onSelect: (category: GuideCategory | 'all') => void;
}

export function GuideCategoryTabs({ selected, onSelect }: GuideCategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to keep active tab visible (scroll to start on first tab)
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      // If the active tab is near the start, just scroll to beginning
      if (el.offsetLeft < container.offsetWidth / 2) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
        container.scrollTo({ left, behavior: 'smooth' });
      }
    }
  }, [selected]);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider px-1">
        Filter by topic
      </p>
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-5 px-5"
      >
        <button
          ref={selected === 'all' ? activeRef : undefined}
          onClick={() => onSelect('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
            selected === 'all'
              ? 'bg-[#6B4C9A] text-white shadow-sm'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-150'
          }`}
        >
          All
        </button>
        {GUIDE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            ref={selected === cat.id ? activeRef : undefined}
            onClick={() => onSelect(cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
              selected === cat.id
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-150'
            }`}
            style={selected === cat.id ? { backgroundColor: cat.color } : undefined}
          >
            {cat.title}
          </button>
        ))}
      </div>
    </div>
  );
}
