import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Ear,
  Grid,
  HelpCircle,
  Keyboard,
  Loader2,
  RotateCcw,
  Sparkles,
  Volume2,
  XCircle,
} from 'lucide-react';
import { getOppositePronunciation, getStarterAlphabet } from '../data/alphabets';
import { generateLanguageAlphabet } from '../lib/gemini';
import { playFeedbackSound } from '../lib/sound';
import { speakText } from '../lib/speech';
import { AlphabetLetter, LanguageAlphabet, UserProfile } from '../types';
import TalkingAvatar from './TalkingAvatar';

interface AlphabetLabProps {
  profile: UserProfile;
  onPracticeSuccess: (xp: number) => Promise<void>;
  hasEnergy?: boolean;
  onConsumeEnergy?: (amount?: number) => Promise<boolean>;
  onOpenRecharge?: () => void;
  compact?: boolean;
}

type DrillType = 'chart' | 'quizPron' | 'writeOpposite' | 'listenPick';

export default function AlphabetLab({
  profile,
  onPracticeSuccess,
  hasEnergy = true,
  onConsumeEnergy,
  onOpenRecharge,
  compact = false,
}: AlphabetLabProps) {
  const [alphabet, setAlphabet] = useState<LanguageAlphabet | null>(() =>
    getStarterAlphabet(profile.targetLanguage)
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [drill, setDrill] = useState<DrillType>('chart');

  const [quizIdx, setQuizIdx] = useState(0);
  const [pickedOpt, setPickedOpt] = useState<string | null>(null);
  const [writeOppositeInput, setWriteOppositeInput] = useState('');
  const [writeOppositeFeedback, setWriteOppositeFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [masteredLetters, setMasteredLetters] = useState<Record<string, boolean>>({});

  const fetchAlphabet = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await generateLanguageAlphabet({
        nativeLanguage: profile.nativeLanguage,
        targetLanguage: profile.targetLanguage,
      });
      setAlphabet(data);
      setSelectedIdx(0);
      setQuizIdx(0);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'تعذر تحميل الحروف.');
    } finally {
      setLoading(false);
    }
  }, [profile.nativeLanguage, profile.targetLanguage]);

  useEffect(() => {
    const starter = getStarterAlphabet(profile.targetLanguage);
    setPickedOpt(null);
    setWriteOppositeInput('');
    setWriteOppositeFeedback('idle');
    setSelectedIdx(0);
    setQuizIdx(0);
    setMasteredLetters({});
    if (starter) {
      setAlphabet(starter);
      setErrorMsg(null);
    } else {
      setAlphabet(null);
      void fetchAlphabet();
    }
  }, [profile.targetLanguage, fetchAlphabet]);

  const letters = alphabet?.letters || [];
  const activeLetter: AlphabetLetter | undefined = letters[selectedIdx] || letters[0];
  const quizLetter: AlphabetLetter | undefined = letters[quizIdx % Math.max(1, letters.length)];

  const quizOptions = useMemo(() => {
    if (!quizLetter || letters.length === 0) return [];
    const correctPron = getOppositePronunciation(quizLetter, profile.nativeLanguage);
    const distractors = letters
      .filter((l) => l.letter !== quizLetter.letter)
      .map((l) => (drill === 'listenPick' ? l.letter : getOppositePronunciation(l, profile.nativeLanguage)))
      .filter((val, i, arr) => arr.indexOf(val) === i && val !== (drill === 'listenPick' ? quizLetter.letter : correctPron));

    const pickedDistractors = distractors.slice(0, 3);
    const correctVal = drill === 'listenPick' ? quizLetter.letter : correctPron;
    const combined = [correctVal, ...pickedDistractors];
    return combined.sort((a, b) => ((a.charCodeAt(0) + quizIdx) % 7) - ((b.charCodeAt(0) + quizIdx) % 7));
  }, [drill, letters, profile.nativeLanguage, quizIdx, quizLetter]);

  const speakLetterSound = (item: AlphabetLetter) => {
    const firstChar = item.letter.split(' ')[0];
    speakText(`${firstChar}. ${item.exampleWord}`, profile.targetLanguage, Math.max(0.75, profile.speechRate - 0.1));
  };

  const handleCheckOppositeWrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizLetter || !writeOppositeInput.trim()) return;
    if (!hasEnergy) {
      onOpenRecharge?.();
      return;
    }
    const expected = getOppositePronunciation(quizLetter, profile.nativeLanguage).toLowerCase();
    const candidates = expected
      .split(/[/،,()\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const userVal = writeOppositeInput.trim().toLowerCase();

    const ok =
      userVal === expected ||
      candidates.some((c) => c === userVal || (c.length >= 2 && userVal.includes(c)));

    if (ok) {
      setWriteOppositeFeedback('correct');
      setMasteredLetters((prev) => ({ ...prev, [quizLetter.letter]: true }));
      playFeedbackSound('success', profile.soundEnabled);
      speakLetterSound(quizLetter);
      await onPracticeSuccess(15);
    } else {
      setWriteOppositeFeedback('wrong');
      playFeedbackSound('error', profile.soundEnabled);
      void onConsumeEnergy?.(1);
    }
  };

  const handleResetAlphabet = () => {
    setMasteredLetters({});
    setSelectedIdx(0);
    setQuizIdx(0);
    setPickedOpt(null);
    setWriteOppositeInput('');
    setWriteOppositeFeedback('idle');
    playFeedbackSound('tap', profile.soundEnabled);
  };

  const nextQuizItem = () => {
    setQuizIdx((i) => (i + 1) % Math.max(1, letters.length));
    setPickedOpt(null);
    setWriteOppositeInput('');
    setWriteOppositeFeedback('idle');
  };

  if (loading && !alphabet) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2.5">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          جاري تجهيز حروف {profile.targetLanguage} ونطقها باللغة المعاكسة...
        </p>
      </div>
    );
  }

  if (errorMsg && !alphabet) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 text-xs text-rose-700 dark:text-rose-200 flex items-center justify-between gap-2">
        <span>{errorMsg}</span>
        <button
          type="button"
          onClick={() => void fetchAlphabet()}
          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold cursor-pointer"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!alphabet || letters.length === 0) return null;

  const tilePalettes = [
    'border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/60 dark:bg-emerald-950/30',
    'border-sky-200 dark:border-sky-900/70 bg-sky-50/60 dark:bg-sky-950/30',
    'border-violet-200 dark:border-violet-900/70 bg-violet-50/60 dark:bg-violet-950/30',
    'border-amber-200 dark:border-amber-900/70 bg-amber-50/60 dark:bg-amber-950/30',
  ];

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>{alphabet.scriptName}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {alphabet.description}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs font-mono-num font-bold text-emerald-700 dark:text-emerald-300">
            {Object.keys(masteredLetters).length} / {letters.length} حرف متقن
          </div>
          {!compact && (
            <button
              type="button"
              onClick={handleResetAlphabet}
              className="min-h-[34px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-emerald-500 flex items-center gap-1.5 cursor-pointer"
              title="إعادة الحروف من البداية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة الحروف</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Selector inside Alphabet Lab */}
      {!compact && (
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          {[
            { id: 'chart' as DrillType, label: 'جدول الحروف والنطق', icon: Grid },
            { id: 'writeOpposite' as DrillType, label: 'اكتب النطق تحت الحرف', icon: Keyboard },
            { id: 'quizPron' as DrillType, label: 'اختر النطق الصحيح', icon: HelpCircle },
            { id: 'listenPick' as DrillType, label: 'استمع واختر الحرف', icon: Ear },
          ].map((item) => {
            const Icon = item.icon;
            const active = drill === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setDrill(item.id);
                  setPickedOpt(null);
                  setWriteOppositeFeedback('idle');
                }}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* DRILL 1: FULL CHART WITH OPPOSITE-LANGUAGE PRONUNCIATION DIRECTLY UNDER EACH LETTER */}
      {(drill === 'chart' || compact) && (
        <div className="space-y-4">
          {activeLetter && (
            <div className="rounded-2xl bg-gradient-to-l from-[#081B3E] via-[#0F2A5F] to-emerald-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <TalkingAvatar
                  text={`${activeLetter.letter.split(' ')[0]}. ${activeLetter.exampleWord}`}
                  languageName={profile.targetLanguage}
                  speechRate={Math.max(0.75, profile.speechRate - 0.1)}
                  size="sm"
                  variant="emerald"
                  label=""
                />
                <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/25 flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl font-extrabold leading-none" dir="ltr">
                    {activeLetter.letter}
                  </span>
                  <span className="text-xs font-bold text-emerald-300 mt-1.5">
                    {getOppositePronunciation(activeLetter, profile.nativeLanguage)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-emerald-300 font-bold">
                    اسم الحرف: {activeLetter.name} · النطق باللغة المعاكسة:{' '}
                    {getOppositePronunciation(activeLetter, profile.nativeLanguage)}
                  </div>
                  <div className="text-sm text-white/95">{activeLetter.soundHint}</div>
                  <div className="text-xs text-slate-200 pt-1">
                    مثال: <span className="font-bold text-white" dir="ltr">{activeLetter.exampleWord}</span>{' '}
                    ({activeLetter.examplePronunciation}) —{' '}
                    <span className="text-emerald-300 font-semibold">{activeLetter.exampleMeaning}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => speakLetterSound(activeLetter)}
                className="min-h-[46px] px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#081B3E] font-extrabold text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
                <span>نطق الحرف والمثال</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {letters.map((item, idx) => {
              const active = selectedIdx === idx;
              const pron = getOppositePronunciation(item, profile.nativeLanguage);
              const mastered = Boolean(masteredLetters[item.letter]);
              return (
                <button
                  key={`${item.letter}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedIdx(idx);
                    speakLetterSound(item);
                  }}
                  className={`rounded-2xl border-2 border-b-4 p-2.5 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:translate-y-0.5 ${
                    active
                      ? 'border-[#081B3E] bg-[#081B3E] text-white dark:border-emerald-400 dark:bg-emerald-700'
                      : mastered
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-slate-900 dark:text-white'
                      : `${tilePalettes[idx % tilePalettes.length]} text-slate-900 dark:text-white hover:border-emerald-500`
                  }`}
                >
                  <span className="text-xl sm:text-2xl font-extrabold leading-tight" dir="ltr">
                    {item.letter}
                  </span>
                  <span
                    className={`w-full text-center text-xs font-bold pt-1 border-t ${
                      active
                        ? 'border-white/25 text-emerald-300'
                        : 'border-slate-300/60 dark:border-slate-700 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {pron}
                  </span>
                  <span
                    className={`text-[10px] truncate max-w-full ${
                      active ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.exampleMeaning}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* DRILL 2: WRITE OPPOSITE PRONUNCIATION DIRECTLY UNDER THE LETTER */}
      {!compact && drill === 'writeOpposite' && quizLetter && (
        <div className="max-w-lg mx-auto space-y-5">
          <div className="text-center space-y-2">
            <div className="text-xs font-bold text-violet-600 dark:text-violet-400">
              تمرين كتابة النطق باللغة المعاكسة تحت الحرف
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              استمع للحرف ثم اكتب كيف يُنطق بـ ({profile.nativeLanguage}) مباشرة في الخانة أسفل الحرف:
            </p>
          </div>

          <form
            onSubmit={(e) => void handleCheckOppositeWrite(e)}
            className="rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center gap-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-4">
              <TalkingAvatar
                text={`${quizLetter.letter.split(' ')[0]}. ${quizLetter.exampleWord}`}
                languageName={profile.targetLanguage}
                speechRate={Math.max(0.75, profile.speechRate - 0.1)}
                size="sm"
                variant="sky"
                mood={
                  writeOppositeFeedback === 'correct'
                    ? 'celebrate'
                    : writeOppositeFeedback === 'wrong'
                    ? 'encourage'
                    : 'neutral'
                }
                label=""
              />
              <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center text-4xl font-extrabold text-slate-900 dark:text-white shadow-sm" dir="ltr">
                {quizLetter.letter}
              </div>
              <button
                type="button"
                onClick={() => speakLetterSound(quizLetter)}
                className="min-h-[48px] px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>اسمع النطق</span>
              </button>
            </div>

            <div className="w-full max-w-xs space-y-1.5">
              <label
                htmlFor="opp-pron-input"
                className="block text-center text-xs font-bold text-slate-600 dark:text-slate-400"
              >
                اكتب النطق باللغة المعاكسة مباشرة هنا ↓
              </label>
              <input
                id="opp-pron-input"
                type="text"
                value={writeOppositeInput}
                onChange={(e) => setWriteOppositeInput(e.target.value)}
                placeholder="مثال: آ، ب، ف، ژ..."
                className="w-full min-h-[48px] px-4 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="submit"
                disabled={!writeOppositeInput.trim()}
                className="min-h-[46px] px-6 rounded-xl border-b-4 border-emerald-800 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm cursor-pointer disabled:opacity-50"
              >
                تحقق
              </button>
              <button
                type="button"
                onClick={nextQuizItem}
                className="min-h-[46px] px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer"
              >
                الحرف التالي
              </button>
            </div>

            {writeOppositeFeedback !== 'idle' && (
              <div
                className={`w-full rounded-xl p-3 text-center text-xs font-bold flex items-center justify-center gap-2 ${
                  writeOppositeFeedback === 'correct'
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                }`}
              >
                {writeOppositeFeedback === 'correct' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {writeOppositeFeedback === 'correct'
                    ? `ممتاز! نطق الحرف (${quizLetter.letter}) هو "${getOppositePronunciation(quizLetter, profile.nativeLanguage)}" (+15 XP)`
                    : `النطق الصحيح للحرف (${quizLetter.letter}) هو "${getOppositePronunciation(quizLetter, profile.nativeLanguage)}" — ${quizLetter.soundHint}`}
                </span>
              </div>
            )}
          </form>
        </div>
      )}

      {/* DRILL 3 & 4: PRONUNCIATION QUIZ OR AUDIO LETTER MATCH WITH TALKING AVATAR */}
      {!compact && (drill === 'quizPron' || drill === 'listenPick') && quizLetter && (
        <div className="max-w-xl mx-auto space-y-5">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center gap-4 text-center">
            <div className="text-xs font-bold text-sky-600 dark:text-sky-400">
              {drill === 'quizPron'
                ? 'اختر النطق الصحيح باللغة المعاكسة لهذا الحرف'
                : 'استمع للأفاتار الناطق ثم اختر الحرف المطابق لصوته'}
            </div>

            <div className="flex items-center justify-center gap-4">
              <TalkingAvatar
                text={`${quizLetter.letter.split(' ')[0]}. ${quizLetter.exampleWord}`}
                languageName={profile.targetLanguage}
                speechRate={Math.max(0.75, profile.speechRate - 0.1)}
                size="md"
                variant="sky"
                mood={
                  pickedOpt
                    ? pickedOpt ===
                      (drill === 'listenPick'
                        ? quizLetter.letter
                        : getOppositePronunciation(quizLetter, profile.nativeLanguage))
                      ? 'celebrate'
                      : 'encourage'
                    : 'neutral'
                }
                label=""
              />
              {drill === 'quizPron' && (
                <div className="text-5xl font-extrabold text-slate-900 dark:text-white py-2" dir="ltr">
                  {quizLetter.letter}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => speakLetterSound(quizLetter)}
              className="mx-auto min-h-[48px] px-6 rounded-2xl border-b-4 border-sky-700 bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
              <span>تشغيل صوت الحرف</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quizOptions.map((opt) => {
              const correctVal =
                drill === 'listenPick'
                  ? quizLetter.letter
                  : getOppositePronunciation(quizLetter, profile.nativeLanguage);
              const isRight = opt === correctVal;
              const isPicked = pickedOpt === opt;

              let cls =
                'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-emerald-500';
              if (pickedOpt) {
                if (isRight) {
                  cls = 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-100';
                } else if (isPicked) {
                  cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={Boolean(pickedOpt)}
                  onClick={async () => {
                    if (!hasEnergy) {
                      onOpenRecharge?.();
                      return;
                    }
                    setPickedOpt(opt);
                    if (isRight) {
                      setMasteredLetters((prev) => ({ ...prev, [quizLetter.letter]: true }));
                      playFeedbackSound('success', profile.soundEnabled);
                      await onPracticeSuccess(15);
                    } else {
                      playFeedbackSound('error', profile.soundEnabled);
                      void onConsumeEnergy?.(1);
                    }
                  }}
                  className={`min-h-[60px] rounded-2xl border-2 border-b-4 font-extrabold text-lg cursor-pointer transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {pickedOpt && (
            <div className="flex items-center justify-between rounded-2xl bg-slate-100 dark:bg-slate-800 p-4">
              <div className="text-xs text-slate-700 dark:text-slate-200">
                <span className="font-bold">{quizLetter.letter}</span> ({getOppositePronunciation(quizLetter, profile.nativeLanguage)}) — مثال:{' '}
                <span className="font-bold">{quizLetter.exampleWord}</span> ({quizLetter.exampleMeaning})
              </div>
              <button
                type="button"
                onClick={nextQuizItem}
                className="min-h-[40px] px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer shrink-0"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
