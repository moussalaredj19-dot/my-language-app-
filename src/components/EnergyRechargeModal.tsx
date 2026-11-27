import { useEffect, useState } from 'react';
import { Check, Clock, Crown, Gem, Sparkles, X, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface EnergyRechargeModalProps {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onRechargeWithGems: () => Promise<void>;
  onSelectSubscription: (tier: 'free' | 'plus_monthly' | 'plus_yearly') => Promise<void>;
}

function getCountdownToTomorrow(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const diffSec = Math.max(0, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
  const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
  const s = String(diffSec % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function EnergyRechargeModal({
  open,
  profile,
  onClose,
  onRechargeWithGems,
  onSelectSubscription,
}: EnergyRechargeModalProps) {
  const [countdown, setCountdown] = useState(getCountdownToTomorrow);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setFeedback(null);
    const id = window.setInterval(() => setCountdown(getCountdownToTomorrow()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  if (!open) return null;

  const energy = profile.energy ?? 5;
  const maxEnergy = profile.maxEnergy ?? 5;
  const gems = profile.gems ?? 100;
  const tier = profile.subscriptionTier || 'free';
  const isUnlimited = tier !== 'free';

  const handleGemsRefill = async () => {
    if (gems < 50 || energy >= maxEnergy || busyAction) return;
    setBusyAction('gems');
    setFeedback(null);
    try {
      await onRechargeWithGems();
      setFeedback('تم شحن طاقتك بالكامل (5/5) بنجاح!');
    } finally {
      setBusyAction(null);
    }
  };

  const handleSubscribe = async (nextTier: 'free' | 'plus_monthly' | 'plus_yearly') => {
    if (busyAction) return;
    setBusyAction(nextTier);
    setFeedback(null);
    try {
      await onSelectSubscription(nextTier);
      setFeedback(
        nextTier === 'free'
          ? 'تم التبديل إلى الخطة المجانية.'
          : 'تم تفعيل اشتراك My Language Plus — لديك الآن طاقة غير محدودة!'
      );
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="إدارة الطاقة والاشتراكات"
    >
      <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-5 max-h-[90dvh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {energy === 0 && !isUnlimited
                  ? 'نفدت طاقتك لليوم!'
                  : 'الطاقة والعضوية المميزة'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isUnlimited
                  ? 'عضوية بلس نشطة · طاقة غير محدودة'
                  : `الطاقة المتبقية: ${energy} / ${maxEnergy} · رصيد الجواهر: ${gems}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Energy meter bar */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>مخزون الطاقة</span>
            </span>
            <span className="font-mono-num text-emerald-600 dark:text-emerald-400">
              {isUnlimited ? '∞ غير محدود' : `${energy} / ${maxEnergy}`}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((slot) => {
              const filled = isUnlimited || slot < energy;
              return (
                <div
                  key={slot}
                  className={`h-3 rounded-full transition-colors ${
                    filled
                      ? 'bg-gradient-to-l from-emerald-500 to-amber-400'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
          {!isUnlimited && (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-500" />
                <span>الشحن التلقائي المجاني غداً بعد:</span>
              </span>
              <span className="font-mono-num font-bold text-slate-900 dark:text-white" dir="ltr">
                {countdown}
              </span>
            </div>
          )}
        </div>

        {/* Recharge with Gems */}
        {!isUnlimited && (
          <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/30 p-4 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Gem className="w-4 h-4 text-sky-500" />
                <span>شحن فوري بالجواهر</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                استبدل 50 جوهرة لشحن 5/5 طاقة فوراً والعودة للمراحل.
              </p>
            </div>
            <button
              type="button"
              disabled={gems < 50 || energy >= maxEnergy || busyAction !== null}
              onClick={() => void handleGemsRefill()}
              className="min-h-[44px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
            >
              {busyAction === 'gems' ? 'جاري الشحن...' : 'شحن (50 جوهرة)'}
            </button>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400">
            <Crown className="w-4 h-4" />
            <span>باقات الاشتراك — طاقة غير محدودة وشحن دائم</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleSubscribe('plus_monthly')}
              className={`rounded-2xl border-2 p-4 text-right space-y-1.5 transition-all cursor-pointer ${
                tier === 'plus_monthly'
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  بلس الشهري
                </span>
                {tier === 'plus_monthly' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-lg font-extrabold font-mono-num text-emerald-600 dark:text-emerald-400">
                ∞ طاقة بلا حدود
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                انتقال حر بين جميع المراحل + +100 جوهرة هدية
              </p>
            </button>

            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleSubscribe('plus_yearly')}
              className={`rounded-2xl border-2 p-4 text-right space-y-1.5 transition-all cursor-pointer ${
                tier === 'plus_yearly'
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40'
                  : 'border-slate-200 dark:border-slate-800 hover:border-amber-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>بلس السنوي</span>
                </span>
                {tier === 'plus_yearly' && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <div className="text-lg font-extrabold font-mono-num text-amber-600 dark:text-amber-400">
                ∞ توفير 40%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                طاقة غير محدودة طوال العام + +250 جوهرة ترحيبية
              </p>
            </button>
          </div>

          {tier !== 'free' && (
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => void handleSubscribe('free')}
              className="w-full min-h-[38px] text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              العودة إلى الخطة المجانية (5 طاقات يومياً)
            </button>
          )}
        </div>

        {feedback && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-200 text-center">
            {feedback}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
