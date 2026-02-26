'use client';

import { AUDIO_SOURCES, PICKER_SOURCES, getAudioForPrayer, type AudioSourceId, type PrayerAudioEntry } from '@/lib/content/audio-sources';

interface AudioSourcePickerProps {
  prayerId: string;
  selectedSource: AudioSourceId;
  onSelectSource: (sourceId: AudioSourceId, entry: PrayerAudioEntry | null) => void;
}

export function AudioSourcePicker({ prayerId, selectedSource, onSelectSource }: AudioSourcePickerProps) {
  const entries = getAudioForPrayer(prayerId);

  // Ensure selected source is one of the picker sources
  const activeSource = PICKER_SOURCES.includes(selectedSource) ? selectedSource : PICKER_SOURCES[0];

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-0.5">
      {PICKER_SOURCES.map((sourceId) => {
        const source = AUDIO_SOURCES[sourceId];
        const entry = entries.find((e) => e.sourceId === sourceId);
        const isActive = sourceId === activeSource;

        return (
          <button
            key={sourceId}
            onClick={() => onSelectSource(sourceId, entry ?? null)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
              ${isActive
                ? 'bg-white text-[#1B4965] shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
              }
            `}
          >
            {sourceId === 'google-tts' && (
              <span className="inline-block mr-1 align-middle opacity-70">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </span>
            )}
            {source.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
