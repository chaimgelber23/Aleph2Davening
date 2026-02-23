'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { KADDISH_TYPES, KADDISH_IN_SERVICES, YAHRZEIT_PRACTICES } from '@/lib/content/yahrzeit';
import type { KaddishType } from '@/types';

type Section = 'types' | 'services' | 'observance';

export default function YahrzeitPage() {
  const [activeSection, setActiveSection] = useState<Section>('types');
  const [expandedKaddish, setExpandedKaddish] = useState<KaddishType | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#5C4033] text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white/60 text-sm hover:text-white">
              Home
            </Link>
            <Link href="/settings" className="text-white/60 text-sm hover:text-white">
              Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-2">Yahrzeit</h1>
          <p className="text-white/60 text-sm mt-1">
            Kaddish, when to say it, and yahrzeit observance
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-4 pb-28">
        {/* Section tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: 'types' as Section, label: 'Kaddish Types' },
            { id: 'services' as Section, label: 'In Services' },
            { id: 'observance' as Section, label: 'Observance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                activeSection === tab.id
                  ? 'bg-white text-[#5C4033] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === KADDISH TYPES === */}
        {activeSection === 'types' && (
          <div className="space-y-3">
            {KADDISH_TYPES.map((kaddish, i) => {
              const isExpanded = expandedKaddish === kaddish.type;
              return (
                <motion.div
                  key={kaddish.type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => setExpandedKaddish(isExpanded ? null : kaddish.type)}
                    className="w-full rounded-2xl bg-white border border-gray-100 p-5 text-left hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          {kaddish.nameEnglish}
                        </h3>
                        <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-lg text-gray-400 mt-0.5">
                          {kaddish.nameHebrew}
                        </p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {kaddish.description}
                        </p>

                        {kaddish.key_line && (
                          <div className="bg-[#5C4033]/5 rounded-xl p-3">
                            <p className="text-[10px] uppercase tracking-wider text-[#5C4033] font-semibold mb-1">
                              Key line
                            </p>
                            <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-xl text-[#5C4033]">
                              {kaddish.key_line}
                            </p>
                            {kaddish.key_line_transliteration && (
                              <p className="text-sm text-[#5C4033]/60 italic mt-1">
                                {kaddish.key_line_transliteration}
                              </p>
                            )}
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">Who says it</p>
                          <p className="text-sm text-gray-600">{kaddish.whoSays}</p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-1">When it is said</p>
                          <ul className="space-y-1">
                            {kaddish.whenSaid.map((when, j) => (
                              <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-gray-300 mt-1 shrink-0">-</span>
                                <span>{when}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* === KADDISH IN SERVICES === */}
        {activeSection === 'services' && (
          <div className="space-y-6">
            <p className="text-xs text-gray-400 px-1">
              Where each type of kaddish appears in a typical davening service
            </p>
            {KADDISH_IN_SERVICES.map((service, i) => (
              <motion.div
                key={service.service}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
              >
                <div className="bg-[#5C4033]/5 px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {service.service}
                    </h3>
                    <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-sm text-gray-400">
                      {service.serviceHebrew}
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {service.occurrences.map((occ, j) => {
                    const typeLabel =
                      occ.type === 'half' ? 'Half' :
                      occ.type === 'full' ? 'Full' :
                      occ.type === 'mourners' ? 'Mourner\'s' :
                      'D\'Rabbanan';
                    const typeColor =
                      occ.type === 'half' ? 'bg-blue-50 text-blue-700' :
                      occ.type === 'full' ? 'bg-green-50 text-green-700' :
                      occ.type === 'mourners' ? 'bg-amber-50 text-amber-700' :
                      'bg-purple-50 text-purple-700';

                    return (
                      <div key={j} className="px-5 py-3 flex items-start gap-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${typeColor}`}>
                          {typeLabel}
                        </span>
                        <div>
                          <p className="text-sm text-gray-600">{occ.when}</p>
                          {occ.notes && (
                            <p className="text-xs text-gray-400 mt-0.5">{occ.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* === YAHRZEIT OBSERVANCE === */}
        {activeSection === 'observance' && (
          <div className="space-y-4">
            <p className="text-xs text-gray-400 px-1">
              What to do on a yahrzeit (anniversary of a loved one's passing)
            </p>

            {/* Required practices */}
            <div>
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 px-1">
                Essential
              </h2>
              <div className="space-y-2">
                {YAHRZEIT_PRACTICES.filter((p) => p.required).map((practice, i) => (
                  <motion.div
                    key={practice.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <h3 className="text-sm font-semibold text-foreground">{practice.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{practice.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Customs */}
            <div>
              <h2 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3 px-1">
                Customs
              </h2>
              <div className="space-y-2">
                {YAHRZEIT_PRACTICES.filter((p) => !p.required).map((practice, i) => (
                  <motion.div
                    key={practice.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (i + 2) * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 p-5"
                  >
                    <h3 className="text-sm font-semibold text-foreground">{practice.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{practice.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
