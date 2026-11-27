import { GoogleGenAI, Type } from '@google/genai';
import {
  ExercisePack,
  InteractiveSprintStep,
  LanguageAlphabet,
} from '../types';

const GEMINI_MODEL = 'gemini-4-hydrogen';

function getAiClient(): GoogleGenAI {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_VITE_GEMINI_API_KEY' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'مفتاح VITE_GEMINI_API_KEY غير مهيأ. يرجى إضافته في ملف .env أو إعدادات البيئة ثم إعادة المحاولة.'
    );
  }
  return new GoogleGenAI({ apiKey });
}

function getLevelDescription(level: number): string {
  switch (level) {
    case 1:
      return 'Level 1 (مبتدئ / Complete Beginner A1): Focus on basic pronunciation, essential greetings, simple present tense, high-frequency everyday words, and short 3-5 word sentences.';
    case 2:
      return 'Level 2 (اعرف بعض الكلمات / Elementary A2): Focus on practical daily situations, building short connected sentences, common verbs, and essential questions.';
    case 3:
      return 'Level 3 (متوسط / Intermediate B1): Focus on fluent everyday conversation, past and future tenses, expressing opinions, and natural phrasing.';
    case 4:
      return 'Level 4 (متقدم / Upper-Intermediate B2): Focus on nuanced expressions, idioms, complex sentence structures, professional/academic vocabulary, and natural rhythm.';
    case 5:
    default:
      return 'Level 5 (ممتاز / Mastery C1-C2): Focus on native-level subtleties, rhetoric, specialized terminology, cultural proverbs, and eloquent style.';
  }
}

function formatGeminiError(err: unknown, fallback: string): Error {
  const raw = err instanceof Error ? err.message : String(err ?? '');
  if (raw.includes('VITE_GEMINI_API_KEY')) {
    return new Error(raw);
  }
  const lower = raw.toLowerCase();
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return new Error('تم تجاوز الحد المسموح لطلبات الذكاء الاصطناعي حالياً. يرجى المحاولة بعد قليل.');
  }
  if (
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('api key not valid') ||
    lower.includes('permission_denied')
  ) {
    return new Error('مفتاح VITE_GEMINI_API_KEY غير صالح أو يفتقر إلى الصلاحيات اللازمة.');
  }
  if (lower.includes('400') || lower.includes('invalid_argument')) {
    return new Error('تعذر معالجة الطلب الحالي. يرجى التحقق من المدخلات والمحاولة مجدداً.');
  }
  return new Error(raw || fallback);
}

