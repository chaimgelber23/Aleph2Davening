'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// =============================================
// All the brachot recordings we need
// =============================================

interface Recording {
  filename: string;
  hebrewText: string;
  transliteration: string;
  description: string;
}

interface Category {
  id: string;
  title: string;
  subtitle: string;
  folder: string;
  status: 'done' | 'needed';
  recordings: Recording[];
}

const CATEGORIES: Category[] = [
  {
    id: 'hamotzi',
    title: 'Hamotzi',
    subtitle: 'Before eating bread',
    folder: 'hamotzi',
    status: 'done',
    recordings: [
      {
        filename: 'hamotzi-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam",
        description: 'Standard bracha opening',
      },
      {
        filename: 'hamotzi-2.mp3',
        hebrewText: 'הַמּוֹצִיא לֶחֶם מִן הָאָרֶץ',
        transliteration: "Hamotzi lechem min ha'aretz",
        description: 'Who brings forth bread from the earth',
      },
    ],
  },
  {
    id: 'mezonot',
    title: 'Mezonot',
    subtitle: 'Before cake, pasta, cereal',
    folder: 'mezonot',
    status: 'done',
    recordings: [
      {
        filename: 'mezonot-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam",
        description: 'Standard bracha opening',
      },
      {
        filename: 'mezonot-2.mp3',
        hebrewText: 'בּוֹרֵא מִינֵי מְזוֹנוֹת',
        transliteration: "Borei minei m'zonot",
        description: 'Who creates various kinds of nourishment',
      },
    ],
  },
  {
    id: 'hagafen',
    title: 'Hagafen',
    subtitle: 'Before wine or grape juice',
    folder: 'hagafen',
    status: 'done',
    recordings: [
      {
        filename: 'hagafen-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam",
        description: 'Standard bracha opening',
      },
      {
        filename: 'hagafen-2.mp3',
        hebrewText: 'בּוֹרֵא פְּרִי הַגָּפֶן',
        transliteration: 'Borei pri hagafen',
        description: 'Who creates the fruit of the vine',
      },
    ],
  },
  {
    id: 'ha-eitz',
    title: "Ha'Eitz",
    subtitle: 'Before fruit from trees',
    folder: 'ha-eitz',
    status: 'done',
    recordings: [
      {
        filename: 'ha-eitz-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam",
        description: 'Standard bracha opening',
      },
      {
        filename: 'ha-eitz-2.mp3',
        hebrewText: 'בּוֹרֵא פְּרִי הָעֵץ',
        transliteration: "Borei pri ha'eitz",
        description: 'Who creates the fruit of the tree',
      },
    ],
  },
  {
    id: 'ha-adamah',
    title: "Ha'Adamah",
    subtitle: 'Before vegetables',
    folder: 'ha-adamah',
    status: 'done',
    recordings: [
      {
        filename: 'ha-adamah-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam",
        description: 'Standard bracha opening',
      },
      {
        filename: 'ha-adamah-2.mp3',
        hebrewText: 'בּוֹרֵא פְּרִי הָאֲדָמָה',
        transliteration: "Borei pri ha'adamah",
        description: 'Who creates the fruit of the earth',
      },
    ],
  },
  {
    id: 'shehakol',
    title: 'Shehakol',
    subtitle: 'Before water, meat, candy, eggs',
    folder: 'shehakol',
    status: 'done',
    recordings: [
      {
        filename: 'shehakol-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam",
        description: 'Standard bracha opening',
      },
      {
        filename: 'shehakol-2.mp3',
        hebrewText: 'שֶׁהַכֹּל נִהְיָה בִּדְבָרוֹ',
        transliteration: 'Shehakol nihyah bidvaro',
        description: 'That everything came to be through His word',
      },
    ],
  },
  {
    id: 'borei-nefashot',
    title: 'Borei Nefashot',
    subtitle: 'After most foods (short after-bracha)',
    folder: 'borei-nefashot',
    status: 'needed',
    recordings: [
      {
        filename: 'bn-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם בּוֹרֵא נְפָשׁוֹת רַבּוֹת וְחֶסְרוֹנָן',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam borei nefashot rabot v'chesronan",
        description: 'Who creates many living things and their needs',
      },
      {
        filename: 'bn-2.mp3',
        hebrewText: 'עַל כָּל מַה שֶּׁבָּרָאתָ לְהַחֲיוֹת בָּהֶם נֶפֶשׁ כָּל חָי',
        transliteration: "Al kol mah shebarata l'hachayot bahem nefesh kol chai",
        description: 'For everything You created to sustain every living soul',
      },
      {
        filename: 'bn-3.mp3',
        hebrewText: 'בָּרוּךְ חֵי הָעוֹלָמִים',
        transliteration: "Baruch Chei ha'olamim",
        description: 'Blessed is the Life of all worlds',
      },
    ],
  },
  {
    id: 'al-hamichya',
    title: 'Al HaMichya',
    subtitle: 'After grain products, wine, or 7 species',
    folder: 'al-hamichya',
    status: 'needed',
    recordings: [
      {
        filename: 'ah-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם עַל הַמִּחְיָה וְעַל הַכַּלְכָּלָה וְעַל תְּנוּבַת הַשָּׂדֶה וְעַל אֶרֶץ חֶמְדָּה טוֹבָה וּרְחָבָה שֶׁרָצִיתָ וְהִנְחַלְתָּ לַאֲבוֹתֵינוּ לֶאֱכוֹל מִפִּרְיָהּ וְלִשְׂבּוֹעַ מִטּוּבָהּ',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam al hamichya v'al hakalkalah...",
        description: 'Opening - for the sustenance and nourishment',
      },
      {
        filename: 'ah-2.mp3',
        hebrewText: 'רַחֶם נָא ה׳ אֱלֹקֵינוּ עַל יִשְׂרָאֵל עַמֶּךָ וְעַל יְרוּשָׁלַיִם עִירֶךָ וְעַל צִיּוֹן מִשְׁכַּן כְּבוֹדֶךָ וְעַל מִזְבְּחֶךָ וְעַל הֵיכָלֶךָ וּבְנֵה יְרוּשָׁלַיִם עִיר הַקֹּדֶשׁ בִּמְהֵרָה בְיָמֵינוּ',
        transliteration: 'Rachem na Hashem Elokeinu al Yisrael amecha...',
        description: 'Have mercy on Israel and Jerusalem',
      },
      {
        filename: 'ah-3.mp3',
        hebrewText: 'וְהַעֲלֵנוּ לְתוֹכָהּ וְשַׂמְּחֵנוּ בְּבִנְיָנָהּ וְנֹאכַל מִפִּרְיָהּ וְנִשְׂבַּע מִטּוּבָהּ וּנְבָרֶכְךָ עָלֶיהָ בִּקְדֻשָּׁה וּבְטָהֳרָה כִּי אַתָּה ה׳ טוֹב וּמֵטִיב לַכֹּל וְנוֹדֶה לְּךָ עַל הָאָרֶץ וְעַל הַמִּחְיָה בָּרוּךְ אַתָּה ה׳ עַל הָאָרֶץ וְעַל הַמִּחְיָה',
        transliteration: "V'ha'aleinu l'tochah v'sam'cheinu b'vinyanah...",
        description: 'Closing - Blessed are You for the land and sustenance',
      },
    ],
  },
  {
    id: 'birkat-hamazon-short',
    title: 'Birkat Hamazon',
    subtitle: 'Grace After Meals (after bread)',
    folder: 'birkat-hamazon-short',
    status: 'needed',
    recordings: [
      {
        filename: 'bh-1.mp3',
        hebrewText: 'בָּרוּךְ אַתָּה ה׳ אֱלֹקֵינוּ מֶלֶךְ הָעוֹלָם הַזָּן אֶת הָעוֹלָם כֻּלּוֹ בְּטוּבוֹ בְּחֵן בְּחֶסֶד וּבְרַחֲמִים הוּא נוֹתֵן לֶחֶם לְכָל בָּשָׂר כִּי לְעוֹלָם חַסְדּוֹ',
        transliteration: "Baruch Atah Hashem Elokeinu Melech ha'olam hazan et ha'olam kulo b'tuvo...",
        description: 'Who nourishes the entire world in His goodness',
      },
      {
        filename: 'bh-2.mp3',
        hebrewText: 'וּבְטוּבוֹ הַגָּדוֹל תָּמִיד לֹא חָסַר לָנוּ וְאַל יֶחְסַר לָנוּ מָזוֹן לְעוֹלָם וָעֶד. בַּעֲבוּר שְׁמוֹ הַגָּדוֹל כִּי הוּא אֵל זָן וּמְפַרְנֵס לַכֹּל וּמֵטִיב לַכֹּל וּמֵכִין מָזוֹן לְכָל בְּרִיּוֹתָיו אֲשֶׁר בָּרָא. בָּרוּךְ אַתָּה ה׳ הַזָּן אֶת הַכֹּל',
        transliteration: "Uv'tuvo hagadol tamid lo chasar lanu...",
        description: 'Through His great goodness we have never lacked',
      },
    ],
  },
];

