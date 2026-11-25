import { useState } from 'react';
import {
  Award,
  Bell,
  Flame,
  Languages,
  Layers,
  MessageSquare,
  PenTool,
  Settings,
  Sparkles,
  Trophy,
  User,
  Volume2,
} from 'lucide-react';
import { MainTab, UserProfile } from '../../types';
import { speakText } from '../../lib/speech';
import { getLanguageByName } from '../../data/languages';
import { getOppositePronunciation, getStarterAlphabet } from '../../data/alphabets';
import LanguageFlag from '../LanguageFlag';
import UserAvatar from '../UserAvatar';

interface HomeViewProps {
  profile: UserProfile;
  unreadNotifications: number;
  onNavigate: (tab: MainTab) => void;
}

export default function HomeView({ profile, unreadNotifications, onNavigate }: HomeViewProps) {
  const [quickText, setQuickText] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translateResult, setTranslateResult] = useState<{
    translation: string;
    pronunciation: string;
    example: string;
    exampleTranslation: string;
  } | null>(null);
  const [translateErr, setTranslateErr] = useState<string | null>(null);

  const langMeta = getLanguageByName(profile.targetLanguage);
  const weeklyPct = Math.min(100, Math.round((profile.weeklyXp / Math.max(1, profile.weeklyTargetXp)) * 100));
  const starterAlphabet = getStarterAlphabet(profile.targetLanguage);
  const spotlightLetter = starterAlphabet
    ? starterAlphabet.letters[new Date().getDate() % starterAlphabet.letters.length]
    : null;

  const handleQuickTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) return;
    setTranslating(true);
    setTranslateErr(null);
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: quickText.trim(),
          sourceLanguage: profile.nativeLanguage,
          targetLanguage: profile.targetLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'تعذر الترجمة حالياً.');
      setTranslateResult(data);
    } catch (err) {
      setTranslateErr(err instanceof Error ? err.message : 'تعذر الترجمة حالياً.');
    } finally {
      setTranslating(false);
    }
  };

  const quickCards: {
    id: MainTab;
    title: string;
    subtitle: string;
    icon: typeof PenTool;
    accent: string;
    borderHover: string;
  }[] = [
    {
      id: 'exercises',
      title: 'المراحل والتمارين',
      subtitle: `مسار المستوى ${profile.level} المتدرج · حروف، نطق، كتابة، ربط وقراءة`,
      icon: PenTool,
      accent: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm',
      borderHover: 'hover:border-emerald-500/70',
    },
    {
      id: 'chat',
      title: 'محادثة الأصدقاء',
      subtitle: `أضف أصدقاءك وتحدث معهم بـ ${profile.targetLanguage} أو تدرب صوتياً`,
      icon: MessageSquare,
      accent: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm',
      borderHover: 'hover:border-sky-500/70',
    },
    {
      id: 'challenges',
      title: 'التحدي الأسبوعي',
      subtitle: 'مهام أسبوعية ونقاط إضافية',
      icon: Trophy,
      accent: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm',
      borderHover: 'hover:border-amber-500/70',
    },
    {
      id: 'flashcards',
      title: 'البطاقات الذكية',
      subtitle: 'مراجعة المفردات المحفوظة بالنطق',
      icon: Layers,
      accent: 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm',
      borderHover: 'hover:border-indigo-500/70',
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      subtitle: unreadNotifications > 0 ? `${unreadNotifications} تنبيه غير مقروء` : 'كل التنبيهات مقروءة',
      icon: Bell,
      accent: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm',
      borderHover: 'hover:border-rose-500/70',
    },
    {
      id: 'account',
      title: 'حسابي',
      subtitle: 'الصورة، الإنجازات، اللغات، وتغيير المستوى',
      icon: User,
      accent: 'bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-sm',
      borderHover: 'hover:border-purple-500/70',
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      subtitle: 'الوضع الليلي، سرعة الصوت، والتنبيهات اليومية',
      icon: Settings,
      accent: 'bg-gradient-to-br from-cyan-500 to-teal-700 text-white shadow-sm',
      borderHover: 'hover:border-cyan-500/70',
    },
  ];

  const skills = [
    { label: 'القراءة', value: profile.skillReading, barColor: 'bg-sky-500', textColor: 'text-sky-600 dark:text-sky-400' },
    { label: 'الكتابة', value: profile.skillWriting, barColor: 'bg-violet-500', textColor: 'text-violet-600 dark:text-violet-400' },
    { label: 'التحدث', value: profile.skillSpeaking, barColor: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'الاستماع', value: profile.skillListening, barColor: 'bg-cyan-500', textColor: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'المفردات', value: profile.skillVocabulary, barColor: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Summary Card */}
      <section className="bg-gradient-to-br from-[#081B3E] via-[#0F2F6B] to-[#065F46] text-white rounded-3xl p-5 sm:p-7 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-emerald-300">
              <LanguageFlag
                language={profile.nativeLanguage}
                arabicCountryCode={profile.arabicCountryCode}
                size="xs"
              />
              <span>{profile.nativeLanguage}</span>
              <span>←</span>
              <LanguageFlag
                language={profile.targetLanguage}
                arabicCountryCode={profile.arabicCountryCode}
                size="xs"
              />
              <span>
                {profile.targetLanguage} ({langMeta.nativeName}) · المستوى {profile.level} ({profile.levelLabel})
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <UserAvatar
                uid={profile.uid}
                displayName={profile.displayName}
                avatarId={profile.avatarId}
                size="md"
                className="ring-2 ring-emerald-400/60"
              />
              <h1 className="text-xl sm:text-3xl font-bold text-balance">
                أهلاً {profile.displayName}، واصل مراحل تعلمك اليوم
              </h1>
            </div>

            <p className="text-sm text-slate-200 max-w-xl">
              مسارك مخصّص لغرض <span className="font-semibold text-white">{profile.purpose}</span> بواقع{' '}
              <span className="font-mono-num font-semibold">{profile.dailyGoalMinutes}</span> دقيقة يومياً.
            </p>
            <div className="pt-1.5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => onNavigate('exercises')}
                className="min-h-[44px] px-5 rounded-xl border-b-4 border-emerald-700 bg-emerald-400 hover:bg-emerald-300 active:translate-y-0.5 text-[#081B3E] font-extrabold text-sm transition-all cursor-pointer"
              >
                متابعة المراحل والتمارين
              </button>
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className="min-h-[44px] px-5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                محادثة الأصدقاء
              </button>
            </div>
          </div>

          {/* Weekly XP Ring & Key Metrics */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-sm rounded-2xl p-4 shrink-0 border border-white/10">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="7" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - weeklyPct / 100)}`}
                />
              </svg>
              <span className="absolute font-mono-num font-bold text-sm">{weeklyPct}%</span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="font-mono-num font-bold">{profile.streakDays}</span>
                <span className="text-slate-200 text-xs">أيام متتالية</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-300" />
                <span className="font-mono-num font-bold">{profile.xp}</span>
                <span className="text-slate-200 text-xs">نقطة XP</span>
              </div>
              <div className="text-xs text-slate-300 font-mono-num">
                الأسبوع: {profile.weeklyXp} / {profile.weeklyTargetXp} XP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Letter & Opposite Pronunciation Spotlight */}
      {spotlightLetter && (
        <section className="bg-gradient-to-l from-emerald-50 via-white to-sky-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-sky-950/40 border border-emerald-200 dark:border-emerald-900/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border-2 border-emerald-400 dark:border-emerald-600 flex flex-col items-center justify-center shrink-0">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white leading-none" dir="ltr">
                {spotlightLetter.letter}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {getOppositePronunciation(spotlightLetter, profile.nativeLanguage)}
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <LanguageFlag
                  language={profile.targetLanguage}
                  arabicCountryCode={profile.arabicCountryCode}
                  size="xs"
                />
                <span>حرف اليوم في {profile.targetLanguage}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {spotlightLetter.exampleWord} ({spotlightLetter.examplePronunciation}) —{' '}
                <span className="text-sky-700 dark:text-sky-300">{spotlightLetter.exampleMeaning}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">{spotlightLetter.soundHint}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                speakText(
                  `${spotlightLetter.letter.split(' ')[0]}. ${spotlightLetter.exampleWord}`,
                  profile.targetLanguage,
                  profile.speechRate
                )
              }
              className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>نطق الحرف</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('exercises')}
              className="min-h-[42px] px-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold cursor-pointer"
            >
              بدء المرحلة الأولى
            </button>
          </div>
        </section>
      )}

      {/* All Main Sections Grid */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">أقسام التطبيق</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {quickCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${card.borderHover} rounded-2xl p-4 text-right transition-all flex items-start gap-3.5 cursor-pointer group`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {card.title}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {card.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Two-Column Pro Row: Quick Translator + Skill Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
              <Languages className="w-5 h-5 text-emerald-600" />
              <span>مترجم ومختبر النطق الفوري</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {profile.nativeLanguage} → {profile.targetLanguage}
            </span>
          </div>

          <form onSubmit={handleQuickTranslate} className="flex gap-2">
            <input
              type="text"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              placeholder={`اكتب كلمة أو جملة لترجمتها إلى ${profile.targetLanguage}...`}
              className="flex-1 min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={translating || !quickText.trim()}
              className="min-h-[46px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>{translating ? 'جاري...' : 'ترجمة'}</span>
            </button>
          </form>

          {translateErr && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{translateErr}</p>
          )}

          {translateResult && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-lg font-bold text-[#081B3E] dark:text-emerald-300">
                  {translateResult.translation}
                </div>
                <button
                  type="button"
                  onClick={() => speakText(translateResult.translation, profile.targetLanguage, profile.speechRate)}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center cursor-pointer"
                  aria-label="استماع للنطق"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                النطق: {translateResult.pronunciation}
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">{translateResult.example}</div>
                <div className="text-slate-500 dark:text-slate-400">{translateResult.exampleTranslation}</div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              مؤشر إتقان المهارات الخمس
            </h2>
            <span className="text-xs font-mono-num text-slate-500 dark:text-slate-400">
              {profile.completedLessonsCount} مراحل · {profile.completedExercisesCount} تمارين
            </span>
          </div>

          <div className="space-y-3">
            {skills.map((s) => (
              <div key={s.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-200">{s.label}</span>
                  <span className={`font-mono-num ${s.textColor}`}>{s.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.barColor} transition-all duration-500`}
                    style={{ width: `${Math.max(4, s.value)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
