'use client';

import { motion } from 'framer-motion';
import type { DaveningService } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  half: 'Half Kaddish',
  full: 'Full Kaddish',
  mourners: 'Mourner\'s Kaddish',
  derabanan: 'Scholar\'s Kaddish',
};

const TYPE_COLORS: Record<string, string> = {
  half: 'bg-blue-50 text-blue-700 border-blue-100',
  full: 'bg-green-50 text-green-700 border-green-100',
  mourners: 'bg-[#5C4033]/8 text-[#5C4033] border-[#5C4033]/20',
  derabanan: 'bg-purple-50 text-purple-700 border-purple-100',
};

export function KaddishServiceMap({
  service,
  onLearnKaddish,
}: {
  service: DaveningService;
  onLearnKaddish: () => void;
}) {
  // Build a timeline of segments, with kaddish items expanded
  const timeline: {
    type: 'segment' | 'kaddish';
    title: string;
    titleHebrew?: string;
    itemCount?: number;
    kaddishType?: string;
    when?: string;
    prayerId?: string;
    isMourners?: boolean;
  }[] = [];

  for (const segment of service.segments) {
    const nonKaddishItems = segment.items.filter((item) => item.type !== 'kaddish');
    const kaddishItems = segment.items.filter((item) => item.type === 'kaddish');

    // Add segment header
    timeline.push({
      type: 'segment',
      title: segment.title,
      titleHebrew: segment.titleHebrew,
      itemCount: nonKaddishItems.length,
    });

    // Add each kaddish item in order of appearance
    for (const item of kaddishItems) {
      const kaddishType = item.prayerId?.replace('kaddish-', '') || 'half';
      timeline.push({
        type: 'kaddish',
        title: TYPE_LABELS[kaddishType] || item.label,
        kaddishType,
        when: item.amud?.instruction || item.amud?.notes || '',
        prayerId: item.prayerId,
        isMourners: kaddishType === 'mourners',
      });
    }
  }

  return (
    <div className="space-y-1">
      {/* Service header */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <h3 className="text-lg font-bold text-foreground">{service.name}</h3>
          <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-gray-400">
            {service.nameHebrew}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          About {service.estimatedMinutes} minutes
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-4 border-l-2 border-gray-100 space-y-0">
        {timeline.map((item, i) => {
          if (item.type === 'segment') {
            return (
              <motion.div
                key={`seg-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="py-2.5 relative"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[calc(1rem+5px)] w-2 h-2 rounded-full bg-gray-200 top-3.5" />
                <div className="flex items-baseline gap-2">
                  <p className="text-xs font-medium text-gray-400">
                    {item.title}
                  </p>
                  {item.titleHebrew && (
                    <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-[10px] text-gray-300">
                      {item.titleHebrew}
                    </span>
                  )}
                  {item.itemCount !== undefined && item.itemCount > 0 && (
                    <span className="text-[10px] text-gray-300">
                      {item.itemCount} {item.itemCount === 1 ? 'prayer' : 'prayers'}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          }

          // Kaddish item
          const isMourners = item.isMourners;
          return (
            <motion.div
              key={`kaddish-${i}`}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`py-3 px-3 my-1 rounded-xl relative ${
                isMourners
                  ? 'bg-[#5C4033]/5 border border-[#5C4033]/15'
                  : 'bg-gray-50/80'
              }`}
            >
              {/* Timeline dot — larger for kaddish */}
              <div className={`absolute -left-[calc(1rem+6px)] w-3 h-3 rounded-full top-4 ${
                isMourners ? 'bg-[#5C4033]' : 'bg-gray-300'
              }`} />

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {isMourners && (
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#5C4033] mb-1">
                      Your Kaddish
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      TYPE_COLORS[item.kaddishType || 'half']
                    }`}>
                      {item.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isMourners
                      ? 'You stand and say this. The congregation responds.'
                      : 'The prayer leader says this. You respond "Amen."'}
                  </p>
                </div>
              </div>

              {isMourners && (
                <button
                  onClick={onLearnKaddish}
                  className="mt-2 text-xs font-semibold text-[#5C4033] hover:text-[#4a3529] transition-colors"
                >
                  Learn this Kaddish
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
