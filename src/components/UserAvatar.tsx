import { getAvatarPreset, getLocalProfilePhoto } from '../data/avatars';

interface UserAvatarProps {
  uid?: string;
  displayName?: string;
  avatarId?: string;
  customPhotoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-8 h-8',
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

export default function UserAvatar({
  uid,
  displayName = 'متعلم',
  avatarId = 'astro',
  customPhotoUrl,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const localPhoto = customPhotoUrl !== undefined ? customPhotoUrl : getLocalProfilePhoto(uid);
  const preset = getAvatarPreset(avatarId);

  if (localPhoto && avatarId === 'custom') {
    return (
      <div
        className={`${SIZE_MAP[size]} rounded-2xl overflow-hidden border-2 border-emerald-400/70 shadow-sm shrink-0 bg-slate-900 ${className}`}
      >
        <img
          src={localPhoto}
          alt={displayName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} rounded-2xl overflow-hidden border border-white/20 shadow-sm shrink-0 ${className}`}
      title={displayName}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full" aria-label={displayName}>
        <defs>
          <linearGradient id={`av-${preset.id}-${size}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={preset.bgFrom} />
            <stop offset="100%" stopColor={preset.bgTo} />
          </linearGradient>
        </defs>
        <rect width="80" height="80" fill={`url(#av-${preset.id}-${size})`} />
        <circle cx="66" cy="14" r="16" fill="rgba(255,255,255,0.12)" />

        {/* Shoulders / Outfit */}
        <path d="M14 80 C16 61, 64 61, 66 80 Z" fill={preset.outfit} />
        <path d="M31 63 L40 72 L49 63" fill="none" stroke={preset.accent} strokeWidth="3" strokeLinecap="round" />

        {/* Neck */}
        <rect x="34" y="51" width="12" height="12" rx="5" fill={preset.skin} />

        {/* Head */}
        <circle cx="40" cy="36" r="17" fill={preset.skin} />

        {/* Hair */}
        <path
          d="M23 34 C23 20, 57 20, 57 34 C54 27, 46 25, 40 26 C33 25, 26 27, 23 34 Z"
          fill={preset.hair}
        />

        {/* Eyes & Friendly Smile */}
        <circle cx="34" cy="37" r="2.1" fill="#0f172a" />
        <circle cx="46" cy="37" r="2.1" fill="#0f172a" />
        <path d="M34 44 Q40 49 46 44" fill="none" stroke="#7c2d12" strokeWidth="2.2" strokeLinecap="round" />

        {/* Accessories */}
        {preset.accessory === 'visor' && (
          <rect
            x="25"
            y="31"
            width="30"
            height="11"
            rx="5.5"
            fill="rgba(56, 189, 248, 0.35)"
            stroke={preset.accent}
            strokeWidth="2"
          />
        )}
        {preset.accessory === 'glasses' && (
          <g fill="none" stroke="#0f172a" strokeWidth="1.8">
            <rect x="27" y="32" width="11" height="9" rx="3" />
            <rect x="42" y="32" width="11" height="9" rx="3" />
            <line x1="38" y1="36" x2="42" y2="36" />
          </g>
        )}
        {preset.accessory === 'headphones' && (
          <g>
            <path d="M21 36 C21 16, 59 16, 59 36" fill="none" stroke={preset.accent} strokeWidth="4" strokeLinecap="round" />
            <rect x="18" y="32" width="6" height="12" rx="3" fill={preset.accent} />
            <rect x="56" y="32" width="6" height="12" rx="3" fill={preset.accent} />
          </g>
        )}
        {preset.accessory === 'beret' && (
          <path d="M22 25 C25 14, 54 14, 58 24 C46 21, 32 22, 22 25 Z" fill={preset.accent} />
        )}
        {preset.accessory === 'crown' && (
          <polygon points="27,22 31,12 37,18 40,10 43,18 49,12 53,22" fill={preset.accent} />
        )}
        {preset.accessory === 'cap' && (
          <g>
            <path d="M22 26 C24 15, 56 15, 58 26 Z" fill={preset.accent} />
            <rect x="22" y="24" width="40" height="4" rx="2" fill={preset.outfit} />
          </g>
        )}
        {preset.accessory === 'bandana' && (
          <rect x="23" y="24" width="34" height="5.5" rx="2.5" fill={preset.accent} />
        )}
      </svg>
    </div>
  );
}
