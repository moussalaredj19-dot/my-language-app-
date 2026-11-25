import { getLanguageByName } from '../data/languages';

export interface ArabCountryOption {
  code: string;
  nameAr: string;
}

export const ARAB_COUNTRIES: ArabCountryOption[] = [
  { code: 'DZ', nameAr: 'الجزائر' },
  { code: 'SA', nameAr: 'السعودية' },
  { code: 'EG', nameAr: 'مصر' },
  { code: 'MA', nameAr: 'المغرب' },
  { code: 'TN', nameAr: 'تونس' },
  { code: 'AE', nameAr: 'الإمارات' },
  { code: 'JO', nameAr: 'الأردن' },
  { code: 'PS', nameAr: 'فلسطين' },
  { code: 'IQ', nameAr: 'العراق' },
  { code: 'KW', nameAr: 'الكويت' },
  { code: 'QA', nameAr: 'قطر' },
  { code: 'OM', nameAr: 'عُمان' },
];

interface LanguageFlagProps {
  language: string;
  arabicCountryCode?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-5 h-3.5 rounded-[3px]',
  sm: 'w-6 h-4 rounded-[4px]',
  md: 'w-8 h-[22px] rounded-[5px]',
  lg: 'w-10 h-7 rounded-md',
};

function renderArabFlag(code: string) {
  switch (code) {
    case 'DZ':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect x="0" y="0" width="18" height="24" fill="#006233" />
          <rect x="18" y="0" width="18" height="24" fill="#FFFFFF" />
          <circle cx="18" cy="12" r="5.5" fill="#D21034" />
          <circle cx="19.6" cy="12" r="4.4" fill="#FFFFFF" />
          <path d="M18 12 A4.4 4.4 0 0 1 18 7.6 L18 16.4 Z" fill="#006233" opacity="0.1" />
          <circle cx="19.8" cy="12" r="4.2" fill="#006233" clipPath="inset(0 50% 0 0)" />
          <polygon points="20.8,10.2 21.3,11.6 22.8,11.6 21.6,12.5 22,13.9 20.8,13 19.6,13.9 20,12.5 18.8,11.6 20.3,11.6" fill="#D21034" />
        </svg>
      );
    case 'EG':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect x="0" y="0" width="36" height="8" fill="#CE1126" />
          <rect x="0" y="8" width="36" height="8" fill="#FFFFFF" />
          <rect x="0" y="16" width="36" height="8" fill="#111111" />
          <rect x="15.5" y="9.2" width="5" height="5.6" rx="1" fill="#C09300" />
        </svg>
      );
    case 'MA':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect width="36" height="24" fill="#C1272D" />
          <polygon points="18,6.5 19.6,11.2 24.5,11.2 20.5,14.1 22,18.8 18,15.9 14,18.8 15.5,14.1 11.5,11.2 16.4,11.2" fill="none" stroke="#006233" strokeWidth="1.3" />
        </svg>
      );
    case 'TN':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect width="36" height="24" fill="#E70013" />
          <circle cx="18" cy="12" r="6" fill="#FFFFFF" />
          <circle cx="18.2" cy="12" r="4.2" fill="#E70013" />
          <circle cx="19.4" cy="12" r="3.4" fill="#FFFFFF" />
          <polygon points="19.8,10.3 20.2,11.5 21.4,11.5 20.4,12.2 20.8,13.4 19.8,12.7 18.8,13.4 19.2,12.2 18.2,11.5 19.4,11.5" fill="#E70013" />
        </svg>
      );
    case 'AE':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect x="9" y="0" width="27" height="8" fill="#00732F" />
          <rect x="9" y="8" width="27" height="8" fill="#FFFFFF" />
          <rect x="9" y="16" width="27" height="8" fill="#111111" />
          <rect x="0" y="0" width="9" height="24" fill="#FF0000" />
        </svg>
      );
    case 'JO':
    case 'PS':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect x="0" y="0" width="36" height="8" fill="#111111" />
          <rect x="0" y="8" width="36" height="8" fill="#FFFFFF" />
          <rect x="0" y="16" width="36" height="8" fill="#007A3D" />
          <polygon points="0,0 15,12 0,24" fill="#CE1126" />
          {code === 'JO' && <circle cx="5.5" cy="12" r="1.4" fill="#FFFFFF" />}
        </svg>
      );
    case 'IQ':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect x="0" y="0" width="36" height="8" fill="#CE1126" />
          <rect x="0" y="8" width="36" height="8" fill="#FFFFFF" />
          <rect x="0" y="16" width="36" height="8" fill="#111111" />
          <rect x="11" y="10.8" width="14" height="2.4" rx="0.6" fill="#007A3D" />
        </svg>
      );
    case 'KW':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect x="0" y="0" width="36" height="8" fill="#007A3D" />
          <rect x="0" y="8" width="36" height="8" fill="#FFFFFF" />
          <rect x="0" y="16" width="36" height="8" fill="#CE1126" />
          <polygon points="0,0 9,7 9,17 0,24" fill="#111111" />
        </svg>
      );
    case 'QA':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect width="36" height="24" fill="#8D1B3D" />
          <polygon points="0,0 10,0 13,2.4 10,4.8 13,7.2 10,9.6 13,12 10,14.4 13,16.8 10,19.2 13,21.6 10,24 0,24" fill="#FFFFFF" />
        </svg>
      );
    case 'OM':
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect x="9" y="0" width="27" height="8" fill="#FFFFFF" />
          <rect x="9" y="8" width="27" height="8" fill="#DB161B" />
          <rect x="9" y="16" width="27" height="8" fill="#008000" />
          <rect x="0" y="0" width="9" height="24" fill="#DB161B" />
          <circle cx="4.5" cy="5.5" r="1.8" fill="#FFFFFF" />
        </svg>
      );
    case 'SA':
    default:
      return (
        <svg viewBox="0 0 36 24" className="w-full h-full">
          <rect width="36" height="24" fill="#006C35" />
          <rect x="9" y="7" width="18" height="3.2" rx="1.2" fill="#FFFFFF" />
          <rect x="12" y="11.4" width="12" height="1.8" rx="0.8" fill="#FFFFFF" opacity="0.9" />
          <path d="M9 16.5 L26 16.5 L27 15.2 L24.5 15.8 L9 15.8 Z" fill="#FFFFFF" />
        </svg>
      );
  }
}

