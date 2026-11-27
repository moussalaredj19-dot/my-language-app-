export type AppScreen =
  | 'welcome'
  | 'auth'
  | 'onboarding_1'
  | 'onboarding_2'
  | 'main';

export type MainTab =
  | 'home'
  | 'exercises'
  | 'chat'
  | 'challenges'
  | 'flashcards'
  | 'notifications'
  | 'account'
  | 'settings';

export type ExerciseMode =
  | 'alphabet'
  | 'sprint'
  | 'writing'
  | 'speaking'
  | 'fillBlank'
  | 'matching'
  | 'reading';

export interface StageDefinition {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  mode: ExerciseMode;
  writingSubMode?: 'words' | 'sentences';
  xpReward: number;
}

export interface AlphabetLetter {
  letter: string;
  name: string;
  pronunciationOpposite: string;
  pronunciationLatin: string;
  soundHint: string;
  exampleWord: string;
  examplePronunciation: string;
  exampleMeaning: string;
}

export interface LanguageAlphabet {
  language: string;
  scriptName: string;
  description: string;
  letters: AlphabetLetter[];
}

export interface InteractiveSprintStep {
  id?: string;
  type: 'arrange' | 'listen' | 'choice';
  prompt: string;
  targetSentence?: string;
  tiles?: string[];
  audioText?: string;
  options?: string[];
  correctIndex?: number;
}

export interface WordWritingItem {
  word: string;
  pronunciation: string;
  meaning: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  nativeLanguage: string;
  targetLanguage: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelLabel: string;
  purpose: string;
  purposeFocus: string;
  learningStyle: string;
  dailyGoalMinutes: number;
  xp: number;
  streakDays: number;
  completedLessonsCount: number;
  completedExercisesCount: number;
  weeklyXp: number;
  weeklyTargetXp: number;
  onboardingCompleted: boolean;
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  speechRate: number;
  notificationsEnabled: boolean;
  reminderTime: string;
  skillReading: number;
  skillWriting: number;
  skillSpeaking: number;
  skillListening: number;
  skillVocabulary: number;
  avatarId?: string;
  arabicCountryCode?: string;
  energy?: number;
  maxEnergy?: number;
  gems?: number;
  lastEnergyDate?: string;
  subscriptionTier?: 'free' | 'plus_monthly' | 'plus_yearly';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface VocabularyItem {
  word: string;
  pronunciation: string;
  translation: string;
  example: string;
  exampleTranslation: string;
}

export interface LessonProgressRecord {
  userId: string;
  lessonId: string;
  language: string;
  level: number;
  title: string;
  status: 'in_progress' | 'completed';
  score: number;
  xpEarned: number;
}

export interface ExercisePack {
  wordWriting: WordWritingItem[];
  writing: { prompt: string; expected: string; hint: string }[];
  speaking: { phrase: string; phonetic: string; translation: string }[];
  fillBlanks: {
    before: string;
    after: string;
    options: string[];
    correct: string;
    translation: string;
  }[];
  matching: { target: string; native: string; pronunciation: string }[];
  reading: {
    title: string;
    paragraph: string;
    translation: string;
    question: string;
    options: string[];
    correctIndex: number;
  };
}

export interface VocabularyCard {
  id: string;
  userId: string;
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
  language: string;
  mastery: number;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: 'reminder' | 'challenge' | 'achievement' | 'lesson';
  read: boolean;
  createdAt?: { seconds: number } | null;
}

export interface WeeklyChallengeProgress {
  id: string;
  userId: string;
  title: string;
  targetTasks: number;
  completedTasks: number;
  xpReward: number;
  status: 'active' | 'completed';
}

export interface FriendRecord {
  id?: string;
  userId: string;
  friendUid: string;
  friendCode: string;
  displayName: string;
  targetLanguage: string;
  level: number;
  levelLabel: string;
  chatId: string;
  avatarId?: string;
  arabicCountryCode?: string;
  createdAt?: { seconds: number } | null;
  updatedAt?: { seconds: number } | null;
}

export interface FriendChatThread {
  id?: string;
  chatId: string;
  uidA: string;
  uidB: string;
  nameA: string;
  nameB: string;
  langA: string;
  langB: string;
  lastMessage: string;
  lastSenderId: string;
  createdAt?: { seconds: number } | null;
  updatedAt?: { seconds: number } | null;
}

export interface FriendChatMessage {
  id: string;
  chatId: string;
  uidA: string;
  uidB: string;
  senderId: string;
  senderName: string;
  text: string;
  language: string;
  createdAt?: { seconds: number } | null;
}
