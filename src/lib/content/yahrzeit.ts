import type { KaddishType } from '@/types';

// ==========================================
// KADDISH TYPES
// ==========================================

export interface KaddishInfo {
  type: KaddishType;
  nameHebrew: string;
  nameEnglish: string;
  description: string;
  beginnerExplanation: string;
  yourRole: string;
  isYourKaddish: boolean;
  whenSaid: string[];
  whoSays: string;
  key_line?: string;
  key_line_transliteration?: string;
  relatedPrayerId?: string;
}

export const KADDISH_TYPES: KaddishInfo[] = [
  {
    type: 'mourners',
    nameHebrew: 'קַדִּישׁ יָתוֹם',
    nameEnglish: 'Mourner\'s Kaddish',
    description:
      'The Mourner\'s Kaddish never mentions death. It is an extraordinary declaration of faith — praising God precisely when it is hardest to do so. When you stand and say these words, the entire congregation stands with you, responding "Amen" as a community united in support.',
    beginnerExplanation: 'This is YOUR Kaddish. You stand and say it, and the congregation responds. It is said near the end of every service.',
    yourRole: 'You say this',
    isYourKaddish: true,
    whenSaid: [
      'After Aleinu at the end of every service',
      'After Psalm of the Day (at Shacharit)',
      'After certain additional psalms or readings',
    ],
    whoSays: 'Mourners and those observing yahrzeit',
    key_line: 'יְהֵא שְׁלָמָא רַבָּא מִן שְׁמַיָּא',
    key_line_transliteration: 'Y\'hei sh\'lama raba min sh\'maya',
    relatedPrayerId: 'kaddish-mourners',
  },
  {
    type: 'half',
    nameHebrew: 'חֲצִי קַדִּישׁ',
    nameEnglish: 'Half Kaddish',
    description:
      'The short form of Kaddish, recited by the chazzan (prayer leader) to mark transitions between sections of the service. You will hear this several times during davening.',
    beginnerExplanation: 'The prayer leader says this. You just listen and respond "Amen" when he pauses.',
    yourRole: 'Listen and respond Amen',
    isYourKaddish: false,
    whenSaid: [
      'Between Pesukei D\'Zimra and Barchhu',
      'Before the Amidah',
      'Between Torah reading and Ashrei (at Mincha)',
      'Before Maariv Amidah',
    ],
    whoSays: 'Chazzan (prayer leader)',
    key_line: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא',
    key_line_transliteration: 'Yitgadal v\'yitkadash sh\'mei raba',
    relatedPrayerId: 'kaddish-half',
  },
  {
    type: 'full',
    nameHebrew: 'קַדִּישׁ שָׁלֵם',
    nameEnglish: 'Full Kaddish',
    description:
      'The complete Kaddish, recited by the chazzan after the Amidah repetition. It includes the additional line "Titkabel" asking that our prayers be accepted.',
    beginnerExplanation: 'The prayer leader says this after the main standing prayer. You just listen and respond "Amen."',
    yourRole: 'Listen and respond Amen',
    isYourKaddish: false,
    whenSaid: [
      'After the chazzan\'s repetition of the Amidah',
      'Near the end of the service',
    ],
    whoSays: 'Chazzan (prayer leader)',
    key_line: 'תִּתְקַבַּל צְלוֹתְהוֹן וּבָעוּתְהוֹן',
    key_line_transliteration: 'Titkabel tz\'lot\'hon u\'va\'ut\'hon',
    relatedPrayerId: 'kaddish-full',
  },
  {
    type: 'derabanan',
    nameHebrew: 'קַדִּישׁ דְּרַבָּנָן',
    nameEnglish: 'Scholar\'s Kaddish',
    description:
      'Recited after studying Torah she\'b\'al peh (Oral Torah) — Mishnah, Gemara, or Midrash. It includes a special prayer for Torah scholars and their students. You will usually hear this once at the beginning of Shacharit.',
    beginnerExplanation: 'This is said after Torah study. You will hear it early in the morning service. Just respond "Amen."',
    yourRole: 'Listen and respond Amen',
    isYourKaddish: false,
    whenSaid: [
      'After learning Mishnah or Gemara in a group',
      'After reciting Birkot HaShachar section with rabbinic passages',
      'After a Torah shiur (class)',
    ],
    whoSays: 'Mourners (when applicable) or the one who led the study',
    key_line: 'עַל יִשְׂרָאֵל וְעַל רַבָּנָן',
    key_line_transliteration: 'Al Yisrael v\'al rabbanan',
  },
];

// ==========================================
// KADDISH IN SERVICES — when each type appears
// ==========================================

export interface KaddishInService {
  service: string;
  serviceHebrew: string;
  serviceId: string;
  timeOfDay: string;
  estimatedMinutes: number;
  beginnerTip: string;
  occurrences: {
    type: KaddishType;
    when: string;
    notes?: string;
  }[];
}