function parseGeminiJson<T>(rawText: string | undefined, fallbackMsg: string): T {
  const cleaned = (rawText ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  if (!cleaned) {
    throw new Error(fallbackMsg);
  }
  return JSON.parse(cleaned) as T;
}

export async function generateExercisesPack(params: {
  nativeLanguage?: string;
  targetLanguage?: string;
  level?: number;
  purpose?: string;
}): Promise<ExercisePack> {
  const {
    nativeLanguage = 'العربية',
    targetLanguage = 'English',
    level = 1,
    purpose = 'التواصل اليومي',
  } = params;

  try {
    const ai = getAiClient();
    const levelDesc = getLevelDescription(Number(level));

    const prompt = `Generate a complete interactive exercise pack STRICTLY for learning "${targetLanguage}" from "${nativeLanguage}".
CRITICAL RULE: Do NOT mix English or any third language unless "${targetLanguage}" IS English. Every target word, phrase, sentence, fill-in-the-blank, and reading paragraph MUST be 100% written in "${targetLanguage}" native script!
Level: ${levelDesc}
Purpose: "${purpose}".
Provide:
1. wordWriting: 4 key words in "${targetLanguage}" tailored to this level:
   - word (in "${targetLanguage}")
   - pronunciation (readable phonetic transcription in "${nativeLanguage}")
   - meaning (concise translation in "${nativeLanguage}")
   - explanation (clear, helpful explanation in "${nativeLanguage}" of the word's meaning, usage context, and letter/pronunciation tips)
   - example (short example sentence in "${targetLanguage}")
   - exampleTranslation (in "${nativeLanguage}")
2. writing: 2 writing translation tasks (prompt in "${nativeLanguage}", expected "${targetLanguage}" answer, hint in "${nativeLanguage}").
3. speaking: 2 oral pronunciation phrases strictly in "${targetLanguage}" (phrase, phonetic in "${nativeLanguage}", translation in "${nativeLanguage}").
4. fillBlanks: 3 fill-in-the-blank questions strictly in "${targetLanguage}" (before, after, options array of 4 choices in "${targetLanguage}", correct in "${targetLanguage}", translation in "${nativeLanguage}").
5. matching: 5 word pairs connecting "${targetLanguage}" word with its exact translation in "${nativeLanguage}" and phonetic pronunciation.
6. reading: 1 engaging paragraph strictly in "${targetLanguage}" appropriate for this exact level, its translation in "${nativeLanguage}", and 1 comprehension question in "${nativeLanguage}" with 3 options and correctIndex.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert multilingual assessment designer. Output strictly valid JSON with pure target-language script.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            wordWriting: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  pronunciation: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  example: { type: Type.STRING },
                  exampleTranslation: { type: Type.STRING },
                },
                required: [
                  'word',
                  'pronunciation',
                  'meaning',
                  'explanation',
                  'example',
                  'exampleTranslation',
                ],
              },
            },
            writing: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  prompt: { type: Type.STRING },
                  expected: { type: Type.STRING },
                  hint: { type: Type.STRING },
                },
                required: ['prompt', 'expected', 'hint'],
              },
            },
            speaking: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phrase: { type: Type.STRING },
                  phonetic: { type: Type.STRING },
                  translation: { type: Type.STRING },
                },
                required: ['phrase', 'phonetic', 'translation'],
              },
            },
            fillBlanks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  before: { type: Type.STRING },
                  after: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correct: { type: Type.STRING },
                  translation: { type: Type.STRING },
                },
                required: ['before', 'after', 'options', 'correct', 'translation'],
              },
            },
            matching: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  target: { type: Type.STRING },
                  native: { type: Type.STRING },
                  pronunciation: { type: Type.STRING },
                },
                required: ['target', 'native', 'pronunciation'],
              },
            },
            reading: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                paragraph: { type: Type.STRING },
                translation: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
              },
              required: ['title', 'paragraph', 'translation', 'question', 'options', 'correctIndex'],
            },
          },
          required: ['wordWriting', 'writing', 'speaking', 'fillBlanks', 'matching', 'reading'],
        },
      },
    });

    return parseGeminiJson<ExercisePack>(response.text, 'تعذر توليد التمارين حالياً.');
  } catch (err) {
    throw formatGeminiError(err, 'تعذر توليد التمارين حالياً.');
  }
}

export async function evaluateWritingAnswer(params: {
  nativeLanguage?: string;
  targetLanguage?: string;
  level?: number;
  promptText: string;
  expectedAnswer: string;
  userAnswer: string;
}): Promise<{
  score: number;
  isCorrect: boolean;
  correctedText: string;
  feedback: string;
  tip: string;
}> {
  const {
    nativeLanguage = 'العربية',
    targetLanguage = 'English',
    level = 1,
    promptText,
    expectedAnswer,
    userAnswer,
  } = params;

  if (!userAnswer.trim()) {
    throw new Error('يرجى كتابة إجابتك أولاً.');
  }

  try {
    const ai = getAiClient();
    const evalPrompt = `Evaluate a learner's written answer in "${targetLanguage}" (${getLevelDescription(Number(level))}).
Prompt shown to learner (${nativeLanguage}): "${promptText}"
Reference answer: "${expectedAnswer}"
Learner's answer: "${userAnswer}"
Be encouraging and fair. Accept valid synonyms or slight punctuation differences. Write feedback and tip in "${nativeLanguage}".`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: evalPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            isCorrect: { type: Type.BOOLEAN },
            correctedText: { type: Type.STRING },
            feedback: { type: Type.STRING },
            tip: { type: Type.STRING },
          },
          required: ['score', 'isCorrect', 'correctedText', 'feedback', 'tip'],
        },
      },
    });

    return parseGeminiJson(response.text, 'تعذر تقييم الإجابة.');
  } catch (err) {
    throw formatGeminiError(err, 'تعذر تقييم الإجابة.');
  }
}

export async function sendCoachChatTurn(params: {
  nativeLanguage?: string;
  targetLanguage?: string;
  level?: number;
  purpose?: string;
  scenario?: string;
  history?: { role?: string; text?: string }[];
  message: string;
}): Promise<{
  replyTarget: string;
  replyTransliteration: string;
  replyTranslation: string;
  userCorrection: string;
  suggestedReplies: string[];
}> {
  const {
    nativeLanguage = 'العربية',
    targetLanguage = 'English',
    level = 1,
    purpose = 'التواصل اليومي',
    scenario = 'محادثة يومية عامة',
    history = [],
    message,
  } = params;

  if (!message.trim()) {
    throw new Error('الرسالة مطلوبة.');
  }

  try {
    const ai = getAiClient();
    const levelDesc = getLevelDescription(Number(level));
    const historyText = Array.isArray(history)
      ? history
          .slice(-8)
          .map((m) => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.text ?? ''}`)
          .join('\n')
      : '';

    const prompt = `Recent conversation:
${historyText}
Learner just said: "${message}"

Respond naturally in "${targetLanguage}" matching the scenario "${scenario}" and purpose "${purpose}".
Adapt vocabulary and sentence length strictly to: ${levelDesc}.
Also provide:
- replyTarget: your natural response in "${targetLanguage}"
- replyTransliteration: pronunciation/phonetics if helpful (or empty string if Latin script is straightforward)
- replyTranslation: exact translation in "${nativeLanguage}"
- userCorrection: gentle, constructive feedback in "${nativeLanguage}" on the learner's last message (or praise if accurate)
- suggestedReplies: 2 short natural reply options in "${targetLanguage}" the learner can tap next.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are a warm, encouraging native-speaking language coach. Keep replies concise (1-3 sentences) and engaging.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyTarget: { type: Type.STRING },
            replyTransliteration: { type: Type.STRING },
            replyTranslation: { type: Type.STRING },
            userCorrection: { type: Type.STRING },
            suggestedReplies: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'replyTarget',
            'replyTransliteration',
            'replyTranslation',
            'userCorrection',
            'suggestedReplies',
          ],
        },
      },
    });

    return parseGeminiJson(response.text, 'تعذر الاتصال بالمدرب الذكي.');
  } catch (err) {
    throw formatGeminiError(err, 'تعذر الاتصال بالمدرب الذكي.');
  }
}

export async function translateQuickPhrase(params: {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}): Promise<{
  translation: string;
  pronunciation: string;
  example: string;
  exampleTranslation: string;
}> {
  const { text, sourceLanguage = 'العربية', targetLanguage = 'English' } = params;
  if (!text.trim()) {
    throw new Error('يرجى إدخال النص للترجمة.');
  }

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Translate "${text}" from "${sourceLanguage}" to "${targetLanguage}". Provide accurate translation, pronunciation guide, and one practical example sentence in "${targetLanguage}" with its translation in "${sourceLanguage}".`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            example: { type: Type.STRING },
            exampleTranslation: { type: Type.STRING },
          },
          required: ['translation', 'pronunciation', 'example', 'exampleTranslation'],
        },
      },
    });

    return parseGeminiJson(response.text, 'تعذر الترجمة حالياً.');
  } catch (err) {
    throw formatGeminiError(err, 'تعذر الترجمة حالياً.');
  }
}

