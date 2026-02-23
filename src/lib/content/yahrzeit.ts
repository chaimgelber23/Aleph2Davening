import type { KaddishType } from '@/types';

// ==========================================
// KADDISH TYPES
// ==========================================

export interface KaddishInfo {
  type: KaddishType;
  nameHebrew: string;
  nameEnglish: string;
  description: string;
  whenSaid: string[];
  whoSays: string;
  key_line?: string;
  key_line_transliteration?: string;
}

export const KADDISH_TYPES: KaddishInfo[] = [
  {
    type: 'half',
    nameHebrew: 'חֲצִי קַדִּישׁ',
    nameEnglish: 'Chatzi Kaddish (Half Kaddish)',
    description:
      'The short form of kaddish, recited by the chazzan to mark transitions between sections of the service. It does not include any mourner-specific passages.',
    whenSaid: [
      'Between Pesukei D\'Zimra and Barchhu',
      'Before the Amidah',
      'Between Torah reading and Ashrei (at Mincha)',
      'Before Maariv Amidah',
    ],
    whoSays: 'Chazzan (prayer leader)',
    key_line: 'יִתְגַּדַּל וְיִתְקַדַּשׁ שְׁמֵהּ רַבָּא',
    key_line_transliteration: 'Yitgadal v\'yitkadash sh\'mei raba',
  },
  {
    type: 'full',
    nameHebrew: 'קַדִּישׁ שָׁלֵם',
    nameEnglish: 'Kaddish Shalem (Full Kaddish)',
    description:
      'The complete kaddish, recited by the chazzan after the Amidah repetition. It includes the additional line "Titkabel" asking that our prayers be accepted.',
    whenSaid: [
      'After the chazzan\'s repetition of the Amidah',
      'Near the end of the service',
    ],
    whoSays: 'Chazzan (prayer leader)',
    key_line: 'תִּתְקַבַּל צְלוֹתְהוֹן וּבָעוּתְהוֹן',
    key_line_transliteration: 'Titkabel tz\'lot\'hon u\'va\'ut\'hon',
  },
  {
    type: 'mourners',
    nameHebrew: 'קַדִּישׁ יָתוֹם',
    nameEnglish: 'Kaddish Yatom (Mourner\'s Kaddish)',
    description:
      'Recited by mourners during the first year after a parent\'s death and on each yahrzeit. It is also said by those observing yahrzeit for other close relatives. This kaddish is the same text as Half Kaddish with an additional paragraph.',
    whenSaid: [
      'After Aleinu at the end of every service',
      'After Psalm of the Day',
      'After certain additional psalms or readings',
    ],
    whoSays: 'Mourners and those observing yahrzeit',
    key_line: 'יְהֵא שְׁלָמָא רַבָּא מִן שְׁמַיָּא',
    key_line_transliteration: 'Y\'hei sh\'lama raba min sh\'maya',
  },
  {
    type: 'derabanan',
    nameHebrew: 'קַדִּישׁ דְּרַבָּנָן',
    nameEnglish: 'Kaddish D\'Rabbanan (Scholar\'s Kaddish)',
    description:
      'Recited after studying Torah she\'b\'al peh (Oral Torah) — Mishnah, Gemara, or Midrash. It includes a special prayer for Torah scholars and their students.',
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
  occurrences: {
    type: KaddishType;
    when: string;
    notes?: string;
  }[];
}

export const KADDISH_IN_SERVICES: KaddishInService[] = [
  {
    service: 'Shacharit (Weekday)',
    serviceHebrew: 'שַׁחֲרִית',
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
    occurrences: [
      { type: 'half', when: 'After Ashrei (before Amidah)' },
      { type: 'full', when: 'After chazzan\'s repetition of the Amidah' },
      { type: 'mourners', when: 'After Aleinu' },
    ],
  },
  {
    service: 'Maariv',
    serviceHebrew: 'מַעֲרִיב',
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
}

export const YAHRZEIT_PRACTICES: YahrzeitPractice[] = [
  {
    title: 'Say Kaddish',
    description:
      'Attend all three daily services (Shacharit, Mincha, Maariv) and say the Mourner\'s Kaddish at each one. If you cannot attend all three, attend at least one.',
    required: true,
  },
  {
    title: 'Light a Yahrzeit Candle',
    description:
      'Light a 24-hour memorial candle at home before sunset on the evening the yahrzeit begins. The candle burns through the full day.',
    required: true,
  },
  {
    title: 'Learn Torah',
    description:
      'Study Mishnah or other Torah in memory of the deceased. Some study chapters of Mishnah whose letters spell the deceased\'s Hebrew name, plus the letters of the word "neshamah" (soul).',
    required: false,
  },
  {
    title: 'Give Tzedakah',
    description:
      'Make a charitable donation in memory of the deceased. This elevates the neshamah.',
    required: false,
  },
  {
    title: 'Visit the Grave',
    description:
      'If possible, visit the gravesite. Recite Psalms (Tehillim) and the El Malei Rachamim prayer.',
    required: false,
  },
  {
    title: 'Lead the Davening',
    description:
      'If you are capable, serve as the chazzan (prayer leader) for one or more of the services on the yahrzeit day.',
    required: false,
  },
  {
    title: 'Fast',
    description:
      'Some have the custom to fast on a parent\'s yahrzeit. This is not required but is practiced in some communities.',
    required: false,
  },
  {
    title: 'Get an Aliyah',
    description:
      'On the Shabbat before the yahrzeit, it is customary to receive an aliyah to the Torah. Let the gabbai know in advance.',
    required: false,
  },
];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export function getKaddishInfo(type: KaddishType): KaddishInfo | undefined {
  return KADDISH_TYPES.find((k) => k.type === type);
}

export function getKaddishForService(serviceName: string): KaddishInService | undefined {
  return KADDISH_IN_SERVICES.find((s) => s.service === serviceName);
}
