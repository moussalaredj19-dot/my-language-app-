import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { UserNotification } from '../../types';

interface NotificationsViewProps {
  notifications: UserNotification[];
  onMarkRead: (notifId: string) => Promise<void>;
  onDelete: (notifId: string) => Promise<void>;
  onRequestBrowserPush: () => void;
}

export default function NotificationsView({
  notifications,
  onMarkRead,
  onDelete,
  onRequestBrowserPush,
}: NotificationsViewProps) {
  const categoryLabels: Record<UserNotification['category'], string> = {
    reminder: 'تذكير يومي',
    challenge: 'التحدي الأسبوعي',
    achievement: 'إنجاز جديد',
    lesson: 'درس مقترح',
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span>الإشعارات والتنبيهات</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تذكيرات الدراسة اليومية، تحديثات التحدي الأسبوعي، وتنبيهات الإنجازات.
          </p>
        </div>
        <button
          type="button"
          onClick={onRequestBrowserPush}
          className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer whitespace-nowrap"
        >
          تفعيل إشعارات الجهاز
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          لا توجد إشعارات حالياً.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-2xl border p-4 flex items-start justify-between gap-3 transition-colors ${
                n.read
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
                  : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
              }`}
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {categoryLabels[n.category]} {!n.read && '· جديد'}
                </div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">{n.body}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => void onMarkRead(n.id)}
                    className="min-h-[38px] min-w-[38px] rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 flex items-center justify-center cursor-pointer"
                    aria-label="تحديد كمقروء"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void onDelete(n.id)}
                  className="min-h-[38px] min-w-[38px] rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer"
                  aria-label="حذف الإشعار"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
