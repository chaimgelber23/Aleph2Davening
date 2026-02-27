'use client';

import { motion } from 'framer-motion';
import { HebrewText } from '@/components/ui/HebrewText';
import { AudioButton } from '@/components/ui/AudioButton';
import { useUserStore } from '@/stores/userStore';
import type { Letter, Pronunciation, VoiceGender } from '@/types';

const PRONUNCIATION_SUFFIX: Record<Pronunciation, string> = {
  modern: '',
  american: '-american',
};

const GENDER_SUFFIX: Record<VoiceGender, string> = {
  male: '',
  female: '-female',
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25];

interface LetterCardProps {
  letter: Letter;
  showDetails?: boolean;
  showMnemonic?: boolean;
  isActive?: boolean;
  pronunciation?: Pronunciation;
  onTap?: () => void;
}

export function LetterCard({
  letter,
  showDetails = true,
  showMnemonic = true,
  isActive = false,
  pronunciation = 'modern',
  onTap,
}: LetterCardProps) {
  const voiceGender = useUserStore((s) => s.profile.voiceGender) || 'male';
  const audioSpeed = useUserStore((s) => s.profile.audioSpeed);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const suffix = PRONUNCIATION_SUFFIX[pronunciation] ?? '';
  const gSuffix = GENDER_SUFFIX[voiceGender] ?? '';
  const audioUrl = `/audio/letters/${letter.id}${suffix}${gSuffix}.mp3`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        bg-white rounded-2xl shadow-sm border-2 p-8
        flex flex-col items-center gap-4
        transition-all duration-300
        ${isActive ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-100'}
        ${onTap ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''}
      `}
      onClick={onTap}
    >
      {/* Large Hebrew Letter */}
      <HebrewText size="2xl">
        {letter.hebrew}
      </HebrewText>

      {showDetails && (
        <>
          {/* Letter name and sound */}
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">{letter.name}</p>
            <p className="text-sm text-gray-500">
              Sound: <span className="font-medium text-primary">{letter.sound}</span>
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
                  const fb = new Audio(`/audio/letters/${letter.id}${suffix}.mp3`);
                  fb.playbackRate = speed;
                  fb.play().catch(() => {});
                }
              };
              audio.play().catch(() => {});
            }}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-[#163d55] active:scale-95 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            Listen
          </button>

          {/* Speed control bar */}
          <div className="flex items-center gap-2 w-full justify-center" onClick={(e) => e.stopPropagation()}>
            <span className="text-base" title="Slower">🐢</span>
            <div className="flex gap-1.5">
              {SPEED_OPTIONS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => updateProfile({ audioSpeed: speed })}
                  className={`
                    px-3.5 py-2 rounded-lg text-sm font-bold transition-all duration-150
                    ${audioSpeed === speed
                      ? 'bg-primary text-white shadow-sm scale-105'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95'
                    }
                  `}
                >
                  {speed}x
                </button>
              ))}
            </div>
            <span className="text-base" title="Faster">🐇</span>
          </div>

          {/* Mnemonic — only when actively teaching */}
          {showMnemonic && isActive && letter.mnemonic && (
            <p className="text-xs text-gray-400 text-center italic">{letter.mnemonic}</p>
          )}

          {/* Confusable hint — only when actively teaching */}
          {isActive && letter.confusableHint && (
            <p className="text-xs text-amber-600 text-center">{letter.confusableHint}</p>
          )}
        </>
      )}
    </motion.div>
  );
}
