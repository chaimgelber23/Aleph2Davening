'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { AmudBadge } from './AmudBadge';
import type { DaveningService, ServiceSegment, ServiceItem } from '@/types';

type ViewMode = 'priority' | 'all';

const TYPE_LABELS: Record<string, string> = {
  kaddish: 'Kaddish',
  instruction: 'Note',
  responsive: 'Call & Response',
  torah_reading: 'Torah Reading',
};

/** Priority mode: only show items where the congregation actively participates */
function filterItemsForPriority(items: ServiceItem[]): ServiceItem[] {
  return items.filter((item) => item.amud.role === 'both' || item.amud.role === 'congregation');
}

export function ServiceRoadmap({
  service,
  onSelectItem,
  onBack,
}: {
  service: DaveningService;
  onSelectItem: (item: ServiceItem, segmentIndex: number, itemIndex: number) => void;
  onBack: () => void;
}) {
  const [expandedSegment, setExpandedSegment] = useState<string | null>(
    service.segments[0]?.id || null
  );
  const [viewMode, setViewMode] = useState<ViewMode>('priority');
  const servicePosition = useUserStore((s) => s.servicePosition[service.id]);
  const displaySettings = useUserStore((s) => s.displaySettings);

  // Calculate overall progress
  const totalItems = service.segments.reduce((sum, seg) => sum + seg.items.length, 0);
  let completedItems = 0;
  if (servicePosition) {
    for (let i = 0; i < servicePosition.segmentIndex; i++) {
      completedItems += service.segments[i]?.items.length || 0;
    }
    completedItems += servicePosition.itemIndex;
  }
  const progressPercent = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const priorityItemCount = service.segments.reduce(
    (sum, seg) => sum + filterItemsForPriority(seg.items).length,
    0
  );

  const isCurrentItem = (segIdx: number, itemIdx: number) => {
    if (!servicePosition) return false;
    return servicePosition.segmentIndex === segIdx && servicePosition.itemIndex === itemIdx;
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Tab Bar — sticky at very top */}
      <div className="sticky top-0 z-20 bg-[#FAFAF8] border-b border-gray-100">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => setViewMode('priority')}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
              viewMode === 'priority'
                ? 'text-[#1B4965] border-[#1B4965]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
              viewMode === 'all'
                ? 'text-[#1B4965] border-[#1B4965]'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-b from-[#1B4965] to-[#163D55] text-white px-6 py-6">
        <div className="max-w-md mx-auto">
          <button onClick={onBack} className="text-white/50 text-sm hover:text-white transition-colors">
            ← Back
          </button>

          <div className="flex items-end justify-between mt-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{service.name}</h1>
              <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-white/50 text-sm mt-1">
                {service.nameHebrew}
              </p>
            </div>
            <span className="text-xs text-white/40 font-medium pb-1">~{service.estimatedMinutes} min</span>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Progress</span>
              <span className="text-[11px] text-white/60 font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #5FA8D3, #C6973F)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {/* Segment color markers */}
            <div className="flex gap-0.5 mt-2">
              {service.segments.map((segment) => {
                const segmentPercent = (segment.items.length / totalItems) * 100;
                return (
                  <div
                    key={segment.id}
                    className="h-0.5 rounded-full"
                    style={{
                      width: `${segmentPercent}%`,
                      backgroundColor: segment.color,
                      opacity: 0.5,
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Priority mode banner */}
      {viewMode === 'priority' && (
        <div className="max-w-md mx-auto px-6 pt-4">
          <div className="bg-[#1B4965]/5 border border-[#1B4965]/10 rounded-xl px-4 py-3">
            <p className="text-xs text-[#1B4965] font-semibold">Start here — {priorityItemCount} congregation moments</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Learn these first. When you're ready, switch to All to see the full service.
            </p>
          </div>
        </div>
      )}

      {/* Segment List */}
      <div className="max-w-md mx-auto px-6 py-4 space-y-3 pb-28">
        {service.segments.map((segment, segIdx) => {
          const visibleItems = viewMode === 'priority'
            ? filterItemsForPriority(segment.items)
            : segment.items;
          if (viewMode === 'priority' && visibleItems.length === 0) return null;
          return (
            <SegmentCard
              key={segment.id}
              segment={segment}
              segmentIndex={segIdx}
              isExpanded={expandedSegment === segment.id}
              onToggle={() =>
                setExpandedSegment(expandedSegment === segment.id ? null : segment.id)
              }
              onSelectItem={onSelectItem}
              isCurrentItem={isCurrentItem}
              showAmudCues={displaySettings.showAmudCues}
              visibleItems={visibleItems}
            />
          );
        })}
      </div>
    </div>
  );
}

function SegmentCard({
  segment,
  segmentIndex,
  isExpanded,
  onToggle,
  onSelectItem,
  isCurrentItem,
  showAmudCues,
  visibleItems,
}: {
  segment: ServiceSegment;
  segmentIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectItem: (item: ServiceItem, segmentIndex: number, itemIndex: number) => void;
  isCurrentItem: (segIdx: number, itemIdx: number) => boolean;
  showAmudCues: boolean;
  visibleItems: ServiceItem[];
}) {
  const totalSeconds = visibleItems.reduce((sum, item) => sum + (item.estimatedSeconds || 0), 0);
  const minutes = Math.ceil(totalSeconds / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: segmentIndex * 0.05 }}
    >
      {/* Segment Header */}
      <button onClick={onToggle} className="w-full text-left">
        <div
          className={`rounded-2xl p-4 transition-all ${
            isExpanded
              ? 'bg-white shadow-sm'
              : 'bg-white border border-gray-100 hover:shadow-sm'
          }`}
          style={isExpanded ? { borderLeft: `3px solid ${segment.color}` } : undefined}
        >
          <div className="flex items-center gap-3">
            {/* Color accent */}
            {!isExpanded && (
              <div
                className="w-1 h-8 rounded-full shrink-0"
                style={{ backgroundColor: segment.color }}
              />
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground text-[15px] tracking-tight">{segment.title}</h3>
                <div className="flex items-center gap-3 text-gray-400">
                  {minutes > 0 && (
                    <span className="text-[10px] font-medium">~{minutes} min</span>
                  )}
                  <span className="text-[10px] font-medium">{visibleItems.length}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {segment.titleHebrew && (
                <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-xs text-gray-400 mt-0.5">
                  {segment.titleHebrew}
                </p>
              )}
              {!isExpanded && segment.description && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">{segment.description}</p>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded Items */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {segment.description && (
              <p className="text-xs text-gray-500 mt-2 ml-5 mb-2 leading-relaxed">{segment.description}</p>
            )}
            <div
              className="mt-2 ml-3 border-l pl-4 space-y-0.5"
              style={{ borderColor: segment.color + '30' }}
            >
              {visibleItems.map((item, itemIdx) => {
                const isCurrent = isCurrentItem(segmentIndex, itemIdx);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectItem(item, segmentIndex, itemIdx)}
                    className={`w-full text-left rounded-xl px-3 py-2.5 transition-all ${
                      isCurrent
                        ? 'bg-primary/5 border border-primary/15'
                        : 'hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Current indicator */}
                      {isCurrent && (
                        <motion.div
                          className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${
                            item.type === 'instruction'
                              ? 'text-gray-400 italic'
                              : 'text-foreground font-medium'
                          }`}>
                            {item.label}
                          </span>
                          {item.type !== 'prayer' && item.type !== 'instruction' && (
                            <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">
                              {TYPE_LABELS[item.type] || item.type}
                            </span>
                          )}
                        </div>
                        {item.labelHebrew && (
                          <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-xs text-gray-400 mt-0.5">
                            {item.labelHebrew}
                          </p>
                        )}
                      </div>

                      {/* Amud badge */}
                      {showAmudCues && item.type !== 'instruction' && (
                        <AmudBadge role={item.amud.role} />
                      )}
                    </div>

                    {/* Instruction text */}
                    {showAmudCues && item.amud.instruction && (
                      <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                        {item.amud.instruction}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
