'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { LETTERS } from '@/lib/content/letters';
import { LetterCard } from '@/components/learn/LetterCard';
import { AudioButton } from '@/components/ui/AudioButton';
import { SpeedPill } from '@/components/ui/SpeedPill';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MilestoneToast } from '@/components/ui/MilestoneToast';
import { track } from '@/lib/analytics';
import type { Letter, MilestoneType, Pronunciation } from '@/types';

const PRONUNCIATION_SUFFIX: Record<Pronunciation, string> = {
  modern: '',
  american: '-american',
};

// Group letters into lessons of 3
const LESSON_SIZE = 3;
function getLessonLetters(lessonIndex: number): Letter[] {
  const start = lessonIndex * LESSON_SIZE;
  return LETTERS.slice(start, start + LESSON_SIZE);
}

const totalLessons = Math.ceil(LETTERS.length / LESSON_SIZE);

type Phase = 'teach' | 'drill' | 'complete';

export default function LearnPage() {
  const router = useRouter();
  const pronunciation = useUserStore((s) => s.profile.pronunciation);
  const learnSession = useUserStore((s) => s.learnSession);
  const saveLearnSession = useUserStore((s) => s.saveLearnSession);
  const clearLearnSession = useUserStore((s) => s.clearLearnSession);
  const skillProgress = useUserStore((s) => s.skillProgress);

  const [currentLesson, setCurrentLesson] = useState(0);
  const [phase, setPhase] = useState<Phase>('teach');
  const [teachIndex, setTeachIndex] = useState(0);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillScore, setDrillScore] = useState(0);
  const [drillTotal, setDrillTotal] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [milestone, setMilestone] = useState<MilestoneType | null>(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for saved session on mount
  useEffect(() => {
    if (learnSession && learnSession.phase !== 'complete') {
      setShowResumePrompt(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const resumeSession = () => {
    if (learnSession) {
      setCurrentLesson(learnSession.currentLesson);
      setPhase(learnSession.phase === 'complete' ? 'teach' : learnSession.phase);
      setTeachIndex(learnSession.teachIndex);
      setDrillIndex(learnSession.drillIndex);
      setDrillScore(learnSession.drillScore);
      track({ eventType: 'lesson_start', eventCategory: 'learning', lessonId: String(learnSession.currentLesson) });
    }
    setShowResumePrompt(false);
  };

  const startFresh = () => {
    clearLearnSession();
    setShowResumePrompt(false);
  };

  // Save session state on meaningful changes
  useEffect(() => {
    if (phase !== 'complete' && !showResumePrompt) {
      saveLearnSession({
        currentLesson,
        phase: phase as 'teach' | 'drill' | 'complete',
        teachIndex,
        drillIndex,
        drillScore,
        savedAt: new Date().toISOString(),
      });
    }
  }, [currentLesson, phase, teachIndex, drillIndex, drillScore, showResumePrompt, saveLearnSession]);

  const updateSkillProgress = useUserStore((s) => s.updateSkillProgress);
  const recordPractice = useUserStore((s) => s.recordPractice);
  const checkAndUpdateStreak = useUserStore((s) => s.checkAndUpdateStreak);
  const earnMilestone = useUserStore((s) => s.earnMilestone);
  const hasMilestone = useUserStore((s) => s.hasMilestone);

  const lessonLetters = useMemo(() => getLessonLetters(currentLesson), [currentLesson]);
  const currentTeachLetter = lessonLetters[teachIndex];

  // Generate drill question — depends only on stable values so options don't reshuffle on re-render
  const [drillCorrectLetter, setDrillCorrectLetter] = useState(lessonLetters[0] || LETTERS[0]);
  const [drillOptions, setDrillOptions] = useState<Letter[]>([]);

  useEffect(() => {
    const letters = getLessonLetters(currentLesson);
    const correct = letters[drillIndex % letters.length];
    if (!correct) return;
    const others = LETTERS.filter((l) => l.id !== correct.id);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...shuffled, correct].sort(() => Math.random() - 0.5);
    setDrillCorrectLetter(correct);
    setDrillOptions(options);
  }, [currentLesson, drillIndex]); // stable deps — no array reference, no reshuffling

  // Back navigation
  const handleBack = () => {
    if (phase === 'teach') {
      if (teachIndex > 0) {
        setTeachIndex(teachIndex - 1);
      } else {
        router.push('/hebrew');
      }
    } else if (phase === 'drill') {
      setPhase('teach');
      setTeachIndex(lessonLetters.length - 1);
    } else {
      router.push('/hebrew');
    }
  };

  // Handle teaching phase
  const handleTeachNext = () => {
    if (teachIndex < lessonLetters.length - 1) {
      setTeachIndex(teachIndex + 1);
    } else {
      setPhase('drill');
      setDrillIndex(0);
      setDrillScore(0);
      setDrillTotal(0);
    }
  };

  // Clear auto-advance timer
  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  // Continue to next question after seeing result
  const handleDrillContinue = useCallback(() => {
    clearAutoAdvance();
    setShowResult(false);
    setSelectedAnswer(null);
    setIsRetry(false);

    if (drillIndex < 8) {
      setDrillIndex(drillIndex + 1);
    } else {
      checkAndUpdateStreak();
      if (!hasMilestone('first_letter') && currentLesson === 0) {
        earnMilestone('first_letter');
        setMilestone('first_letter');
      }
      const totalMastered = (currentLesson + 1) * LESSON_SIZE;
      if (!hasMilestone('half_alephbet') && totalMastered >= 11) {
        earnMilestone('half_alephbet');
        setMilestone('half_alephbet');
      }
      if (!hasMilestone('full_alephbet') && totalMastered >= LETTERS.length) {
        earnMilestone('full_alephbet');
        setMilestone('full_alephbet');
      }
      track({ eventType: 'lesson_complete', eventCategory: 'learning', lessonId: String(currentLesson), completionPercentage: drillScore / (drillTotal + 1) });
      clearLearnSession();
      setPhase('complete');
    }
  }, [drillIndex, currentLesson, drillScore, drillTotal, checkAndUpdateStreak, hasMilestone, earnMilestone, clearLearnSession, clearAutoAdvance]);

  // Handle drill answer — auto-advances after delay
  const handleDrillAnswer = (letterId: string) => {
    if (showResult) return;
    setSelectedAnswer(letterId);
    setShowResult(true);

    const isCorrect = letterId === drillCorrectLetter.id;

    // Only count score on first attempt (not retries)
    if (!isRetry) {
      setDrillTotal(drillTotal + 1);
      if (isCorrect) setDrillScore(drillScore + 1);
      updateSkillProgress(drillCorrectLetter.id, isCorrect);
      recordPractice(isCorrect, drillTotal === 0);
    }

    // Auto-advance: 1.5s if correct, 2.5s if wrong
    clearAutoAdvance();
    autoAdvanceRef.current = setTimeout(() => {
      handleDrillContinue();
    }, isCorrect ? 1500 : 2500);
  };

  // Retry: let user try the same question again (wrong answers only)
  const handleRetry = () => {
    clearAutoAdvance();
    setShowResult(false);
    setSelectedAnswer(null);
    setIsRetry(true);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearAutoAdvance();
  }, [clearAutoAdvance]);

  // Handle lesson complete
  const handleNextLesson = () => {
    if (currentLesson < totalLessons - 1) {
      setCurrentLesson(currentLesson + 1);
      setPhase('teach');
      setTeachIndex(0);
      setDrillIndex(0);
    }
  };

  // Letters the user struggled with this lesson (< 60% accuracy)
  const strugglingLetters = lessonLetters.filter((l) => {
    const p = skillProgress[l.id];
    if (!p || p.timesPracticed < 2) return false;
    return p.timesCorrect / p.timesPracticed < 0.6;
  });

  // Resume prompt overlay
  if (showResumePrompt && learnSession) {
    const resumeLetters = getLessonLetters(learnSession.currentLesson);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 max-w-sm w-full text-center space-y-4"
        >
          <p className="text-4xl">📖</p>
          <h2 className="text-xl font-bold text-foreground">Welcome back!</h2>
          <p className="text-sm text-gray-500">
            You were on Lesson {learnSession.currentLesson + 1} — learning{' '}
            {resumeLetters.map((l) => l.name).join(', ')}
          </p>
          <div className="space-y-2 pt-2">
            <button
              onClick={resumeSession}
              className="w-full bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-[#163d55] transition-colors"
            >
              Continue Where I Left Off
            </button>
            <button
              onClick={startFresh}
              className="w-full border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:border-primary transition-colors"
            >
              Start from Beginning
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            ← Back
          </button>
          <span className="text-sm font-medium text-gray-600">
            Lesson {currentLesson + 1} of {totalLessons}
          </span>
          <div className="w-16" /> {/* spacer to balance layout */}
        </div>
        <ProgressBar
          value={
            phase === 'teach'
              ? teachIndex / lessonLetters.length * 0.3
              : phase === 'drill'
                ? 0.3 + (drillIndex / 9) * 0.7
                : 1
          }
          size="sm"
          className="max-w-md mx-auto mt-2"
        />
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* TEACH PHASE */}
          {phase === 'teach' && currentTeachLetter && (
            <motion.div
              key={`teach-${teachIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6"
            >
              <div className="text-center">
                <p className="text-sm text-primary font-medium uppercase tracking-wider">
                  New Letter
                </p>
                <h2 className="text-xl font-bold text-foreground mt-1">
                  Meet {currentTeachLetter.name}
                </h2>
              </div>

              <LetterCard letter={currentTeachLetter} isActive pronunciation={pronunciation} />

              <button
                onClick={handleTeachNext}
                className="w-full bg-primary text-white py-4 rounded-xl text-lg font-medium hover:bg-[#163d55] transition-colors"
              >
                {teachIndex < lessonLetters.length - 1 ? 'Next Letter →' : "Let's Practice! →"}
              </button>
            </motion.div>
          )}

          {/* DRILL PHASE */}
          {phase === 'drill' && (
            <motion.div
              key={`drill-${drillIndex}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-6 pb-28"
            >
              <div className="text-center">
                <p className="text-sm text-primary font-medium uppercase tracking-wider">
                  Which letter is this?
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {drillIndex + 1} of 9
                </p>
              </div>

              {/* Big letter display */}
              <div className="flex justify-center">
                <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 w-40 h-40 flex items-center justify-center">
                  <span
                    dir="rtl"
                    className="font-[var(--font-hebrew-serif)] text-7xl text-[#1A1A2E]"
                  >
                    {drillCorrectLetter.hebrew}
                  </span>
                </div>
              </div>

              {/* Audio + Speed — together for easy access */}
              <div className="flex items-center justify-center gap-3">
                <AudioButton
                  audioUrl={`/audio/letters/${drillCorrectLetter.id}${PRONUNCIATION_SUFFIX[pronunciation]}.mp3`}
                  label="Listen"
                  size="sm"
                  variant="outline"
                />
                <SpeedPill color="primary" />
              </div>

              {/* Answer options — static, no reshuffling */}
              <div className="grid grid-cols-2 gap-3">
                {drillOptions.map((letter) => {
                  const isSelected = selectedAnswer === letter.id;
                  const isCorrect = letter.id === drillCorrectLetter.id;

                  let bgClass = 'bg-white border-gray-200 hover:border-primary-light';
                  if (showResult && isSelected && isCorrect) {
                    bgClass = 'bg-success/10 border-success';
                  } else if (showResult && isSelected && !isCorrect) {
                    bgClass = 'bg-error/10 border-error';
                  } else if (showResult && isCorrect) {
                    bgClass = 'bg-success/5 border-success/50';
                  }

                  return (
                    <button
                      key={letter.id}
                      onClick={() => handleDrillAnswer(letter.id)}
                      disabled={showResult}
                      className={`
                        p-4 rounded-xl border-2 text-center transition-all duration-200
                        ${bgClass}
                        ${!showResult ? 'active:scale-95' : ''}
                      `}
                    >
                      <p className="text-lg font-semibold text-foreground">{letter.name}</p>
                      <p className="text-sm text-gray-500">{letter.sound}</p>
                      {showResult && isCorrect && (
                        <p className="text-[10px] font-bold text-success mt-1 uppercase tracking-wide">
                          {isSelected ? '✓ Correct' : 'Correct answer'}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* COMPLETE PHASE */}
          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-8"
            >
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold text-foreground">Lesson Complete!</h2>
              <p className="text-gray-600">
                You learned {lessonLetters.map((l) => l.name).join(', ')}
              </p>

              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Score</span>
                  <span className="font-bold text-primary">
                    {drillScore}/{drillTotal} ({Math.round((drillScore / Math.max(drillTotal, 1)) * 100)}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Letters learned</span>
                  <span className="font-bold text-success">
                    {lessonLetters.map((l) => l.hebrew).join(' ')}
                  </span>
                </div>
              </div>

              {/* Struggling letters — shown if user got some wrong repeatedly */}
              {strugglingLetters.length > 0 && (
                <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 text-left">
                  <p className="text-sm font-semibold text-[#8B6914] mb-2">Keep practicing:</p>
                  <div className="flex flex-wrap gap-2">
                    {strugglingLetters.map((l) => (
                      <span key={l.id} className="inline-flex items-center gap-1.5 bg-white rounded-lg px-3 py-1.5 text-sm border border-warning/20">
                        <span dir="rtl" className="font-[var(--font-hebrew-serif)] text-lg">{l.hebrew}</span>
                        <span className="text-gray-600">{l.name}</span>
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-[#8B6914]/70 mt-2">These will come up more in Practice drills.</p>
                </div>
              )}

              <div className="space-y-3">
                {currentLesson < totalLessons - 1 && (
                  <button
                    onClick={handleNextLesson}
                    className="w-full bg-primary text-white py-4 rounded-xl text-lg font-medium hover:bg-[#163d55] transition-colors"
                  >
                    Next Lesson →
                  </button>
                )}
                <button
                  onClick={() => router.push('/hebrew')}
                  className="w-full border-2 border-gray-200 text-gray-600 py-4 rounded-xl text-lg font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  Back to Hebrew
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom result bar — drill feedback */}
      <AnimatePresence>
        {phase === 'drill' && showResult && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 z-30 safe-bottom ${
              selectedAnswer === drillCorrectLetter.id
                ? 'bg-[#4A7C59]'
                : 'bg-[#C17767]'
            }`}
          >
            <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-3">
              {/* Result text */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base">
                  {selectedAnswer === drillCorrectLetter.id
                    ? '✓ Correct!'
                    : `✗ That was ${drillCorrectLetter.name} (${drillCorrectLetter.sound})`}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 shrink-0">
                {selectedAnswer !== drillCorrectLetter.id && (
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all"
                  >
                    Try Again
                  </button>
                )}
                <button
                  onClick={handleDrillContinue}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-gray-800 hover:bg-gray-100 active:scale-95 transition-all"
                >
                  {drillIndex < 8 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Toast */}
      <MilestoneToast milestone={milestone} onClose={() => setMilestone(null)} />
    </div>
  );
}