// =============================================
// Upload Page Component
// =============================================

export default function UploadAudioPage() {
  const [uploadedFiles, setUploadedFiles] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Load already-uploaded files on mount
  useEffect(() => {
    fetch('/api/upload-audio')
      .then((res) => res.json())
      .then((data) => {
        if (data.files) {
          setUploadedFiles(new Set(data.files));
        }
      })
      .catch(() => {});
  }, []);

  const handleUpload = useCallback(async (file: File, folder: string, filename: string) => {
    const key = `${folder}/${filename}`;
    setUploading(key);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('filename', filename);

    try {
      const res = await fetch('/api/upload-audio', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadedFiles((prev) => new Set([...prev, key]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  }, []);

  const neededCategories = CATEGORIES.filter((c) => c.status === 'needed');
  const doneCategories = CATEGORIES.filter((c) => c.status === 'done');

  const totalNeeded = neededCategories.reduce((sum, c) => sum + c.recordings.length, 0);
  const totalUploaded = neededCategories.reduce(
    (sum, c) => sum + c.recordings.filter((r) => uploadedFiles.has(`${c.folder}/${r.filename}`)).length,
    0
  );

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      {/* Header */}
      <div className="bg-[#1B4965] text-white px-6 py-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold">Audio Recording Upload</h1>
          <p className="text-white/60 text-sm mt-1">
            Upload bracha recordings for the Aleph2Davening app
          </p>
          <div className="mt-4 bg-white/10 rounded-xl p-3">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className="font-mono">{totalUploaded} / {totalNeeded} uploaded</span>
            </div>
            <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4A7C59] rounded-full transition-all"
                style={{ width: totalNeeded > 0 ? `${(totalUploaded / totalNeeded) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Instructions */}
        <div className="bg-[#1B4965]/5 rounded-2xl p-4">
          <p className="text-sm font-semibold text-[#1B4965] mb-2">How to record</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>1. Read the Hebrew text slowly and clearly</li>
            <li>2. Say &quot;Hashem&quot; where you see ה׳</li>
            <li>3. Save as MP3 (any quality is fine)</li>
            <li>4. Upload each recording below</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* NEEDED recordings first */}
        <div>
          <h2 className="text-lg font-bold text-[#1B4965] mb-3">
            Needs Recording ({totalNeeded - totalUploaded} remaining)
          </h2>

          <div className="space-y-3">
            {neededCategories.map((category) => {
              const uploaded = category.recordings.filter((r) =>
                uploadedFiles.has(`${category.folder}/${r.filename}`)
              ).length;
              const isExpanded = expandedCategory === category.id;

              return (
                <div key={category.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800">{category.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{category.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        uploaded === category.recordings.length
                          ? 'bg-[#4A7C59]/10 text-[#4A7C59]'
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {uploaded}/{category.recordings.length}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-50 px-5 py-4 space-y-4">
                      {category.recordings.map((rec) => {
                        const key = `${category.folder}/${rec.filename}`;
                        const isUploaded = uploadedFiles.has(key);
                        const isCurrentlyUploading = uploading === key;

                        return (
                          <RecordingSlot
                            key={rec.filename}
                            recording={rec}
                            folder={category.folder}
                            isUploaded={isUploaded}
                            isUploading={isCurrentlyUploading}
                            onUpload={handleUpload}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Already done */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">
            Already Recorded ({doneCategories.length} brachot)
          </h2>
          <div className="space-y-2">
            {doneCategories.map((category) => {
              const isExpanded = expandedCategory === category.id;
              const uploaded = category.recordings.filter((r) =>
                uploadedFiles.has(`${category.folder}/${r.filename}`)
              ).length;

              return (
                <div key={category.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                    className="w-full px-5 py-3 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-gray-600 text-sm">{category.title}</h3>
                        <p className="text-[11px] text-gray-400">{category.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {uploaded > 0 && (
                        <span className="text-[10px] text-[#4A7C59] bg-[#4A7C59]/10 px-2 py-0.5 rounded-full">
                          {uploaded} new
                        </span>
                      )}
                      <svg
                        className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-50 px-5 py-4 space-y-4">
                      <p className="text-xs text-gray-400">
                        These already have audio, but you can upload new versions to replace them.
                      </p>
                      {category.recordings.map((rec) => {
                        const key = `${category.folder}/${rec.filename}`;
                        const isUploaded = uploadedFiles.has(key);
                        const isCurrentlyUploading = uploading === key;

                        return (
                          <RecordingSlot
                            key={rec.filename}
                            recording={rec}
                            folder={category.folder}
                            isUploaded={isUploaded}
                            isUploading={isCurrentlyUploading}
                            onUpload={handleUpload}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
// Single Recording Upload Slot
// =============================================

function RecordingSlot({
  recording,
  folder,
  isUploaded,
  isUploading,
  onUpload,
}: {
  recording: Recording;
  folder: string;
  isUploaded: boolean;
  isUploading: boolean;
  onUpload: (file: File, folder: string, filename: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`rounded-xl border p-4 space-y-2 ${
      isUploaded ? 'border-[#4A7C59]/30 bg-[#4A7C59]/3' : 'border-gray-100 bg-gray-50/50'
    }`}>
      {/* Hebrew text to record */}
      <p
        dir="rtl"
        className="font-['Noto_Serif_Hebrew'] text-lg text-[#1A1A2E] leading-[1.8] text-right"
      >
        {recording.hebrewText}
      </p>

      {/* Transliteration */}
      <p className="text-xs text-gray-400 italic">{recording.transliteration}</p>

      {/* Description + filename */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-gray-400">
          Save as: <span className="font-mono text-gray-500">{recording.filename}</span>
        </p>
        {isUploaded && (
          <span className="text-[11px] text-[#4A7C59] font-medium flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Uploaded
          </span>
        )}
      </div>

      {/* Upload button */}
      <input
        ref={inputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file, folder, recording.filename);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isUploaded
            ? 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            : 'bg-[#1B4965] text-white hover:bg-[#163d55]'
        }`}
      >
        {isUploading ? (
          <>
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {isUploaded ? 'Replace Recording' : 'Upload Recording'}
          </>
        )}
      </button>
    </div>
  );
}