export async function generateInteractiveSprint(params: {
  nativeLanguage?: string;
  targetLanguage?: string;
  level?: number;
  purpose?: string;
}): Promise<{ steps: InteractiveSprintStep[] }> {
  const {
    nativeLanguage = 'العربية',
    targetLanguage = 'English',
    level = 1,
    purpose = 'التواصل اليومي',
  } = params;

  try {
    const ai = getAiClient();
    const levelDesc = getLevelDescription(Number(level));

    const prompt = `Create a 5-step interactive language sprint strictly for learning "${targetLanguage}" from "${nativeLanguage}".
CRITICAL RULE: ALL tiles, target sentences, audioText, and target-language choices MUST be 100% pure "${targetLanguage}" in its authentic script (NEVER use English unless "${targetLanguage}" IS English!).
Level: ${levelDesc}
Purpose: "${purpose}"
Return a JSON object with a "steps" array of 5 items using these 3 interactive types:
1. type: "arrange" (Word Tile Sentence Builder):
   - prompt: short instruction in "${nativeLanguage}"
   - targetSentence: exact sentence in "${targetLanguage}"
   - tiles: array of words from targetSentence PLUS 2 extra distractor words in "${targetLanguage}", all shuffled!
2. type: "listen" (Audio Listening Choice):
   - prompt: "استمع جيداً واختر المعنى الصحيح"
   - audioText: natural phrase in "${targetLanguage}"
   - options: 4 short meaning choices in "${nativeLanguage}"
   - correctIndex: 0..3
3. type: "choice" (Context Card Quiz):
   - prompt: situational question in "${nativeLanguage}"
   - audioText: the target phrase in "${targetLanguage}"
   - options: 4 phrase options in "${targetLanguage}"
   - correctIndex: 0..3`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert gamified language exercise designer. Return strictly valid JSON with zero language mixing.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  prompt: { type: Type.STRING },
                  targetSentence: { type: Type.STRING },
                  tiles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  audioText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctIndex: { type: Type.INTEGER },
                },
                required: ['type', 'prompt'],
              },
            },
          },
          required: ['steps'],
        },
      },
    });

    return parseGeminiJson<{ steps: InteractiveSprintStep[] }>(
      response.text,
      'تعذر توليد الجولة التفاعلية.'
    );
  } catch (err) {
    throw formatGeminiError(err, 'تعذر توليد الجولة التفاعلية.');
  }
}

