import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, Clock, Sparkles, User } from 'lucide-react';
import { AVATAR_PRESETS, compressImageFileToAvatar } from '../data/avatars';
import { playFeedbackSound } from '../lib/sound';
import SpaceBackdrop from './SpaceBackdrop';
import UserAvatar from './UserAvatar';

export interface OnboardingStep1Data {
  displayName: string;
  dailyGoalMinutes: number;
  learningStyle: string;
  avatarId: string;
  customPhotoDataUrl?: string | null;
}

interface OnboardingStep1Props {
  initialData: OnboardingStep1Data;
  onBack: () => void;
  onNext: (data: OnboardingStep1Data) => void;
}

const DAILY_GOALS = [
  { minutes: 10, label: '10 دقائق / يوم', desc: 'وتيرة خفيفة ومرنة' },
  { minutes: 15, label: '15 دقيقة / يوم', desc: 'الهدف المتوازن الموصى به' },
  { minutes: 30, label: '30 دقيقة / يوم', desc: 'تقدم سريع وملموس' },
  { minutes: 45, label: '45 دقيقة / يوم', desc: 'انغماس لغوي مكثف' },
];

const LEARNING_STYLES = [
  { id: 'متوازن (قراءة + كتابة + صوت)', title: 'متوازن وشامل', desc: 'يمزج بين المراحل التفاعلية، التمارين الصوتية، والمحادثة' },
  { id: 'تركيز على المحادثة والنطق', title: 'تركيز على المحادثة والنطق', desc: 'أولوية للتحدث والاستماع والردود الحية مع الأصدقاء' },
  { id: 'تركيز على القراءة والكتابة', title: 'تركيز على القراءة والكتابة', desc: 'أولوية لقراءة الفقرات والقواعد والتمارين الكتابية' },
];

export default function OnboardingStep1({ initialData, onBack, onNext }: OnboardingStep1Props) {
  const [displayName, setDisplayName] = useState(initialData.displayName);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(initialData.dailyGoalMinutes || 15);
  const [learningStyle, setLearningStyle] = useState(
    initialData.learningStyle || LEARNING_STYLES[0].id
  );
  const [avatarId, setAvatarId] = useState(initialData.avatarId || 'astro');
  const [customPhotoDataUrl, setCustomPhotoDataUrl] = useState<string | null>(
    initialData.customPhotoDataUrl || null
  );
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      const compressed = await compressImageFileToAvatar(file);
      setCustomPhotoDataUrl(compressed);
      setAvatarId('custom');
      playFeedbackSound('success', true);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'تعذر تحميل الصورة.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = displayName.trim();
    if (cleaned.length < 2) {
      setError('يرجى إدخال اسمك الكامل للمتابعة.');
      return;
    }
    onNext({
      displayName: cleaned.slice(0, 80),
      dailyGoalMinutes,
      learningStyle,
      avatarId,
      customPhotoDataUrl,
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#02040a] text-white flex flex-col relative overflow-hidden">
      <SpaceBackdrop />

      {/* Header with step progress */}
      <header className="relative z-20 px-4 sm:px-8 h-16 flex items-center justify-between border-b border-white/10 bg-slate-950/70 backdrop-blur-xl sticky top-0">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="رجوع"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span>الخطوة 1 من 2</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-400">بيانات المتعلم</span>
        </div>
        <div className="w-11" aria-hidden="true" />
      </header>

      {/* Progress Track */}
      <div className="relative z-20 w-full h-1 bg-white/10">
        <div className="h-full w-1/2 bg-gradient-to-l from-emerald-400 to-cyan-400 transition-all duration-300" />
      </div>

      <main className="relative z-10 flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <form onSubmit={handleSubmit} className="space-y-6 pb-24">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white text-balance">
              أخبرنا عنك لنخصّص رحلتك التعليمية
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-slate-300">
              أضف صورتك أو اختر أفاتارك الخاص وحدد وتيرة مراحلك التفاعلية اليومية.
            </p>
          </div>

          {/* Photo or Avatar Picker */}
          <div className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  displayName={displayName || 'متعلم'}
                  avatarId={avatarId}
                  customPhotoUrl={customPhotoDataUrl}
                  size="lg"
                  className="ring-2 ring-emerald-400/50"
                />
                <div>
                  <div className="text-sm font-bold text-white">صورتك الشخصية أو الأفاتار</div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    اختر شخصية جاهزة أو ارفع صورة من هاتفك لتظهر في ملفك ومحادثاتك
                  </p>
                </div>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => void handlePhotoUpload(e)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[42px] px-4 rounded-xl border border-cyan-400/50 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-xs font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Camera className="w-4 h-4" />
                  <span>رفع صورة من جهازك</span>
                </button>
              </div>
            </div>

            {photoError && <p className="text-xs text-rose-400">{photoError}</p>}

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 pt-1">
              {AVATAR_PRESETS.map((preset) => {
                const selected = avatarId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarId(preset.id);
                      playFeedbackSound('tap', true);
                    }}
                    className={`relative p-1.5 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      selected
                        ? 'border-emerald-400 bg-emerald-500/20 ring-2 ring-emerald-400/70'
                        : 'border-white/10 bg-white/5 hover:border-white/30'
                    }`}
                  >
                    <UserAvatar avatarId={preset.id} displayName={preset.label} size="sm" />
                    <span className="text-[10px] font-semibold text-slate-200 truncate w-full text-center">
                      {preset.label}
                    </span>
                    {selected && (
                      <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Name */}
          <div className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-3">
            <label htmlFor="learner-name" className="flex items-center gap-2 text-sm font-bold text-white">
              <User className="w-4 h-4 text-emerald-400" />
              <span>الاسم الكامل أو اسم الشهرة</span>
            </label>
            <input
              id="learner-name"
              type="text"
              maxLength={80}
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError(null);
              }}
              placeholder="مثال: أحمد محمد"
              className="w-full min-h-[48px] px-4 rounded-xl border border-white/15 bg-black/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            {error && <p className="text-sm text-rose-400">{error}</p>}
          </div>

          {/* Daily Goal */}
          <div className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>الهدف اليومي للتعلم</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAILY_GOALS.map((g) => {
                const active = dailyGoalMinutes === g.minutes;
                return (
                  <button
                    key={g.minutes}
                    type="button"
                    onClick={() => {
                      setDailyGoalMinutes(g.minutes);
                      playFeedbackSound('tap', true);
                    }}
                    className={`min-h-[60px] p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <div className="font-bold text-sm text-white font-mono-num">
                      {g.label}
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">{g.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Learning Style */}
          <div className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>أسلوب التعلم المفضل</span>
            </div>
            <div className="space-y-2.5">
              {LEARNING_STYLES.map((style) => {
                const active = learningStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => {
                      setLearningStyle(style.id);
                      playFeedbackSound('tap', true);
                    }}
                    className={`w-full min-h-[56px] p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-400 bg-emerald-500/15 ring-1 ring-emerald-400'
                        : 'border-white/10 bg-white/5 hover:border-white/25'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">{style.title}</div>
                    <div className="text-xs text-slate-300 mt-0.5">{style.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fixed Bottom Next CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-[#02040a] via-[#02040a]/95 to-transparent">
            <div className="max-w-2xl mx-auto">
              <button
                type="submit"
                className="w-full min-h-[52px] rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-l from-emerald-500 to-teal-400 hover:brightness-105 active:translate-y-0.5 text-slate-950 font-extrabold text-base shadow-[0_0_24px_rgba(52,211,153,0.28)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>التالي</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
