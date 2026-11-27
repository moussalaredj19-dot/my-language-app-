import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AppLogo from './AppLogo';
import classroomHeroImg from '../assets/images/study_classroom_two_students_1795806725481.jpg';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [imageBroken, setImageBroken] = useState(false);

  return (
    <main className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#06101f] px-5 py-6 sm:py-9 relative overflow-hidden">
      {/* Classroom Study Ambient Wall & Warm Overhead Lamp Glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(251, 191, 36, 0.10) 0%, rgba(15, 42, 74, 0.42) 38%, #06101f 82%)',
          }}
        />
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[260px] rounded-full blur-3xl opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(52, 211, 153, 0.35), rgba(245, 158, 11, 0.14), transparent 70%)',
          }}
        />
      </div>

      {/* Top: Clear Modern App Logo & Wordmark */}
      <header className="relative z-10 flex flex-col items-center text-center pt-1 gap-2.5">
        <AppLogo size="md" />
        <h1
          dir="ltr"
          className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(52,211,153,0.38)]"
        >
          My Language
        </h1>
        <p className="text-xs sm:text-sm font-medium text-amber-200/85 text-balance">
          قسم الدراسة التفاعلي · سبورة اللغات العالمية ومراحلك المتدرجة
        </p>
      </header>

      {/* Center: Study Classroom with Chalkboard of World Language Letters & Two Students */}
      <section className="relative z-10 flex-1 flex items-center justify-center my-3 select-none">
        {!imageBroken ? (
          <div className="relative w-full max-w-xl flex items-center justify-center">
            <img
              src={classroomHeroImg}
              alt="طالبان في قسم للدراسة أمام سبورة مكتوب عليها حروف لغات العالم"
              referrerPolicy="no-referrer"
              onError={() => setImageBroken(true)}
              className="w-full h-auto max-h-[54dvh] object-contain [mask-image:radial-gradient(ellipse_92%_90%_at_50%_50%,black_74%,transparent_100%)]"
            />
          </div>
        ) : (
          <div className="w-full max-w-lg rounded-2xl border-4 border-amber-800/80 bg-[#12332a] p-6 text-center space-y-4 shadow-2xl">
            <div className="text-lg sm:text-xl font-extrabold tracking-widest text-white/95 leading-relaxed">
              أ ب ج ع ض ي · А Б Д Ж Я И · A E É Ñ Ç Ü ß
            </div>
            <AppLogo size="lg" />
          </div>
        )}
      </section>

      {/* Bottom: Start Button */}
      <footer className="relative z-10 w-full max-w-md mx-auto pb-safe">
        <button
          type="button"
          onClick={onStart}
          className="w-full min-h-[56px] rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-l from-emerald-500 via-emerald-400 to-teal-400 hover:brightness-105 active:translate-y-0.5 text-[#020617] font-extrabold text-lg shadow-[0_0_32px_rgba(52,211,153,0.32)] transition-all flex items-center justify-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60"
        >
          <span>البدء</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </footer>
    </main>
  );
}
