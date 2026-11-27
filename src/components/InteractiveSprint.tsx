import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Flame,
  Heart,
  Loader2,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { getStarterInteractiveSprint } from '../data/curriculum';
import { generateInteractiveSprint } from '../lib/gemini';
import { playFeedbackSound } from '../lib/sound';
import { speakText } from '../lib/speech';
import { InteractiveSprintStep, UserProfile } from '../types';
import TalkingAvatar from './TalkingAvatar';

interface InteractiveSprintProps {
  profile: UserProfile;
  stageTitle?: string;
  onCompleteSprint: (xpEarned: number) => Promise<void>;
}

export default function InteractiveSprint({
  profile,
  stageTitle,
  onCompleteSprint,
}: InteractiveSprintProps) {
  const [steps, setSteps] = useState<InteractiveSprintStep[]>(
    () => getStarterInteractiveSprint(profile.targetLanguage, profile.level) || []
  );
  const [stepIdx, setStepIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [combo, setCombo] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  const [chosenTiles, setChosenTiles] = useState<{ idx: number; word: string }[]>([]);
  const [selectedOptIdx, setSelectedOptIdx] = useState<number | null>(null);
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [finished, setFinished] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  const resetWithSteps = useCallback((nextSteps: InteractiveSprintStep[]) => {
    setSteps(nextSteps);
    setStepIdx(0);
    setHearts(5);
    setCombo(0);
    setEarnedXp(0);
    setCorrectCount(0);
    setChosenTiles([]);
    setSelectedOptIdx(null);
    setCheckedState('idle');
    setFinished(false);
  }, []);

  const handleGenerateAiSprint = useCallback(async () => {
    setGenerating(true);
    setGenError(null);
    try {
      const data = await generateInteractiveSprint({
        nativeLanguage: profile.nativeLanguage,
        targetLanguage: profile.targetLanguage,
        level: profile.level,
        purpose: profile.purpose,
      });
      if (Array.isArray(data.steps) && data.steps.length > 0) {
        resetWithSteps(data.steps);
        playFeedbackSound('success', profile.soundEnabled);
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'تعذر توليد الجولة التفاعلية.');
    } finally {
      setGenerating(false);
    }
  }, [profile.level, profile.nativeLanguage, profile.purpose, profile.soundEnabled, profile.targetLanguage, resetWithSteps]);

  useEffect(() => {
    const starter = getStarterInteractiveSprint(profile.targetLanguage, profile.level);
    if (starter && starter.length > 0) {
      resetWithSteps(starter);
      setGenError(null);
    } else {
      resetWithSteps([]);
      void handleGenerateAiSprint();
    }
  }, [profile.targetLanguage, profile.level, resetWithSteps, handleGenerateAiSprint]);

  const current = steps[stepIdx];
  const progressPct = Math.round(
    ((stepIdx + (checkedState !== 'idle' ? 1 : 0)) / Math.max(1, steps.length)) * 100
  );

  const canCheck = (() => {
    if (!current || checkedState !== 'idle') return false;
    if (current.type === 'arrange') return chosenTiles.length > 0;
    return selectedOptIdx !== null;
  })();

  const handleCheck = () => {
    if (!current || checkedState !== 'idle') return;
    let isRight = false;

    if (current.type === 'arrange') {
      const built = chosenTiles.map((t) => t.word).join(' ').trim().toLowerCase();
      const target = (current.targetSentence || '')
        .replace(/[.,!?؟،。！]/g, '')
        .trim()
        .toLowerCase();
      const cleanBuilt = built.replace(/[.,!?؟،。！]/g, '').trim().toLowerCase();
      isRight = cleanBuilt === target;
      if (current.targetSentence) {
        speakText(current.targetSentence, profile.targetLanguage, profile.speechRate);
      }
    } else {
      isRight = selectedOptIdx === (current.correctIndex ?? 0);
      if (current.audioText) {
        speakText(current.audioText, profile.targetLanguage, profile.speechRate);
      }
    }

    if (isRight) {
      const nextCombo = combo + 1;
      setCombo(nextCombo);
      setCorrectCount((c) => c + 1);
      setEarnedXp((x) => x + 15 + (nextCombo >= 2 ? 5 : 0));
      setCheckedState('correct');
      playFeedbackSound('success', profile.soundEnabled);
    } else {
      setCombo(0);
      setHearts((h) => Math.max(0, h - 1));
      setCheckedState('wrong');
      playFeedbackSound('error', profile.soundEnabled);
    }
  };

  const handleContinue = async () => {
    if (stepIdx + 1 >= steps.length) {
      setFinished(true);
      playFeedbackSound('levelup', profile.soundEnabled);
      await onCompleteSprint(Math.max(15, earnedXp));
      return;
    }
    setStepIdx((i) => i + 1);
    setChosenTiles([]);
    setSelectedOptIdx(null);
    setCheckedState('idle');
  };

  if (generating && steps.length === 0) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
          جاري إعداد جولة تفاعلية خالصة بـ {profile.targetLanguage} للمستوى {profile.level}...
        </p>
      </section>
    );
  }

  if (finished) {
    const accuracy = Math.round((correctCount / Math.max(1, steps.length)) * 100);
    return (
      <section className="bg-white dark:bg-slate-900 border-2 border-emerald-200 dark:border-emerald-900 rounded-3xl p-6 sm:p-8 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
          <Trophy className="w-10 h-10" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            جولة رائعة! أكملت {stageTitle || 'المرحلة التفاعلية'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            عمل ممتاز في {profile.targetLanguage} (المستوى {profile.level}) — واصل مسار مراحلك المتدرج.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3.5">
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">النقاط</div>
            <div className="text-xl font-extrabold font-mono-num text-amber-600 dark:text-amber-400 mt-1">
              +{Math.max(15, earnedXp)} XP
            </div>
          </div>
          <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-3.5">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">الدقة</div>
            <div className="text-xl font-extrabold font-mono-num text-emerald-600 dark:text-emerald-400 mt-1">
              {accuracy}%
            </div>
          </div>
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3.5">
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">القلوب</div>
            <div className="text-xl font-extrabold font-mono-num text-rose-600 dark:text-rose-400 mt-1">
              {hearts}/5
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => resetWithSteps(steps)}
            className="min-h-[48px] px-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 border-b-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold text-sm flex items-center gap-2 cursor-pointer active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة الجولة</span>
          </button>
          <button
            type="button"
            onClick={() => void handleGenerateAiSprint()}
            disabled={generating}
            className="min-h-[48px] px-6 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer active:translate-y-0.5 disabled:opacity-60"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>تحدٍ جديد بالذكاء الاصطناعي</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
      {/* Top HUD */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-l from-emerald-50/70 via-white to-sky-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="flex-1 h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-l from-emerald-500 via-teal-500 to-sky-500 transition-all duration-300"
              style={{ width: `${Math.max(8, progressPct)}%` }}
            />
          </div>
          <span className="text-xs font-mono-num font-bold text-slate-600 dark:text-slate-300">
            {stepIdx + 1}/{Math.max(1, steps.length)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {combo >= 2 && (
            <span className="flex items-center gap-1 text-xs font-mono-num font-extrabold text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4" />
              <span>x{combo}</span>
            </span>
          )}
          <span className="flex items-center gap-1 text-xs font-mono-num font-extrabold text-rose-600 dark:text-rose-400">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>{hearts}</span>
          </span>
          <button
            type="button"
            onClick={() => void handleGenerateAiSprint()}
            disabled={generating}
            className="min-h-[36px] px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>جولة جديدة</span>
          </button>
        </div>
      </div>

      {genError && (
        <div className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-200 border-b border-rose-200 dark:border-rose-900">
          {genError}
        </div>
      )}

      {current && (
        <div className="p-5 sm:p-7 space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-violet-600 dark:text-violet-400">
              {current.type === 'arrange'
                ? 'رتّب الكلمات لتكوين الجملة'
                : current.type === 'listen'
                ? 'تحدي الرسالة الصوتية مع الأفاتار'
                : 'اختر الإجابة المناسبة'}
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              {current.prompt}
            </h2>
          </div>

          {/* MODE A: Tap-to-Build Sentence Tiles */}
          {current.type === 'arrange' && (
            <div className="space-y-5">
              <div className="min-h-[76px] p-3.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center gap-2">
                {chosenTiles.length === 0 ? (
                  <span className="text-xs text-slate-400">
                    اضغط على الكلمات بالأسفل لترتيب الجملة هنا...
                  </span>
                ) : (
                  chosenTiles.map((item) => (
                    <button
                      key={`${item.idx}-${item.word}`}
                      type="button"
                      disabled={checkedState !== 'idle'}
                      onClick={() =>
                        setChosenTiles((prev) => prev.filter((t) => t.idx !== item.idx))
                      }
                      className="min-h-[42px] px-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border-2 border-sky-400 dark:border-sky-600 border-b-4 text-sm font-bold text-sky-900 dark:text-sky-100 cursor-pointer active:translate-y-0.5"
                    >
                      {item.word}
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {(current.tiles || []).map((word, idx) => {
                  const used = chosenTiles.some((t) => t.idx === idx);
                  return (
                    <button
                      key={`${idx}-${word}`}
                      type="button"
                      disabled={used || checkedState !== 'idle'}
                      onClick={() => {
                        setChosenTiles((prev) => [...prev, { idx, word }]);
                        speakText(word, profile.targetLanguage, profile.speechRate);
                      }}
                      className={`min-h-[44px] px-4 rounded-xl border-2 border-b-4 text-sm font-bold transition-all cursor-pointer ${
                        used
                          ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-transparent select-none'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-emerald-500 active:translate-y-0.5'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE B & C: Listening & Context Choice Cards with Talking Avatar */}
          {(current.type === 'listen' || current.type === 'choice') && (
            <div className="space-y-5">
              {current.audioText && (
                <div className="rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/25 p-4">
                  <TalkingAvatar
                    text={current.audioText}
                    languageName={profile.targetLanguage}
                    speechRate={profile.speechRate}
                    size="md"
                    variant="sky"
                    label="شخصيتك الناطقة"
                    subtitle="اضغط للاستماع إلى الرسالة الصوتية بالسرعة الطبيعية أو البطيئة"
                    showControls
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(current.options || []).map((opt, idx) => {
                  const picked = selectedOptIdx === idx;
                  const isCorrectOpt = idx === (current.correctIndex ?? 0);
                  let cardClass =
                    'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-sky-400';

                  if (checkedState === 'idle' && picked) {
                    cardClass =
                      'border-sky-500 bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-100 ring-1 ring-sky-500';
                  } else if (checkedState !== 'idle') {
                    if (isCorrectOpt) {
                      cardClass =
                        'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100';
                    } else if (picked) {
                      cardClass =
                        'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={`${idx}-${opt}`}
                      type="button"
                      disabled={checkedState !== 'idle'}
                      onClick={() => {
                        setSelectedOptIdx(idx);
                        if (current.type === 'choice') {
                          speakText(opt, profile.targetLanguage, profile.speechRate);
                        }
                      }}
                      className={`min-h-[58px] p-4 rounded-2xl border-2 border-b-4 text-right font-bold text-sm flex items-center justify-between gap-3 transition-all cursor-pointer active:translate-y-0.5 ${cardClass}`}
                    >
                      <span>{opt}</span>
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs font-mono-num flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300">
                        {idx + 1}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Check / Feedback Banner */}
      {current && (
        <div
          className={`p-4 sm:px-7 border-t transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            checkedState === 'correct'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900'
              : checkedState === 'wrong'
              ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900'
              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
          }`}
        >
          {checkedState === 'idle' ? (
            <>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                اختر إجابتك ثم اضغط تحقق لكسب نقاط XP
              </div>
              <button
                type="button"
                disabled={!canCheck}
                onClick={handleCheck}
                className="min-h-[48px] px-8 rounded-2xl border-b-4 border-emerald-800 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:border-slate-400 dark:disabled:border-slate-700 disabled:text-slate-500 text-white font-extrabold text-sm cursor-pointer active:translate-y-0.5 transition-all"
              >
                تحقق
              </button>
            </>
          ) : (
            <>
              <div className="flex items-start gap-2.5">
                {checkedState === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <div
                    className={`font-extrabold text-sm ${
                      checkedState === 'correct'
                        ? 'text-emerald-800 dark:text-emerald-200'
                        : 'text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    {checkedState === 'correct' ? 'أحسنت! إجابة صحيحة (+15 XP)' : 'إجابة غير صحيحة'}
                  </div>
                  {checkedState === 'wrong' && (
                    <div className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                      الإجابة الصحيحة:{' '}
                      <span className="font-bold">
                        {current.type === 'arrange'
                          ? current.targetSentence
                          : current.options?.[current.correctIndex ?? 0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleContinue()}
                className={`min-h-[48px] px-8 rounded-2xl border-b-4 text-white font-extrabold text-sm cursor-pointer active:translate-y-0.5 ${
                  checkedState === 'correct'
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-800'
                    : 'bg-rose-600 hover:bg-rose-500 border-rose-800'
                }`}
              >
                {stepIdx + 1 >= steps.length ? 'عرض النتيجة' : 'متابعة'}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
}