export default function LanguageFlag({
  language,
  arabicCountryCode = 'DZ',
  size = 'sm',
  className = '',
}: LanguageFlagProps) {
  const lang = getLanguageByName(language);

  const renderSvg = () => {
    switch (lang.id) {
      case 'ar':
        return renderArabFlag(arabicCountryCode);
      case 'fr':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect x="0" y="0" width="12" height="24" fill="#002395" />
            <rect x="12" y="0" width="12" height="24" fill="#FFFFFF" />
            <rect x="24" y="0" width="12" height="24" fill="#ED2939" />
          </svg>
        );
      case 'en':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#012169" />
            <path d="M0 0 L36 24 M36 0 L0 24" stroke="#FFFFFF" strokeWidth="4.4" />
            <path d="M0 0 L36 24 M36 0 L0 24" stroke="#C8102E" strokeWidth="2.2" />
            <path d="M18 0 V24 M0 12 H36" stroke="#FFFFFF" strokeWidth="6.4" />
            <path d="M18 0 V24 M0 12 H36" stroke="#C8102E" strokeWidth="3.6" />
          </svg>
        );
      case 'ru':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect x="0" y="0" width="36" height="8" fill="#FFFFFF" />
            <rect x="0" y="8" width="36" height="8" fill="#0039A6" />
            <rect x="0" y="16" width="36" height="8" fill="#D52B1E" />
          </svg>
        );
      case 'it':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect x="0" y="0" width="12" height="24" fill="#009246" />
            <rect x="12" y="0" width="12" height="24" fill="#FFFFFF" />
            <rect x="24" y="0" width="12" height="24" fill="#CE2B37" />
          </svg>
        );
      case 'es':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect x="0" y="0" width="36" height="6" fill="#AA151B" />
            <rect x="0" y="6" width="36" height="12" fill="#F1BF00" />
            <rect x="0" y="18" width="36" height="6" fill="#AA151B" />
            <rect x="8.5" y="8.5" width="4.5" height="6.5" rx="1.2" fill="#AA151B" />
            <rect x="9.5" y="9.5" width="2.5" height="4.5" rx="0.6" fill="#F1BF00" />
          </svg>
        );
      case 'pt':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect x="0" y="0" width="14" height="24" fill="#006600" />
            <rect x="14" y="0" width="22" height="24" fill="#FF0000" />
            <circle cx="14" cy="12" r="4.8" fill="#FFCC00" />
            <rect x="12.2" y="9.8" width="3.6" height="4.4" rx="1" fill="#FFFFFF" stroke="#003399" strokeWidth="0.9" />
          </svg>
        );
      case 'de':
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect x="0" y="0" width="36" height="8" fill="#111111" />
            <rect x="0" y="8" width="36" height="8" fill="#DD0000" />
            <rect x="0" y="16" width="36" height="8" fill="#FFCE00" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 36 24" className="w-full h-full">
            <rect width="36" height="24" fill="#0EA5E9" />
            <circle cx="18" cy="12" r="6" fill="#10B981" />
          </svg>
        );
    }
  };

  return (
    <span
      className={`inline-flex overflow-hidden border border-black/15 dark:border-white/20 shadow-xs shrink-0 ${SIZE_CLASSES[size]} ${className}`}
      aria-label={`علم ${lang.nameAr}`}
      title={lang.nameAr}
    >
      {renderSvg()}
    </span>
  );
}
