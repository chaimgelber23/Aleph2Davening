'use client';

import { useState } from 'react';
import TodaysServicePath from './TodaysServicePath';
import ServiceScopeOverview from './ServiceScopeOverview';
import ServiceRehearsalScript from './ServiceRehearsalScript';
import { AmudRolesGuide } from './AmudCue';

export type PreparationLevel = 'quick' | 'full' | 'rehearsal' | 'guide';

interface AmudPreparationProps {
  defaultLevel?: PreparationLevel;
  onBack?: () => void;
}

export default function AmudPreparation({ defaultLevel = 'guide', onBack }: AmudPreparationProps) {
  const [level, setLevel] = useState<PreparationLevel>(defaultLevel);

  const levels: { id: PreparationLevel; title: string; description: string; time: string }[] = [
    {
      id: 'guide',
      title: 'Learn the Roles',
      description: 'First time? Understand what prayer roles mean and how services work.',
      time: '5 min read',
    },
    {
      id: 'quick',
      title: 'Quick Path',
      description: 'High-level roadmap. See the flow and your key moments.',
      time: '10 min review',
    },
    {
      id: 'full',
      title: 'Full Scope',
      description: 'Complete picture. Every section, timing, variations, and critical moments.',
      time: '20 min review',
    },
    {
      id: 'rehearsal',
      title: 'Complete Rehearsal',
      description: 'Word-for-word script. Every line you\'ll say, every pause, every response.',
      time: '30-60 min practice',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      {/* Header + Level Selector */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto p-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-gray-600 text-sm mb-2 transition-colors"
            >
              ← Back
            </button>
          )}
          <h1 className="text-xl font-bold text-[#1A1A2E] mb-3">
            Prepare to Lead Davening
          </h1>
          <div className="grid grid-cols-2 gap-2">
            {levels.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  level === l.id
                    ? 'border-[#1B4965] bg-[#E8F4F8] shadow-md'
                    : 'border-gray-200 bg-white hover:border-[#5FA8D3] hover:shadow-sm'
                }`}
              >
                <div className="font-semibold text-sm text-[#1A1A2E] mb-0.5">{l.title}</div>
                <div className="text-[11px] text-gray-500 leading-snug">{l.description}</div>
                <div className="text-[11px] text-[#1B4965] font-medium mt-1">{l.time}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto py-6 px-4">
        {level === 'guide' && <AmudRolesGuide />}
        {level === 'quick' && <TodaysServicePath />}
        {level === 'full' && <ServiceScopeOverview />}
        {level === 'rehearsal' && <ServiceRehearsalScript />}
      </div>

      {/* Progress Recommendation */}
      {level !== 'rehearsal' && (
        <div className="max-w-md mx-auto px-4 pb-6">
          <div className="bg-gradient-to-r from-[#5FA8D3] to-[#1B4965] rounded-2xl p-5 text-white">
            <h3 className="text-lg font-bold mb-2">
              {level === 'guide' && 'Next Step: Review the Quick Path'}
              {level === 'quick' && 'Ready for More Detail?'}
              {level === 'full' && 'Ready to Practice?'}
            </h3>
            <p className="text-sm mb-3 text-white/80">
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
              className="bg-white text-[#1B4965] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors"
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
        <div className="max-w-md mx-auto px-4 pb-6">
          <div className="bg-[#4A7C59] rounded-2xl p-5 text-white text-center">
            <h3 className="text-xl font-bold mb-2">
              You Are Fully Prepared!
            </h3>
            <p className="text-sm mb-3">
              You&apos;ve reviewed the roles, the path, the scope, and the complete script.
              You know every word, every pause, every moment.
              The congregation is blessed to have you leading them.
            </p>
            <p className="text-xs opacity-90">
              Trust your preparation. Lead with confidence. You&apos;ve got this.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
