'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { getBrachotPrayers } from '@/lib/content/prayers';
import { GUIDES } from '@/lib/content/guides';
import { GuideCategoryTabs } from '@/components/guide/GuideCategoryTabs';
import { GuideCard } from '@/components/guide/GuideCard';
import { GuideReader } from '@/components/guide/GuideReader';
import { useUserStore } from '@/stores/userStore';
import type { Prayer, Guide, GuideCategory } from '@/types';

type Section = 'brachot' | 'guides';

export default function LivingPage() {
  const [activeSection, setActiveSection] = useState<Section>('brachot');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [guideCategory, setGuideCategory] = useState<GuideCategory | 'all'>('all');

  const guideProgress = useUserStore((s) => s.guideProgress);

  const brachotPrayers = getBrachotPrayers();

  // Filter guides by category
  const filteredGuides = useMemo(() => {
    if (guideCategory === 'all') return GUIDES;
    return GUIDES.filter((g) => g.category === guideCategory);
  }, [guideCategory]);

  const handleSelectGuide = useCallback((guide: Guide) => {
    setSelectedGuide(guide);
  }, []);

  const handleNavigateGuide = useCallback((guideId: string) => {
    const guide = GUIDES.find((g) => g.id === guideId);
    if (guide) {
      setSelectedGuide(guide);
    }
  }, []);

  const handleBackFromGuide = useCallback(() => {
    setSelectedGuide(null);
  }, []);

  // Guide Reader view
  if (selectedGuide) {
    return (
      <GuideReader
        guide={selectedGuide}
        onBack={handleBackFromGuide}
        onNavigate={handleNavigateGuide}
      />
    );
  }

  // Main list view
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#6B4C9A] text-white px-6 py-8 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white/60 text-sm hover:text-white">
              Home
            </Link>
            <Link href="/settings" className="text-white/60 text-sm hover:text-white">
              Settings
            </Link>
          </div>
          <h1 className="text-2xl font-bold mt-2">Jewish Living</h1>
          <p className="text-white/60 text-sm mt-1">
            Brachot and practical Jewish living guides
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-4 pb-28">
        {/* Section tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { id: 'brachot' as Section, label: 'Brachot' },
            { id: 'guides' as Section, label: 'Guides' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === tab.id
                  ? 'bg-white text-[#6B4C9A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* === BRACHOT === */}
        {activeSection === 'brachot' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-4 px-1">
              Blessings over food and drink — know which bracha to say and when
            </p>
            {brachotPrayers.map((prayer, i) => (
              <motion.div
                key={prayer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <BrachaCard prayer={prayer} />
              </motion.div>
            ))}
          </div>
        )}

        {/* === GUIDES === */}
        {activeSection === 'guides' && (
          <div className="space-y-4">
            {/* Category filter */}
            <GuideCategoryTabs
              selected={guideCategory}
              onSelect={setGuideCategory}
            />

            {/* Guide cards */}
            <div className="space-y-2">
              {filteredGuides.map((guide, i) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  progress={guideProgress[guide.id]}
                  onClick={() => handleSelectGuide(guide)}
                  index={i}
                />
              ))}
              {filteredGuides.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">
                  No guides in this category yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

// ==========================
// Bracha Card
// ==========================

function BrachaCard({ prayer }: { prayer: Prayer }) {
  const isPrayerCoached = useUserStore((s) =>
    s.isPrayerFullyCoached(prayer.id, prayer.sections.map((sec) => sec.id))
  );

  return (
    <Link
      href="/daven"
      className="block w-full rounded-2xl border bg-white border-gray-100 hover:shadow-md hover:border-[#6B4C9A]/20 cursor-pointer p-4 text-left transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isPrayerCoached
              ? 'bg-success/10 text-success'
              : 'bg-[#6B4C9A]/10 text-[#6B4C9A]'
          }`}>
            {isPrayerCoached ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              prayer.sortOrder
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{prayer.nameEnglish}</h3>
            <p dir="rtl" className="font-[var(--font-hebrew-serif)] text-base text-gray-500">
              {prayer.nameHebrew}
            </p>
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
