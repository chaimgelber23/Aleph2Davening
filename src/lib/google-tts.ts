/**
 * Google Cloud Text-to-Speech client for Hebrew audio generation.
 *
 * Voice tiers (best → good):
 *   Neural2  — newest, most natural (he-IL-Neural2-A/B/C/D)
 *   WaveNet  — high quality (he-IL-Wavenet-A/B/C/D)
 *   Standard — basic (he-IL-Standard-A/B/C/D)
 *
 * A/C = female, B/D = male
 *
 * Setup:
 *   1. Create a Google Cloud project
 *   2. Enable the Text-to-Speech API
 *   3. Create a service account key (JSON)
 *   4. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json in .env.local
 *      OR set GOOGLE_TTS_API_KEY for API key auth (simpler but less secure)
 */

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

export type GoogleVoiceGender = 'male' | 'female';

export interface GoogleTTSOptions {
  /** Playback speed (0.25 to 4.0, default 1.0) */
  speed?: number;
  /** Pitch adjustment in semitones (-20.0 to 20.0, default 0) */
  pitch?: number;
  /** Voice gender */
  gender?: GoogleVoiceGender;
}

// Primary: Neural2 (highest quality). Fallback: WaveNet.
const HEBREW_VOICES_NEURAL2 = {
  male: 'he-IL-Neural2-B',
  female: 'he-IL-Neural2-A',
} as const;

const HEBREW_VOICES_WAVENET = {
  male: 'he-IL-Wavenet-D',
  female: 'he-IL-Wavenet-C',
} as const;

let _client: TextToSpeechClient | null = null;

function getClient(): TextToSpeechClient {
  if (!_client) {
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (apiKey) {
      _client = new TextToSpeechClient({ apiKey });
    } else {
      _client = new TextToSpeechClient();
    }
  }
  return _client;
}

/**
 * Fix ה׳ → אֲדֹנָי so TTS says "Adonai" instead of "heh".
 * Also handles the ASCII apostrophe variant ה'.
 */
export function fixHashemForTTS(text: string): string {
  return text.replace(/ה[׳']/g, 'אֲדֹנָי');
}

/**
 * Build SSML from Hebrew prayer text for natural pacing.
 * Adds pauses after Hebrew sentence-ending punctuation (׃ ׀ : . —)
 * and shorter pauses after commas.
 */
function buildSSML(text: string): string {
  let ssml = text
    // Sof pasuk (׃) or pipe (׀) — liturgical pauses
    .replace(/[׃׀]/g, '$&<break time="500ms"/>')
    // Period or colon — sentence boundary
    .replace(/([.:])(\s)/g, '$1<break time="400ms"/>$2')
    // Em dash — dramatic pause
    .replace(/—/g, '—<break time="350ms"/>')
    // Comma — brief pause
    .replace(/,/g, ',<break time="200ms"/>');

  return `<speak><prosody rate="medium" pitch="0st">${ssml}</prosody></speak>`;
}

/**
 * Generate Hebrew speech audio using Google Cloud TTS.
 * Tries Neural2 first (highest quality), falls back to WaveNet.
 * Uses SSML for natural Hebrew pacing with liturgical pauses.
 * Returns MP3 audio as a Buffer.
 */
export async function synthesizeHebrew(
  text: string,
  opts: GoogleTTSOptions = {}
): Promise<Buffer> {
  const client = getClient();
  const gender = opts.gender || 'male';
  const processedText = fixHashemForTTS(text);
  const ssml = buildSSML(processedText);

  // Try Neural2 first, then WaveNet
  const voicesToTry = [
    HEBREW_VOICES_NEURAL2[gender],
    HEBREW_VOICES_WAVENET[gender],
  ];

  for (const voiceName of voicesToTry) {
    try {
      const [response] = await client.synthesizeSpeech({
        input: { ssml },
        voice: {
          languageCode: 'he-IL',
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: opts.speed || 1.0,
          pitch: opts.pitch || 0,
          sampleRateHertz: 24000,
          effectsProfileId: ['headphone-class-device'],
        },
      });

      if (!response.audioContent) continue;

      if (typeof response.audioContent === 'string') {
        return Buffer.from(response.audioContent, 'base64');
      }
      return Buffer.from(response.audioContent);
    } catch {
      // Voice not available in this tier, try next
      continue;
    }
  }

  throw new Error('No Hebrew TTS voice available');
}
