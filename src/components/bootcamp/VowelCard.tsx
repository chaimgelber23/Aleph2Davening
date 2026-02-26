'use client';

import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import type { Vowel, Pronunciation, VoiceGender } from '@/types';

const PRONUNCIATION_SUFFIX: Record<Pronunciation, string> = {
  modern: '',
  american: '-american',
};

const GENDER_SUFFIX: Record<VoiceGender, string> = {
  male: '',
  female: '-female',
};

interface VowelCardProps {
  vowel: Vowel;
  exampleLetter?: string; // e.g. 'ב' to show the vowel under a letter
  isActive?: boolean;
  pronunciation?: Pronunciation;
}

export function VowelCard({ vowel, exampleLetter = 'ב', isActive = false, pronunciation = 'modern' }: VowelCardProps) {
  const voiceGender = useUserStore((s) => s.profile.voiceGender) || 'male';
  const suffix = PRONUNCIATION_SUFFIX[pronunciation] ?? '';
  const gSuffix = GENDER_SUFFIX[voiceGender] ?? '';
  // Single audio: plays name + sound together
  const audioUrl = `/audio/vowels/${vowel.id}${gSuffix}.mp3`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-2xl shadow-sm border-2 p-6
        flex flex-col items-center gap-3
        transition-all duration-300
        ${isActive ? 'shadow-lg' : 'border-gray-100'}
      `}
      style={isActive ? { borderColor: vowel.color, boxShadow: `0 4px 20px ${vowel.color}20` } : undefined}
    >
      {/* Color dot indicator */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vowel.color }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: vowel.color }}>
          {vowel.soundGroup === 'chataf' ? 'Chataf' : vowel.soundGroup.toUpperCase()} vowel
        </span>
      </div>

      {/* Vowel mark shown under an example letter */}
      <div className="flex flex-col items-center">
        <span
          dir="rtl"
          className="font-['Noto_Serif_Hebrew',serif] text-6xl text-[#1A1A2E] leading-[2]"
        >
          {exampleLetter}{vowel.hebrew}
        </span>
      </div>

      {/* Vowel name and sound */}
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">{vowel.name}</p>
        <p className="text-sm text-gray-500">
          Sound: <span className="font-medium" style={{ color: vowel.color }}>{vowel.sound}</span>
        </p>
      </div>

      {/* Audio button — plays name + sound together */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          const speed = useUserStore.getState().profile.audioSpeed;
          const audio = new Audio(audioUrl);
          audio.playbackRate = speed;
          audio.onerror = () => {
            if (gSuffix) {
              const fb = new Audio(`/audio/vowels/${vowel.id}.mp3`);
              fb.playbackRate = speed;
              fb.play().catch(() => {});
            }
          };
          audio.play().catch(() => {});
        }}
        className="flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
        style={{ backgroundColor: vowel.color }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5.14v14l11-7-11-7z" />
        </svg>
        Listen
      </button>

      {/* Short description — only show when card is active/focused */}
      {isActive && (
        <p className="text-xs text-gray-400 text-center px-2">{vowel.description}</p>
      )}
    </motion.div>
  );
}
