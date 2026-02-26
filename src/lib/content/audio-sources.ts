/**
 * Audio source registry for all prayer recordings.
 *
 * Two primary voices:
 *   1. Alex — human recordings (default, static files in /public/audio/)
 *   2. AI Israeli — Google Cloud TTS Hebrew voice (always available fallback)
 *
 * Legacy sources (chabad, hadar, siddur-audio) still exist in the map
 * but are not shown in the picker — they play if static files match.
 */

export type AudioSourceId = 'alex' | 'google-tts' | 'siddur-audio' | 'chabad' | 'young-israel' | 'hadar-weiss' | 'hadar-richman' | 'hadar-diamond' | 'hadar-rosenbaum';

export interface AudioSource {
  id: AudioSourceId;
  label: string;
  shortLabel: string;
  description: string;
  /** Whether to show in the voice picker UI */
  showInPicker: boolean;
}

export const AUDIO_SOURCES: Record<AudioSourceId, AudioSource> = {
  'alex': {
    id: 'alex',
    label: 'Alex',
    shortLabel: 'Alex',
    description: 'Human voice — clear Hebrew reading',
    showInPicker: true,
  },
  'google-tts': {
    id: 'google-tts',
    label: 'AI Israeli Voice',
    shortLabel: 'AI Israeli',
    description: 'Natural Israeli Hebrew voice — always available',
    showInPicker: true,
  },
  'siddur-audio': {
    id: 'siddur-audio',
    label: 'Siddur Audio',
    shortLabel: 'Siddur Audio',
    description: 'Full text reading — traditional pace',
    showInPicker: false,
  },
  'chabad': {
    id: 'chabad',
    label: 'Chabad.org',
    shortLabel: 'Chabad',
    description: 'Full text reading — Chabad nusach',
    showInPicker: false,
  },
  'young-israel': {
    id: 'young-israel',
    label: 'Young Israel',
    shortLabel: 'Young Israel',
    description: 'Full text reading — Young Israel nusach',
    showInPicker: false,
  },
  'hadar-weiss': {
    id: 'hadar-weiss',
    label: 'Hadar - Rabbi Dena Weiss',
    shortLabel: 'R. Weiss',
    description: 'Nusach demonstration — Hadar Institute',
    showInPicker: false,
  },
  'hadar-richman': {
    id: 'hadar-richman',
    label: 'Hadar - Rabbi Aviva Richman',
    shortLabel: 'R. Richman',
    description: 'Nusach demonstration — Hadar Institute',
    showInPicker: false,
  },
  'hadar-diamond': {
    id: 'hadar-diamond',
    label: 'Hadar - Rabbi Eliezer Diamond',
    shortLabel: 'R. Diamond',
    description: 'Nusach demonstration — Hadar Institute',
    showInPicker: false,
  },
  'hadar-rosenbaum': {
    id: 'hadar-rosenbaum',
    label: 'Hadar - Rosenbaum',
    shortLabel: 'Rosenbaum',
    description: 'Nusach demonstration — Hadar Institute',
    showInPicker: false,
  },
};

/** The two voices users can choose from */
export const PICKER_SOURCES: AudioSourceId[] = ['alex', 'google-tts'];

export interface PrayerAudioEntry {
  sourceId: AudioSourceId;
  /** Path relative to /public */
  path: string;
  /** Type of recording */
  type: 'full-prayer' | 'nusach' | 'section';
}

/**
 * All available audio files per prayer ID.
 * The useAudio hook checks these to offer source options.
 */
