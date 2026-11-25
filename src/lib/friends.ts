import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from '../types';

export function getFriendCode(uid: string): string {
  const clean = uid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return `ML-${clean.slice(0, 6).padEnd(6, '0')}`;
}

export function getSortedPair(uid1: string, uid2: string): { uidA: string; uidB: string } {
  return uid1 < uid2 ? { uidA: uid1, uidB: uid2 } : { uidA: uid2, uidB: uid1 };
}

export function makeChatId(uid1: string, uid2: string): string {
  const { uidA, uidB } = getSortedPair(uid1, uid2);
  return `${uidA}_${uidB}`;
}

export async function sha256Hex(value: string): Promise<string | null> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return null;
  const encoded = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await window.crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function syncPublicFriendDirectory(profile: UserProfile): Promise<void> {
  const friendCode = getFriendCode(profile.uid);
  const safeName = (profile.displayName || 'متعلم').trim().slice(0, 80);
  const safeNative = (profile.nativeLanguage || 'العربية').slice(0, 40);
  const safeTarget = (profile.targetLanguage || 'الإنجليزية').slice(0, 40);
  const safeLevelLabel = (profile.levelLabel || 'مبتدئ').slice(0, 50);
  const safeAvatarId = (profile.avatarId || 'astro').slice(0, 32);
  const safeArabCode = (profile.arabicCountryCode || 'DZ').slice(0, 4);

  const pubRef = doc(db, 'publicProfiles', profile.uid);
  try {
    await setDoc(pubRef, {
      uid: profile.uid,
      displayName: safeName,
      friendCode,
      nativeLanguage: safeNative,
      targetLanguage: safeTarget,
      level: profile.level,
      levelLabel: safeLevelLabel,
      xp: profile.xp,
      avatarId: safeAvatarId,
      arabicCountryCode: safeArabCode,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `publicProfiles/${profile.uid}`);
  }

  const lookupPayload = {
    uid: profile.uid,
    displayName: safeName,
    friendCode,
    targetLanguage: safeTarget,
    level: profile.level,
    levelLabel: safeLevelLabel,
    avatarId: safeAvatarId,
    arabicCountryCode: safeArabCode,
    updatedAt: serverTimestamp(),
  };

  const codeLookupId = `code_${friendCode}`;
  try {
    await setDoc(doc(db, 'friendLookup', codeLookupId), lookupPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `friendLookup/${codeLookupId}`);
  }

  if (profile.email && profile.email.includes('@')) {
    const emailHash = await sha256Hex(profile.email);
    if (emailHash) {
      const emailLookupId = `email_${emailHash}`;
      try {
        await setDoc(doc(db, 'friendLookup', emailLookupId), lookupPayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `friendLookup/${emailLookupId}`);
      }
    }
  }
}

export async function lookupFriendByQuery(queryText: string): Promise<{
  uid: string;
  displayName: string;
  friendCode: string;
  targetLanguage: string;
  level: number;
  levelLabel: string;
  avatarId?: string;
  arabicCountryCode?: string;
} | null> {
  const trimmed = queryText.trim();
  if (!trimmed) return null;

  let lookupId = '';
  if (trimmed.includes('@')) {
    const emailHash = await sha256Hex(trimmed);
    if (!emailHash) return null;
    lookupId = `email_${emailHash}`;
  } else {
    const upper = trimmed.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const normalizedCode = upper.startsWith('ML-') ? upper : `ML-${upper}`;
    lookupId = `code_${normalizedCode}`;
  }

  const snap = await getDoc(doc(db, 'friendLookup', lookupId));
  if (!snap.exists()) return null;
  return snap.data() as {
    uid: string;
    displayName: string;
    friendCode: string;
    targetLanguage: string;
    level: number;
    levelLabel: string;
    avatarId?: string;
    arabicCountryCode?: string;
  };
}
