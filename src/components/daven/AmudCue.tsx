'use client';

import React from 'react';
import type { AmudRole, PhysicalAction } from '@/types';

interface AmudCueProps {
  role: AmudRole;
  instruction?: string;
  congregationResponse?: string;
  congregationResponseTransliteration?: string;
  physicalActions?: PhysicalAction[];
  waitForCongregation?: boolean;
  notes?: string;
  showForBeginners?: boolean; // Show simplified version for beginners
}

const roleExplanations: Record<AmudRole, { label: string; color: string; icon: string; explanation: string }> = {
  shaliach_tzibbur: {
    label: 'Prayer Leader',
    color: 'bg-[#1B4965] text-white',
    icon: '🎙️',
    explanation: 'The Shaliach Tzibbur (prayer leader) says this aloud for the congregation',
  },
  congregation: {
    label: 'Congregation',
    color: 'bg-[#5FA8D3] text-white',
    icon: '👥',
    explanation: 'Everyone in the congregation says this together',
  },
  both: {
    label: 'Everyone Together',
    color: 'bg-[#8B5CF6] text-white',
    icon: '🎵',
    explanation: 'The prayer leader and congregation say this together',
  },
  silent_individual: {
    label: 'Silent (Individual)',
    color: 'bg-gray-500 text-white',
    icon: '🤫',
    explanation: 'Each person says this quietly to themselves',
  },
};

const actionLabels: Record<PhysicalAction, string> = {
  stand: 'Stand',
  sit: 'Sit',
  bow: 'Bow',
  bow_and_stand: 'Bow while standing',
  three_steps_forward: 'Take 3 steps forward',
  three_steps_back: 'Take 3 steps back',
  cover_eyes: 'Cover your eyes',
  face_west: 'Face west (toward Israel)',
  rise_on_toes: 'Rise on your toes',
};

export default function AmudCue({
  role,
  instruction,
  congregationResponse,
  congregationResponseTransliteration,
  physicalActions,
  waitForCongregation,
  notes,
  showForBeginners = true,
}: AmudCueProps) {
  const roleInfo = roleExplanations[role];

  // For beginners, show simplified version
  if (showForBeginners) {
    return (
      <div className="my-4 p-4 bg-[#F8F9FA] border-l-4 border-[#1B4965] rounded-r-lg">
        {/* Role badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${roleInfo.color}`}>
            <span>{roleInfo.icon}</span>
            <span>{roleInfo.label}</span>
          </span>
        </div>

        {/* Explanation */}
        <p className="text-sm text-gray-700 mb-2">
          {roleInfo.explanation}
          {instruction && <span className="font-medium"> — {instruction}</span>}
        </p>

        {/* Physical actions */}
        {physicalActions && physicalActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {physicalActions.map((action) => (
              <span key={action} className="inline-flex items-center gap-1 px-2 py-1 bg-[#FEF3E2] text-[#8B6914] rounded-md text-xs font-medium">
                🧘 {actionLabels[action]}
              </span>
            ))}
          </div>
        )}

        {/* Congregation response */}
        {congregationResponse && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-1">The congregation responds:</p>
            <p className="font-['Noto_Serif_Hebrew'] text-xl text-[#1A1A2E] text-right" dir="rtl">
              {congregationResponse}
            </p>
            {congregationResponseTransliteration && (
              <p className="text-sm text-gray-600 italic mt-1">
                {congregationResponseTransliteration}
              </p>
            )}
          </div>
        )}

        {/* Wait cue */}
        {waitForCongregation && (
          <p className="text-xs text-[#D4A373] font-medium mt-2">
            ⏸️ Pause and wait for the congregation to finish responding
          </p>
        )}

        {/* Additional notes */}
        {notes && (
          <p className="text-xs text-gray-600 italic mt-2">
            💡 {notes}
          </p>
        )}
      </div>
    );
  }

  // For advanced users, show compact version
  return (
    <div className="my-2 p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs">
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${roleInfo.color}`}>
          {roleInfo.icon} {roleInfo.label}
        </span>
        {instruction && <span className="text-gray-700">{instruction}</span>}
        {physicalActions && physicalActions.length > 0 && (
          <span className="text-gray-500">
            • {physicalActions.map((a) => actionLabels[a]).join(', ')}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Beginner's Guide to Amud Roles - Standalone Component
 */
export function AmudRolesGuide() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">
        Understanding Prayer Roles in Synagogue
      </h2>
      <p className="text-gray-600 mb-6">
        In a traditional Jewish prayer service, different parts are said by different people. Here&apos;s what each role means:
      </p>

      <div className="space-y-6">
        {/* Shaliach Tzibbur */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${roleExplanations.shaliach_tzibbur.color}`}>
              {roleExplanations.shaliach_tzibbur.icon} {roleExplanations.shaliach_tzibbur.label}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            <strong>שליח ציבור (Shaliach Tzibbur)</strong> means &quot;messenger of the congregation.&quot; This person stands at the front and leads the prayers aloud.
            When you see this label, it means the prayer leader says this part out loud while everyone else listens.
            Often called the &quot;Chazzan&quot; or &quot;Ba&apos;al Tefillah.&quot;
          </p>
        </div>

        {/* Congregation */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${roleExplanations.congregation.color}`}>
              {roleExplanations.congregation.icon} {roleExplanations.congregation.label}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            When you see this, <strong>everyone</strong> in the synagogue says this together.
            Common examples: responding &quot;Amen&quot; after a blessing, saying the Shema together, or answering &quot;Y&apos;hei sh&apos;mei raba&quot; during Kaddish.
          </p>
        </div>

        {/* Both */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${roleExplanations.both.color}`}>
              {roleExplanations.both.icon} {roleExplanations.both.label}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            The prayer leader starts or leads, but <strong>everyone says it together</strong> at the same time.
            The leader sets the pace, and the congregation follows along saying the same words.
          </p>
        </div>

        {/* Silent Individual */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold ${roleExplanations.silent_individual.color}`}>
              {roleExplanations.silent_individual.icon} {roleExplanations.silent_individual.label}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            Each person says this <strong>quietly to themselves</strong>. The most important example is the Amidah (Shemoneh Esrei),
            where everyone stands and prays silently at their own pace. You may see people&apos;s lips moving, but no one says it out loud.
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[#E8F4F8] rounded-lg border-l-4 border-[#5FA8D3]">
        <p className="text-sm text-gray-700">
          <strong>Why does this matter?</strong> Understanding these roles helps you follow along in synagogue and know when to respond,
          when to stay silent, and when to say prayers together. It also prepares you to lead davening when the time comes!
        </p>
      </div>
    </div>
  );
}
