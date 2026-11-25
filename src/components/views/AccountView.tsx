import { useRef, useState } from 'react';
import { Award, Camera, Check, Flag, Globe, LogOut, Save, User } from 'lucide-react';
import {
  AVATAR_PRESETS,
  compressImageFileToAvatar,
  getLocalProfilePhoto,
  saveLocalProfilePhoto,
} from '../../data/avatars';
import { PROFICIENCY_LEVELS, WORLD_LANGUAGES } from '../../data/languages';
import { playFeedbackSound } from '../../lib/sound';
import { UserProfile } from '../../types';
import LanguageFlag, { ARAB_COUNTRIES } from '../LanguageFlag';
import UserAvatar from '../UserAvatar';

interface AccountViewProps {
  profile: UserProfile;
  onUpdateLearningPath: (updates: {
    displayName: string;
    targetLanguage: string;
    level: 1 | 2 | 3 | 4 | 5;
    levelLabel: string;
    avatarId?: string;
    arabicCountryCode?: string;
  }) => Promise<void>;
  onSignOut: () => Promise<void>;
}

export default function AccountView({
  profile,
  onUpdateLearningPath,
  onSignOut,
}: AccountViewProps) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [targetLanguage, setTargetLanguage] = useState(profile.targetLanguage);
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(profile.level);
  const [avatarId, setAvatarId] = useState(profile.avatarId || 'astro');
  const [arabicCountryCode, setArabicCountryCode] = useState(profile.arabicCountryCode || 'DZ');
  const [customPhotoPreview, setCustomPhotoPreview] = useState<string | null>(() =>
    getLocalProfilePhoto(profile.uid)
  );
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    try {
      const compressed = await compressImageFileToAvatar(file);
      setCustomPhotoPreview(compressed);
      setAvatarId('custom');
      saveLocalProfilePhoto(profile.uid, compressed);
      playFeedbackSound('success', profile.soundEnabled);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'تعذر تحميل الصورة.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      const def = PROFICIENCY_LEVELS.find((l) => l.level === level) || PROFICIENCY_LEVELS[0];
      if (customPhotoPreview && avatarId === 'custom') {
        saveLocalProfilePhoto(profile.uid, customPhotoPreview);
      }
      await onUpdateLearningPath({
        displayName: displayName.trim() || profile.displayName,
        targetLanguage,
        level,
        levelLabel: def.label,
        avatarId,
        arabicCountryCode,
      });
      setSavedNotice(true);
      playFeedbackSound('success', profile.soundEnabled);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const showsArabic = profile.nativeLanguage === 'العربية' || targetLanguage === 'العربية';

  return (
    <div className="space-y-6">
      {/* Account Profile Header */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            uid={profile.uid}
            displayName={profile.displayName}
            avatarId={avatarId}
            customPhotoUrl={customPhotoPreview}
            size="lg"
          />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{profile.displayName}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400" dir="ltr">
              {profile.email || 'متعلم My Language'}
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1.5">
              <LanguageFlag
                language={profile.targetLanguage}
                arabicCountryCode={profile.arabicCountryCode}
                size="sm"
              />
              <span>
                يتعلم {profile.targetLanguage} · المستوى {profile.level} ({profile.levelLabel})
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void onSignOut()}
          className="min-h-[44px] px-4 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </section>

      {/* Stats Summary */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي النقاط', value: `${profile.xp} XP`, cls: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'أيام الاستمرار', value: `${profile.streakDays} يوم`, cls: 'text-amber-600 dark:text-amber-400' },
          { label: 'المراحل المكتملة', value: String(profile.completedLessonsCount), cls: 'text-sky-600 dark:text-sky-400' },
          { label: 'التمارين المنجزة', value: String(profile.completedExercisesCount), cls: 'text-violet-600 dark:text-violet-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
          >
            <div className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</div>
            <div className={`text-xl font-extrabold font-mono-num mt-1 ${stat.cls}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </section>

      {/* Edit Avatar, Name, Target Language, Country Flag & Level */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5"
      >
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-600" />
          <span>تحديث بيانات الحساب والصورة ومسار التعلم</span>
        </h2>

        {/* Avatar / Custom Photo Editor */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar
                uid={profile.uid}
                displayName={displayName || profile.displayName}
                avatarId={avatarId}
                customPhotoUrl={customPhotoPreview}
                size="md"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">الصورة الشخصية والأفاتار</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  اختر شخصية أو ارفع صورة من جهازك ثم اضغط حفظ
                </div>
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
                className="min-h-[38px] px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>تغيير الصورة</span>
              </button>
            </div>
          </div>

          {photoError && <p className="text-xs text-rose-500">{photoError}</p>}

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const selected = avatarId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setAvatarId(preset.id);
                    playFeedbackSound('tap', profile.soundEnabled);
                  }}
                  className={`relative p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    selected
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <UserAvatar avatarId={preset.id} displayName={preset.label} size="xs" />
                  <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                    {preset.label}
                  </span>
                  {selected && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="acc-name" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              الاسم
            </label>
            <input
              id="acc-name"
              type="text"
              maxLength={80}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="acc-target" className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>اللغة التي تتعلمها</span>
              </span>
              <LanguageFlag
                language={targetLanguage}
                arabicCountryCode={arabicCountryCode}
                size="xs"
              />
            </label>
            <select
              id="acc-target"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            >
              {WORLD_LANGUAGES.map((l) => (
                <option key={l.id} value={l.nameAr}>
                  {l.nameAr} — {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showsArabic && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Flag className="w-3.5 h-3.5 text-emerald-600" />
              <span>العلم الوطني الظاهر مع العربية في الشريط العلوي</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ARAB_COUNTRIES.map((country) => {
                const active = arabicCountryCode === country.code;
                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setArabicCountryCode(country.code)}
                    className={`min-h-[34px] px-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
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
        )}

        <div>
          <label htmlFor="acc-level" className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            <span className="inline-flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>مستواك الحالي (لكل مستوى مراحله الخاصة)</span>
            </span>
          </label>
          <select
            id="acc-level"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
            className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
          >
            {PROFICIENCY_LEVELS.map((lvl) => (
              <option key={lvl.level} value={lvl.level}>
                {lvl.level}. {lvl.label} ({lvl.cefr})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedNotice ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              تم حفظ التغييرات وتحديث المنهج بنجاح.
            </span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={saving}
            className="min-h-[46px] px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
