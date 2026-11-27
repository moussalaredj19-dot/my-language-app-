interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showText?: boolean;
  darkBackground?: boolean;
}

export default function AppLogo({
  size = 'sm',
  showText = false,
  darkBackground = false,
}: AppLogoProps) {
  const dim =
    size === 'xs'
      ? 'w-7 h-7'
      : size === 'sm'
      ? 'w-9 h-9'
      : size === 'md'
      ? 'w-12 h-12'
      : 'w-16 h-16';

  const textCls =
    size === 'lg'
      ? 'text-3xl sm:text-4xl'
      : size === 'md'
      ? 'text-xl'
      : 'text-base sm:text-lg';

  return (
    <div className="inline-flex items-center gap-2.5 shrink-0">
      <svg
        viewBox="0 0 64 64"
        className={`${dim} shrink-0 drop-shadow-[0_4px_14px_rgba(16,185,129,0.28)]`}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ml-crest-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="55%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="ml-ribbon" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="ml-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Rounded crest frame with subtle speech-corner notch */}
        <path
          d="M16 6 H48 A10 10 0 0 1 58 16 V42 A10 10 0 0 1 48 52 H25 L13 59 V52 H16 A10 10 0 0 1 6 42 V16 A10 10 0 0 1 16 6 Z"
          fill="url(#ml-crest-bg)"
        />
        <path
          d="M16 8 H48 A8 8 0 0 1 56 16 V42 A8 8 0 0 1 48 50 H24.5 L15 55.5 V50 H16 A8 8 0 0 1 8 42 V16 A8 8 0 0 1 16 8 Z"
          fill="none"
          stroke="rgba(255,255,255,0.24)"
          strokeWidth="1.5"
        />

        {/* Geometric stylized "M" linguistic wave / book spine */}
        <path
          d="M18 39 V21.5 C18 19.5 20.4 18.5 21.8 20 L32 30.8 L42.2 20 C43.6 18.5 46 19.5 46 21.5 V39"
          fill="none"
          stroke="url(#ml-ribbon)"
          strokeWidth="5.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Subtle sound-wave underline */}
        <path
          d="M23 43.5 Q32 46.5 41 43.5"
          fill="none"
          stroke="#A7F3D0"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Four-point language spark */}
        <path
          d="M32 11.5 L33.6 15.2 L37.3 16.8 L33.6 18.4 L32 22.1 L30.4 18.4 L26.7 16.8 L30.4 15.2 Z"
          fill="url(#ml-gold)"
        />
      </svg>

      {showText && (
        <span
          dir="ltr"
          className={`font-display font-extrabold tracking-tight whitespace-nowrap ${textCls} ${
            darkBackground
              ? 'text-white drop-shadow-[0_0_20px_rgba(52,211,153,0.4)]'
              : 'text-[#081B3E] dark:text-emerald-400'
          }`}
        >
          My Language
        </span>
      )}
    </div>
  );
}
