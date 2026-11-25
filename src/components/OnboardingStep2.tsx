import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Flag, Globe, Info, Languages, Target } from 'lucide-react';
import {
  LEARNING_PURPOSES,
  PROFICIENCY_LEVELS,
  WORLD_LANGUAGES,
} from '../data/languages';
import { playFeedbackSound } from '../lib/sound';
import LanguageFlag, { ARAB_COUNTRIES } from './LanguageFlag';
import SpaceBackdrop from './SpaceBackdrop';

export interface OnboardingStep2Data {
  nativeLanguage: string;
  targetLanguage: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
  purpose: string;
  purposeFocus: string;
  arabicCountryCode: string;
}

interface OnboardingStep2Props {
  initialData: OnboardingStep2Data;
  saving: boolean;
  errorMsg: string | null;
  onBack: () => void;
  onComplete: (data: OnboardingStep2Data) => void;
}

export default function OnboardingStep2({
  initialData,
  saving,
  errorMsg,
  onBack,
  onComplete,
}: OnboardingStep2Props) {
  const [nativeLanguage, setNativeLanguage] = useState(
    WORLD_LANGUAGES.some((l) => l.nameAr === initialData.nativeLanguage)
      ? initialData.nativeLanguage
      : 'العربية'
  );
  const [targetLanguage, setTargetLanguage] = useState(
    WORLD_LANGUAGES.some((l) => l.nameAr === initialData.targetLanguage)
      ? initialData.targetLanguage
      : 'الإنجليزية'
  );
  const [arabicCountryCode, setArabicCountryCode] = useState(
    initialData.arabicCountryCode || 'DZ'
  );
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(initialData.level || 1);
  const [purposeId, setPurposeId] = useState<string>(() => {
    const matched = LEARNING_PURPOSES.find((p) => p.label === initialData.purpose);
    return matched ? matched.id : LEARNING_PURPOSES[0].id;
  });

  const activePurpose = useMemo(
    () => LEARNING_PURPOSES.find((p) => p.id === purposeId) || LEARNING_PURPOSES[0],
    [purposeId]
  );

  const [answer1, setAnswer1] = useState(activePurpose.options1[0]);
  const [answer2, setAnswer2] = useState(activePurpose.options2[0]);
  const [customNote, setCustomNote] = useState('');

  // Strict 8-language catalog excluding current native language
  const availableTargetLanguages = useMemo(
    () => WORLD_LANGUAGES.filter((l) => l.nameAr !== nativeLanguage),
    [nativeLanguage]
  );

  const handleNativeChange = (nextNative: string) => {
    setNativeLanguage(nextNative);
    if (nextNative === targetLanguage) {
      const firstOther = WORLD_LANGUAGES.find((l) => l.nameAr !== nextNative);
      if (firstOther) setTargetLanguage(firstOther.nameAr);
    }
  };

  const handlePurposeChange = (id: string) => {
    setPurposeId(id);
    const nextP = LEARNING_PURPOSES.find((p) => p.id === id);
    if (nextP) {
      setAnswer1(nextP.options1[0]);
      setAnswer2(nextP.options2[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const levelDef = PROFICIENCY_LEVELS.find((l) => l.level === level) || PROFICIENCY_LEVELS[0];
    const focusSummary = [answer1, answer2, customNote.trim()].filter(Boolean).join(' · ').slice(0, 160);

    onComplete({
      nativeLanguage,
      targetLanguage,
      level,
      levelLabel: levelDef.label,
      purpose: activePurpose.label,
      purposeFocus: focusSummary,
      arabicCountryCode,
    });
  };

  const showsArabic = nativeLanguage === 'العربية' || targetLanguage === 'العربية';

  return (
    <div className="min-h-[100dvh] bg-[#02040a] text-white flex flex-col relative overflow-hidden">
      <SpaceBackdrop />

      {/* Header */}
      <header className="relative z-30 px-4 sm:px-8 h-16 flex items-center justify-between border-b border-white/10 bg-slate-950/75 backdrop-blur-xl sticky top-0">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="رجوع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span>الخطوة 2 من 2</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400">اللغة والمستوى والغرض</span>
        </div>
        <div className="w-11" aria-hidden="true" />
      </header>

      <div className="relative z-30 w-full h-1 bg-white/10">
        <div className="h-full w-full bg-gradient-to-l from-emerald-400 to-cyan-400" />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <form onSubmit={handleSubmit} className="space-y-6 pb-28">
          {/* 1. Native Language */}
          <section className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-3">
            <label htmlFor="native-lang" className="flex items-center justify-between gap-2 text-base font-bold text-white">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>إختر لغتك (لغتك الأم)</span>
              </span>
              <LanguageFlag
                language={nativeLanguage}
                arabicCountryCode={arabicCountryCode}
                size="md"
              />
            </label>
            <select
              id="native-lang"
              value={nativeLanguage}
              onChange={(e) => handleNativeChange(e.target.value)}
              className="w-full min-h-[48px] px-4 rounded-xl border border-white/15 bg-black/70 text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {WORLD_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.nameAr} className="bg-slate-950 text-white">
                  {lang.nameAr} — {lang.nativeName}
                </option>
              ))}
            </select>
          </section>

          {/* 2. Target Language (Strict 8 Languages ONLY + National Flags) */}
          <section className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Languages className="w-5 h-5 text-emerald-400" />
                <span>اللغة التي تريد تعلمها</span>
              </h2>
              <div className="flex items-center gap-2">
                <LanguageFlag
                  language={targetLanguage}
                  arabicCountryCode={arabicCountryCode}
                  size="sm"
                />
                <span className="text-xs font-semibold text-emerald-300">
                  8 لغات معتمدة
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {availableTargetLanguages.map((lang) => {
                const selected = targetLanguage === lang.nameAr;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      setTargetLanguage(lang.nameAr);
                      playFeedbackSound('tap', true);
                    }}
                    className={`min-h-[68px] p-3 rounded-xl border text-right transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      selected
                        ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <LanguageFlag
                          language={lang.nameAr}
                          arabicCountryCode={arabicCountryCode}
                          size="xs"
                        />
                        <span className="font-bold text-sm text-white truncate">
                          {lang.nameAr}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 truncate mt-1">
                        {lang.nativeName}
                      </div>
                    </div>
                    <span className="font-display font-bold text-xs text-emerald-300 shrink-0">
                      {lang.scriptSample}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Arab National Flag Picker */}
            {showsArabic && (
              <div className="pt-3 border-t border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <Flag className="w-3.5 h-3.5" />
                  <span>اختر علم بلدك للظهور في الشريط العلوي:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ARAB_COUNTRIES.map((country) => {
                    const active = arabicCountryCode === country.code;
                    return (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setArabicCountryCode(country.code);
                          playFeedbackSound('tap', true);
                        }}
                        className={`min-h-[36px] px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                          active
                            ? 'border-emerald-400 bg-emerald-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/25'
                        }`}
                      >
                        <LanguageFlag language="العربية" arabicCountryCode={country.code} size="xs" />
                        <span>{country.nameAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 3. Proficiency Level (1 to 5) */}
          <section className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white">
              مستواك من هذه اللغة
            </h2>

            <div className="space-y-2.5">
              {PROFICIENCY_LEVELS.map((lvl) => {
                const active = level === lvl.level;
                return (
                  <button
                    key={lvl.level}
                    type="button"
                    onClick={() => {
                      setLevel(lvl.level);
                      playFeedbackSound('tap', true);
                    }}
                    className={`w-full min-h-[64px] p-3.5 rounded-xl border text-right transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      active
                        ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <span className="font-mono-num">{lvl.level}.</span>
                        <span>{lvl.label}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-xs font-mono-num text-emerald-300">
                          {lvl.cefr}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{lvl.description}</p>
                    </div>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        active
                          ? 'bg-emerald-400 text-slate-950'
                          : 'border border-white/25'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3.5 flex items-start gap-2.5 text-sm text-emerald-100">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">ملاحظة: كل مستوى له مراحله وتمارينه الخاصة. </span>
                <span>
                  {PROFICIENCY_LEVELS.find((l) => l.level === level)?.curriculumFocus}
                </span>
              </div>
            </div>
          </section>

          {/* 4. Purpose + Tailored Questions */}
          <section className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-white">
              <Target className="w-5 h-5 text-emerald-400" />
              <span>الغرض من تعلم هذه اللغة</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEARNING_PURPOSES.map((p) => {
                const active = purposeId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePurposeChange(p.id)}
                    className={`min-h-[60px] p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{p.label}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{p.summary}</div>
                  </button>
                );
              })}
            </div>

            {/* Tailored Purpose Questions */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-emerald-300">
                أسئلة خاصة بغرض ({activePurpose.label}):
              </h3>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-100">
                  1. {activePurpose.question1}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activePurpose.options1.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswer1(opt)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium text-right transition-colors cursor-pointer ${
                        answer1 === opt
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-200 hover:border-white/25'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-100">
                  2. {activePurpose.question2}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activePurpose.options2.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswer2(opt)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-medium text-right transition-colors cursor-pointer ${
                        answer2 === opt
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-white/5 border-white/10 text-slate-200 hover:border-white/25'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="purpose-note" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ملاحظة إضافية لتركيز تمارينك ومراحلك (اختياري):
                </label>
                <input
                  id="purpose-note"
                  type="text"
                  maxLength={70}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="مثال: أركز على النطق السليم ومقابلات العمل..."
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-white/15 bg-black/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
            </div>
          </section>

          {errorMsg && (
            <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3.5 text-sm text-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Fixed Bottom Next Button */}
          <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#02040a] via-[#02040a]/95 to-transparent">
            <div className="max-w-3xl mx-auto">
              <button
                type="submit"
                disabled={saving}
                className="w-full min-h-[52px] rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-l from-emerald-500 to-teal-400 hover:brightness-105 active:translate-y-0.5 text-slate-950 font-extrabold text-base shadow-[0_0_24px_rgba(52,211,153,0.28)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{saving ? 'جاري إعداد مراحلك الخاصة...' : 'التالي'}</span>
                {!saving && <ArrowLeft className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
