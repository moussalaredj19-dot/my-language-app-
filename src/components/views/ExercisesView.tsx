import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Languages,
  Link2,
  Loader2,
  Lock,
  Mic,
  MicOff,
  PenTool,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import AlphabetLab from '../AlphabetLab';
import InteractiveSprint from '../InteractiveSprint';
import TalkingAvatar from '../TalkingAvatar';
import { getStagesForLevel, getStarterContent } from '../../data/curriculum';
import { getLanguageByName, PROFICIENCY_LEVELS } from '../../data/languages';
import { playFeedbackSound } from '../../lib/sound';
import {
  computeWordSimilarity,
  createSpeechRecognizer,
  speakText,
  SpeechRecognitionLike,
} from '../../lib/speech';
import {
  ExerciseMode,
  ExercisePack,
  LessonProgressRecord,
  StageDefinition,
  UserProfile,
} from '../../types';

interface ExercisesViewProps {
  profile: UserProfile;
  completedStages: Record<string, LessonProgressRecord>;
  onCompleteStage: (stage: StageDefinition, scopedStageId: string) => Promise<void>;
  onExerciseCompleted: (
    skill: 'writing' | 'speaking' | 'reading' | 'listening' | 'vocabulary',
    xp: number
  ) => Promise<void>;
}

const EMPTY_PACK: ExercisePack = {
  wordWriting: [],
  writing: [],
  speaking: [],
  fillBlanks: [],
  matching: [],
  reading: {
    title: '',
    paragraph: '',
    translation: '',
    question: '',
    options: [],
    correctIndex: 0,
  },
};

export function makeScopedStageId(targetLanguage: string, stageId: string): string {
  const langId = getLanguageByName(targetLanguage).id;
  return `${langId}-${stageId}`.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
}

