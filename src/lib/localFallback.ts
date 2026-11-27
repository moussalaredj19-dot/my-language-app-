import { getStarterAlphabet } from '../data/alphabets';
import { getStarterContent, getStarterInteractiveSprint } from '../data/curriculum';
import { computeWordSimilarity } from './speech';
import {
  ExercisePack,
  InteractiveSprintStep,
  LanguageAlphabet,
} from '../types';

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildLocalExercisesPack(targetLanguage: string, level: number): ExercisePack {
  const base = getStarterContent(targetLanguage, level)?.exercises
    || getStarterContent(targetLanguage, 1)?.exercises;

  if (!base) {
    return {
      wordWriting: [],
      writing: [],
      speaking: [],
      fillBlanks: [],
      matching: [],
      reading: {
        title: targetLanguage,
        paragraph: '',
        translation: '',
        question: '',
        options: [],
        correctIndex: 0,
      },
    };
  }

  return {
    wordWriting: shuffleArray(base.wordWriting),
    writing: shuffleArray(base.writing),
    speaking: shuffleArray(base.speaking),
    fillBlanks: shuffleArray(base.fillBlanks),
    matching: shuffleArray(base.matching),
    reading: base.reading,
  };
}

export function buildLocalInteractiveSprint(
  targetLanguage: string,
  level: number
): { steps: InteractiveSprintStep[] } {
  const baseSprint =
    getStarterInteractiveSprint(targetLanguage, level) ||
    getStarterInteractiveSprint(targetLanguage, 1) ||
    [];

  const content = getStarterContent(targetLanguage, level) || getStarterContent(targetLanguage, 1);
  const generatedSteps: InteractiveSprintStep[] = [...baseSprint];

  if (content?.exercises?.wordWriting?.length) {
    const ww = content.exercises.wordWriting;
    const picked = ww[Math.floor(Math.random() * ww.length)];
    const distractors = ww
      .filter((item) => item.word !== picked.word)
      .slice(0, 3)
      .map((item) => item.meaning);

    if (distractors.length >= 2) {
      const allOptions = shuffleArray([picked.meaning, ...distractors]);
      generatedSteps.push({
        id: `local-listen-${Date.now()}`,
        type: 'listen',
        prompt: 'استمع جيداً للكلمة واختر معناها الصحيح',
        audioText: picked.word,
        options: allOptions,
        correctIndex: allOptions.indexOf(picked.meaning),
      });
    }
  }

  if (content?.exercises?.speaking?.length) {
    const sp = content.exercises.speaking[0];
    const extraWords = (content.exercises.matching || []).slice(0, 2).map((m) => m.target);
    const words = sp.phrase.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      generatedSteps.push({
        id: `local-arr-${Date.now()}`,
        type: 'arrange',
        prompt: `رتّب الكلمات لتكوين: ${sp.translation}`,
        targetSentence: sp.phrase.replace(/[.,!?؟،]/g, ''),
        tiles: shuffleArray([...words.map((w) => w.replace(/[.,!?؟،]/g, '')), ...extraWords]),
      });
    }
  }

  return {
    steps: shuffleArray(generatedSteps).slice(0, 5),
  };
}

export function buildLocalAlphabet(targetLanguage: string): LanguageAlphabet {
  return (
    getStarterAlphabet(targetLanguage) || {
      language: targetLanguage,
      scriptName: targetLanguage,
      description: `تعلّم حروف ${targetLanguage} الأساسية مع النطق المكتوب تحت كل حرف.`,
      letters: [],
    }
  );
}

export function evaluateWritingLocally(params: {
  expectedAnswer: string;
  userAnswer: string;
}): {
  score: number;
  isCorrect: boolean;
  correctedText: string;
  feedback: string;
  tip: string;
} {
  const sim = computeWordSimilarity(params.expectedAnswer, params.userAnswer);
  const isCorrect = sim.score >= 70;
  return {
    score: sim.score,
    isCorrect,
    correctedText: params.expectedAnswer,
    feedback: isCorrect
      ? 'أحسنت! إجابتك مطابقة ومفهومة بشكل ممتاز.'
      : 'محاولة جيدة! راجع الإملاء وترتيب الكلمات في الصيغة الصحيحة أعلاه.',
    tip: 'استمع إلى النطق الصوتي للصيغة الصحيحة وحاول كتابتها مرة أخرى.',
  };
}

export function translateLocallyFromCurriculum(
  text: string,
  targetLanguage: string
): {
  translation: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
} | null {
  const q = text.trim().toLowerCase();
  if (!q) return null;

  for (const lvl of [1, 2, 3, 4, 5]) {
    const content = getStarterContent(targetLanguage, lvl);
    if (!content) continue;

    for (const item of content.exercises.wordWriting) {
      if (item.meaning.toLowerCase().includes(q) || item.word.toLowerCase().includes(q)) {
        return {
          translation: item.word,
          pronunciation: item.pronunciation,
          example: item.example,
          exampleTranslation: item.exampleTranslation,
        };
      }
    }

    for (const pair of content.exercises.matching) {
      if (pair.native.toLowerCase().includes(q) || pair.target.toLowerCase().includes(q)) {
        return {
          translation: pair.target,
          pronunciation: pair.pronunciation,
          example: `${pair.target} — ${pair.native}`,
          exampleTranslation: pair.native,
        };
      }
    }
  }
  return null;
}

export function buildLocalCoachReply(params: {
  targetLanguage: string;
  level: number;
  message: string;
}): {
  replyTarget: string;
  replyTransliteration: string;
  replyTranslation: string;
  userCorrection: string;
  suggestedReplies: string[];
} {
  const starter = getStarterContent(params.targetLanguage, params.level)
    || getStarterContent(params.targetLanguage, 1);
  const speakingPool = starter?.exercises?.speaking || [];
  const chosen = speakingPool[Math.floor(Math.random() * Math.max(1, speakingPool.length))];

  return {
    replyTarget: chosen?.phrase || params.message,
    replyTransliteration: chosen?.phonetic || '',
    replyTranslation: chosen?.translation || 'ممتاز! واصل المحادثة بهذه الجمل المفيدة.',
    userCorrection:
      'محاولة رائعة! واصل التمرن على هذه العبارة ونطقها بصوت واضح.',
    suggestedReplies: speakingPool.slice(0, 2).map((s) => s.phrase),
  };
}
