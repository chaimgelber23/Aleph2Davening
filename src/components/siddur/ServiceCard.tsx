'use client';

import { motion } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import type { DaveningService } from '@/types';

function TimeIcon({ timeOfDay }: { timeOfDay: string }) {
  const className = 'w-6 h-6 text-primary';
  switch (timeOfDay) {
    case 'shacharit':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      );
    case 'mincha':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          <path d="M2 20l4-2M18 6l4-2" opacity="0.4" />
        </svg>
      );
    case 'maariv':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      );
    case 'musaf':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    case 'kabbalat_shabbat':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2c.5 2.5 2 4 4.5 4.5C14 9 12.5 10.5 12 13c-.5-2.5-2-4-4.5-4.5C10 6 11.5 4.5 12 2z" />
          <path d="M8 14c.3 1.5 1.2 2.4 2.7 2.7-1.5.3-2.4 1.2-2.7 2.7-.3-1.5-1.2-2.4-2.7-2.7C6.8 16.4 7.7 15.5 8 14z" opacity="0.6" />
        </svg>
      );
    default:
      return null;
  }
}

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
      className="w-full bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-primary-light/30 p-5 text-left transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
          <TimeIcon timeOfDay={service.timeOfDay} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-foreground text-[15px]">{service.name}</h3>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              ~{service.estimatedMinutes} min
            </span>
          </div>

          {/* Hebrew name */}
          <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-gray-400 mt-0.5">
            {service.nameHebrew}
          </p>

          {/* Description */}
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
            {service.description}
          </p>

          {/* Segment preview dots */}
          <div className="flex gap-1 mt-3">
            {service.segments.map((segment) => (
              <div
                key={segment.id}
                className="h-1.5 rounded-full flex-1"
                style={{ backgroundColor: segment.color + '40' }}
              />
            ))}
          </div>

          {/* Resume indicator */}
          {servicePosition && progressPercent > 0 && progressPercent < 100 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-primary font-medium">
                {progressPercent}%
              </span>
            </div>
          )}
        </div>

        {/* Arrow */}
        <svg className="w-5 h-5 text-gray-300 mt-1 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </motion.button>
  );
}
