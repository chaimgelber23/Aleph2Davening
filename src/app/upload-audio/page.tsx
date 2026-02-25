'use client';

import { useState, useRef, useEffect } from 'react';
import { LETTERS } from '@/lib/content/letters';
import { VOWELS } from '@/lib/content/vowels';
import { BOOTCAMP_VOCAB } from '@/lib/content/bootcampVocab';
import { BOOTCAMP_DAYS } from '@/lib/content/bootcampDays';
import { getTefillahPrayers, getBrachotPrayers, getBrachotAchronotPrayers } from '@/lib/content/prayers';
import { getServicePrayer } from '@/lib/content/service-prayers';

type Tab = 'letters' | 'bootcamp' | 'davening' | 'brachot';
type SlotStatus = 'idle' | 'recording' | 'processing' | 'preview' | 'uploading' | 'done';

/* ─── WAV Encoding ─── */

function encodeWav(buf: AudioBuffer): Blob {
  const ch = buf.numberOfChannels, sr = buf.sampleRate, len = buf.length;
  const dataSize = len * ch * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const v = new DataView(ab);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + dataSize, true); w(8, 'WAVE');
  w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, ch, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * ch * 2, true); v.setUint16(32, ch * 2, true);
  v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < len; i++) {
    for (let c = 0; c < ch; c++) {
      const s = Math.max(-1, Math.min(1, buf.getChannelData(c)[i]));
      v.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: 'audio/wav' });
}

/* ─── Audio Enhancement Pipeline ─── */

async function enhanceAudio(blob: Blob): Promise<Blob> {
  try {
    const ctx = new AudioContext();
    const arrayBuf = await blob.arrayBuffer();
    const audio = await ctx.decodeAudioData(arrayBuf);
    ctx.close();

    const off = new OfflineAudioContext(audio.numberOfChannels, audio.length, audio.sampleRate);
    const src = off.createBufferSource();
    src.buffer = audio;

    // High-pass filter: remove rumble below 80Hz
    const hp = off.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 80; hp.Q.value = 0.7;

    // Compressor: consistent volume
    const comp = off.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 10;
    comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.25;

    // Peak normalization to -1dB
    let peak = 0;
    const d = audio.getChannelData(0);
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    const gain = off.createGain();
    gain.gain.value = peak > 0.01 ? 0.89 / peak : 1;

    src.connect(hp).connect(comp).connect(gain).connect(off.destination);
    src.start();
    return encodeWav(await off.startRendering());
  } catch {
    return blob; // fallback to original if enhancement fails
  }
}

/* ─── Path Helpers ─── */

