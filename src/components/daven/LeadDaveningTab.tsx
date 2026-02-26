'use client';

import { motion } from 'framer-motion';
import type { DaveningService } from '@/types';

interface LeadDaveningTabProps {
  services: DaveningService[];
  onSelectService: (service: DaveningService) => void;
}

export function LeadDaveningTab({ services, onSelectService }: LeadDaveningTabProps) {
  const weekday = services.filter((s) => s.type === 'weekday');
  const shabbat = services.filter((s) => s.type === 'shabbat');

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1B4965]/[0.06] to-[#5FA8D3]/[0.08] rounded-2xl border border-[#1B4965]/10 p-5"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 bg-[#1B4965]/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            {/* Lectern/amud icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B4965" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18" />
              <path d="M5 7h14l-2 8H7L5 7z" />
              <path d="M8 21h8" />
            </svg>
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-foreground">
              Learn to Lead Davening
            </h2>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              Step-by-step guidance to confidently lead a minyan as Shaliach Tzibbur — who says what, when to pause, congregation responses, and more.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Weekday Services */}
      {weekday.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
            Weekday
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Daily services — morning, afternoon, and evening
          </p>
          <div className="space-y-2.5">
            {weekday.map((service, i) => (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.03 }}
                onClick={() => onSelectService(service)}
                className="w-full text-left block rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-[#1B4965]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {service.name}
                        </h3>
                        <span
                          dir="rtl"
                          className="font-[var(--font-hebrew-serif)] text-xs text-gray-300"
                        >
                          {service.nameHebrew}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ~{service.estimatedMinutes} min · {service.segments.length} sections
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Shabbat Services */}
      {shabbat.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">
            Shabbat
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Shabbat services — Friday evening and Saturday
          </p>
          <div className="space-y-2.5">
            {shabbat.map((service, i) => (
              <motion.button
                key={service.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                onClick={() => onSelectService(service)}
                className="w-full text-left block rounded-2xl bg-white border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full bg-[#2D6A4F]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          {service.name}
                        </h3>
                        <span
                          dir="rtl"
                          className="font-[var(--font-hebrew-serif)] text-xs text-gray-300"
                        >
                          {service.nameHebrew}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        ~{service.estimatedMinutes} min · {service.segments.length} sections
                      </p>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* First time? */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-gray-50 rounded-xl px-4 py-3"
      >
        <p className="text-xs text-gray-500 leading-relaxed">
          <span className="font-semibold">First time leading?</span>{' '}
          Pick any service above — you&apos;ll see a step-by-step guide that starts with the basics and builds to a full rehearsal.
        </p>
      </motion.div>
    </div>
  );
}