export const PRAYER_AUDIO_MAP: Record<string, PrayerAudioEntry[]> = {
  'modeh-ani': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/modeh-ani/modeh-ani-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/modeh-ani/modeh-ani-chabad.mp3', type: 'full-prayer' },
  ],
  'netilat-yadayim': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/netilat-yadayim/netilat-yadayim-sidduraudio.mp3', type: 'full-prayer' },
  ],
  'asher-yatzar': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/asher-yatzar/asher-yatzar-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/asher-yatzar/asher-yatzar-chabad.mp3', type: 'full-prayer' },
  ],
  'elokai-neshama': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/elokai-neshama/elokai-neshama-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/elokai-neshama/elokai-neshama-chabad.mp3', type: 'full-prayer' },
  ],
  'birchos-hatorah': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/birchos-hatorah/birchos-hatorah-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/birchos-hatorah/birchos-hatorah-chabad.mp3', type: 'full-prayer' },
  ],
  'birchos-hashachar': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/birchos-hashachar/birchos-hashachar-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/birchos-hashachar/birchos-hashachar-chabad.mp3', type: 'full-prayer' },
  ],
  'baruch-sheamar': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/baruch-sheamar/baruch-sheamar-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/baruch-sheamar/baruch-sheamar-chabad.mp3', type: 'full-prayer' },
  ],
  'hodu': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/hodu/hodu-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/hodu/hodu-chabad.mp3', type: 'full-prayer' },
  ],
  'mizmor-ltodah': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/mizmor-ltodah/mizmor-ltodah-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/mizmor-ltodah/mizmor-ltodah-chabad.mp3', type: 'full-prayer' },
  ],
  'ashrei': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/ashrei/ashrei-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/ashrei/ashrei-chabad.mp3', type: 'full-prayer' },
  ],
  'az-yashir': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/az-yashir/az-yashir-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/az-yashir/az-yashir-chabad.mp3', type: 'full-prayer' },
  ],
  'yishtabach': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/yishtabach/yishtabach-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/yishtabach/yishtabach-chabad.mp3', type: 'full-prayer' },
  ],
  'yotzer-or': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/yotzer-or/yotzer-or-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/yotzer-or/yotzer-or-chabad.mp3', type: 'full-prayer' },
    { sourceId: 'hadar-weiss', path: '/audio/sources/hadar/yotzer-or/weiss.mp3', type: 'nusach' },
    { sourceId: 'hadar-richman', path: '/audio/sources/hadar/yotzer-or/richman.mp3', type: 'nusach' },
    { sourceId: 'hadar-diamond', path: '/audio/sources/hadar/yotzer-or/diamond.mp3', type: 'nusach' },
  ],
  'ahavah-rabbah': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/ahavah-rabbah/ahavah-rabbah-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/ahavah-rabbah/ahavah-rabbah-chabad.mp3', type: 'full-prayer' },
    { sourceId: 'hadar-weiss', path: '/audio/sources/hadar/ahavah-rabbah/weiss.mp3', type: 'nusach' },
    { sourceId: 'hadar-richman', path: '/audio/sources/hadar/ahavah-rabbah/richman.mp3', type: 'nusach' },
    { sourceId: 'hadar-diamond', path: '/audio/sources/hadar/ahavah-rabbah/diamond.mp3', type: 'nusach' },
  ],
  'shema': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/shema/shema-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/shema/shema-chabad.mp3', type: 'full-prayer' },
    { sourceId: 'hadar-weiss', path: '/audio/sources/hadar/shema/weiss.mp3', type: 'nusach' },
    { sourceId: 'hadar-richman', path: '/audio/sources/hadar/shema/richman.mp3', type: 'nusach' },
    { sourceId: 'hadar-diamond', path: '/audio/sources/hadar/shema/diamond.mp3', type: 'nusach' },
  ],
  'emet-vyatziv': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/emet-vyatziv/emet-vyatziv-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/emet-vyatziv/emet-vyatziv-chabad.mp3', type: 'full-prayer' },
    { sourceId: 'hadar-weiss', path: '/audio/sources/hadar/emet-vyatziv/weiss.mp3', type: 'nusach' },
    { sourceId: 'hadar-richman', path: '/audio/sources/hadar/emet-vyatziv/richman.mp3', type: 'nusach' },
    { sourceId: 'hadar-diamond', path: '/audio/sources/hadar/emet-vyatziv/diamond.mp3', type: 'nusach' },
  ],
  'shemoneh-esrei': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/shemoneh-esrei/shemoneh-esrei-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/shemoneh-esrei/shemoneh-esrei-chabad.mp3', type: 'full-prayer' },
    { sourceId: 'hadar-weiss', path: '/audio/sources/hadar/shemoneh-esrei-avot/weiss.mp3', type: 'nusach' },
    { sourceId: 'hadar-richman', path: '/audio/sources/hadar/shemoneh-esrei-avot/richman.mp3', type: 'nusach' },
    { sourceId: 'hadar-diamond', path: '/audio/sources/hadar/shemoneh-esrei-avot/diamond.mp3', type: 'nusach' },
  ],
  'tachanun': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/tachanun/tachanun-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/tachanun/tachanun-chabad.mp3', type: 'full-prayer' },
  ],
  'uva-ltzion': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/uva-ltzion/uva-ltzion-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/uva-ltzion/uva-ltzion-chabad.mp3', type: 'full-prayer' },
  ],
  'aleinu': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/aleinu/aleinu-sidduraudio.mp3', type: 'full-prayer' },
    { sourceId: 'chabad', path: '/audio/prayers/aleinu/aleinu-chabad.mp3', type: 'full-prayer' },
  ],
  'ein-kelokeinu': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/ein-kelokeinu/ein-kelokeinu-sidduraudio.mp3', type: 'full-prayer' },
  ],
  'hallel': [
    { sourceId: 'siddur-audio', path: '/audio/prayers/hallel/hallel-sidduraudio.mp3', type: 'full-prayer' },
  ],
};

/**
 * Get all available audio entries for a prayer.
 */
export function getAudioForPrayer(prayerId: string): PrayerAudioEntry[] {
  return PRAYER_AUDIO_MAP[prayerId] ?? [];
}

/**
 * Get a specific source's audio for a prayer, if available.
 */
export function getAudioBySource(prayerId: string, sourceId: AudioSourceId): PrayerAudioEntry | null {
  const entries = PRAYER_AUDIO_MAP[prayerId] ?? [];
  return entries.find((e) => e.sourceId === sourceId) ?? null;
}

/**
 * Get the list of source IDs shown in the voice picker.
 * Always returns Alex first (default), then AI Israeli.
 */
export function getAvailableSources(_prayerId: string): AudioSourceId[] {
  return [...PICKER_SOURCES];
}
