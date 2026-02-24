'use client';

import Link from 'next/link';
import { useUserStore } from '@/stores/userStore';
import { LETTERS } from '@/lib/content/letters';

export function QuickActionPills() {
  const skillProgress = useUserStore((s) => s.skillProgress);

  const nextLetter = LETTERS.find((l) => {
    const p = skillProgress[l.id];
    return !p || p.masteryLevel < 0.8;
  });

  const pills = [
    {
      label: 'Quick Practice',
      href: '/hebrew/practice',
      style: 'bg-primary/8 text-primary',
    },
    nextLetter
      ? {
          label: `Learn: ${nextLetter.name}`,
          href: '/hebrew/letters',
          style: 'bg-[#5FA8D3]/10 text-[#5FA8D3]',
        }
      : null,
    {
      label: 'Morning Prayers',
      href: '/daven',
      style: 'bg-success/8 text-success',
    },
    {
      label: 'Brachot',
      href: '/living',
      style: 'bg-[#6B4C9A]/10 text-[#6B4C9A]',
    },
  ].filter(Boolean) as { label: string; href: string; style: string }[];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
      {pills.map((pill) => (
        <Link
          key={pill.label}
          href={pill.href}
          className={`${pill.style} px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-opacity hover:opacity-80`}
        >
          {pill.label}
        </Link>
      ))}
    </div>
  );
}
