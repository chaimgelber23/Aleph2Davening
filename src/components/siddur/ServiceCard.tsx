'use client';

import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import type { DaveningService } from '@/types';

export function ServiceCard({
  service,
  onSelect,
  index = 0,
}: {
  service: DaveningService;
  onSelect: (service: DaveningService) => void;
  index?: number;
}) {
  const servicePosition = useUserStore((s) => s.servicePosition[service.id]);

  // Calculate how far they've gotten
  const totalItems = service.segments.reduce((sum, seg) => sum + seg.items.length, 0);
  let completedItems = 0;
  if (servicePosition) {
    for (let i = 0; i < servicePosition.segmentIndex; i++) {
      completedItems += service.segments[i]?.items.length || 0;
    }
    completedItems += servicePosition.itemIndex;
  }
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => onSelect(service)}
      className="w-full bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary/20 p-6 text-left transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Title + Hebrew */}
          <h3 className="font-bold text-foreground text-base tracking-tight">{service.name}</h3>
          <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-gray-400 mt-0.5">
            {service.nameHebrew}
          </p>

          {/* Description */}
          <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-1">
            {service.description}
          </p>

          {/* Segment color bar */}
          <div className="flex gap-0.5 mt-4">
            {service.segments.map((segment) => (
              <div
                key={segment.id}
                className="h-1 rounded-full flex-1"
                style={{ backgroundColor: segment.color + '50' }}
              />
            ))}
          </div>

          {/* Resume indicator */}
          {servicePosition && progressPercent > 0 && progressPercent < 100 && (
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-primary font-semibold">
                {progressPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Time + arrow */}
        <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
          <span className="text-[11px] text-gray-400 font-medium">
            ~{service.estimatedMinutes} min
          </span>
          <svg className="w-4 h-4 text-gray-300 mt-2 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}