export async function generateLanguageAlphabet(params: {
  nativeLanguage?: string;
  targetLanguage?: string;
}): Promise<LanguageAlphabet> {
  const { nativeLanguage = 'العربية', targetLanguage = 'English' } = params;

  try {
    const ai = getAiClient();
    const prompt = `Generate the core alphabet or fundamental characters of "${targetLanguage}" for a beginner learner whose native language is "${nativeLanguage}".
Provide 16 to 28 essential letters/characters of "${targetLanguage}" (in its authentic script) with:
- letter: the character (uppercase + lowercase if applicable)
- name: letter name in "${nativeLanguage}"
- pronunciationOpposite: how to pronounce it written in Arabic script (e.g. آ, ب, ژ) so it can be displayed directly underneath the letter
- pronunciationLatin: short Latin phonetic transliteration
- soundHint: short articulation tip in "${nativeLanguage}"
- exampleWord: authentic word in "${targetLanguage}" starting with/using this letter
- examplePronunciation: phonetic pronunciation in "${nativeLanguage}"
- exampleMeaning: meaning in "${nativeLanguage}"`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert phonetics and writing-system instructor. Output strictly valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            scriptName: { type: Type.STRING },
            description: { type: Type.STRING },
            letters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  letter: { type: Type.STRING },
                  name: { type: Type.STRING },
                  pronunciationOpposite: { type: Type.STRING },
                  pronunciationLatin: { type: Type.STRING },
                  soundHint: { type: Type.STRING },
                  exampleWord: { type: Type.STRING },
                  examplePronunciation: { type: Type.STRING },
                  exampleMeaning: { type: Type.STRING },
                },
                required: [
                  'letter',
                  'name',
                  'pronunciationOpposite',
                  'pronunciationLatin',
                  'soundHint',
                  'exampleWord',
                  'examplePronunciation',
                  'exampleMeaning',
                ],
              },
            },
          },
          required: ['language', 'scriptName', 'description', 'letters'],
        },
      },
    });

    return parseGeminiJson<LanguageAlphabet>(response.text, 'تعذر تحميل حروف اللغة حالياً.');
  } catch (err) {
    throw formatGeminiError(err, 'تعذر تحميل حروف اللغة حالياً.');
  }
}
