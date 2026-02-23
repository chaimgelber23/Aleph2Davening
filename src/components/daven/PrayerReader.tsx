'use client';

import React, { useState } from 'react';
import type { Prayer, DisplaySettings } from '@/types';
import AmudCue from './AmudCue';

interface PrayerReaderProps {
  prayer: Prayer;
  displaySettings?: DisplaySettings;
  showAmudCues?: boolean;
}

export default function PrayerReader({
  prayer,
  displaySettings = {
    showTransliteration: true,
    showTranslation: true,
    showInstructions: true,
    showAmudCues: true,
  },
  showAmudCues = true,
}: PrayerReaderProps) {
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  const fontSizes = {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-4xl',
  };

  const hebrewFontSize = fontSizes[fontSize];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-['Noto_Serif_Hebrew'] text-3xl text-[#1A1A2E] mb-2" dir="rtl">
              {prayer.nameHebrew}
            </h1>
            <h2 className="text-2xl font-bold text-gray-700">
              {prayer.nameEnglish}
            </h2>
          </div>

          {/* Font size controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFontSize('small')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                fontSize === 'small'
                  ? 'bg-[#1B4965] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('medium')}
              className={`px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                fontSize === 'medium'
                  ? 'bg-[#1B4965] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-3 py-2 rounded-lg text-lg font-medium transition-colors ${
                fontSize === 'large'
                  ? 'bg-[#1B4965] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              A
            </button>
          </div>
        </div>

        {/* When said */}
        {prayer.whenSaid && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-[#E8F4F8] text-[#1B4965] rounded-full text-sm font-medium">
              When: {prayer.whenSaid}
            </span>
          </div>
        )}

        {/* Why said */}
        {prayer.whySaid && displaySettings.showInstructions && (
          <div className="mb-4">
            <p className="text-gray-700 leading-relaxed">
              <strong className="text-[#1A1A2E]">Why we say this:</strong> {prayer.whySaid}
            </p>
          </div>
        )}

        {/* Inspiration */}
        {prayer.inspirationText && displaySettings.showInstructions && (
          <div className="p-4 bg-[#FEF3E2] border-l-4 border-[#C6973F] rounded-r-lg">
            <p className="text-gray-800 leading-relaxed italic">
              {prayer.inspirationText}
            </p>
          </div>
        )}
      </div>

      {/* Prayer Sections */}
      <div className="space-y-6">
        {prayer.sections?.map((section) => (
          <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* Amud Cue - Show BEFORE the text */}
            {showAmudCues && displaySettings.showAmudCues && section.amud && (
              <AmudCue
                role={section.amud.role}
                instruction={section.amud.instruction}
                congregationResponse={section.amud.congregationResponse}
                congregationResponseTransliteration={section.amud.congregationResponseTransliteration}
                physicalActions={section.amud.physicalActions}
                waitForCongregation={section.amud.waitForCongregation}
                notes={section.amud.notes}
                showForBeginners={true}
              />
            )}

            {/* Hebrew Text */}
            <div className="mb-4">
              <p
                className={`font-['Noto_Serif_Hebrew'] ${hebrewFontSize} text-[#1A1A2E] leading-[2] text-right`}
                dir="rtl"
              >
                {section.hebrewText}
              </p>
            </div>

            {/* Transliteration */}
            {displaySettings.showTransliteration && section.transliteration && (
              <div className="mb-3">
                <p className="text-lg text-gray-600 italic leading-relaxed">
                  {section.transliteration}
                </p>
              </div>
            )}

            {/* Translation */}
            {displaySettings.showTranslation && section.translation && (
              <div className="mb-3">
                <p className="text-base text-gray-700 leading-relaxed">
                  {section.translation}
                </p>
              </div>
            )}

            {/* Section Notes */}
            {displaySettings.showInstructions && section.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> {section.notes}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Conclusion / Next Steps */}
      {prayer.whatComesNext && displaySettings.showInstructions && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-[#1A1A2E] mb-2">What Comes Next</h3>
          <p className="text-gray-700 leading-relaxed">
            {prayer.whatComesNext}
          </p>
        </div>
      )}
    </div>
  );
}
