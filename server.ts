import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('مفتاح Gemini API غير مهيأ على الخادم. يرجى إعداده في لوحة Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
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

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // 1. Generate tailored lesson for ANY language, level 1-5, and learning purpose
  app.post('/api/ai/lesson', async (req, res) => {
    try {
      const {
        nativeLanguage = 'العربية',
        targetLanguage = 'English',
        level = 1,
        purpose = 'التواصل اليومي',
        purposeFocus = '',
        topic = '',
      } = req.body ?? {};

      const ai = getAiClient();
      const levelDesc = getLevelDescription(Number(level));
      const topicPrompt = topic ? `Focus specifically on the topic: "${topic}".` : `Choose an engaging practical topic aligned with the learner's purpose.`;

      const prompt = `Create a structured, authentic language lesson for a learner whose native language is "${nativeLanguage}" and who is learning "${targetLanguage}".
Learner Level: ${levelDesc}
Learning Purpose: "${purpose}" ${purposeFocus ? `(Specific focus: ${purposeFocus})` : ''}.
${topicPrompt}
All explanations, translations, grammar tips, and cultural notes MUST be written in "${nativeLanguage}" (use Arabic if nativeLanguage is Arabic).
All vocabulary words, dialogue lines, and the reading paragraph MUST be written authentically in "${targetLanguage}" with accurate pronunciation guide / IPA or readable phonetic transliteration.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert multilingual curriculum designer. Output strictly valid JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              grammarTip: { type: Type.STRING },
              culturalNote: { type: Type.STRING },
              vocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    pronunciation: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    example: { type: Type.STRING },
                    exampleTranslation: { type: Type.STRING },
                  },
                  required: ['word', 'pronunciation', 'translation', 'example', 'exampleTranslation'],
                },
              },
              dialogues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    speaker: { type: Type.STRING },
                    line: { type: Type.STRING },
                    translation: { type: Type.STRING },
                  },
                  required: ['speaker', 'line', 'translation'],
                },
              },
              readingParagraph: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  keyWords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['title', 'text', 'translation', 'keyWords'],
              },
            },
            required: ['title', 'summary', 'grammarTip', 'culturalNote', 'vocabulary', 'dialogues', 'readingParagraph'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر توليد الدرس حالياً.';
      res.status(500).json({ error: message });
    }
  });

  // 2. Generate tailored multi-modal exercises (word writing + meaning, writing, speaking, fill-blank, matching, reading shadowing)
  app.post('/api/ai/exercises', async (req, res) => {
    try {
      const {
        nativeLanguage = 'العربية',
        targetLanguage = 'English',
        level = 1,
        purpose = 'التواصل اليومي',
      } = req.body ?? {};

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
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert multilingual assessment designer. Output strictly valid JSON with pure target-language script.',
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
                  required: ['word', 'pronunciation', 'meaning', 'explanation', 'example', 'exampleTranslation'],
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر توليد التمارين حالياً.';
      res.status(500).json({ error: message });
    }
  });

  // 3. Evaluate written exercise answer
  app.post('/api/ai/evaluate-writing', async (req, res) => {
    try {
      const {
        nativeLanguage = 'العربية',
        targetLanguage = 'English',
        level = 1,
        promptText,
        expectedAnswer,
        userAnswer,
      } = req.body ?? {};

      if (!userAnswer || typeof userAnswer !== 'string') {
        res.status(400).json({ error: 'يرجى كتابة إجابتك أولاً.' });
        return;
      }

      const ai = getAiClient();
      const evalPrompt = `Evaluate a learner's written answer in "${targetLanguage}" (${getLevelDescription(Number(level))}).
Prompt shown to learner (${nativeLanguage}): "${promptText}"
Reference answer: "${expectedAnswer}"
Learner's answer: "${userAnswer}"
Be encouraging and fair. Accept valid synonyms or slight punctuation differences. Write feedbackArabic and tipArabic in "${nativeLanguage}".`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر تقييم الإجابة.';
      res.status(500).json({ error: message });
    }
  });

  // 4. Interactive Multilingual Conversation Tutor
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const {
        nativeLanguage = 'العربية',
        targetLanguage = 'English',
        level = 1,
        purpose = 'التواصل اليومي',
        scenario = 'محادثة يومية عامة',
        history = [],
        message,
      } = req.body ?? {};

      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'الرسالة مطلوبة.' });
        return;
      }

      const ai = getAiClient();
      const levelDesc = getLevelDescription(Number(level));
      const historyText = Array.isArray(history)
        ? history
            .slice(-8)
            .map((m: { role?: string; text?: string }) => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.text ?? ''}`)
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
        model: 'gemini-4-hydrogen',
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
            required: ['replyTarget', 'replyTransliteration', 'replyTranslation', 'userCorrection', 'suggestedReplies'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر الاتصال بالمحادث الذكي.';
      res.status(500).json({ error: message });
    }
  });

  // 5. Instant Phrasebook / Translator helper
  app.post('/api/ai/translate', async (req, res) => {
    try {
      const { text, sourceLanguage = 'العربية', targetLanguage = 'English' } = req.body ?? {};
      if (!text || typeof text !== 'string') {
        res.status(400).json({ error: 'يرجى إدخال النص للترجمة.' });
        return;
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر الترجمة حالياً.';
      res.status(500).json({ error: message });
    }
  });

  // 6. Interactive Gamified Language Sprint Generator
  app.post('/api/ai/interactive-sprint', async (req, res) => {
    try {
      const {
        nativeLanguage = 'العربية',
        targetLanguage = 'English',
        level = 1,
        purpose = 'التواصل اليومي',
      } = req.body ?? {};

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
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert gamified language exercise designer. Return strictly valid JSON with zero language mixing.',
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر توليد الجولة التفاعلية.';
      res.status(500).json({ error: message });
    }
  });

  // 7. Alphabet & Pronunciation Script Generator for any world language
  app.post('/api/ai/alphabet', async (req, res) => {
    try {
      const {
        nativeLanguage = 'العربية',
        targetLanguage = 'English',
      } = req.body ?? {};

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
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert phonetics and writing-system instructor. Output strictly valid JSON.',
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

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json(parsed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'تعذر تحميل حروف اللغة حالياً.';
      res.status(500).json({ error: message });
    }
  });

  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    process.env.DISABLE_HMR = process.env.DISABLE_HMR || 'true';
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        allowedHosts: true,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`My Language server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
