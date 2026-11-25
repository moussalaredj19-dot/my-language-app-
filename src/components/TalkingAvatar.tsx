import { useEffect, useState } from 'react';
import { Turtle, Volume2 } from 'lucide-react';
import { speakText, subscribeSpeakingState } from '../lib/speech';

interface TalkingAvatarProps {
  text?: string;
  languageName?: string;
  speechRate?: number;
  label?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'emerald' | 'sky' | 'violet';
  showControls?: boolean;
  forceSpeaking?: boolean;
}

export default function TalkingAvatar({
  text,
  languageName = 'الإنجليزية',
  speechRate = 1.0,
  label = 'المدرب الصوتي',
  subtitle,
  size = 'md',
  variant = 'emerald',
  showControls = false,
  forceSpeaking = false,
}: TalkingAvatarProps) {
  const [globalSpeaking, setGlobalSpeaking] = useState(false);
  const [mouthStep, setMouthStep] = useState(0);
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    return subscribeSpeakingState((isSpeaking, spoken) => {
      if (!text) {
        setGlobalSpeaking(isSpeaking);
      } else {
        setGlobalSpeaking(isSpeaking && (spoken === text.trim() || spoken.includes(text.trim())));
      }
    });
  }, [text]);

  const isTalking = forceSpeaking || globalSpeaking;

  // Mouth articulation cycle while talking
  useEffect(() => {
    if (!isTalking) {
      setMouthStep(0);
      return;
    }
    const id = window.setInterval(() => {
      setMouthStep((prev) => (prev + 1) % 4);
    }, 135);
    return () => window.clearInterval(id);
  }, [isTalking]);

  // Subtle natural blinking
  useEffect(() => {
    const id = window.setInterval(() => {
      setBlinking(true);
      window.setTimeout(() => setBlinking(false), 140);
    }, 3600);
    return () => window.clearInterval(id);
  }, []);

  const dimCls =
    size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-24 h-24' : 'w-20 h-20';

  const palette = {
    emerald: {
      ring: 'border-emerald-400/70',
      bg: 'from-emerald-500/20 via-teal-500/15 to-sky-500/20',
      hood: '#059669',
      hoodDark: '#065F46',
      accent: '#34D399',
    },
    sky: {
      ring: 'border-sky-400/70',
      bg: 'from-sky-500/20 via-cyan-500/15 to-indigo-500/20',
      hood: '#0284C7',
      hoodDark: '#075985',
      accent: '#38BDF8',
    },
    violet: {
      ring: 'border-violet-400/70',
      bg: 'from-violet-500/20 via-indigo-500/15 to-sky-500/20',
      hood: '#7C3AED',
      hoodDark: '#5B21B6',
      accent: '#A78BFA',
    },
  }[variant];

  const renderMouth = () => {
    if (!isTalking || mouthStep === 0) {
      return (
        <path
          d="M 43 60 Q 50 65 57 60"
          fill="none"
          stroke="#7C2D12"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      );
    }
    if (mouthStep === 1) {
      return <ellipse cx="50" cy="61" rx="5.5" ry="3.2" fill="#881337" />;
    }
    if (mouthStep === 2) {
      return <ellipse cx="50" cy="61.5" rx="6.5" ry="5" fill="#881337" />;
    }
    return <ellipse cx="50" cy="61" rx="4.2" ry="4.2" fill="#881337" />;
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className={`relative ${dimCls} shrink-0 flex items-center justify-center`}>
        {isTalking && (
          <>
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full border-2 ${palette.ring} animate-avatar-ring`}
            />
            <span
              aria-hidden="true"
              className={`absolute inset-0 rounded-full border-2 ${palette.ring} animate-avatar-ring`}
              style={{ animationDelay: '0.55s' }}
            />
          </>
        )}

        <div
          className={`relative w-full h-full rounded-full bg-gradient-to-br ${palette.bg} border-2 ${
            isTalking ? palette.ring : 'border-slate-200 dark:border-slate-700'
          } shadow-md flex items-center justify-center overflow-hidden transition-transform duration-200 ${
            isTalking ? 'scale-105' : ''
          }`}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
            {/* Shoulders / Hoodie */}
            <path
              d="M 18 98 C 20 77 33 72 50 72 C 67 72 80 77 82 98 Z"
              fill={palette.hood}
            />
            <path
              d="M 32 76 Q 50 86 68 76"
              fill="none"
              stroke={palette.hoodDark}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Neck */}
            <rect x="43" y="64" width="14" height="12" rx="6" fill="#FDBA74" />
            {/* Headphones Band */}
            <path
              d="M 22 48 C 22 24 78 24 78 48"
              fill="none"
              stroke="#0F172A"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Hair / Top */}
            <path
              d="M 26 44 C 26 24 74 24 74 44 C 66 36 34 36 26 44 Z"
              fill="#1E293B"
            />
            {/* Head */}
            <ellipse cx="50" cy="48" rx="22" ry="23" fill="#FED7AA" />
            {/* Ears + Earcups */}
            <rect x="18" y="42" width="8" height="16" rx="4" fill={palette.accent} stroke="#0F172A" strokeWidth="2" />
            <rect x="74" y="42" width="8" height="16" rx="4" fill={palette.accent} stroke="#0F172A" strokeWidth="2" />
            {/* Hair Bangs */}
            <path
              d="M 28 41 C 33 27 67 27 72 41 C 62 33 45 34 28 41 Z"
              fill="#0F172A"
            />
            {/* Cheeks */}
            <circle cx="35" cy="54" r="3.4" fill="#FB7185" opacity="0.35" />
            <circle cx="65" cy="54" r="3.4" fill="#FB7185" opacity="0.35" />
            {/* Eyes */}
            {blinking ? (
              <>
                <path d="M 37 46 Q 41 48 45 46" stroke="#0F172A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                <path d="M 55 46 Q 59 48 63 46" stroke="#0F172A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <circle cx="41" cy="46" r="3.2" fill="#0F172A" />
                <circle cx="59" cy="46" r="3.2" fill="#0F172A" />
                <circle cx="42.1" cy="44.9" r="1.1" fill="#FFFFFF" />
                <circle cx="60.1" cy="44.9" r="1.1" fill="#FFFFFF" />
              </>
            )}
            {/* Animated Mouth */}
            {renderMouth()}
            {/* Mic boom */}
            <path
              d="M 76 55 Q 68 65 59 64"
              fill="none"
              stroke="#0F172A"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="58.5" cy="64" r="2.2" fill={palette.accent} />
          </svg>
        </div>
      </div>

      {(showControls || subtitle || label) && (
        <div className="flex-1 min-w-[180px] space-y-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
              <span>{label}</span>
              {isTalking && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-sky-600 dark:text-sky-300">
                  <span className="w-1 h-2.5 bg-current rounded-full animate-pulse" />
                  <span className="w-1 h-3.5 bg-current rounded-full animate-pulse" />
                  <span className="w-1 h-2 bg-current rounded-full animate-pulse" />
                  <span>يتحدث الآن</span>
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{subtitle}</p>
            )}
          </div>

          {showControls && text && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => speakText(text, languageName, speechRate)}
                className="min-h-[42px] px-4 rounded-xl border-b-4 border-sky-700 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
              >
                <Volume2 className="w-4 h-4" />
                <span>استمع للرسالة الصوتية</span>
              </button>
              <button
                type="button"
                onClick={() => speakText(text, languageName, 0.65)}
                className="min-h-[42px] px-3.5 rounded-xl border-2 border-sky-200 dark:border-sky-800 border-b-4 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
                title="نطق بطيء"
              >
                <Turtle className="w-4 h-4" />
                <span>بطيء</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
