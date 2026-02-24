'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/stores/userStore';
import { AudioSourcePicker } from './AudioSourcePicker';
import type { AudioSourceId, PrayerAudioEntry } from '@/lib/content/audio-sources';

interface PrayerSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    prayerId: string;
    selectedAudioSource: AudioSourceId;
    onSelectAudioSource: (sourceId: AudioSourceId, entry: PrayerAudioEntry | null) => void;
    autoAdvanceEnabled: boolean;
    onToggleAutoAdvance: () => void;
    viewMode: 'section' | 'full';
    onChangeViewMode: (mode: 'section' | 'full') => void;
    showProgressSidebar: boolean;
    onToggleProgressSidebar: () => void;
}

export function PrayerSettingsModal({
    isOpen,
    onClose,
    prayerId,
    selectedAudioSource,
    onSelectAudioSource,
    autoAdvanceEnabled,
    onToggleAutoAdvance,
    viewMode,
    onChangeViewMode,
    showProgressSidebar,
    onToggleProgressSidebar
}: PrayerSettingsModalProps) {
    const displaySettings = useUserStore((s) => s.displaySettings);
    const updateDisplaySettings = useUserStore((s) => s.updateDisplaySettings);

    const TOGGLES = [
        { key: 'showTransliteration' as const, label: 'Transliteration', desc: 'Romanized pronunciation under each line' },
        { key: 'showTranslation' as const, label: 'English Translation', desc: 'English meaning of the words' },
        { key: 'showInstructions' as const, label: 'Instructions & Tips', desc: 'Context about when and why we say this' },
        { key: 'showAmudCues' as const, label: 'Amud/Chazan Cues', desc: 'Who says what — leader vs. congregation' },
    ];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 z-[60]"
            />

            {/* Modal */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-[70] bg-background rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
            >
                {/* Handle bar */}
                <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Customize Your Reader</h2>
                        <p className="text-[11px] text-gray-400 mt-0.5">Change how you read, listen, and follow along</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

                    {/* View Modes */}
                    <section className="space-y-3">
                        <div>
                            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">How to Read</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">Choose how the prayer is presented</p>
                        </div>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => onChangeViewMode('section')}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${viewMode === 'section' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Section by Section
                            </button>
                            <button
                                onClick={() => onChangeViewMode('full')}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${viewMode === 'full' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Full Prayer
                            </button>
                        </div>
                        <p className="text-[11px] text-gray-400 px-1">
                            {viewMode === 'section'
                                ? 'Focus on one section at a time. Audio plays each section, then moves to the next.'
                                : 'See the entire prayer. Audio plays through and the view scrolls to follow.'}
                        </p>

                        <button
                            onClick={onToggleProgressSidebar}
                            className={`w-full py-3 rounded-xl border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${showProgressSidebar ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600'
                                }`}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 6h16M4 12h16M4 18h7" />
                            </svg>
                            {showProgressSidebar ? 'Hide Outline' : 'Show Outline'}
                        </button>
                    </section>

                    {/* Audio Setup */}
                    <section className="space-y-3">
                        <div>
                            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Audio</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">Pick a voice and control playback</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Voice</span>
                                    <span className="text-[11px] text-gray-400">Switch between AI and recorded voices</span>
                                </div>
                                <AudioSourcePicker
                                    prayerId={prayerId}
                                    selectedSource={selectedAudioSource}
                                    onSelectSource={onSelectAudioSource}
                                />
                            </div>

                            <div className="w-full h-px bg-gray-100" />

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-medium text-gray-700 block">Auto-Advance</span>
                                    <span className="text-[11px] text-gray-400">Audio plays through every section, scrolling as it goes</span>
                                </div>
                                <button
                                    onClick={onToggleAutoAdvance}
                                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-3 ${autoAdvanceEnabled ? 'bg-success' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoAdvanceEnabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Display Settings */}
                    <section className="space-y-3">
                        <div>
                            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Display Layers</h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">Show or hide text layers under the Hebrew</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-100 shadow-sm">
                            {TOGGLES.map(({ key, label, desc }) => {
                                const isOn = displaySettings[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => updateDisplaySettings({ [key]: !isOn })}
                                        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <div className="text-left">
                                            <span className="text-sm font-medium text-gray-700 block">{label}</span>
                                            <span className="text-[11px] text-gray-400">{desc}</span>
                                        </div>
                                        <div
                                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ml-3 ${isOn ? 'bg-primary' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${isOn ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                            />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* What's Included */}
                    <section className="space-y-3 pb-6">
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">What&apos;s Included</h3>
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                            {[
                                { label: 'Audio for every prayer', desc: 'AI voice + multiple recorded voices', color: 'bg-primary' },
                                { label: 'Auto-scroll & advance', desc: 'Plays through each section hands-free', color: 'bg-success' },
                                { label: 'Transliteration & translation', desc: 'Read along in English, toggle on/off', color: 'bg-primary-light' },
                                { label: 'Coach mode', desc: 'Tap the Coach button to learn step by step', color: 'bg-gold' },
                            ].map((f) => (
                                <div key={f.label} className="flex items-start gap-2.5">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${f.color}`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">{f.label}</p>
                                        <p className="text-[11px] text-gray-400">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </motion.div>
        </>
    );
}
