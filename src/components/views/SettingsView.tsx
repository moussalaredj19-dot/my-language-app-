import { useEffect, useState } from 'react';
import { Bell, Flag, Moon, Save, Settings, Sun, Volume2 } from 'lucide-react';
import { UserProfile } from '../../types';
import LanguageFlag, { ARAB_COUNTRIES } from '../LanguageFlag';

interface SettingsViewProps {
  profile: UserProfile;
  onQuickThemeChange: (theme: 'light' | 'dark') => Promise<void>;
  onSaveSettings: (settings: {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    speechRate: number;
    notificationsEnabled: boolean;
    reminderTime: string;
    dailyGoalMinutes: number;
    weeklyTargetXp: number;
    arabicCountryCode: string;
  }) => Promise<void>;
}

export default function SettingsView({
  profile,
  onQuickThemeChange,
  onSaveSettings,
}: SettingsViewProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(profile.theme);
  const [soundEnabled, setSoundEnabled] = useState(profile.soundEnabled);
  const [speechRate, setSpeechRate] = useState(profile.speechRate);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notificationsEnabled);
  const [reminderTime, setReminderTime] = useState(profile.reminderTime);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(profile.dailyGoalMinutes);
  const [weeklyTargetXp, setWeeklyTargetXp] = useState(profile.weeklyTargetXp);
  const [arabicCountryCode, setArabicCountryCode] = useState(profile.arabicCountryCode || 'DZ');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync local theme if toggled from header
  useEffect(() => {
    setTheme(profile.theme);
  }, [profile.theme]);

  useEffect(() => {
    if (profile.arabicCountryCode) {
      setArabicCountryCode(profile.arabicCountryCode);
    }
  }, [profile.arabicCountryCode]);

  const handleImmediateThemeSelect = (nextTheme: 'light' | 'dark') => {
    setTheme(nextTheme);
    void onQuickThemeChange(nextTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await onSaveSettings({
        theme,
        soundEnabled,
        speechRate,
        notificationsEnabled,
        reminderTime,
        dailyGoalMinutes,
        weeklyTargetXp,
        arabicCountryCode,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            <span>الإعدادات</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تحكم في الوضع الليلي والنهاري، الصوتيات، العلم الوطني، وأهدافك اليومية.
          </p>
        </div>
      </div>

      {/* Appearance & Audio */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">مظهر التطبيق (ليلي / نهاري)</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">يتغيّر المظهر فوراً عند الضغط على الوضع المطلوب</div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => handleImmediateThemeSelect('light')}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-amber-400/50'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>نهاري</span>
            </button>
            <button
              type="button"
              onClick={() => handleImmediateThemeSelect('dark')}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950 text-white shadow-sm ring-1 ring-sky-500/60'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-sky-400" />
              <span>ليلي</span>
            </button>
          </div>
        </div>

        {/* National Flag for Arabic */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Flag className="w-4 h-4 text-emerald-600" />
              <span>العلم الوطني للغة العربية</span>
            </div>
            <LanguageFlag language="العربية" arabicCountryCode={arabicCountryCode} size="md" />
          </div>
          <div className="flex flex-wrap gap-2">
            {ARAB_COUNTRIES.map((country) => {
              const active = arabicCountryCode === country.code;
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => setArabicCountryCode(country.code)}
                  className={`min-h-[36px] px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <LanguageFlag language="العربية" arabicCountryCode={country.code} size="xs" />
                  <span>{country.nameAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>المؤثرات الصوتية والاهتزاز التفاعلي</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">تشغيل أصوات التشجيع والاهتزاز على أندرويد عند حل التمارين</div>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-pressed={soundEnabled}
            className={`min-h-[38px] px-4 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              soundEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {soundEnabled ? 'مفعّل' : 'متوقف'}
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white">
            <span>سرعة القراءة الصوتية والنطق</span>
            <span className="font-mono-num text-emerald-600 dark:text-emerald-400">{speechRate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={1.4}
            step={0.1}
            value={speechRate}
            onChange={(e) => setSpeechRate(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </div>
      </div>

      {/* Notifications & Goals */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-emerald-600" />
              <span>تفعيل تنبيهات الدراسة</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">تذكير يومي للحفاظ على سلسلة الإنجاز</div>
          </div>
          <button
            type="button"
            onClick={() => setNotificationsEnabled((v) => !v)}
            aria-pressed={notificationsEnabled}
            className={`min-h-[38px] px-4 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              notificationsEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {notificationsEnabled ? 'مفعّل' : 'متوقف'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label htmlFor="set-time" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              وقت التذكير اليومي
            </label>
            <input
              id="set-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white font-mono-num"
            />
          </div>

          <div>
            <label htmlFor="set-daily" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              الهدف اليومي (دقيقة)
            </label>
            <input
              id="set-daily"
              type="number"
              min={5}
              max={180}
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(Math.min(180, Math.max(5, Number(e.target.value) || 15)))}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white font-mono-num"
            />
          </div>

          <div>
            <label htmlFor="set-weekly" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              هدف النقاط الأسبوعي (XP)
            </label>
            <input
              id="set-weekly"
              type="number"
              min={50}
              max={50000}
              step={50}
              value={weeklyTargetXp}
              onChange={(e) => setWeeklyTargetXp(Math.min(50000, Math.max(50, Number(e.target.value) || 300)))}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white font-mono-num"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {saved ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            تم حفظ الإعدادات بنجاح.
          </span>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={saving}
          className="min-h-[48px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
        </button>
      </div>
    </form>
  );
}
