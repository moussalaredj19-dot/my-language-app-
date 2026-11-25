import { ArrowLeft, Sparkles } from 'lucide-react';
import EarthGlobe3D from './EarthGlobe3D';
import SpaceBackdrop from './SpaceBackdrop';

interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#02040a] px-6 py-8 sm:py-12 relative overflow-hidden">
      <SpaceBackdrop />

      {/* Top: Luminous Brand Header over Space Black */}
      <header className="relative z-10 flex flex-col items-center text-center pt-2">
        <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wide text-emerald-400 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>رحلتك عبر 8 لغات عالمية</span>
        </div>
        <h1
          dir="ltr"
          className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_24px_rgba(52,211,153,0.45)]"
        >
          My Language
        </h1>
        <p className="mt-2.5 text-sm sm:text-base font-medium text-slate-300 max-w-md text-balance">
          تعلّم اللغات بمراحل تفاعلية متدرجة، تمارين نطق صوتية، ومحادثات حقيقية مع الأصدقاء
        </p>
      </header>

      {/* Center: Realistic 3D Earth Globe in Starry Space */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center my-2">
        <EarthGlobe3D />
      </section>

      {/* Bottom: Start Button */}
      <footer className="relative z-10 w-full max-w-md mx-auto pb-safe">
        <button
          type="button"
          onClick={onStart}
          className="w-full min-h-[56px] rounded-2xl border-b-4 border-emerald-700 bg-gradient-to-l from-emerald-500 via-emerald-400 to-teal-400 hover:brightness-105 active:translate-y-0.5 text-[#020617] font-extrabold text-lg shadow-[0_0_32px_rgba(52,211,153,0.35)] transition-all flex items-center justify-center gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300/60"
        >
          <span>البدء</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </footer>
    </main>
  );
}
