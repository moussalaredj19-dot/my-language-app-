import { getLanguageSpeechCode } from '../data/languages';

type SpeakingListener = (speaking: boolean, text: string) => void;

let currentSpeaking = false;
let currentSpokenText = '';
let safetyTimer: number | null = null;
const listeners = new Set<SpeakingListener>();

function notifySpeaking(speaking: boolean, text = '') {
  currentSpeaking = speaking;
  currentSpokenText = speaking ? text : '';
  if (safetyTimer !== null && typeof window !== 'undefined') {
    window.clearTimeout(safetyTimer);
    safetyTimer = null;
  }
  listeners.forEach((cb) => {
    try {
      cb(currentSpeaking, currentSpokenText);
    } catch {
      // Ignore subscriber errors
    }
  });
}

export function getIsSpeaking(): boolean {
  return currentSpeaking;
}

export function subscribeSpeakingState(cb: SpeakingListener): () => void {
  listeners.add(cb);
  cb(currentSpeaking, currentSpokenText);
  return () => {
    listeners.delete(cb);
  };
}

export function speakText(
  text: string,
  languageName: string,
  rate = 1.0,
  onEnd?: () => void
) {
  const cleanText = (text || '').trim();
  if (!cleanText) {
    onEnd?.();
    return;
  }

  // Fallback pulse even if speechSynthesis is unavailable in headless environments
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifySpeaking(true, cleanText);
    const estMs = Math.min(4000, Math.max(1100, cleanText.length * 70));
    safetyTimer = globalThis.setTimeout(() => {
      notifySpeaking(false, '');
      onEnd?.();
    }, estMs) as unknown as number;
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const bcp47 = getLanguageSpeechCode(languageName);
    utterance.lang = bcp47;
    utterance.rate = Math.min(1.6, Math.max(0.5, rate));

    const voices = window.speechSynthesis.getVoices();
    const matchedVoice =
      voices.find((v) => v.lang.toLowerCase() === bcp47.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(bcp47.split('-')[0].toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      notifySpeaking(false, '');
      onEnd?.();
    };

    utterance.onstart = () => notifySpeaking(true, cleanText);
    utterance.onend = finish;
    utterance.onerror = finish;

    notifySpeaking(true, cleanText);
    const fallbackMs = Math.min(14000, Math.max(1800, Math.round((cleanText.length * 85) / utterance.rate)));
    safetyTimer = window.setTimeout(finish, fallbackMs);

    window.speechSynthesis.speak(utterance);
  } catch {
    notifySpeaking(false, '');
    onEnd?.();
  }
}

export function stopSpeaking() {
  notifySpeaking(false, '');
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function createSpeechRecognizer(languageName: string): SpeechRecognitionLike | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = getLanguageSpeechCode(languageName);
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;
  return rec;
}

export function computeWordSimilarity(expected: string, spoken: string): {
  score: number;
  matchedWords: string[];
  missedWords: string[];
} {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:'"«»؟،؛\-()]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

  const expWords = clean(expected);
  const spkWords = clean(spoken);

  if (expWords.length === 0) return { score: 0, matchedWords: [], missedWords: [] };

  const matchedWords: string[] = [];
  const missedWords: string[] = [];

  expWords.forEach((w) => {
    if (spkWords.some((s) => s === w || (w.length > 3 && s.includes(w.slice(0, -1))))) {
      matchedWords.push(w);
    } else {
      missedWords.push(w);
    }
  });

  const score = Math.round((matchedWords.length / expWords.length) * 100);
  return { score, matchedWords, missedWords };
}
