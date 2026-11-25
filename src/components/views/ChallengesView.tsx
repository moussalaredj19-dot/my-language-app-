import { CheckCircle2, Flame, Trophy } from 'lucide-react';
import { playFeedbackSound } from '../../lib/sound';
import { UserProfile, WeeklyChallengeProgress } from '../../types';

interface ChallengesViewProps {
  profile: UserProfile;
  challenges: WeeklyChallengeProgress[];
  onAdvanceChallenge: (challenge: WeeklyChallengeProgress) => Promise<void>;
}

export default function ChallengesView({
  profile,
  challenges,
  onAdvanceChallenge,
}: ChallengesViewProps) {
  const weeklyPct = Math.min(
    100,
    Math.round((profile.weeklyXp / Math.max(1, profile.weeklyTargetXp)) * 100)
  );

  return (
    <div className="space-y-5">
      {/* Weekly Banner */}
      <section className="bg-gradient-to-l from-amber-500 via-orange-500 to-rose-500 text-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-100">
              <Trophy className="w-4 h-4" />
              <span>التحدي الأسبوعي النشط</span>
            </div>
            <h1 className="text-2xl font-bold">تحدي الإتقان المستمر في {profile.targetLanguage}</h1>
            <p className="text-sm text-white/90">
              أكمل مهام الأسبوع واجمع <span className="font-mono-num font-bold">{profile.weeklyTargetXp}</span> نقطة XP لفتح وسام الأسبوع الذهبي.
            </p>
          </div>
          <div className="bg-white/15 rounded-2xl p-4 text-center shrink-0 min-w-[140px]">
            <div className="text-3xl font-extrabold font-mono-num">{weeklyPct}%</div>
            <div className="text-xs font-mono-num mt-1">
              {profile.weeklyXp} / {profile.weeklyTargetXp} XP
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Missions List */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">مهام هذا الأسبوع</h2>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Flame className="w-4 h-4" />
            <span className="font-mono-num">{profile.streakDays} أيام متواصلة</span>
          </div>
        </div>

        <div className="space-y-3">
          {challenges.map((ch) => {
            const pct = Math.min(100, Math.round((ch.completedTasks / Math.max(1, ch.targetTasks)) * 100));
            const done = ch.status === 'completed';
            return (
              <div
                key={ch.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 bg-slate-50/70 dark:bg-slate-950/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ch.title}</h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-num mt-0.5">
                      التقدم: {ch.completedTasks} / {ch.targetTasks} · المكافأة: +{ch.xpReward} XP
                    </div>
                  </div>
                  {done ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>مكتمل</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        await onAdvanceChallenge(ch);
                        playFeedbackSound('success', profile.soundEnabled);
                      }}
                      className="min-h-[40px] px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                    >
                      تسجيل مهمة (+1)
                    </button>
                  )}
                </div>

                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      done ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
