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
        { key: 'showTransliteration' as const, label: 'Transliteration' },
        { key: 'showTranslation' as const, label: 'English Translation' },
        { key: 'showInstructions' as const, label: 'Instructions & Tips' },
        { key: 'showAmudCues' as const, label: 'Amud/Chazan Cues' },
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
                    <h2 className="text-lg font-bold text-foreground">Settings</h2>
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
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                    {/* View Modes */}
                    <section className="space-y-3">
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">View Mode</h3>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => onChangeViewMode('section')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${viewMode === 'section' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                Section by Section
                            </button>
                            <button
                                onClick={() => onChangeViewMode('full')}
                                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${viewMode === 'full' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                                    }`}
                            >
                                View Full
                            </button>
                        </div>

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
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Audio Setup</h3>
                        <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Audio Voice</span>
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
                                    <span className="text-xs text-gray-400">Play next section automatically</span>
                                </div>
                                <button
                                    onClick={onToggleAutoAdvance}
                                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${autoAdvanceEnabled ? 'bg-success' : 'bg-gray-300'
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
                    <section className="space-y-3 pb-6">
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Display Options</h3>
                        <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-100 shadow-sm">
                            {TOGGLES.map(({ key, label }) => {
                                const isOn = displaySettings[key];
                                return (
                                    <button
                                        key={key}
                                        onClick={() => updateDisplaySettings({ [key]: !isOn })}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                        <div
                                            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${isOn ? 'bg-primary' : 'bg-gray-300'
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

                </div>
            </motion.div>
        </>
    );
}
