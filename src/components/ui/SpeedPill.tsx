'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';

const SPEED_STEPS = [0.75, 1, 1.25, 1.5, 2];

export function SpeedPill({
  onSpeedChange,
  color = 'gray',
}: {
  onSpeedChange?: (speed: number) => void;
  color?: 'gray' | 'primary' | 'brown' | 'purple';
}) {
  const audioSpeed = useUserStore((s) => s.profile.audioSpeed);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const [justChanged, setJustChanged] = useState(false);

  const cycleSpeed = () => {
    const currentIdx = SPEED_STEPS.indexOf(audioSpeed);
    const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % SPEED_STEPS.length : 1;
    const newSpeed = SPEED_STEPS[nextIdx];
    if (onSpeedChange) {
      onSpeedChange(newSpeed);
    } else {
      updateProfile({ audioSpeed: newSpeed });
    }
    setJustChanged(true);
  };

  useEffect(() => {
    if (justChanged) {
      const t = setTimeout(() => setJustChanged(false), 400);
      return () => clearTimeout(t);
    }
  }, [justChanged]);

  const colorMap = {
    gray: {
      bg: 'bg-gray-100 hover:bg-gray-200',
      text: 'text-gray-600',
      activeBg: 'bg-gray-200',
    },
    primary: {
      bg: 'bg-primary/10 hover:bg-primary/15',
      text: 'text-primary',
      activeBg: 'bg-primary/20',
    },
    brown: {
      bg: 'bg-[#5C4033]/10 hover:bg-[#5C4033]/15',
      text: 'text-[#5C4033]',
      activeBg: 'bg-[#5C4033]/20',
    },
    purple: {
      bg: 'bg-[#6B4C9A]/10 hover:bg-[#6B4C9A]/15',
      text: 'text-[#6B4C9A]',
      activeBg: 'bg-[#6B4C9A]/20',
    },
  };

  const c = colorMap[color];

  return (
    <motion.button
      onClick={cycleSpeed}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors text-sm font-bold shrink-0 ${
        justChanged ? c.activeBg : c.bg
      } ${c.text}`}
      aria-label={`Speed: ${audioSpeed}x. Tap to change.`}
      whileTap={{ scale: 0.92 }}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={audioSpeed}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="tabular-nums"
        >
          {audioSpeed}x
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}