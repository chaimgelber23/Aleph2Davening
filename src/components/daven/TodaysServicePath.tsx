'use client';

import React from 'react';
import { getTodaysServiceVariations, getAmudPreparationNotes } from '@/lib/calendar/service-calendar';

interface ServiceStep {
  section: string;
  yourRole: 'lead' | 'silent' | 'together' | 'respond';
  action: string;
  tip?: string;
  conditional?: boolean;
}

export default function TodaysServicePath() {
  const today = new Date();
  const variations = getTodaysServiceVariations(today);
  const prepNotes = getAmudPreparationNotes(today);

  // Build the service path based on today's variations
  const servicePath: ServiceStep[] = [
    {
      section: 'Opening Blessings',
      yourRole: 'silent',
      action: 'The congregation says Modeh Ani, morning brachot, and Torah blessings quietly',
      tip: 'You prepare yourself at your seat during this time',
    },
    {
      section: 'Barechu',
      yourRole: 'lead',
      action: 'Call out: "ברכו את ה\' המבורך" (Barechu et Adonai ha-m\'vorach)',
      tip: 'This is your first public moment. Say it clearly and wait for the congregation to respond: "ברוך ה\' המבורך לעולם ועד"',
    },
    {
      section: 'Shema & Blessings',
      yourRole: 'together',
      action: 'Lead the blessings before and after Shema, congregation says Shema aloud with you',
      tip: 'Cover your eyes during the first verse of Shema',
    },
    {
      section: 'Silent Amidah',
      yourRole: 'silent',
      action: 'Everyone says the Amidah silently (Shemoneh Esrei)',
      tip: 'Take three steps forward, then say your own Amidah quietly. Wait for the congregation to finish before continuing.',
    },
  ];

  // Add Ya'aleh V'yavo note if applicable
  if (variations.hasYaalehVeyavo) {
    servicePath.push({
      section: '⚠️ IMPORTANT',
      yourRole: 'silent',
      action: 'Add Ya\'aleh V\'yavo during the Amidah (in the Modim section)',
      tip: 'This is easy to forget! Make sure to include it in both your silent Amidah and the repetition.',
      conditional: true,
    });
  }

  servicePath.push({
    section: 'Chazzan\'s Repetition',
    yourRole: 'lead',
    action: 'Repeat the Amidah aloud. Say it slowly and clearly.',
    tip: 'The congregation responds "Amen" after each blessing. Wait for them. During Kedushah, the congregation says "Kadosh, Kadosh, Kadosh" with you.',
  });

  // Add Tachnun or skip it based on today
  if (variations.hasTachnun) {
    servicePath.push({
      section: variations.hasLongTachnun ? 'Tachnun (LONG version)' : 'Tachnun',
      yourRole: 'together',
      action: variations.hasLongTachnun
        ? 'Say the extended Tachnun (Monday/Thursday version with extra verses)'
        : 'Say Tachnun with the congregation',
      tip: 'Rest your head on your arm while sitting. If there\'s a Torah in the room, face toward it.',
    });
  } else {
    servicePath.push({
      section: '✓ Skip Tachnun',
      yourRole: 'lead',
      action: 'NO Tachnun today - go straight to Ashrei',
      tip: variations.notes[0] || 'We don\'t say Tachnun on special days',
      conditional: true,
    });
  }

  servicePath.push(
    {
      section: 'Ashrei & Uva L\'Tzion',
      yourRole: 'together',
      action: 'Lead Ashrei and Uva L\'Tzion',
      tip: 'These are said together with the congregation',
    },
    {
      section: 'Kaddish',
      yourRole: 'lead',
      action: 'Say the Full Kaddish',
      tip: 'Stand and say it clearly. The congregation responds "Y\'hei sh\'mei raba" loudly - pause for them.',
    },
    {
      section: 'Aleinu',
      yourRole: 'together',
      action: 'Lead Aleinu',
      tip: 'Bow during "Va\'anachnu kor\'im"',
    },
  );

  // Add Hallel if applicable
  if (variations.hasHallel) {
    servicePath.push({
      section: `Hallel (${variations.hallelType === 'full' ? 'FULL' : 'HALF'})`,
      yourRole: 'lead',
      action: variations.hallelType === 'full' ? 'Lead the complete Hallel' : 'Lead Half Hallel (skip certain paragraphs)',
      tip: variations.hallelType === 'half' ? 'Skip "Lo lanu" and parts of "Hodu"' : 'Say the entire Hallel with all verses',
      conditional: true,
    });
  }

  // Add Mussaf if applicable
  if (variations.hasMussaf) {
    servicePath.push({
      section: 'Mussaf',
      yourRole: 'lead',
      action: 'Lead the Mussaf Amidah (additional service)',
      tip: 'After the main service, there\'s an additional Amidah for Rosh Chodesh/Yom Tov. Silent first, then repeat it aloud.',
      conditional: true,
    });
  }

  servicePath.push({
    section: 'Closing',
    yourRole: 'respond',
    action: 'A mourner (if present) says Mourner\'s Kaddish',
    tip: 'You respond with the congregation. Your job as shaliach tzibbur is complete!',
  });

  // Role icons
  const roleIcons: Record<typeof servicePath[0]['yourRole'], string> = {
    lead: '🎙️',
    silent: '🤫',
    together: '👥',
    respond: '🙋',
  };

  const roleLabels: Record<typeof servicePath[0]['yourRole'], string> = {
    lead: 'YOU LEAD',
    silent: 'SILENT',
    together: 'TOGETHER',
    respond: 'YOU RESPOND',
  };

  const roleColors: Record<typeof servicePath[0]['yourRole'], string> = {
    lead: 'bg-[#1B4965] text-white',
    silent: 'bg-gray-400 text-white',
    together: 'bg-[#5FA8D3] text-white',
    respond: 'bg-[#4A7C59] text-white',
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-[#1A1A2E] mb-2">
          Today&apos;s Service Path
        </h1>
        <p className="text-gray-600 mb-4">
          Your step-by-step guide to leading davening as the Shaliach Tzibbur (Prayer Leader)
        </p>

        {/* Today's special notes */}
        <div className="bg-[#FEF3E2] border-l-4 border-[#D4A373] p-4 rounded-r-lg">
          <h3 className="font-semibold text-[#1A1A2E] mb-2">Today&apos;s Notes:</h3>
          {variations.notes.map((note, i) => (
            <p key={i} className="text-sm text-gray-700">
              {note}
            </p>
          ))}
        </div>
      </div>

      {/* Preparation Notes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-4">
          Before You Begin
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700 space-y-2">
          {prepNotes.map((note, i) => {
            if (note.startsWith('**')) {
              return (
                <p key={i} className="font-semibold text-[#1A1A2E] mt-4 mb-2">
                  {note.replace(/\*\*/g, '')}
                </p>
              );
            }
            if (note.startsWith('✓')) {
              return (
                <p key={i} className="ml-4">
                  {note}
                </p>
              );
            }
            if (note.startsWith('•')) {
              return (
                <p key={i} className="ml-6 text-sm">
                  {note}
                </p>
              );
            }
            if (note === '') {
              return <div key={i} className="h-2" />;
            }
            return (
              <p key={i} className="text-gray-600">
                {note}
              </p>
            );
          })}
        </div>
      </div>

      {/* Service Path */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-6">
          The Service Flow
        </h2>

        <div className="space-y-4">
          {servicePath.map((step, index) => (
            <div
              key={index}
              className={`border-l-4 pl-6 py-4 relative ${
                step.conditional
                  ? 'border-[#D4A373] bg-[#FEF3E2]'
                  : 'border-gray-200 bg-gray-50'
              } rounded-r-lg`}
            >
              {/* Step number */}
              <div className="absolute left-[-1.5rem] top-4 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                {index + 1}
              </div>

              {/* Role badge */}
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    roleColors[step.yourRole]
                  }`}
                >
                  <span>{roleIcons[step.yourRole]}</span>
                  <span>{roleLabels[step.yourRole]}</span>
                </span>
                <h3 className="text-lg font-bold text-[#1A1A2E]">{step.section}</h3>
              </div>

              {/* Action */}
              <p className="text-gray-800 font-medium mb-2">{step.action}</p>

              {/* Tip */}
              {step.tip && (
                <p className="text-sm text-gray-600 italic">
                  💡 {step.tip}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-[#1A1A2E] mb-4">Role Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(roleLabels).map(([role, label]) => (
            <div key={role} className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleColors[role as keyof typeof roleColors]}`}>
                {roleIcons[role as keyof typeof roleIcons]} {label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p><strong>YOU LEAD:</strong> You say this aloud, congregation listens or responds</p>
          <p><strong>SILENT:</strong> Everyone prays quietly at their own pace</p>
          <p><strong>TOGETHER:</strong> You lead, but the congregation says it with you</p>
          <p><strong>YOU RESPOND:</strong> Someone else leads, you respond with the congregation</p>
        </div>
      </div>
    </div>
  );
}
