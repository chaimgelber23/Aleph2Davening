'use client';

import { motion } from 'framer-motion';
import type { GuideLevel } from '@/types';

interface LevelSelectorProps {
  selected: GuideLevel;
  onSelect: (level: GuideLevel) => void;
}

const LEVELS: { id: GuideLevel; label: string; description: string }[] = [
  { id: 'beginner', label: 'Just Starting', description: 'Simple, practical guidance' },
  { id: 'intermediate', label: 'Ready to Practice', description: 'Traditional methods' },
  { id: 'advanced', label: 'Full Detail', description: 'Complete halachic guide' },
];

export function LevelSelector({ selected, onSelect }: LevelSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100/80 p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B4965" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="13" />
        </svg>
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Choose Your Level
        </h3>
      </div>
      <p className="text-[13px] text-gray-500 leading-relaxed">
        This guide has multiple levels. Start where you feel comfortable:
      </p>
      <div className="space-y-2">
        {LEVELS.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`w-full text-left rounded-xl border-2 p-3 transition-all ${
              selected === level.id
                ? 'border-[#1B4965] bg-[#1B4965]/5'
                : 'border-gray-100 hover:border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-[14px] font-semibold ${
                  selected === level.id ? 'text-[#1B4965]' : 'text-[#2D3142]'
                }`}>
                  {level.label}
                </h4>
                <p className="text-[12px] text-gray-500 mt-0.5">{level.description}</p>
              </div>
              {selected === level.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-5 h-5 rounded-full bg-[#1B4965] flex items-center justify-center shrink-0"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
