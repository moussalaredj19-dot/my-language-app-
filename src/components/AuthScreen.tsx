import { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import AppLogo from './AppLogo';
import SpaceBackdrop from './SpaceBackdrop';

interface AuthScreenProps {
  onBack: () => void;
  onAuthenticated: () => void;
}

export default function AuthScreen({ onBack, onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const mapFirebaseAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'صيغة البريد الإلكتروني غير صحيحة.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'البريد الإلكتروني أو كلمة السر غير صحيحة.';
      case 'auth/wrong-password':
        return 'كلمة السر غير صحيحة.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول مباشرة.';
      case 'auth/weak-password':
        return 'كلمة السر يجب أن تكون 6 أحرف على الأقل.';
      case 'auth/operation-not-allowed':
        return 'تسجيل الدخول بالبريد وكلمة السر يحتاج تفعيل المزود من لوحة تحكم Firebase، أو يمكنك تسجيل الدخول عبر Google فوراً.';
      case 'auth/popup-closed-by-user':
        return 'تم إغلاق نافذة تسجيل الدخول عبر Google قبل الإكمال.';
      case 'auth/popup-blocked':
        return 'المتصفح حظر النافذة المنبثقة. يرجى السماح بالنوافذ المنبثقة ثم المحاولة مجدداً.';
      default:
        return err instanceof Error ? err.message : 'حدث خطأ أثناء تسجيل الدخول.';
    }
  };

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة السر.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        try {
          await sendEmailVerification(cred.user);
          setInfoMsg('تم إنشاء حسابك بنجاح وإرسال رابط تحقق إلى بريدك.');
        } catch {
          // Non-blocking verification email
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onAuthenticated();
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onAuthenticated();
    } catch (err) {
      setErrorMsg(mapFirebaseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#02040a] text-white flex flex-col relative overflow-hidden">
      <SpaceBackdrop />

      {/* Top Bar */}
      <header className="relative z-10 px-4 sm:px-8 h-16 flex items-center justify-between border-b border-white/10 bg-slate-950/60 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="العودة"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <AppLogo size="sm" showText darkBackground />
        <div className="w-11" aria-hidden="true" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-slate-950/75 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.12)]">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white text-balance">
              {mode === 'login' ? 'تسجيل الدخول إلى حسابك' : 'إنشاء حساب متعلم جديد'}
            </h1>
            <p className="mt-1.5 text-sm text-slate-300">
              احفظ مستواك، مراحلك التفاعلية، وأصدقاءك عبر جميع أجهزتك.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`min-h-[40px] rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`min-h-[40px] rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'signup'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-semibold text-slate-200 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  dir="ltr"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full min-h-[48px] pr-11 pl-4 rounded-xl border border-white/15 bg-black/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-left"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-semibold text-slate-200 mb-1.5">
                كلمة السر
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[48px] pr-11 pl-11 rounded-xl border border-white/15 bg-black/50 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-left"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center absolute left-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-sm text-rose-200">
                {errorMsg}
              </div>
            )}

            {infoMsg && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-sm text-emerald-200">
                {infoMsg}
              </div>
            )}

            <div className="relative py-2 flex items-center">
              <div className="flex-grow border-t border-white/10" />
              <span className="mx-3 text-xs font-medium text-slate-400">أو</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full min-h-[48px] rounded-xl border border-white/15 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z" />
                <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
              </svg>
              <span>تسجيل الدخول عبر Google</span>
            </button>

            {/* Bottom Next Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[52px] rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-l from-emerald-500 to-teal-400 hover:brightness-105 active:translate-y-0.5 text-slate-950 font-extrabold text-base shadow-[0_0_24px_rgba(52,211,153,0.28)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'جاري التحقق...' : 'التالي'}</span>
                {!loading && <ArrowLeft className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
