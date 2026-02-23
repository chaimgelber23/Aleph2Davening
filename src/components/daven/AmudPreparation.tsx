'use client';

import React, { useState } from 'react';
import TodaysServicePath from './TodaysServicePath';
import ServiceScopeOverview from './ServiceScopeOverview';
import ServiceRehearsalScript from './ServiceRehearsalScript';
import { AmudRolesGuide } from './AmudCue';

export type PreparationLevel = 'quick' | 'full' | 'rehearsal' | 'guide';

interface AmudPreparationProps {
  defaultLevel?: PreparationLevel;
}

export default function AmudPreparation({ defaultLevel = 'quick' }: AmudPreparationProps) {
  const [level, setLevel] = useState<PreparationLevel>(defaultLevel);

  const levels: { id: PreparationLevel; title: string; description: string; icon: string; time: string }[] = [
    {
      id: 'guide',
      title: 'Learn the Roles',
      description: 'First time? Understand what prayer roles mean and how services work.',
      icon: '',
      time: '5 min read',
    },
    {
      id: 'quick',
      title: 'Quick Path',
      description: 'High-level roadmap. See the flow and your key moments.',
      icon: '',
      time: '10 min review',
    },
    {
      id: 'full',
      title: 'Full Scope',
      description: 'Complete picture. Every section, timing, variations, and critical moments.',
      icon: '',
      time: '20 min review',
    },
    {
      id: 'rehearsal',
      title: 'Complete Rehearsal',
      description: 'Word-for-word script. Every line you\'ll say, every pause, every response.',
      icon: '',
      time: '30-60 min practice',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      {/* Level Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-[#1A1A2E] mb-4">
            Prepare to Lead Davening
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {levels.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  level === l.id
                    ? 'border-[#1B4965] bg-[#E8F4F8] shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#5FA8D3] hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-2">{l.icon}</div>
                <div className="font-bold text-[#1A1A2E] mb-1">{l.title}</div>
                <div className="text-xs text-gray-600 mb-2">{l.description}</div>
                <div className="text-xs text-[#1B4965] font-medium">{l.time}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto py-6">
        {level === 'guide' && <AmudRolesGuide />}
        {level === 'quick' && <TodaysServicePath />}
        {level === 'full' && <ServiceScopeOverview />}
        {level === 'rehearsal' && <ServiceRehearsalScript />}
      </div>

      {/* Progress Recommendation */}
      {level !== 'rehearsal' && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="bg-gradient-to-r from-[#5FA8D3] to-[#1B4965] rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">
              {level === 'guide' && 'Next Step: Review the Quick Path'}
              {level === 'quick' && 'Ready for More Detail?'}
              {level === 'full' && 'Ready to Practice?'}
            </h3>
            <p className="mb-4">
              {level === 'guide' &&
                'Now that you understand the roles, see how a complete service flows from start to finish.'}
              {level === 'quick' &&
                'You have the roadmap. Now see the complete scope with timing, sections, and critical moments.'}
              {level === 'full' &&
                'You know what\'s coming. Now practice with the complete word-for-word rehearsal script.'}
            </p>
            <button
              onClick={() => {
                if (level === 'guide') setLevel('quick');
                else if (level === 'quick') setLevel('full');
                else if (level === 'full') setLevel('rehearsal');
              }}
              className="bg-white text-[#1B4965] px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              {level === 'guide' && 'View Quick Path →'}
              {level === 'quick' && 'View Full Scope →'}
              {level === 'full' && 'View Rehearsal Script →'}
            </button>
          </div>
        </div>
      )}

      {/* Encouragement at bottom of rehearsal */}
      {level === 'rehearsal' && (
        <div className="max-w-6xl mx-auto px-6 pb-6">
          <div className="bg-[#4A7C59] rounded-2xl p-6 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">
              You Are Fully Prepared! 
            </h3>
            <p className="text-lg mb-4">
              You&apos;ve reviewed the roles, the path, the scope, and the complete script.
              You know every word, every pause, every moment.
              The congregation is blessed to have you leading them.
            </p>
            <p className="text-sm opacity-90">
              Trust your preparation. Lead with confidence. You&apos;ve got this.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
