'use client';

import React from 'react';
import { getTodaysServiceVariations } from '@/lib/calendar/service-calendar';

interface ServiceSection {
  section: string;
  subsections: string[];
  estimatedMinutes: number;
  yourRole: 'lead' | 'silent' | 'together' | 'respond';
  criticalMoments: string[];
  commonMistakes?: string[];
  conditional?: boolean;
  conditionalNote?: string;
}

export default function ServiceScopeOverview() {
  const variations = getTodaysServiceVariations();

  // Build complete service structure
  const serviceStructure: ServiceSection[] = [
    {
      section: '1. Opening Blessings (Birchot HaShachar)',
      subsections: [
        'Modeh Ani',
        'Netilat Yadayim blessing',
        'Asher Yatzar',
        'Elohai Neshama',
        'Morning blessings (15 brachot)',
        'Torah blessings',
      ],
      estimatedMinutes: 5,
      yourRole: 'silent',
      criticalMoments: ['Congregation says these quietly at their seats'],
      commonMistakes: [],
    },
    {
      section: '2. Pesukei D\'Zimra (Verses of Praise)',
      subsections: [
        'Hodu',
        'Mizmor L\'Todah',
        'Yehi Chevod',
        'Ashrei',
        'Psalm 145-150',
        'Vayevarech David',
        'Az Yashir (Song at the Sea)',
        'Yishtabach',
      ],
      estimatedMinutes: 10,
      yourRole: 'together',
      criticalMoments: [
        'Start Hodu to signal the service is beginning',
        'Ashrei - everyone says together',
        'Nishmat - slower, more reverently',
      ],
      commonMistakes: ['Going too fast through Ashrei', 'Skipping verses by accident'],
    },
    {
      section: '3. Barechu (Call to Prayer)',
      subsections: ['Barechu et Hashem ha-m\'vorach', 'Congregation responds'],
      estimatedMinutes: 1,
      yourRole: 'lead',
      criticalMoments: [
        ' YOUR FIRST PUBLIC MOMENT - call out clearly',
        'Bow when you say "Barechu"',
        'Wait for congregation: "Baruch Hashem ha-m\'vorach l\'olam va-ed"',
        'You repeat their response',
      ],
      commonMistakes: [
        'Forgetting to bow',
        'Not waiting for congregation to finish',
        'Saying it too quietly',
      ],
    },
    {
      section: '4. Shema and Its Blessings',
      subsections: [
        'Yotzer Or (first blessing)',
        'Ahavah Rabbah (second blessing)',
        'SHEMA (cover eyes for first verse)',
        'V\'ahavta',
        'Vayomer (Tzitzit paragraph)',
        'Emet V\'Yatziv (after Shema)',
        'Mi Chamocha',
        'Hashem Yimloch',
      ],
      estimatedMinutes: 8,
      yourRole: 'together',
      criticalMoments: [
        'Shema first verse: "Shema Yisrael..." - COVER YOUR EYES, say slowly',
        'Everyone says Shema together at same pace',
        'Do NOT pause between "Emet V\'Yatziv" and what came before',
      ],
      commonMistakes: [
        'Pausing between Shema and "Emet V\'Yatziv" (halachically problematic)',
        'Rushing through the first verse',
        'Not covering eyes',
      ],
    },
    {
      section: '5. Silent Amidah (Shemoneh Esrei)',
      subsections: ['Take 3 steps forward', 'Say Amidah silently', 'Take 3 steps back when done'],
      estimatedMinutes: 8,
      yourRole: 'silent',
      criticalMoments: [
        'Take 3 steps forward before starting',
        'Bow at specific points: Avot (beginning), Modim, end of Avot, end of Modim',
        'Stand with feet together',
        'Do NOT interrupt - say entire Amidah straight through',
      ],
      commonMistakes: ['Forgetting to take steps', 'Not bowing at correct points'],
    },
  ];

  // Add conditional Ya'aleh V'yavo reminder
  if (variations.hasYaalehVeyavo) {
    serviceStructure.push({
      section: ' ADD YA\'ALEH V\'YAVO IN AMIDAH',
      subsections: [
        'Insert Ya\'aleh V\'yavo in the Modim section',
        'Say it in both silent Amidah AND repetition',
      ],
      estimatedMinutes: 1,
      yourRole: 'lead',
      criticalMoments: [
        ' EASY TO FORGET - Set a mental reminder',
        'If you forget in silent Amidah, you may need to repeat it',
        'Place a bookmark in your siddur as a visual cue',
      ],
      commonMistakes: ['THE most commonly forgotten addition'],
      conditional: true,
      conditionalNote: 'Required on Rosh Chodesh and Yom Tov',
    });
  }

  serviceStructure.push(
    {
      section: '6. Chazzan\'s Repetition of Amidah',
      subsections: [
        'Repeat entire Amidah aloud',
        'Kedushah (Kadosh, Kadosh, Kadosh)',
        'Modim D\'Rabbanan (congregation bows)',
        'Birkat Kohanim or Sim Shalom',
      ],
      estimatedMinutes: 12,
      yourRole: 'lead',
      criticalMoments: [
        'Say it SLOWLY and clearly - this is the main service',
        'Kedushah: Wait for congregation to say "Kadosh, Kadosh, Kadosh"',
        'Wait after each blessing for "Amen"',
        'During Modim, congregation says their own Modim quietly',
      ],
      commonMistakes: [
        'Going too fast',
        'Not waiting for Amens',
        'Forgetting Ya\'aleh V\'yavo if applicable',
      ],
    },
  );

  // Tachnun or skip
  if (variations.hasTachnun) {
    serviceStructure.push({
      section: variations.hasLongTachnun
        ? '7. Tachnun - LONG VERSION (Monday/Thursday)'
        : '7. Tachnun',
      subsections: variations.hasLongTachnun
        ? [
            'V\'hu Rachum (extra introductory verses)',
            'Nefilat Apayim (rest head on arm)',
            'Extended supplications',
            'V\'anachnu lo neida',
          ]
        : ['Nefilat Apayim (rest head on arm)', 'V\'anachnu lo neida'],
      estimatedMinutes: variations.hasLongTachnun ? 8 : 3,
      yourRole: 'together',
      criticalMoments: [
        'Rest your head on your arm while sitting',
        'If there\'s a Torah in the room, face toward it',
        variations.hasLongTachnun
          ? 'Monday/Thursday version has extra verses - follow your siddur carefully'
          : '',
      ],
      commonMistakes: ['Saying it on days when we skip Tachnun'],
    });
  } else {
    serviceStructure.push({
      section: '7.  SKIP TACHNUN TODAY',
      subsections: ['Go directly to Ashrei'],
      estimatedMinutes: 0,
      yourRole: 'lead',
      criticalMoments: ['Do NOT say Tachnun - proceed to Ashrei'],
      commonMistakes: ['Accidentally starting Tachnun out of habit'],
      conditional: true,
      conditionalNote: variations.notes[0] || 'We skip Tachnun on special days',
    });
  }

  serviceStructure.push(
    {
      section: '8. Ashrei & Uva L\'Tzion',
      subsections: ['Ashrei (Psalm 145)', 'Uva L\'Tzion Goel'],
      estimatedMinutes: 5,
      yourRole: 'together',
      criticalMoments: ['Say together with congregation', 'Moderate pace'],
      commonMistakes: [],
    },
    {
      section: '9. Kaddish Shalem (Full Kaddish)',
      subsections: [
        'Yitgadal v\'yitkadash',
        'Congregation: Y\'hei sh\'mei raba',
        'Titkabel (prayer acceptance)',
        'Oseh shalom',
      ],
      estimatedMinutes: 2,
      yourRole: 'lead',
      criticalMoments: [
        'This is the Full Kaddish (includes "Titkabel" - acceptance of prayers)',
        'Wait for congregation at "Y\'hei sh\'mei raba" - they say it LOUDLY',
        'Stand throughout',
      ],
      commonMistakes: ['Rushing through Y\'hei sh\'mei raba'],
    },
    {
      section: '10. Aleinu',
      subsections: ['Aleinu l\'shabeiach', 'Al kein n\'kaveh'],
      estimatedMinutes: 2,
      yourRole: 'together',
      criticalMoments: ['Bow during "Va\'anachnu kor\'im u\'mishtachavim"'],
      commonMistakes: ['Forgetting to bow'],
    },
  );

  // Add Hallel if applicable
  if (variations.hasHallel) {
    serviceStructure.push({
      section: `11. Hallel - ${variations.hallelType === 'full' ? 'FULL' : 'HALF'}`,
      subsections:
        variations.hallelType === 'full'
          ? ['Complete Hallel (Psalms 113-118)', 'All verses included']
          : ['Half Hallel', 'SKIP: "Lo lanu" and parts of "Hodu"', 'Check siddur for details'],
      estimatedMinutes: variations.hallelType === 'full' ? 10 : 7,
      yourRole: 'lead',
      criticalMoments: [
        variations.hallelType === 'half'
          ? ' HALF HALLEL - skip certain paragraphs (check your siddur)'
          : 'Full Hallel - say everything',
        'Congregation joins at certain verses (e.g., "Hodu l\'Hashem ki tov")',
      ],
      commonMistakes: [
        variations.hallelType === 'half'
          ? 'Saying full Hallel when it should be half'
          : 'Skipping verses by accident',
      ],
      conditional: true,
      conditionalNote: 'Said on Rosh Chodesh and holidays',
    });
  }

  // Add Mussaf if applicable
  if (variations.hasMussaf) {
    serviceStructure.push({
      section: '12. Mussaf (Additional Service)',
      subsections: [
        'Silent Mussaf Amidah',
        'Chazzan\'s Repetition',
        'Kedushah',
        'Full Kaddish',
        'Aleinu',
      ],
      estimatedMinutes: 20,
      yourRole: 'lead',
      criticalMoments: [
        'This is a SECOND Amidah',
        'Same structure as Shacharit Amidah',
        'Include Ya\'aleh V\'yavo',
        'Kedushah in repetition',
      ],
      commonMistakes: ['Forgetting Mussaf entirely', 'Skipping Ya\'aleh V\'yavo'],
      conditional: true,
      conditionalNote: 'Required on Rosh Chodesh and Yom Tov',
    });
  }

  serviceStructure.push({
    section: variations.hasMussaf ? '13. Closing' : '11. Closing',
    subsections: ['Mourner\'s Kaddish (if applicable)', 'Adon Olam or Ein Keloheinu'],
    estimatedMinutes: 3,
    yourRole: 'respond',
    criticalMoments: [
      'If there are mourners, they say Kaddish',
      'You respond with congregation',
      'Your job as Shaliach Tzibbur is complete!',
    ],
    commonMistakes: [],
  });

  // Calculate total time
  const totalMinutes = serviceStructure.reduce((sum, section) => sum + section.estimatedMinutes, 0);

  const roleColors = {
    lead: 'bg-[#1B4965] text-white',
    silent: 'bg-gray-400 text-white',
    together: 'bg-[#5FA8D3] text-white',
    respond: 'bg-[#4A7C59] text-white',
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">
          Complete Service Scope
        </h1>
        <p className="text-gray-600 mb-4">
          The full picture of what you&apos;ll be leading - every section, every detail, every variation.
        </p>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#E8F4F8] rounded-xl p-4">
            <div className="text-3xl font-bold text-[#1B4965]">{totalMinutes} min</div>
            <div className="text-sm text-gray-600">Total estimated time</div>
          </div>
          <div className="bg-[#FEF3E2] rounded-xl p-4">
            <div className="text-3xl font-bold text-[#C6973F]">{serviceStructure.length}</div>
            <div className="text-sm text-gray-600">Major sections</div>
          </div>
          <div className="bg-[#F0F9FF] rounded-xl p-4">
            <div className="text-3xl font-bold text-[#5FA8D3]">
              {serviceStructure.filter((s) => s.conditional).length}
            </div>
            <div className="text-sm text-gray-600">Special variations today</div>
          </div>
        </div>
      </div>

      {/* Today's Variations */}
      {variations.notes.length > 0 && (
        <div className="bg-[#FEF3E2] border-l-4 border-[#D4A373] rounded-r-xl p-6">
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-3">Today&apos;s Variations</h3>
          <ul className="space-y-2">
            {variations.notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[#D4A373] font-bold">•</span>
                <span className="text-gray-700">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Complete Section Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-6">
          Complete Section-by-Section Breakdown
        </h2>

        <div className="space-y-6">
          {serviceStructure.map((section, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl p-5 ${
                section.conditional
                  ? 'border-[#D4A373] bg-[#FFFBF5]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Section Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">
                    {section.section}
                  </h3>
                  {section.conditionalNote && (
                    <div className="inline-block px-3 py-1 bg-[#D4A373] text-white rounded-full text-xs font-bold mb-2">
                       {section.conditionalNote}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      roleColors[section.yourRole]
                    }`}
                  >
                    {section.yourRole === 'lead' && ' YOU LEAD'}
                    {section.yourRole === 'silent' && ' SILENT'}
                    {section.yourRole === 'together' && ' TOGETHER'}
                    {section.yourRole === 'respond' && ' RESPOND'}
                  </span>
                  <span className="text-sm font-medium text-gray-600">
                    ~{section.estimatedMinutes} min
                  </span>
                </div>
              </div>

              {/* Subsections */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  What&apos;s Included:
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {section.subsections.map((sub, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#1B4965] mt-1"></span>
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical Moments */}
              {section.criticalMoments.length > 0 && (
                <div className="mb-4 p-3 bg-[#E8F4F8] rounded-lg">
                  <h4 className="text-sm font-semibold text-[#1B4965] mb-2">
                     Critical Moments:
                  </h4>
                  <ul className="space-y-1">
                    {section.criticalMoments.map((moment, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-[#1B4965]">•</span>
                        <span>{moment}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {section.commonMistakes && section.commonMistakes.length > 0 && (
                <div className="p-3 bg-[#FFF0F0] border-l-4 border-[#C17767] rounded-r-lg">
                  <h4 className="text-sm font-semibold text-[#C17767] mb-2">
                     Common Mistakes to Avoid:
                  </h4>
                  <ul className="space-y-1">
                    {section.commonMistakes.map((mistake, i) => (
                      <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-[#C17767]">×</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="bg-gradient-to-r from-[#1B4965] to-[#5FA8D3] rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-3">You&apos;ve Got This!</h3>
        <p className="text-lg mb-4">
          You now have the complete picture of the service. Review each section, practice the
          critical moments, and remember: the congregation is rooting for you.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="font-bold">{totalMinutes} minutes</span> total
          </div>
          <div className="w-px h-6 bg-white/30" />
          <div>
            <span className="font-bold">{serviceStructure.length} sections</span> to lead
          </div>
          <div className="w-px h-6 bg-white/30" />
          <div>
            <span className="font-bold">
              {serviceStructure.filter((s) => s.conditional).length} variations
            </span>{' '}
            today
          </div>
        </div>
      </div>
    </div>
  );
}
