'use client';

import { HelpCircle } from 'lucide-react';

interface TourReplayButtonProps {
  onClick: () => void;
  /** Accent color for the icon and border. Default: #1B4965 */
  accentColor?: string;
}

/**
 * A polished, always-visible button to replay a page tour.
 * Sits inline in the page content — not floating.
 */
export function TourReplayButton({
  onClick,
  accentColor = '#1B4965',
}: TourReplayButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm px-4 py-3.5 transition-all group"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}10` }}
      >
        <HelpCircle
          className="w-[18px] h-[18px]"
          strokeWidth={1.8}
          style={{ color: accentColor }}
        />
      </div>
      <div className="text-left flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2D3142]">
          How this page works
        </p>
        <p className="text-[11px] text-gray-400">
          Replay the guided tour
        </p>
      </div>
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