export default function ExercisesView({
  profile,
  completedStages,
  onCompleteStage,
  onExerciseCompleted,
}: ExercisesViewProps) {
  const stages = useMemo(
    () => getStagesForLevel(profile.targetLanguage, profile.level),
    [profile.targetLanguage, profile.level]
  );

  const initialStarter = getStarterContent(profile.targetLanguage, profile.level);
  const [pack, setPack] = useState<ExercisePack>(initialStarter?.exercises || EMPTY_PACK);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [mode, setMode] = useState<ExerciseMode>(stages[0]?.mode || 'sprint');
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [completingStage, setCompletingStage] = useState(false);

  // Track if user practiced inside the currently active stage
  const [stagePracticed, setStagePracticed] = useState(false);

  // Writing sub-mode: Word writing & meaning explanation vs Sentence writing
  const [writingSubMode, setWritingSubMode] = useState<'words' | 'sentences'>(
    profile.level <= 2 ? 'words' : 'sentences'
  );
  const [wordWriteIdx, setWordWriteIdx] = useState(0);
  const [wordWriteInput, setWordWriteInput] = useState('');
  const [wordWriteStatus, setWordWriteStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [hideWordModel, setHideWordModel] = useState(false);

  // Sentence writing state
  const [writeIdx, setWriteIdx] = useState(0);
  const [writeInput, setWriteInput] = useState('');
  const [writeEval, setWriteEval] = useState<{
    score: number;
    isCorrect: boolean;
    correctedText: string;
    feedback: string;
    tip: string;
  } | null>(null);
  const [evaluatingWrite, setEvaluatingWrite] = useState(false);

  // Speaking state
  const [speakIdx, setSpeakIdx] = useState(0);
  const [isRecordingSpeak, setIsRecordingSpeak] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [speakScore, setSpeakScore] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognitionLike | null>(null);

  // Fill-in-the-blank state
  const [blankIdx, setBlankIdx] = useState(0);
  const [selectedBlankOpt, setSelectedBlankOpt] = useState<string | null>(null);

  // Matching state
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedTargets, setMatchedTargets] = useState<Record<string, boolean>>({});
  const [wrongFlash, setWrongFlash] = useState(false);

  // Reading & Voice Shadowing state
  const [showReadingTranslation, setShowReadingTranslation] = useState(false);
  const [readingAnswerIdx, setReadingAnswerIdx] = useState<number | null>(null);
  const [isRecordingReading, setIsRecordingReading] = useState(false);
  const [readingSpoken, setReadingSpoken] = useState('');
  const [readingShadowResult, setReadingShadowResult] = useState<{
    score: number;
    matchedWords: string[];
    missedWords: string[];
  } | null>(null);

  const highestUnlockedIdx = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < stages.length; i++) {
      const scopedId = makeScopedStageId(profile.targetLanguage, stages[i].id);
      if (completedStages[scopedId]?.status === 'completed') {
        idx = Math.min(stages.length - 1, i + 1);
      } else {
        break;
      }
    }
    return idx;
  }, [completedStages, profile.targetLanguage, stages]);

  const completedInCurrentLevel = useMemo(() => {
    return stages.filter((s) => {
      const scopedId = makeScopedStageId(profile.targetLanguage, s.id);
      return completedStages[scopedId]?.status === 'completed';
    }).length;
  }, [completedStages, profile.targetLanguage, stages]);

  const activeStage = stages[activeStageIdx] || stages[0];
  const activeScopedId = activeStage
    ? makeScopedStageId(profile.targetLanguage, activeStage.id)
    : '';
  const isActiveStageDone = Boolean(
    activeScopedId && completedStages[activeScopedId]?.status === 'completed'
  );

  const resetExerciseStates = useCallback(() => {
    setWordWriteIdx(0);
    setWordWriteInput('');
    setWordWriteStatus('idle');
    setWriteIdx(0);
    setWriteInput('');
    setWriteEval(null);
    setSpeakIdx(0);
    setSpokenText('');
    setSpeakScore(null);
    setBlankIdx(0);
    setSelectedBlankOpt(null);
    setMatchedTargets({});
    setSelectedLeft(null);
    setReadingAnswerIdx(null);
    setReadingSpoken('');
    setReadingShadowResult(null);
  }, []);

  const handleGeneratePack = useCallback(async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch('/api/ai/exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nativeLanguage: profile.nativeLanguage,
          targetLanguage: profile.targetLanguage,
          level: profile.level,
          purpose: profile.purpose,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تعذر توليد التمارين.');
      setPack(data);
      resetExerciseStates();
      playFeedbackSound('success', profile.soundEnabled);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'تعذر توليد التمارين.');
    } finally {
      setGenerating(false);
    }
  }, [profile.level, profile.nativeLanguage, profile.purpose, profile.soundEnabled, profile.targetLanguage, resetExerciseStates]);

  useEffect(() => {
    const fresh = getStarterContent(profile.targetLanguage, profile.level);
    const nextStages = getStagesForLevel(profile.targetLanguage, profile.level);
    setActiveStageIdx(0);
    setMode(nextStages[0]?.mode || 'sprint');
    setWritingSubMode(nextStages[0]?.writingSubMode || (profile.level <= 2 ? 'words' : 'sentences'));
    setStagePracticed(false);
    resetExerciseStates();
    if (fresh) {
      setPack(fresh.exercises);
      setGenError(null);
    } else {
      setPack(EMPTY_PACK);
      void handleGeneratePack();
    }
  }, [profile.targetLanguage, profile.level, resetExerciseStates, handleGeneratePack]);

  const handleSelectStage = (idx: number) => {
    if (idx > highestUnlockedIdx) return;
    const st = stages[idx];
    if (!st) return;
    setActiveStageIdx(idx);
    setMode(st.mode);
    if (st.writingSubMode) {
      setWritingSubMode(st.writingSubMode);
    }
    setStagePracticed(false);
    playFeedbackSound('tap', profile.soundEnabled);
  };

  const handleFinishActiveStage = async () => {
    if (!activeStage || completingStage) return;
    setCompletingStage(true);
    try {
      await onCompleteStage(activeStage, activeScopedId);
      playFeedbackSound('levelup', profile.soundEnabled);
      if (activeStageIdx + 1 < stages.length) {
        const nextIdx = activeStageIdx + 1;
        const nextStage = stages[nextIdx];
        setActiveStageIdx(nextIdx);
        setMode(nextStage.mode);
        if (nextStage.writingSubMode) {
          setWritingSubMode(nextStage.writingSubMode);
        }
        setStagePracticed(false);
      }
    } finally {
      setCompletingStage(false);
    }
  };

  const recordExerciseSuccess = async (
    skill: 'writing' | 'speaking' | 'reading' | 'listening' | 'vocabulary',
    xp: number
  ) => {
    setStagePracticed(true);
    await onExerciseCompleted(skill, xp);
  };

  const shuffledNativeMatching = useMemo(() => {
    return [...(pack.matching || [])].sort((a, b) => a.native.localeCompare(b.native));
  }, [pack.matching]);

  const activeWordItem = (pack.wordWriting || [])[wordWriteIdx] || (pack.wordWriting || [])[0];
  const wordHelperChars = useMemo(() => {
    if (!activeWordItem?.word) return [];
    const chars = Array.from(activeWordItem.word.replace(/\s+/g, ''));
    const unique = Array.from(new Set(chars));
    return unique.sort((a, b) => a.localeCompare(b));
  }, [activeWordItem]);

  const handleCheckWordWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWordItem || !wordWriteInput.trim()) return;
    const cleanUser = wordWriteInput.trim().toLowerCase().replace(/[.,!?؟،]/g, '');
    const cleanTarget = activeWordItem.word.trim().toLowerCase().replace(/[.,!?؟،]/g, '');
    if (cleanUser === cleanTarget) {
      setWordWriteStatus('correct');
      playFeedbackSound('success', profile.soundEnabled);
      speakText(activeWordItem.word, profile.targetLanguage, profile.speechRate);
      await recordExerciseSuccess('writing', 20);
    } else {
      setWordWriteStatus('wrong');
      playFeedbackSound('error', profile.soundEnabled);
    }
  };

  const activeWriting = (pack.writing || [])[writeIdx] || (pack.writing || [])[0];
  const handleCheckWriting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writeInput.trim() || !activeWriting) return;
    setEvaluatingWrite(true);
    setGenError(null);
    try {
      const res = await fetch('/api/ai/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nativeLanguage: profile.nativeLanguage,
          targetLanguage: profile.targetLanguage,
          level: profile.level,
          promptText: activeWriting.prompt,
          expectedAnswer: activeWriting.expected,
          userAnswer: writeInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تعذر التقييم.');
      setWriteEval(data);
      if (data.isCorrect || data.score >= 70) {
        playFeedbackSound('success', profile.soundEnabled);
        await recordExerciseSuccess('writing', 25);
      } else {
        playFeedbackSound('error', profile.soundEnabled);
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'تعذر تقييم الكتابة.');
    } finally {
      setEvaluatingWrite(false);
    }
  };

  const activeSpeaking = (pack.speaking || [])[speakIdx] || (pack.speaking || [])[0];
  const startSpeechRecognition = (
    expectedPhrase: string,
    onUpdate: (
      transcript: string,
      result: { score: number; matchedWords: string[]; missedWords: string[] }
    ) => void,
    setRecording: (b: boolean) => void
  ) => {
    setMicError(null);
    const rec = createSpeechRecognizer(profile.targetLanguage);
    if (!rec) {
      setMicError(
        'متصفحك لا يدعم التعرف الصوتي التلقائي. استمع للنطق النموذجي من الأفاتار ثم سجّل إتمام التدريب.'
      );
      return;
    }

    recognizerRef.current = rec;
    setRecording(true);
    let latestTranscript = '';

    rec.onresult = (ev) => {
      const lastIdx = ev.results.length - 1;
      latestTranscript = ev.results[lastIdx][0].transcript;
      const similarity = computeWordSimilarity(expectedPhrase, latestTranscript);
      onUpdate(latestTranscript, similarity);
    };

    rec.onerror = (ev) => {
      setMicError(`تعذر استخدام الميكروفون (${ev.error}). تأكد من منح إذن الميكروفون.`);
      setRecording(false);
    };

    rec.onend = () => {
      setRecording(false);
      if (latestTranscript) {
        const similarity = computeWordSimilarity(expectedPhrase, latestTranscript);
        if (similarity.score >= 60) {
          playFeedbackSound('success', profile.soundEnabled);
          void recordExerciseSuccess('speaking', 25);
        }
      }
    };

    rec.start();
  };

  const stopSpeechRecognition = () => {
    recognizerRef.current?.stop();
    setIsRecordingSpeak(false);
    setIsRecordingReading(false);
  };

  const activeBlank = (pack.fillBlanks || [])[blankIdx] || (pack.fillBlanks || [])[0];
  const handleSelectBlank = async (opt: string) => {
    setSelectedBlankOpt(opt);
    if (opt === activeBlank?.correct) {
      playFeedbackSound('success', profile.soundEnabled);
      await recordExerciseSuccess('vocabulary', 15);
    } else {
      playFeedbackSound('error', profile.soundEnabled);
    }
  };

  const handleTapNativeMatch = async (nativeWord: string) => {
    if (!selectedLeft) return;
    const pair = pack.matching.find((p) => p.target === selectedLeft);
    if (pair && pair.native === nativeWord) {
      const next = { ...matchedTargets, [selectedLeft]: true };
      setMatchedTargets(next);
      setSelectedLeft(null);
      playFeedbackSound('success', profile.soundEnabled);
      if (Object.keys(next).length === pack.matching.length) {
        await recordExerciseSuccess('vocabulary', 30);
      }
    } else {
      setWrongFlash(true);
      playFeedbackSound('error', profile.soundEnabled);
      setTimeout(() => setWrongFlash(false), 450);
    }
  };

  const levelMeta = PROFICIENCY_LEVELS.find((l) => l.level === profile.level);

  const stageIcons: Record<ExerciseMode, typeof PenTool> = {
    alphabet: Languages,
    sprint: Zap,
    writing: PenTool,
    speaking: Mic,
    fillBlank: Sparkles,
    matching: Link2,
    reading: BookOpen,
  };

  const tabs: { id: ExerciseMode; label: string; icon: typeof PenTool; activeCls: string }[] = [
    ...(profile.level === 1
      ? [
          {
            id: 'alphabet' as ExerciseMode,
            label: 'الحروف والنطق',
            icon: Languages,
            activeCls: 'bg-gradient-to-l from-teal-600 to-emerald-600 text-white shadow-sm',
          },
        ]
      : []),
    {
      id: 'sprint',
      label: 'الجولة السريعة',
      icon: Zap,
      activeCls: 'bg-gradient-to-l from-emerald-600 to-sky-600 text-white shadow-sm',
    },
    {
      id: 'writing',
      label: 'كتابي (كلمات وجمل)',
      icon: PenTool,
      activeCls: 'bg-violet-600 text-white shadow-sm',
    },
    { id: 'speaking', label: 'شفهي', icon: Mic, activeCls: 'bg-sky-600 text-white shadow-sm' },
    { id: 'fillBlank', label: 'ملئ الفراغات', icon: Sparkles, activeCls: 'bg-amber-500 text-white shadow-sm' },
    { id: 'matching', label: 'ربط الكلمات', icon: Link2, activeCls: 'bg-indigo-600 text-white shadow-sm' },
    { id: 'reading', label: 'قراءة بالوسيلة الصوتية', icon: BookOpen, activeCls: 'bg-rose-600 text-white shadow-sm' },
  ];

  const windingOffsets = [
    'translate-x-0',
    'sm:-translate-x-10 -translate-x-5',
    'sm:translate-x-10 translate-x-5',
    'translate-x-0',
    'sm:-translate-x-8 -translate-x-4',
    'translate-x-0',
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-gradient-to-l from-violet-600/10 via-white to-emerald-600/10 dark:from-violet-950/30 dark:via-slate-900 dark:to-emerald-950/30 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            مسار المراحل والتمارين — {profile.targetLanguage}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            المستوى {profile.level} ({profile.levelLabel}) · {levelMeta?.curriculumFocus}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleGeneratePack()}
          disabled={generating}
          className="min-h-[44px] px-4 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0 active:translate-y-0.5"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          <span>{generating ? 'جاري التوليد...' : 'توليد حزمة تمارين جديدة'}</span>
        </button>
      </div>

      {/* Sequential Stage Path (Step-by-Step Progression, Zero Brand Mentions) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>مسار المراحل المتدرج (أكمل كل مرحلة لفتح التالية)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              كل مستوى يحتوي على 6 مراحل متسلسلة ومخصّصة — أنجزت{' '}
              <span className="font-mono-num font-bold text-emerald-600 dark:text-emerald-400">
                {completedInCurrentLevel} / {stages.length}
              </span>
            </p>
          </div>

          <div className="w-36 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-emerald-500 to-teal-400 transition-all duration-300"
              style={{
                width: `${Math.max(6, Math.round((completedInCurrentLevel / Math.max(1, stages.length)) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Winding Nodes */}
        <div className="relative py-2 flex flex-col items-center gap-4">
          {stages.map((st, idx) => {
            const scopedId = makeScopedStageId(profile.targetLanguage, st.id);
            const done = completedStages[scopedId]?.status === 'completed';
            const unlocked = idx <= highestUnlockedIdx;
            const currentActive = idx === activeStageIdx;
            const StageIcon = stageIcons[st.mode] || Zap;
            const offsetCls = windingOffsets[idx % windingOffsets.length];

            return (
              <div key={st.id} className={`flex flex-col items-center ${offsetCls} transition-transform`}>
                <button
                  type="button"
                  disabled={!unlocked}
                  onClick={() => handleSelectStage(idx)}
                  className={`group relative flex items-center gap-3.5 min-w-[260px] sm:min-w-[330px] p-3 rounded-2xl border-2 border-b-4 transition-all text-right ${
                    !unlocked
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/60 opacity-60 cursor-not-allowed'
                      : currentActive
                      ? 'border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-md shadow-emerald-500/15 cursor-pointer'
                      : done
                      ? 'border-teal-400 dark:border-teal-700 bg-teal-50/60 dark:bg-teal-950/25 cursor-pointer hover:border-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-emerald-500'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border-b-4 flex items-center justify-center shrink-0 font-extrabold text-sm ${
                      !unlocked
                        ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                        : done
                        ? 'bg-emerald-500 border-emerald-700 text-white'
                        : currentActive
                        ? 'bg-[#081B3E] dark:bg-emerald-500 border-slate-950 dark:border-emerald-700 text-white dark:text-slate-950'
                        : 'bg-sky-500 border-sky-700 text-white'
                    }`}
                  >
                    {!unlocked ? (
                      <Lock className="w-5 h-5" />
                    ) : done ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <StageIcon className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono-num font-bold text-emerald-700 dark:text-emerald-300">
                        المرحلة {st.order} · +{st.xpReward} XP
                      </span>
                      {currentActive && !done && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <Play className="w-3 h-3 fill-current" />
                          <span>نشطة</span>
                        </span>
                      )}
                    </div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                      {st.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {st.subtitle}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Stage Completion Bar */}
        {activeStage && (
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                المرحلة الحالية: {activeStage.order} — {activeStage.title}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isActiveStageDone
                  ? 'أكملت هذه المرحلة بنجاح! يمكنك إعادتها أو الانتقال للمرحلة التالية.'
                  : stagePracticed
                  ? 'عمل رائع! يمكنك الآن تثبيت إتمام المرحلة وفتح المرحلة التالية.'
                  : 'نفّذ التمرين بالأسفل ثم اضغط "إتمام المرحلة" لفتح المرحلة التالية.'}
              </div>
            </div>
            <button
              type="button"
              disabled={completingStage}
              onClick={() => void handleFinishActiveStage()}
              className="min-h-[44px] px-5 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shrink-0 cursor-pointer active:translate-y-0.5 disabled:opacity-60"
            >
              {completingStage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>
                {isActiveStageDone
                  ? 'الانتقال للمرحلة التالية'
                  : `إتمام المرحلة (+${activeStage.xpReward} XP)`}
              </span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {genError && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-200"
        >
          {genError}
        </div>
      )}

      {/* Exercise Mode Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-200/70 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = mode === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setMode(t.id)}
              className={`min-h-[44px] px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                active
                  ? t.activeCls
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {generating && mode !== 'alphabet' && mode !== 'sprint' && pack.matching.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            جاري تجهيز تمارين {profile.targetLanguage} الخالصة للمستوى {profile.level}...
          </p>
        </div>
      )}

      {/* 0A. ALPHABET & OPPOSITE-LANGUAGE PRONUNCIATION LAB */}
      {mode === 'alphabet' && (
        <AlphabetLab
          profile={profile}
          onPracticeSuccess={async (xp) => {
            await recordExerciseSuccess('reading', xp);
          }}
        />
      )}

      {/* 0B. INTERACTIVE SPRINT */}
      {mode === 'sprint' && (
        <InteractiveSprint
          profile={profile}
          stageTitle={activeStage?.title}
          onCompleteSprint={async (xpEarned) => {
            await recordExerciseSuccess('vocabulary', xpEarned);
          }}
        />
      )}

      {/* 1. WRITING */}
      {mode === 'writing' && (
        <div className="space-y-4">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 gap-1">
            <button
              type="button"
              onClick={() => setWritingSubMode('words')}
              className={`min-h-[40px] px-4 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                writingSubMode === 'words'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              كتابة الكلمات وشرح معناها
            </button>
            <button
              type="button"
              onClick={() => setWritingSubMode('sentences')}
              className={`min-h-[40px] px-4 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                writingSubMode === 'sentences'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              كتابة الجمل والتقييم الذكي
            </button>
          </div>

          {writingSubMode === 'words' && activeWordItem && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono-num font-bold text-violet-600 dark:text-violet-400">
                  كلمة {wordWriteIdx + 1} / {pack.wordWriting.length} — المستوى {profile.level}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHideWordModel((v) => !v)}
                    className="min-h-[34px] px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    {hideWordModel ? 'إظهار الكلمة للنسخ' : 'إخفاء الكلمة (إملاء)'}
                  </button>
                  <div className="flex gap-1.5">
                    {pack.wordWriting.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setWordWriteIdx(idx);
                          setWordWriteInput('');
                          setWordWriteStatus('idle');
                        }}
                        className={`w-8 h-8 rounded-lg text-xs font-mono-num font-bold cursor-pointer ${
                          wordWriteIdx === idx
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-gradient-to-l from-violet-50 via-white to-sky-50 dark:from-violet-950/30 dark:via-slate-950 dark:to-sky-950/20 border border-violet-200 dark:border-violet-900/60 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <TalkingAvatar
                      text={activeWordItem.word}
                      languageName={profile.targetLanguage}
                      speechRate={profile.speechRate}
                      size="sm"
                      variant="violet"
                      label=""
                    />
                    <div>
                      <div className="text-xs font-bold text-violet-700 dark:text-violet-300">
                        المعنى: {activeWordItem.meaning}
                      </div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1" dir="ltr">
                        {hideWordModel ? '••••••' : activeWordItem.word}
                      </div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                        النطق باللغة المعاكسة: {activeWordItem.pronunciation}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakText(activeWordItem.word, profile.targetLanguage, profile.speechRate)}
                    className="min-h-[46px] px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>استمع للكلمة</span>
                  </button>
                </div>

                <div className="rounded-xl bg-white/80 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-3.5 space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    شرح المعنى وطريقة النطق والاستخدام:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {activeWordItem.explanation}
                  </p>
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white" dir="ltr">
                      {activeWordItem.example}
                    </span>{' '}
                    — <span className="text-slate-500 dark:text-slate-400">{activeWordItem.exampleTranslation}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => void handleCheckWordWrite(e)} className="space-y-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                  اكتب الكلمة بـ ({profile.targetLanguage}) أو اضغط على أحرفها بالأسفل:
                </label>
                <input
                  type="text"
                  dir="auto"
                  value={wordWriteInput}
                  onChange={(e) => {
                    setWordWriteInput(e.target.value);
                    setWordWriteStatus('idle');
                  }}
                  placeholder={`اكتب "${activeWordItem.meaning}" بـ ${profile.targetLanguage}...`}
                  className="w-full min-h-[50px] px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                />

                {wordHelperChars.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {wordHelperChars.map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => {
                          setWordWriteInput((prev) => prev + ch);
                          setWordWriteStatus('idle');
                        }}
                        className="min-w-[40px] min-h-[40px] px-2.5 rounded-xl border-2 border-b-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-extrabold text-slate-900 dark:text-white hover:border-violet-500 cursor-pointer active:translate-y-0.5"
                      >
                        {ch}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setWordWriteInput((prev) => prev.slice(0, -1))}
                      className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      مسح حرف
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={!wordWriteInput.trim()}
                    className="min-h-[46px] px-6 rounded-xl border-b-4 border-violet-800 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm cursor-pointer disabled:opacity-50"
                  >
                    تحقق من كتابة الكلمة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWordWriteIdx((i) => (i + 1) % Math.max(1, pack.wordWriting.length));
                      setWordWriteInput('');
                      setWordWriteStatus('idle');
                    }}
                    className="min-h-[46px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    الكلمة التالية
                  </button>
                </div>
              </form>

              {wordWriteStatus !== 'idle' && (
                <div
                  className={`rounded-xl p-3.5 text-xs font-bold flex items-center gap-2 ${
                    wordWriteStatus === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900'
                  }`}
                >
                  {wordWriteStatus === 'correct' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>
                    {wordWriteStatus === 'correct'
                      ? `ممتاز! كتبت الكلمة "${activeWordItem.word}" بشكل صحيح (+20 XP).`
                      : `الإملاء الصحيح هو: ${activeWordItem.word} (${activeWordItem.pronunciation})`}
                  </span>
                </div>
              )}
            </section>
          )}

          {(writingSubMode === 'sentences' || !activeWordItem) && activeWriting && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-num font-bold text-emerald-600 dark:text-emerald-400">
                  تمرين كتابة الجمل {writeIdx + 1} / {pack.writing.length}
                </span>
                <div className="flex gap-2">
                  {pack.writing.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setWriteIdx(idx);
                        setWriteInput('');
                        setWriteEval(null);
                      }}
                      className={`w-8 h-8 rounded-lg text-xs font-mono-num font-bold cursor-pointer ${
                        writeIdx === idx
                          ? 'bg-[#081B3E] text-white dark:bg-emerald-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeWriting.prompt}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">تلميح: {activeWriting.hint}</p>
              </div>

              <form onSubmit={(e) => void handleCheckWriting(e)} className="space-y-3">
                <textarea
                  rows={3}
                  dir="auto"
                  value={writeInput}
                  onChange={(e) => setWriteInput(e.target.value)}
                  placeholder={`اكتب الجملة بـ ${profile.targetLanguage} هنا...`}
                  className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={evaluatingWrite || !writeInput.trim()}
                  className="min-h-[48px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {evaluatingWrite && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{evaluatingWrite ? 'جاري التقييم...' : 'تحقق من الإجابة'}</span>
                </button>
              </form>

              {writeEval && (
                <div
                  className={`rounded-2xl p-4 border space-y-2 ${
                    writeEval.isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {writeEval.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-amber-600" />
                      )}
                      <span className="text-slate-900 dark:text-white">
                        النتيجة: <span className="font-mono-num">{writeEval.score}%</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(writeEval.correctedText, profile.targetLanguage, profile.speechRate)
                      }
                      className="min-h-[36px] px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>اسمع الصيغة الصحيحة</span>
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-[#081B3E] dark:text-emerald-300">
                    {writeEval.correctedText}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{writeEval.feedback}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">نصيحة: {writeEval.tip}</p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* 2. SPEAKING WITH TALKING AVATAR */}
      {mode === 'speaking' && activeSpeaking && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num font-bold text-emerald-600 dark:text-emerald-400">
              تمرين الرسالة الصوتية والنطق {speakIdx + 1} / {pack.speaking.length}
            </span>
            <div className="flex gap-2">
              {pack.speaking.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSpeakIdx(idx);
                    setSpokenText('');
                    setSpeakScore(null);
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-mono-num font-bold cursor-pointer ${
                    speakIdx === idx
                      ? 'bg-[#081B3E] text-white dark:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-900/60 p-4 sm:p-5">
            <TalkingAvatar
              text={activeSpeaking.phrase}
              languageName={profile.targetLanguage}
              speechRate={profile.speechRate}
              size="lg"
              variant="emerald"
              label="مدربك الصوتي الناطق"
              subtitle="استمع جيداً لحركة النطق ثم كرر العبارة بصوتك"
              showControls
            />
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 space-y-2 text-center">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white" dir="ltr">
              {activeSpeaking.phrase}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              النطق التقريبي: {activeSpeaking.phonetic}
            </div>
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {activeSpeaking.translation}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isRecordingSpeak) {
                  stopSpeechRecognition();
                } else {
                  startSpeechRecognition(
                    activeSpeaking.phrase,
                    (transcript, sim) => {
                      setSpokenText(transcript);
                      setSpeakScore(sim.score);
                    },
                    setIsRecordingSpeak
                  );
                }
              }}
              className={`min-h-[48px] px-6 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition-colors ${
                isRecordingSpeak
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isRecordingSpeak ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span>{isRecordingSpeak ? 'إيقاف التسجيل' : 'انطق الجملة الآن'}</span>
            </button>
          </div>

          {micError && (
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2">
              <span>{micError}</span>
              <button
                type="button"
                onClick={() => void recordExerciseSuccess('speaking', 20)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold whitespace-nowrap cursor-pointer"
              >
                تدربتُ صوتياً (+20 XP)
              </button>
            </div>
          )}

          {spokenText && speakScore !== null && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-1.5 text-center">
              <div className="text-xs text-slate-500">ما سمعه التطبيق:</div>
              <div className="text-base font-bold text-slate-900 dark:text-white">{spokenText}</div>
              <div className="text-sm font-bold font-mono-num text-emerald-600 dark:text-emerald-400">
                دقة التطابق: {speakScore}%
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3. FILL IN THE BLANKS */}
      {mode === 'fillBlank' && activeBlank && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-num font-bold text-emerald-600 dark:text-emerald-400">
              ملئ الفراغات {blankIdx + 1} / {pack.fillBlanks.length}
            </span>
            <div className="flex gap-2">
              {pack.fillBlanks.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setBlankIdx(idx);
                    setSelectedBlankOpt(null);
                  }}
                  className={`w-8 h-8 rounded-lg text-xs font-mono-num font-bold cursor-pointer ${
                    blankIdx === idx
                      ? 'bg-[#081B3E] text-white dark:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 text-center space-y-2">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {activeBlank.before}{' '}
              <span className="inline-block min-w-[90px] px-3 py-1 mx-1 rounded-lg border-b-2 border-emerald-600 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300">
                {selectedBlankOpt || '______'}
              </span>{' '}
              {activeBlank.after}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{activeBlank.translation}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeBlank.options.map((opt) => {
              const isPicked = selectedBlankOpt === opt;
              const isRight = opt === activeBlank.correct;
              let btnClass =
                'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white hover:border-emerald-500';
              if (selectedBlankOpt) {
                if (isRight)
                  btnClass =
                    'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200';
                else if (isPicked)
                  btnClass =
                    'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200';
              }
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => void handleSelectBlank(opt)}
                  className={`min-h-[50px] rounded-xl border font-bold text-sm transition-all cursor-pointer ${btnClass}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. WORD MATCHING */}
      {mode === 'matching' && pack.matching.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                اربط كل كلمة في {profile.targetLanguage} بمعناها الصحيح
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر كلمة من العمود الأول ثم اضغط على ترجمتها في العمود الثاني.
              </p>
            </div>
            <span className="font-mono-num text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {Object.keys(matchedTargets).length} / {pack.matching.length}
            </span>
          </div>

          <div className={`grid grid-cols-2 gap-4 transition-transform ${wrongFlash ? 'translate-x-1' : ''}`}>
            <div className="space-y-2.5">
              {pack.matching.map((pair) => {
                const matched = Boolean(matchedTargets[pair.target]);
                const active = selectedLeft === pair.target;
                return (
                  <button
                    key={pair.target}
                    type="button"
                    disabled={matched}
                    onClick={() => {
                      setSelectedLeft(pair.target);
                      speakText(pair.target, profile.targetLanguage, profile.speechRate);
                    }}
                    className={`w-full min-h-[54px] px-3.5 rounded-xl border text-sm font-bold flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      matched
                        ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 opacity-60'
                        : active
                        ? 'border-[#081B3E] bg-[#081B3E] text-white dark:border-emerald-500 dark:bg-emerald-600'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="text-right">
                      <div>{pair.target}</div>
                      <div className={`text-[11px] font-normal ${active ? 'text-emerald-200' : 'text-slate-400'}`}>
                        {pair.pronunciation}
                      </div>
                    </div>
                    <Volume2 className="w-4 h-4 opacity-70 shrink-0" />
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              {shuffledNativeMatching.map((pair) => {
                const matched = Boolean(matchedTargets[pair.target]);
                return (
                  <button
                    key={pair.native}
                    type="button"
                    disabled={matched || !selectedLeft}
                    onClick={() => void handleTapNativeMatch(pair.native)}
                    className={`w-full min-h-[54px] px-3.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      matched
                        ? 'border-emerald-300 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 opacity-60'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:border-emerald-500'
                    }`}
                  >
                    {pair.native}
                  </button>
                );
              })}
            </div>
          </div>

          {Object.keys(matchedTargets).length === pack.matching.length && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3.5 flex items-center justify-between">
              <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                أحسنت! تم ربط جميع الكلمات بنجاح (+30 XP).
              </span>
              <button
                type="button"
                onClick={() => {
                  setMatchedTargets({});
                  setSelectedLeft(null);
                }}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-300 underline cursor-pointer"
              >
                إعادة اللعب
              </button>
            </div>
          )}
        </section>
      )}

      {/* 5. READING PARAGRAPH & VOICE RE-READING WITH TALKING AVATAR */}
      {mode === 'reading' && pack.reading?.paragraph && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{pack.reading.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                استمع للأفاتار يقرأ الفقرة ثم أعد قراءتها بصوتك عبر الميكروفون لاختبار طلاقتك ونطقك.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowReadingTranslation((v) => !v)}
              className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer shrink-0"
            >
              {showReadingTranslation ? 'إخفاء الترجمة' : 'عرض الترجمة'}
            </button>
          </div>

          <div className="rounded-2xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-900/60 p-4">
            <TalkingAvatar
              text={pack.reading.paragraph}
              languageName={profile.targetLanguage}
              speechRate={profile.speechRate}
              size="md"
              variant="sky"
              label="راوي الفقرة الصوتية"
              subtitle="اضغط للاستماع إلى قراءة الفقرة كاملة"
              showControls
            />
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <p className="text-base sm:text-lg leading-loose font-medium text-slate-900 dark:text-white">
              {pack.reading.paragraph}
            </p>
            {showReadingTranslation && (
              <p className="text-sm text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
                {pack.reading.translation}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  إعادة قراءة الفقرة بالوسيلة الصوتية
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  اضغط لبدء القراءة بصوت مسموع وسيقارن التطبيق نطقك مع كلمات الفقرة.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isRecordingReading) {
                    stopSpeechRecognition();
                  } else {
                    startSpeechRecognition(
                      pack.reading.paragraph,
                      (transcript, sim) => {
                        setReadingSpoken(transcript);
                        setReadingShadowResult(sim);
                      },
                      setIsRecordingReading
                    );
                  }
                }}
                className={`min-h-[46px] px-5 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0 ${
                  isRecordingReading
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#081B3E] hover:bg-[#0D285B] text-white dark:bg-emerald-600'
                }`}
              >
                {isRecordingReading ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecordingReading ? 'إيقاف القراءة' : 'ابدأ إعادة القراءة صوتياً'}</span>
              </button>
            </div>

            {readingSpoken && readingShadowResult && (
              <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">النص المسجل:</span>
                  <span className="font-mono-num text-sm font-bold text-emerald-600">
                    نسبة الإتقان: {readingShadowResult.score}%
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200">{readingSpoken}</p>
                {readingShadowResult.missedWords.length > 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    كلمات تحتاج تركيزاً إضافياً: {readingShadowResult.missedWords.slice(0, 6).join(' · ')}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              سؤال الفهم: {pack.reading.question}
            </h3>
            <div className="space-y-2">
              {pack.reading.options.map((opt, idx) => {
                const picked = readingAnswerIdx === idx;
                const isRight = idx === pack.reading.correctIndex;
                let cls =
                  'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200';
                if (readingAnswerIdx !== null) {
                  if (isRight)
                    cls =
                      'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200';
                  else if (picked)
                    cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-200';
                }
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setReadingAnswerIdx(idx);
                      if (isRight) {
                        playFeedbackSound('success', profile.soundEnabled);
                        void recordExerciseSuccess('reading', 25);
                      } else {
                        playFeedbackSound('error', profile.soundEnabled);
                      }
                    }}
                    className={`w-full min-h-[46px] px-4 rounded-xl border text-right text-sm font-semibold transition-colors cursor-pointer ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
