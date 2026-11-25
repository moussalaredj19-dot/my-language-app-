export interface AvatarPreset {
  id: string;
  label: string;
  bgFrom: string;
  bgTo: string;
  skin: string;
  hair: string;
  outfit: string;
  accent: string;
  accessory: 'visor' | 'glasses' | 'headphones' | 'beret' | 'crown' | 'bandana' | 'cap' | 'none';
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: 'astro',
    label: 'رائد فضاء',
    bgFrom: '#0ea5e9',
    bgTo: '#312e81',
    skin: '#f6d5b8',
    hair: '#1e293b',
    outfit: '#e2e8f0',
    accent: '#34d399',
    accessory: 'visor',
  },
  {
    id: 'scholar',
    label: 'باحث لغات',
    bgFrom: '#10b981',
    bgTo: '#064e3b',
    skin: '#e8b996',
    hair: '#292524',
    outfit: '#1e3a8a',
    accent: '#fbbf24',
    accessory: 'glasses',
  },
  {
    id: 'polyglot',
    label: 'متحدث محترف',
    bgFrom: '#8b5cf6',
    bgTo: '#4c1d95',
    skin: '#f3cfb3',
    hair: '#451a03',
    outfit: '#0f172a',
    accent: '#38bdf8',
    accessory: 'headphones',
  },
  {
    id: 'artist',
    label: 'مبدع',
    bgFrom: '#f43f5e',
    bgTo: '#9f1239',
    skin: '#f5d0b5',
    hair: '#0f172a',
    outfit: '#334155',
    accent: '#fda4af',
    accessory: 'beret',
  },
  {
    id: 'champion',
    label: 'بطل المراحل',
    bgFrom: '#f59e0b',
    bgTo: '#b45309',
    skin: '#d99b72',
    hair: '#1c1917',
    outfit: '#065f46',
    accent: '#fef08a',
    accessory: 'crown',
  },
  {
    id: 'explorer',
    label: 'مستكشف',
    bgFrom: '#06b6d4',
    bgTo: '#155e75',
    skin: '#ecc19c',
    hair: '#78350f',
    outfit: '#0f766e',
    accent: '#a7f3d0',
    accessory: 'cap',
  },
  {
    id: 'ninja',
    label: 'سريع التعلم',
    bgFrom: '#14b8a6',
    bgTo: '#0f172a',
    skin: '#f1caa8',
    hair: '#020617',
    outfit: '#1e293b',
    accent: '#2dd4bf',
    accessory: 'bandana',
  },
  {
    id: 'classic',
    label: 'أنيق',
    bgFrom: '#3b82f6',
    bgTo: '#1e3a8a',
    skin: '#e0ab84',
    hair: '#18181b',
    outfit: '#047857',
    accent: '#bae6fd',
    accessory: 'none',
  },
];

export function getAvatarPreset(avatarId?: string): AvatarPreset {
  return AVATAR_PRESETS.find((a) => a.id === avatarId) || AVATAR_PRESETS[0];
}

const PHOTO_KEY_PREFIX = 'my_language_photo_';

export function getLocalProfilePhoto(uid?: string): string | null {
  if (typeof window === 'undefined' || !uid) return null;
  try {
    return window.localStorage.getItem(`${PHOTO_KEY_PREFIX}${uid}`);
  } catch {
    return null;
  }
}

export function saveLocalProfilePhoto(uid: string, dataUrl: string): void {
  if (typeof window === 'undefined' || !uid) return;
  try {
    window.localStorage.setItem(`${PHOTO_KEY_PREFIX}${uid}`, dataUrl);
  } catch {
    // Storage full fallback ignored
  }
}

export function clearLocalProfilePhoto(uid: string): void {
  if (typeof window === 'undefined' || !uid) return;
  try {
    window.localStorage.removeItem(`${PHOTO_KEY_PREFIX}${uid}`);
  } catch {
    // Ignored
  }
}

export function compressImageFileToAvatar(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const size = 180;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر معالجة الصورة'));
          return;
        }
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('الملف المحدد ليس صورة صالحة.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.readAsDataURL(file);
  });
}