export const KADDISH_IN_SERVICES: KaddishInService[] = [
  {
    service: 'Shacharit',
    serviceHebrew: 'שַׁחֲרִית',
    serviceId: 'weekday-shacharit',
    timeOfDay: 'Morning',
    estimatedMinutes: 35,
    beginnerTip: 'The morning service is the longest. Most shuls start between 6:30-8:00 AM. If you can only attend one service, this is the one.',
    occurrences: [
      { type: 'derabanan', when: 'After Birkot HaShachar / Korbanot section' },
      { type: 'half', when: 'After Yishtabach (before Barchhu)' },
      { type: 'half', when: 'Before the Amidah' },
      { type: 'full', when: 'After chazzan\'s repetition of the Amidah' },
      { type: 'half', when: 'Before Ashrei / Uva L\'Tziyon (on Torah reading days, after Torah reading)' },
      { type: 'mourners', when: 'After Aleinu' },
      { type: 'mourners', when: 'After Psalm of the Day' },
    ],
  },
  {
    service: 'Mincha',
    serviceHebrew: 'מִנְחָה',
    serviceId: 'weekday-mincha',
    timeOfDay: 'Afternoon',
    estimatedMinutes: 15,
    beginnerTip: 'The shortest service. Usually held in the late afternoon, about an hour before sunset. Quick but meaningful.',
    occurrences: [
      { type: 'half', when: 'After Ashrei (before Amidah)' },
      { type: 'full', when: 'After chazzan\'s repetition of the Amidah' },
      { type: 'mourners', when: 'After Aleinu' },
    ],
  },
  {
    service: 'Maariv',
    serviceHebrew: 'מַעֲרִיב',
    serviceId: 'weekday-maariv',
    timeOfDay: 'Evening',
    estimatedMinutes: 15,
    beginnerTip: 'The evening service. Often said right after Mincha in many shuls. A quiet, reflective service.',
    occurrences: [
      { type: 'half', when: 'Before the Amidah' },
      { type: 'full', when: 'After the Amidah', notes: 'Some communities say Half Kaddish here instead' },
      { type: 'mourners', when: 'After Aleinu' },
    ],
  },
];

// ==========================================
// YAHRZEIT OBSERVANCE GUIDE
// ==========================================

export interface YahrzeitPractice {
  title: string;
  description: string;
  required: boolean;
  sortOrder: number;
  beginnerTip?: string;
}

export const YAHRZEIT_PRACTICES: YahrzeitPractice[] = [
  {
    title: 'Light a Yahrzeit Candle',
    description:
      'Light a 24-hour memorial candle at home before sunset on the evening the yahrzeit begins. The candle burns through the full day.',
    required: true,
    sortOrder: 1,
    beginnerTip: 'You can buy yahrzeit candles at most grocery stores or Judaica shops. Light it before sunset the evening before the yahrzeit date.',
  },
  {
    title: 'Say Kaddish',
    description:
      'Attend daily services (Shacharit, Mincha, Maariv) and say the Mourner\'s Kaddish at each one. If you cannot attend all three, attend at least one.',
    required: true,
    sortOrder: 2,
    beginnerTip: 'Let someone at the shul know it is your yahrzeit. They will help you know when to stand and say Kaddish.',
  },
  {
    title: 'Learn Torah',
    description:
      'Study Mishnah or other Torah in memory of the deceased. Some study chapters of Mishnah whose letters spell the deceased\'s Hebrew name, plus the letters of the word "neshamah" (soul).',
    required: false,
    sortOrder: 3,
  },
  {
    title: 'Give Tzedakah',
    description:
      'Make a charitable donation in memory of the deceased. This elevates the neshamah (soul) of the departed.',
    required: false,
    sortOrder: 4,
    beginnerTip: 'Any amount to any charity counts. Some people donate to a cause the deceased cared about.',
  },
  {
    title: 'Visit the Grave',
    description:
      'If possible, visit the gravesite. Recite Psalms (Tehillim) and the El Malei Rachamim prayer.',
    required: false,
    sortOrder: 5,
  },
  {
    title: 'Lead the Davening',
    description:
      'If you are capable, serve as the chazzan (prayer leader) for one or more of the services on the yahrzeit day.',
    required: false,
    sortOrder: 6,
  },
];

// ==========================================
// CONGREGATION RESPONSE — quick reference
// ==========================================

export const CONGREGATION_RESPONSE = {
  hebrew: 'יְהֵא שְׁמֵהּ רַבָּא מְבָרַךְ לְעָלַם וּלְעָלְמֵי עָלְמַיָּא',
  transliteration: 'Y\'hei sh\'mei raba m\'varach l\'alam ul\'almei almaya',
  translation: 'May His great name be blessed forever and to all eternity',
  explanation: 'This is the most important response during any Kaddish. When you hear the Kaddish being said, respond with these words loudly and with feeling. The Talmud says that whoever responds with all their strength has any negative decrees annulled.',
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getKaddishInfo(type: KaddishType): KaddishInfo | undefined {
  return KADDISH_TYPES.find((k) => k.type === type);
}

export function getKaddishForService(serviceName: string): KaddishInService | undefined {
  return KADDISH_IN_SERVICES.find((s) => s.service === serviceName);
}