function extractPath(audioUrl: string): { folder: string; filename: string } {
  const clean = audioUrl.replace(/^\/audio\//, '');
  const parts = clean.split('/');
  const file = (parts.pop() || '').replace(/\.\w+$/, '');
  return { folder: parts.join('/'), filename: file };
}

/* ─── Recording Slot Component ─── */

function Slot({
  hebrew, translit, label, folder, filename, existingAudio, isUploaded, onUpload, badge,
}: {
  hebrew: string; translit: string; label?: string;
  folder: string; filename: string; existingAudio?: string;
  isUploaded: boolean; onUpload: (path: string) => void;
  badge?: 'chazzan' | 'congregation' | 'response';
}) {
  const [st, setSt] = useState<SlotStatus>(isUploaded ? 'done' : 'idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState<Blob | null>(null);
  const [timer, setTimer] = useState(0);
  const mr = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (isUploaded && st === 'idle') setSt('done'); }, [isUploaded]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      const rec = new MediaRecorder(stream);
      chunks.current = [];
      rec.ondataavailable = e => chunks.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
        setSt('processing');
        const raw = new Blob(chunks.current, { type: rec.mimeType });
        const enh = await enhanceAudio(raw);
        setEnhanced(enh);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(enh));
        setSt('preview');
      };
      rec.start();
      mr.current = rec;
      setTimer(0);
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      setSt('recording');
    } catch { alert('Microphone access needed. Please allow mic access and try again.'); }
  };

  const stopRec = () => mr.current?.stop();

  const save = async (blob: Blob) => {
    setSt('uploading');
    const fd = new FormData();
    fd.append('file', blob, `${filename}.wav`);
    fd.append('folder', folder);
    fd.append('filename', `${filename}.wav`);
    const r = await fetch('/api/upload-audio', { method: 'POST', body: fd });
    if (r.ok) { setSt('done'); onUpload(`${folder}/${filename}.wav`); }
    else { alert('Upload failed. Try again.'); setSt('preview'); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setSt('processing');
    const enh = await enhanceAudio(f);
    setEnhanced(enh);
    await save(enh);
    e.target.value = '';
  };

  const playExisting = () => {
    if (existingAudio) new Audio(existingAudio).play().catch(() => {});
  };

  const reset = () => {
    setSt('idle');
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setEnhanced(null);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className={`p-3 rounded-xl border transition-colors ${st === 'done' ? 'border-green-200 bg-green-50/60' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-start gap-2">
        {existingAudio && (
          <button onClick={playExisting} className="mt-1.5 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-sm shrink-0" title="Play existing audio">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
          </button>
        )}
        <div className="flex-1 min-w-0">
          {label && <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>}
          {badge && (
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
              badge === 'chazzan' ? 'bg-blue-100 text-blue-700' :
              badge === 'congregation' ? 'bg-amber-100 text-amber-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {badge === 'chazzan' ? 'Chazzan says' : badge === 'congregation' ? 'Everyone answers' : 'Congregation responds'}
            </span>
          )}
          <p className="font-['Noto_Serif_Hebrew'] text-lg text-[#1A1A2E] leading-relaxed" dir="rtl">{hebrew}</p>
          <p className="text-sm text-gray-500 truncate">{translit}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-1">
          {st === 'idle' && (
            <>
              <button onClick={startRec} className="w-11 h-11 rounded-full bg-red-50 hover:bg-red-100 border-2 border-red-300 flex items-center justify-center transition-colors" title="Record">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
              </button>
              <button onClick={() => fileRef.current?.click()} className="w-11 h-11 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center" title="Upload file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              </button>
              <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFile} />
            </>
          )}
          {st === 'recording' && (
            <button onClick={stopRec} className="w-11 h-11 rounded-full bg-red-500 animate-pulse flex items-center justify-center shadow-lg shadow-red-200" title="Stop recording">
              <div className="w-4 h-4 bg-white rounded-sm" />
            </button>
          )}
          {st === 'processing' && (
            <div className="w-11 h-11 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {st === 'uploading' && (
            <div className="w-11 h-11 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {st === 'done' && (
            <div className="flex items-center gap-1">
              <div className="w-11 h-11 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <button onClick={reset} className="text-[10px] text-gray-400 hover:text-gray-600">redo</button>
            </div>
          )}
        </div>
      </div>

      {st === 'recording' && (
        <div className="mt-2 flex items-center gap-2 text-red-500 text-sm font-medium">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Recording... {fmt(timer)}
        </div>
      )}
      {st === 'processing' && (
        <div className="mt-2 text-blue-500 text-sm font-medium">Enhancing audio...</div>
      )}
      {st === 'preview' && preview && (
        <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg p-2">
          <audio src={preview} controls className="h-8 flex-1 min-w-0" />
          <button onClick={reset} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded shrink-0">Redo</button>
          <button onClick={() => save(enhanced!)} className="px-3 py-1 text-xs text-white bg-[#4A7C59] hover:bg-[#3d6a4b] rounded font-medium shrink-0">Save</button>
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible Section ─── */

function Section({ title, count, done, defaultOpen = false, children }: {
  title: string; count: number; done: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const pct = count > 0 ? Math.round((done / count) * 100) : 0;
  return (
    <div className="mb-3">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors text-left">
        <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        <span className="flex-1 font-medium text-[#2D3142] text-sm">{title}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${done === count && count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {done}/{count}
        </span>
        {count > 0 && (
          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
            <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        )}
      </button>
      {open && <div className="mt-2 space-y-1.5 pl-1">{children}</div>}
    </div>
  );
}

/* ─── Main Page ─── */

export default function RecordingStudioPage() {
  const [tab, setTab] = useState<Tab>('letters');
  const [uploaded, setUploaded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/upload-audio').then(r => r.json())
      .then(d => setUploaded(new Set(d.files || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Uploaded check: match by folder/filename prefix (ignoring extension)
  const uploadedPrefixes = new Set([...uploaded].map(f => f.replace(/\.\w+$/, '')));
  const check = (folder: string, filename: string) => uploadedPrefixes.has(`${folder}/${filename}`);
  const mark = (path: string) => setUploaded(prev => new Set([...prev, path]));

  // Content data
  const tefillah = getTefillahPrayers();
  const brachotBefore = getBrachotPrayers();
  const brachotAfter = getBrachotAchronotPrayers();
  const kaddishPrayers = [
    getServicePrayer('kaddish-half'),
    getServicePrayer('kaddish-full'),
    getServicePrayer('kaddish-mourners'),
  ].filter(Boolean) as NonNullable<ReturnType<typeof getServicePrayer>>[];

  // Count helpers
  const countDone = (items: { folder: string; filename: string }[]) =>
    items.filter(i => check(i.folder, i.filename)).length;

  // Letters tab items
  const lettersItems = LETTERS.map(l => extractPath(l.audioUrl));
  const vowelsItems = VOWELS.map(v => extractPath(v.audioUrl));
  const lettersTotal = lettersItems.length + vowelsItems.length;
  const lettersDone = countDone(lettersItems) + countDone(vowelsItems);

  // Bootcamp tab items
  const bootcampDayItems = BOOTCAMP_DAYS.flatMap(day => [
    ...day.syllables.map(s => extractPath(s.audioUrl)),
    ...(day.practiceWords || []).map(w => extractPath(w.audioUrl)),
    ...(day.culminatingReading?.lines || []).map(l => extractPath(l.audioUrl)),
  ]);
  const vocabItems = BOOTCAMP_VOCAB.map(w => extractPath(w.audioUrl));
  const bootcampTotal = bootcampDayItems.length + vocabItems.length;
  const bootcampDone = countDone(bootcampDayItems) + countDone(vocabItems);

  // Davening tab items (includes Kaddish)
  const kaddishItems = kaddishPrayers.flatMap(p =>
    p.sections.map(s => ({ folder: `prayers/${p.id}`, filename: s.id }))
  );
  const daveningItems = [
    ...tefillah.flatMap(p => p.sections.map(s => ({ folder: `prayers/${p.id}`, filename: s.id }))),
    ...kaddishItems,
  ];
  const daveningTotal = daveningItems.length;
  const daveningDone = countDone(daveningItems);

  // Brachot tab items
  const brachotItems = [...brachotBefore, ...brachotAfter].flatMap(p =>
    p.sections.map(s => ({ folder: `prayers/${p.id}`, filename: s.id }))
  );
  const brachotTotal = brachotItems.length;
  const brachotDone = countDone(brachotItems);

  const totalAll = lettersTotal + bootcampTotal + daveningTotal + brachotTotal;
  const totalDone = lettersDone + bootcampDone + daveningDone + brachotDone;

  const tabs: { id: Tab; label: string; total: number; done: number }[] = [
    { id: 'letters', label: 'Letters', total: lettersTotal, done: lettersDone },
    { id: 'bootcamp', label: 'Bootcamp', total: bootcampTotal, done: bootcampDone },
    { id: 'davening', label: 'Davening', total: daveningTotal, done: daveningDone },
    { id: 'brachot', label: 'Brachot', total: brachotTotal, done: brachotDone },
  ];

  return (
    <div className="min-h-screen bg-[#FEFDFB]">
      {/* Header */}
      <div className="bg-[#1B4965] text-white py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-center">Recording Studio</h1>
          <p className="text-center text-blue-200 text-sm mt-1">Record audio for Aleph2Davening</p>
          <div className="mt-4 bg-white/10 rounded-2xl p-4">
            <div className="text-center mb-2">
              <span className="text-4xl font-bold text-white">{totalDone}</span>
              <span className="text-xl text-blue-200 mx-1">/</span>
              <span className="text-xl text-blue-200">{totalAll}</span>
              <p className="text-xs text-blue-300 mt-1">recordings done</p>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: totalAll > 0 ? `${(totalDone / totalAll) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
        <div className="max-w-2xl mx-auto text-sm text-amber-800">
          <strong>How to record:</strong> Tap the red circle to record, then preview and save. You can also upload files.
          All recordings are <strong>automatically enhanced</strong> (volume normalized, noise filtered).
          Say <strong>&ldquo;Hashem&rdquo;</strong> where you see ה׳.
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto w-full flex">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-center text-sm font-medium border-b-2 transition-colors ${
                tab === t.id ? 'border-[#1B4965] text-[#1B4965]' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {t.label}
              <span className="ml-1 text-[10px] opacity-60">{t.done}/{t.total}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* ─── Letters & Vowels Tab ─── */}
            {tab === 'letters' && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-800">
                  <strong>For each letter:</strong> Say the letter name, then the sound it makes. Example: &ldquo;Shin... SH&rdquo;
                </div>
                <Section title="Hebrew Letters" count={LETTERS.length} done={countDone(lettersItems)} defaultOpen>
                  {LETTERS.map(l => {
                    const p = extractPath(l.audioUrl);
                    return <Slot key={l.id} hebrew={l.hebrew} translit={`Say "${l.name}" then "${l.sound}"`}
                      folder={p.folder} filename={p.filename} existingAudio={l.audioUrl}
                      isUploaded={check(p.folder, p.filename)} onUpload={mark} />;
                  })}
                </Section>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 mt-4 text-sm text-blue-800">
                  <strong>For each vowel:</strong> Say the vowel name, then the sound. Example: &ldquo;Patach... AH&rdquo;
                </div>
                <Section title="Vowels (Nekudot)" count={VOWELS.length} done={countDone(vowelsItems)}>
                  {VOWELS.map(v => {
                    const p = extractPath(v.audioUrl);
                    return <Slot key={v.id} hebrew={`בּ${v.hebrew}`} translit={`Say "${v.name}" then "${v.sound}"`}
                      folder={p.folder} filename={p.filename} existingAudio={v.audioUrl}
                      isUploaded={check(p.folder, p.filename)} onUpload={mark} />;
                  })}
                </Section>
              </>
            )}

            {/* ─── Bootcamp Tab ─── */}
            {tab === 'bootcamp' && (
              <>
                {BOOTCAMP_DAYS.map(day => {
                  const sylItems = day.syllables.map(s => extractPath(s.audioUrl));
                  const pwItems = (day.practiceWords || []).map(w => extractPath(w.audioUrl));
                  const readItems = (day.culminatingReading?.lines || []).map(l => extractPath(l.audioUrl));
                  const allDay = [...sylItems, ...pwItems, ...readItems];
                  return (
                    <Section key={day.day} title={`Day ${day.day}: ${day.title}`}
                      count={allDay.length} done={countDone(allDay)}>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-1 mb-1">Syllables</p>
                      {day.syllables.map((s, i) => {
                        const p = extractPath(s.audioUrl);
                        return <Slot key={`s${day.day}-${i}`} hebrew={s.hebrew} translit={s.transliteration}
                          folder={p.folder} filename={p.filename} existingAudio={s.audioUrl}
                          isUploaded={check(p.folder, p.filename)} onUpload={mark} />;
                      })}
                      {day.practiceWords && day.practiceWords.length > 0 && (
                        <>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-1 mt-3 mb-1">Practice Words</p>
                          {day.practiceWords.map((w, i) => {
                            const p = extractPath(w.audioUrl);
                            return <Slot key={`pw${day.day}-${i}`} hebrew={w.hebrew} translit={`${w.transliteration} — ${w.translation}`}
                              folder={p.folder} filename={p.filename} existingAudio={w.audioUrl}
                              isUploaded={check(p.folder, p.filename)} onUpload={mark} />;
                          })}
                        </>
                      )}
                      {day.culminatingReading && day.culminatingReading.lines.length > 0 && (
                        <>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider ml-1 mt-3 mb-1">Reading: {day.culminatingReading.title}</p>
                          {day.culminatingReading.lines.map((line, i) => {
                            const p = extractPath(line.audioUrl);
                            return <Slot key={`r${day.day}-${i}`} hebrew={line.hebrew} translit={line.transliteration}
                              folder={p.folder} filename={p.filename} existingAudio={line.audioUrl}
                              isUploaded={check(p.folder, p.filename)} onUpload={mark} />;
                          })}
                        </>
                      )}
                    </Section>
                  );
                })}
                <Section title="Vocabulary Words" count={BOOTCAMP_VOCAB.length} done={countDone(vocabItems)}>
                  {BOOTCAMP_VOCAB.map(w => {
                    const p = extractPath(w.audioUrl);
                    return <Slot key={w.id} hebrew={w.hebrew} translit={`${w.transliteration} — ${w.translation}`}
                      folder={p.folder} filename={p.filename} existingAudio={w.audioUrl}
                      isUploaded={check(p.folder, p.filename)} onUpload={mark} />;
                  })}
                </Section>
              </>
            )}

            {/* ─── Davening Tab ─── */}
            {tab === 'davening' && (
              <>
                {tefillah.map(prayer => {
                  const pItems = prayer.sections.map(s => ({ folder: `prayers/${prayer.id}`, filename: s.id }));
                  return (
                    <Section key={prayer.id} title={`${prayer.nameEnglish}`}
                      count={pItems.length} done={countDone(pItems)}>
                      <p className="text-xs text-gray-400 italic mb-2 ml-1">{prayer.whenSaid}</p>
                      {prayer.sections.map(s => (
                        <Slot key={s.id} hebrew={s.hebrewText} translit={s.transliteration}
                          label={prayer.nameHebrew}
                          folder={`prayers/${prayer.id}`} filename={s.id}
                          existingAudio={`/audio/prayers/${prayer.id}/${s.id}.mp3`}
                          isUploaded={check(`prayers/${prayer.id}`, s.id)} onUpload={mark} />
                      ))}
                    </Section>
                  );
                })}

                {/* Kaddish Section */}
                <h3 className="text-xs font-bold text-[#1B4965] uppercase tracking-wider mb-3 mt-6">Kaddish</h3>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-sm text-amber-800">
                  <strong>Important:</strong> Kaddish is only said with a minyan (10 men). The <span className="inline-block bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Chazzan says</span> parts
                  are read by the prayer leader. The <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Everyone answers</span> parts
                  are the congregation&apos;s response.
                </div>
                {kaddishPrayers.map(prayer => {
                  const pItems = prayer.sections.map(s => ({ folder: `prayers/${prayer.id}`, filename: s.id }));
                  return (
                    <Section key={prayer.id} title={`${prayer.nameEnglish} — ${prayer.nameHebrew}`}
                      count={pItems.length} done={countDone(pItems)} defaultOpen>
                      <p className="text-xs text-gray-400 italic mb-2 ml-1">{prayer.whySaid}</p>
                      {prayer.sections.map(s => {
                        const role = s.amud?.role;
                        const congResponse = s.amud?.congregationResponse;
                        const badge: 'chazzan' | 'congregation' | 'response' | undefined =
                          role === 'congregation' ? 'congregation' :
                          role === 'shaliach_tzibbur' ? 'chazzan' : undefined;
                        return (
                          <div key={s.id}>
                            <Slot hebrew={s.hebrewText} translit={s.transliteration}
                              label={prayer.nameHebrew} badge={badge}
                              folder={`prayers/${prayer.id}`} filename={s.id}
                              existingAudio={`/audio/prayers/${prayer.id}/${s.id}.mp3`}
                              isUploaded={check(`prayers/${prayer.id}`, s.id)} onUpload={mark} />
                            {congResponse && (
                              <div className="ml-6 mt-1 mb-2 flex items-center gap-2 text-sm">
                                <span className="inline-block bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Congregation responds</span>
                                <span className="font-['Noto_Serif_Hebrew'] text-[#1A1A2E]" dir="rtl">{congResponse}</span>
                                {s.amud?.congregationResponseTransliteration && (
                                  <span className="text-gray-400 text-xs">({s.amud.congregationResponseTransliteration})</span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </Section>
                  );
                })}
              </>
            )}

            {/* ─── Brachot Tab ─── */}
            {tab === 'brachot' && (
              <>
                <h3 className="text-xs font-bold text-[#1B4965] uppercase tracking-wider mb-3">Before Eating</h3>
                {brachotBefore.map(b => {
                  const bItems = b.sections.map(s => ({ folder: `prayers/${b.id}`, filename: s.id }));
                  return (
                    <Section key={b.id} title={`${b.nameEnglish}`}
                      count={bItems.length} done={countDone(bItems)}>
                      <p className="text-xs text-gray-400 italic mb-2 ml-1">{b.whenSaid}</p>
                      {b.sections.map(s => (
                        <Slot key={s.id} hebrew={s.hebrewText} translit={s.transliteration}
                          folder={`prayers/${b.id}`} filename={s.id}
                          existingAudio={`/audio/prayers/${b.id}/${s.id}.mp3`}
                          isUploaded={check(`prayers/${b.id}`, s.id)} onUpload={mark} />
                      ))}
                    </Section>
                  );
                })}

                <h3 className="text-xs font-bold text-[#1B4965] uppercase tracking-wider mb-3 mt-6">After Eating</h3>
                {brachotAfter.map(b => {
                  const bItems = b.sections.map(s => ({ folder: `prayers/${b.id}`, filename: s.id }));
                  return (
                    <Section key={b.id} title={`${b.nameEnglish}`}
                      count={bItems.length} done={countDone(bItems)} defaultOpen>
                      <p className="text-xs text-gray-400 italic mb-2 ml-1">{b.whenSaid}</p>
                      {b.sections.map(s => (
                        <Slot key={s.id} hebrew={s.hebrewText} translit={s.transliteration}
                          folder={`prayers/${b.id}`} filename={s.id}
                          existingAudio={`/audio/prayers/${b.id}/${s.id}.mp3`}
                          isUploaded={check(`prayers/${b.id}`, s.id)} onUpload={mark} />
                      ))}
                    </Section>
                  );
                })}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
