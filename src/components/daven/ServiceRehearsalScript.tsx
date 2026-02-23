'use client';

import React, { useState } from 'react';
import { getTodaysServiceVariations } from '@/lib/calendar/service-calendar';
import type { Prayer } from '@/types';

interface ScriptItem {
  type: 'instruction' | 'you_say' | 'congregation_says' | 'together' | 'silent' | 'note' | 'timing';
  content: string;
  hebrewText?: string;
  transliteration?: string;
  timing?: string;
  critical?: boolean;
}

interface ScriptSection {
  title: string;
  estimatedMinutes: number;
  items: ScriptItem[];
  conditional?: boolean;
}

interface ServiceRehearsalScriptProps {
  prayers?: Prayer[]; // Optional - full prayer objects if available
}

export default function ServiceRehearsalScript({ prayers }: ServiceRehearsalScriptProps) {
  const [showHebrew, setShowHebrew] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTimings, setShowTimings] = useState(true);

  const variations = getTodaysServiceVariations();

  // Build the complete script
  const script: ScriptSection[] = [
    {
      title: 'BEFORE YOU BEGIN',
      estimatedMinutes: 0,
      items: [
        {
          type: 'instruction',
          content: 'Arrive 10-15 minutes early. Review this script one more time.',
        },
        {
          type: 'instruction',
          content: 'Find your place in the siddur. Bookmark key sections.',
        },
        variations.hasYaalehVeyavo
          ? {
              type: 'note',
              content: 'CRITICAL: Today requires Ya\'aleh V\'yavo in the Amidah. Place a bookmark now!',
              critical: true,
            }
          : null,
        !variations.hasTachnun
          ? {
              type: 'note',
              content: 'Reminder: NO Tachnun today. After Amidah, go straight to Ashrei.',
              critical: true,
            }
          : null,
        {
          type: 'instruction',
          content: 'Take a deep breath. You are prepared. The congregation is with you.',
        },
      ].filter(Boolean) as ScriptItem[],
    },
    {
      title: 'PESUKEI D\'ZIMRA - Start Here',
      estimatedMinutes: 10,
      items: [
        {
          type: 'instruction',
          content: 'Wait until most of the congregation has arrived and is ready.',
        },
        {
          type: 'you_say',
          content: 'Begin by saying "Hodu" to signal the service is starting.',
          hebrewText: 'הוֹדוּ לַה\' קִרְאוּ בִשְׁמוֹ',
          transliteration: 'Hodu l\'Adonai kir\'u vishmo',
          timing: '~10 seconds',
        },
        {
          type: 'together',
          content: 'Continue with the congregation through Pesukei D\'Zimra.',
        },
        {
          type: 'note',
          content: 'Pace yourself - not too fast. Let the congregation keep up with you.',
        },
        {
          type: 'you_say',
          content: 'When you reach Ashrei (Psalm 145), slow down slightly - this is important.',
          hebrewText: 'אַשְׁרֵי יוֹשְׁבֵי בֵיתֶךָ',
          transliteration: 'Ashrei yoshvei veitecha',
          timing: '~2 minutes',
        },
        {
          type: 'together',
          content: 'Continue through the Psalms and Nishmat.',
        },
        {
          type: 'you_say',
          content: 'Conclude Pesukei D\'Zimra with Yishtabach.',
          hebrewText: 'יִשְׁתַּבַּח שִׁמְךָ לָעַד מַלְכֵּנוּ',
          transliteration: 'Yishtabach shimcha la\'ad malkeinu',
        },
      ],
    },
    {
      title: 'BARECHU - Your First Major Moment',
      estimatedMinutes: 1,
      items: [
        {
          type: 'instruction',
          content: ' STAND UP. This is your first public call to the congregation.',
          critical: true,
        },
        {
          type: 'instruction',
          content: 'Bow when you say "Barechu".',
          critical: true,
        },
        {
          type: 'you_say',
          content: 'Call out clearly and confidently:',
          hebrewText: 'בָּרְכוּ אֶת ה\' הַמְּבֹרָךְ',
          transliteration: 'Barechu et Adonai ha-m\'vorach',
          timing: '~5 seconds',
          critical: true,
        },
        {
          type: 'timing',
          content: ' PAUSE. Wait for the congregation to respond.',
        },
        {
          type: 'congregation_says',
          content: 'The congregation responds (bow when they say this):',
          hebrewText: 'בָּרוּךְ ה\' הַמְּבֹרָךְ לְעוֹלָם וָעֶד',
          transliteration: 'Baruch Adonai ha-m\'vorach l\'olam va-ed',
        },
        {
          type: 'you_say',
          content: 'You repeat what they just said:',
          hebrewText: 'בָּרוּךְ ה\' הַמְּבֹרָךְ לְעוֹלָם וָעֶד',
          transliteration: 'Baruch Adonai ha-m\'vorach l\'olam va-ed',
        },
        {
          type: 'note',
          content: 'Well done. The hardest part is over. Continue with confidence.',
        },
      ],
    },
    {
      title: 'SHEMA AND ITS BLESSINGS',
      estimatedMinutes: 8,
      items: [
        {
          type: 'together',
          content: 'Lead the blessings before Shema: Yotzer Or and Ahavah Rabbah.',
        },
        {
          type: 'instruction',
          content: ' SHEMA: Cover your eyes with your right hand for the first verse.',
          critical: true,
        },
        {
          type: 'you_say',
          content: 'Say the first verse slowly and with intention:',
          hebrewText: 'שְׁמַע יִשְׂרָאֵל ה\' אֱלֹהֵינוּ ה\' אֶחָד',
          transliteration: 'Shema Yisrael, Adonai Eloheinu, Adonai Echad',
          timing: '~8 seconds - say it SLOWLY',
          critical: true,
        },
        {
          type: 'together',
          content: 'Continue with V\'ahavta and the rest of the Shema.',
        },
        {
          type: 'note',
          content: ' CRITICAL: Do NOT pause between the end of Shema and "Emet V\'Yatziv" - say it immediately.',
          critical: true,
        },
        {
          type: 'you_say',
          content: 'Without pausing, continue:',
          hebrewText: 'אֱמֶת וְיַצִּיב',
          transliteration: 'Emet v\'yatziv',
        },
        {
          type: 'together',
          content: 'Continue through Ga\'al Yisrael.',
        },
      ],
    },
    {
      title: 'SILENT AMIDAH',
      estimatedMinutes: 8,
      items: [
        {
          type: 'instruction',
          content: ' Take 3 small steps FORWARD (to approach God).',
          critical: true,
        },
        {
          type: 'instruction',
          content: 'Stand with your feet together. Face east (toward Jerusalem).',
        },
        {
          type: 'silent',
          content: 'Say the entire Amidah SILENTLY. Take your time. No one can hear you.',
          timing: '~8 minutes',
        },
        variations.hasYaalehVeyavo
          ? {
              type: 'note',
              content: ' REMEMBER: Add Ya\'aleh V\'yavo in the Modim section!',
              critical: true,
            }
          : null,
        {
          type: 'instruction',
          content: 'When you finish, take 3 small steps BACK (to leave God\'s presence respectfully).',
        },
        {
          type: 'timing',
          content: ' WAIT for the congregation to finish their silent Amidah. Do NOT rush them.',
        },
      ].filter(Boolean) as ScriptItem[],
    },
    {
      title: 'CHAZZAN\'S REPETITION - The Main Event',
      estimatedMinutes: 12,
      items: [
        {
          type: 'instruction',
          content: 'Once the congregation has finished, take 3 steps forward again.',
        },
        {
          type: 'you_say',
          content: 'Repeat the ENTIRE Amidah aloud. Say it slowly and clearly.',
          timing: '~12 minutes',
        },
        {
          type: 'note',
          content: 'The congregation will answer "Amen" after each blessing. WAIT for them.',
          critical: true,
        },
        {
          type: 'instruction',
          content: ' KEDUSHAH: When you reach "Nakdishach," the congregation will say Kedushah with you.',
          critical: true,
        },
        {
          type: 'together',
          content: 'The congregation says with you:',
          hebrewText: 'קָדוֹשׁ קָדוֹשׁ קָדוֹשׁ ה\' צְבָאוֹת',
          transliteration: 'Kadosh, Kadosh, Kadosh, Adonai Tzeva\'ot',
        },
        ...(variations.hasYaalehVeyavo
          ? [{
              type: 'note' as const,
              content: ' REMEMBER: Add Ya\'aleh V\'yavo in Modim (second time today)!',
              critical: true,
            }]
          : []),
        {
          type: 'note',
          content: 'During Modim, the congregation says their own quiet Modim. Keep going.',
        },
        {
          type: 'instruction',
          content: 'After the final blessing (Sim Shalom), take 3 steps back.',
        },
      ],
    },
  ];

  // Add Tachnun section conditionally
  if (variations.hasTachnun) {
    script.push({
      title: variations.hasLongTachnun ? 'TACHNUN - Monday/Thursday Long Version' : 'TACHNUN',
      estimatedMinutes: variations.hasLongTachnun ? 8 : 3,
      items: [
        {
          type: 'instruction',
          content: 'Sit down. Rest your head on your arm.',
        },
        {
          type: 'instruction',
          content: 'If there is a Torah in the room, turn to face it.',
        },
        variations.hasLongTachnun
          ? {
              type: 'note',
              content: 'Monday/Thursday: Say the EXTENDED Tachnun with extra verses (V\'hu Rachum...).',
            }
          : null,
        {
          type: 'together',
          content: 'Say Tachnun with the congregation.',
          timing: variations.hasLongTachnun ? '~8 minutes' : '~3 minutes',
        },
      ].filter(Boolean) as ScriptItem[],
    });
  } else {
    script.push({
      title: ' SKIP TACHNUN',
      estimatedMinutes: 0,
      conditional: true,
      items: [
        {
          type: 'note',
          content: ` ${variations.notes[0] || 'We do not say Tachnun today.'}`,
          critical: true,
        },
        {
          type: 'instruction',
          content: 'Go directly to Ashrei. Do NOT say Tachnun.',
        },
      ],
    });
  }

  // Continue with the rest
  script.push(
    {
      title: 'ASHREI & UVA L\'TZION',
      estimatedMinutes: 5,
      items: [
        {
          type: 'together',
          content: 'Lead Ashrei (Psalm 145) and Uva L\'Tzion.',
        },
      ],
    },
    {
      title: 'FULL KADDISH',
      estimatedMinutes: 2,
      items: [
        {
          type: 'instruction',
          content: 'Stand for Kaddish.',
        },
        {
          type: 'you_say',
          content: 'Begin the Full Kaddish:',
          hebrewText: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא',
          transliteration: 'Yitgadal v\'yitkadash sh\'mei raba',
        },
        {
          type: 'timing',
          content: ' PAUSE for congregation to answer "Amen".',
        },
        {
          type: 'note',
          content: ' CRITICAL MOMENT: When you reach "Y\'hei sh\'mei raba," the congregation says it LOUDLY. WAIT for them.',
          critical: true,
        },
        {
          type: 'congregation_says',
          content: 'Congregation says loudly:',
          hebrewText: 'יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא',
          transliteration: 'Y\'hei sh\'mei raba m\'varach l\'alam ul\'almei almaya',
        },
        {
          type: 'you_say',
          content: 'Continue with the rest of Kaddish. This is the FULL Kaddish, so include "Titkabel."',
        },
      ],
    },
    {
      title: 'ALEINU',
      estimatedMinutes: 2,
      items: [
        {
          type: 'together',
          content: 'Lead Aleinu with the congregation.',
        },
        {
          type: 'instruction',
          content: ' Bow during "Va\'anachnu kor\'im u\'mishtachavim."',
          critical: true,
        },
      ],
    },
  );

  // Add Hallel if applicable
  if (variations.hasHallel) {
    script.push({
      title: `HALLEL - ${variations.hallelType === 'full' ? 'FULL' : 'HALF'}`,
      estimatedMinutes: variations.hallelType === 'full' ? 10 : 7,
      conditional: true,
      items: [
        variations.hallelType === 'half'
          ? {
              type: 'note',
              content: ' This is HALF Hallel. Skip "Lo lanu" and parts of "Hodu." Follow your siddur carefully.',
              critical: true,
            }
          : {
              type: 'note',
              content: 'This is FULL Hallel. Say all verses.',
            },
        {
          type: 'you_say',
          content: 'Begin with the bracha for Hallel.',
          hebrewText: 'בָּרוּךְ אַתָּה ה\' אֱלֹהֵינוּ מֶלֶךְ הָעוֹלָם אֲשֶׁר קִדְּשָׁנוּ בְּמִצְווֹתָיו וְצִוָּנוּ לִקְרוֹא אֶת הַהַלֵּל',
          transliteration: 'Baruch atah Adonai...asher kidshanu b\'mitzvotav v\'tzivanu likro et ha-hallel',
        },
        {
          type: 'together',
          content: 'Lead Hallel. The congregation joins at certain verses.',
          timing: variations.hallelType === 'full' ? '~10 minutes' : '~7 minutes',
        },
      ],
    });
  }

  // Add Mussaf if applicable
  if (variations.hasMussaf) {
    script.push({
      title: 'MUSSAF - Additional Service',
      estimatedMinutes: 20,
      conditional: true,
      items: [
        {
          type: 'note',
          content: 'Mussaf is a SECOND Amidah, with the same structure as Shacharit.',
        },
        {
          type: 'silent',
          content: 'Say the silent Mussaf Amidah (includes Ya\'aleh V\'yavo).',
          timing: '~8 minutes',
        },
        variations.hasYaalehVeyavo
          ? {
              type: 'note',
              content: ' Include Ya\'aleh V\'yavo in Modim.',
              critical: true,
            }
          : null,
        {
          type: 'you_say',
          content: 'Repeat the Mussaf Amidah aloud.',
          timing: '~12 minutes',
        },
        {
          type: 'note',
          content: 'Kedushah in the repetition. Wait for "Kadosh, Kadosh, Kadosh."',
        },
        {
          type: 'you_say',
          content: 'Conclude with Full Kaddish and Aleinu.',
        },
      ].filter(Boolean) as ScriptItem[],
    });
  }

  script.push({
    title: 'CLOSING',
    estimatedMinutes: 3,
    items: [
      {
        type: 'note',
        content: 'If there are mourners present, they will say Mourner\'s Kaddish.',
      },
      {
        type: 'congregation_says',
        content: 'You and the congregation respond during the Kaddish.',
      },
      {
        type: 'instruction',
        content: ' Congratulations! You have successfully led the service. Well done!',
      },
    ],
  });

  const totalMinutes = script.reduce((sum, section) => sum + section.estimatedMinutes, 0);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">
          Complete Service Rehearsal Script
        </h1>
        <p className="text-gray-600 mb-4">
          Every word, every pause, every moment - exactly as it will happen. Total time: ~{totalMinutes} minutes.
        </p>

        {/* Display Controls */}
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHebrew}
              onChange={(e) => setShowHebrew(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1B4965] focus:ring-[#1B4965]"
            />
            <span className="text-sm font-medium text-gray-700">Show Hebrew</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTransliteration}
              onChange={(e) => setShowTransliteration(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1B4965] focus:ring-[#1B4965]"
            />
            <span className="text-sm font-medium text-gray-700">Show Transliteration</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTimings}
              onChange={(e) => setShowTimings(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1B4965] focus:ring-[#1B4965]"
            />
            <span className="text-sm font-medium text-gray-700">Show Timings</span>
          </label>
        </div>

        <div className="p-4 bg-[#E8F4F8] rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>How to use this script:</strong> Read through it completely before the service.
            On the day, you can reference it quickly if needed, but trust your preparation.
            The congregation is with you every step of the way.
          </p>
        </div>
      </div>

      {/* Script Sections */}
      <div className="space-y-6">
        {script.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className={`rounded-2xl shadow-sm border-2 p-6 ${
              section.conditional
                ? 'border-[#D4A373] bg-[#FFFBF5]'
                : 'border-gray-200 bg-white'
            }`}
          >
            {/* Section Title */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200">
              <h2 className="text-2xl font-bold text-[#1A1A2E]">{section.title}</h2>
              {showTimings && section.estimatedMinutes > 0 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  ~{section.estimatedMinutes} min
                </span>
              )}
            </div>

            {/* Script Items */}
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => {
                if (item.type === 'instruction') {
                  return (
                    <div
                      key={itemIndex}
                      className={`p-3 rounded-lg border-l-4 ${
                        item.critical
                          ? 'bg-[#FFF0F0] border-[#C17767]'
                          : 'bg-gray-50 border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">
                         {item.content}
                      </p>
                    </div>
                  );
                }

                if (item.type === 'you_say') {
                  return (
                    <div key={itemIndex} className="p-4 bg-[#E8F4F8] border-l-4 border-[#1B4965] rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#1B4965] text-white rounded text-xs font-bold">
                           YOU SAY
                        </span>
                        {showTimings && item.timing && (
                          <span className="text-xs text-gray-600">{item.timing}</span>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{item.content}</p>
                      {showHebrew && item.hebrewText && (
                        <p className="font-['Noto_Serif_Hebrew'] text-2xl text-[#1A1A2E] text-right mb-2" dir="rtl">
                          {item.hebrewText}
                        </p>
                      )}
                      {showTransliteration && item.transliteration && (
                        <p className="text-gray-600 italic">{item.transliteration}</p>
                      )}
                    </div>
                  );
                }

                if (item.type === 'congregation_says') {
                  return (
                    <div key={itemIndex} className="p-4 bg-[#F0F9FF] border-l-4 border-[#5FA8D3] rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-[#5FA8D3] text-white rounded text-xs font-bold">
                           CONGREGATION SAYS
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{item.content}</p>
                      {showHebrew && item.hebrewText && (
                        <p className="font-['Noto_Serif_Hebrew'] text-2xl text-[#1A1A2E] text-right mb-2" dir="rtl">
                          {item.hebrewText}
                        </p>
                      )}
                      {showTransliteration && item.transliteration && (
                        <p className="text-gray-600 italic">{item.transliteration}</p>
                      )}
                    </div>
                  );
                }

                if (item.type === 'together') {
                  return (
                    <div key={itemIndex} className="p-3 bg-[#F5F3FF] border-l-4 border-[#8B5CF6] rounded-r-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[#8B5CF6] text-white rounded text-xs font-bold">
                           TOGETHER
                        </span>
                        {showTimings && item.timing && (
                          <span className="text-xs text-gray-600">{item.timing}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{item.content}</p>
                    </div>
                  );
                }

                if (item.type === 'silent') {
                  return (
                    <div key={itemIndex} className="p-3 bg-gray-100 border-l-4 border-gray-400 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gray-500 text-white rounded text-xs font-bold">
                           SILENT
                        </span>
                        {showTimings && item.timing && (
                          <span className="text-xs text-gray-600">{item.timing}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{item.content}</p>
                    </div>
                  );
                }

                if (item.type === 'timing') {
                  return (
                    <div key={itemIndex} className="p-3 bg-[#FEF3E2] border-l-4 border-[#D4A373] rounded-r-lg">
                      <p className="text-sm font-medium text-gray-800">{item.content}</p>
                    </div>
                  );
                }

                if (item.type === 'note') {
                  return (
                    <div
                      key={itemIndex}
                      className={`p-3 rounded-lg ${
                        item.critical
                          ? 'bg-[#FFF0F0] border-2 border-[#C17767]'
                          : 'bg-yellow-50 border-l-4 border-yellow-400'
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-800">
                         {item.content}
                      </p>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Encouragement */}
      <div className="bg-gradient-to-r from-[#4A7C59] to-[#5FA8D3] rounded-2xl p-8 text-white text-center">
        <h3 className="text-3xl font-bold mb-3">You Are Ready!</h3>
        <p className="text-lg mb-4">
          You now have the complete script of the service. You know every moment, every pause, every response.
          The congregation is rooting for you. Trust your preparation, and lead with confidence.
        </p>
        <p className="text-xl font-bold">
          ~{totalMinutes} minutes • {script.length} sections • You've got this!
        </p>
      </div>
    </div>
  );
}
