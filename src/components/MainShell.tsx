import { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Bell,
  Crown,
  Gem,
  Home,
  Layers,
  MessageSquare,
  Moon,
  PenTool,
  Settings,
  Sun,
  Trophy,
  User,
  Zap,
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { syncPublicFriendDirectory } from '../lib/friends';
import { playFeedbackSound } from '../lib/sound';
import {
  LessonProgressRecord,
  MainTab,
  StageDefinition,
  UserNotification,
  UserProfile,
  VocabularyCard,
  WeeklyChallengeProgress,
} from '../types';
import AppLogo from './AppLogo';
import EnergyRechargeModal from './EnergyRechargeModal';
import LanguageFlag from './LanguageFlag';
import UserAvatar from './UserAvatar';
import HomeView from './views/HomeView';
import ExercisesView from './views/ExercisesView';
import ChatView from './views/ChatView';
import ChallengesView from './views/ChallengesView';
import FlashcardsView from './views/FlashcardsView';
import NotificationsView from './views/NotificationsView';
import AccountView from './views/AccountView';
import SettingsView from './views/SettingsView';

interface MainShellProps {
  profile: UserProfile;
  onThemeSync: (theme: 'light' | 'dark') => void;
  onSignOut: () => Promise<void>;
}

export default function MainShell({ profile, onThemeSync, onSignOut }: MainShellProps) {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [completedStages, setCompletedStages] = useState<Record<string, LessonProgressRecord>>({});
  const [vocabCards, setVocabCards] = useState<VocabularyCard[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [challenges, setChallenges] = useState<WeeklyChallengeProgress[]>([]);
  const [energyModalOpen, setEnergyModalOpen] = useState(false);
  const [resettingStages, setResettingStages] = useState(false);

  const energy = profile.energy ?? 5;
  const maxEnergy = profile.maxEnergy ?? 5;
  const gems = profile.gems ?? 100;
  const subscriptionTier = profile.subscriptionTier || 'free';
  const isPlus = subscriptionTier !== 'free';
  const hasEnergy = isPlus || energy > 0;

  // Automatic daily energy refill at local midnight/date rollover
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (profile.lastEnergyDate !== today) {
      const userRef = doc(db, 'users', profile.uid);
      void updateDoc(userRef, {
        energy: 5,
        maxEnergy: 5,
        lastEnergyDate: today,
        updatedAt: serverTimestamp(),
      }).catch((err) => handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`));
    }
  }, [profile.uid, profile.lastEnergyDate]);

  // Keep public friend card & lookup keys synchronized
  useEffect(() => {
    void syncPublicFriendDirectory(profile);
  }, [
    profile.uid,
    profile.displayName,
    profile.email,
    profile.nativeLanguage,
    profile.targetLanguage,
    profile.level,
    profile.levelLabel,
    profile.xp,
    profile.avatarId,
    profile.arabicCountryCode,
  ]);

  useEffect(() => {
    const uid = profile.uid;

    const qStages = query(
      collection(db, 'users', uid, 'lessonProgress'),
      where('userId', '==', uid)
    );
    const unsubStages = onSnapshot(
      qStages,
      (snap) => {
        const map: Record<string, LessonProgressRecord> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as LessonProgressRecord;
          map[data.lessonId] = data;
        });
        setCompletedStages(map);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/lessonProgress`)
    );

    const qVocab = query(
      collection(db, 'users', uid, 'vocabulary'),
      where('userId', '==', uid)
    );
    const unsubVocab = onSnapshot(
      qVocab,
      (snap) => {
        setVocabCards(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<VocabularyCard, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/vocabulary`)
    );

    const qNotifs = query(
      collection(db, 'users', uid, 'notifications'),
      where('userId', '==', uid)
    );
    const unsubNotifs = onSnapshot(
      qNotifs,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<UserNotification, 'id'>),
        }));
        items.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setNotifications(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/notifications`)
    );

    const qChallenges = query(
      collection(db, 'users', uid, 'weeklyChallenges'),
      where('userId', '==', uid)
    );
    const unsubChallenges = onSnapshot(
      qChallenges,
      (snap) => {
        setChallenges(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<WeeklyChallengeProgress, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/weeklyChallenges`)
    );

    return () => {
      unsubStages();
      unsubVocab();
      unsubNotifs();
      unsubChallenges();
    };
  }, [profile.uid]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const awardProgress = async (
    xpGain: number,
    skillKey: 'skillReading' | 'skillWriting' | 'skillSpeaking' | 'skillListening' | 'skillVocabulary',
    skillDelta: number,
    stageDelta = 0,
    exerciseDelta = 0,
    gemsDelta = 0
  ) => {
    const userRef = doc(db, 'users', profile.uid);
    const nextSkillVal = Math.min(100, (profile[skillKey] ?? 0) + skillDelta);
    try {
      await updateDoc(userRef, {
        xp: profile.xp + xpGain,
        weeklyXp: profile.weeklyXp + xpGain,
        completedLessonsCount: profile.completedLessonsCount + stageDelta,
        completedExercisesCount: profile.completedExercisesCount + exerciseDelta,
        gems: gems + gemsDelta,
        [skillKey]: nextSkillVal,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleConsumeEnergy = async (amount = 1): Promise<boolean> => {
    if (isPlus) return true;
    if (energy <= 0) {
      playFeedbackSound('error', profile.soundEnabled);
      setEnergyModalOpen(true);
      return false;
    }
    const today = new Date().toISOString().slice(0, 10);
    const nextEnergy = Math.max(0, energy - amount);
    const userRef = doc(db, 'users', profile.uid);
    try {
      await updateDoc(userRef, {
        energy: nextEnergy,
        maxEnergy,
        lastEnergyDate: today,
        updatedAt: serverTimestamp(),
      });
      if (nextEnergy === 0) {
        setEnergyModalOpen(true);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
    return true;
  };

  const handleRechargeWithGems = async () => {
    if (gems < 50) return;
    const today = new Date().toISOString().slice(0, 10);
    const userRef = doc(db, 'users', profile.uid);
    try {
      await updateDoc(userRef, {
        energy: 5,
        maxEnergy: 5,
        gems: gems - 50,
        lastEnergyDate: today,
        updatedAt: serverTimestamp(),
      });
      playFeedbackSound('levelup', profile.soundEnabled);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleSelectSubscription = async (nextTier: 'free' | 'plus_monthly' | 'plus_yearly') => {
    const today = new Date().toISOString().slice(0, 10);
    const bonus =
      nextTier !== subscriptionTier && nextTier === 'plus_yearly'
        ? 250
        : nextTier !== subscriptionTier && nextTier === 'plus_monthly'
        ? 100
        : 0;
    const userRef = doc(db, 'users', profile.uid);
    try {
      await updateDoc(userRef, {
        subscriptionTier: nextTier,
        energy: 5,
        maxEnergy: 5,
        gems: gems + bonus,
        lastEnergyDate: today,
        updatedAt: serverTimestamp(),
      });
      playFeedbackSound('levelup', profile.soundEnabled);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleResetLevelStages = async (scopedStageIds: string[]) => {
    setResettingStages(true);
    try {
      const existingIds = scopedStageIds
        .map((id) => id.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120))
        .filter((safeId) => Boolean(completedStages[safeId]));

      await Promise.all(
        existingIds.map((safeId) =>
          deleteDoc(doc(db, 'users', profile.uid, 'lessonProgress', safeId)).catch((err) =>
            handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/lessonProgress/${safeId}`)
          )
        )
      );

      if (existingIds.length > 0) {
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          completedLessonsCount: Math.max(0, profile.completedLessonsCount - existingIds.length),
          updatedAt: serverTimestamp(),
        });
      }
      playFeedbackSound('tap', profile.soundEnabled);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    } finally {
      setResettingStages(false);
    }
  };

  const handleCompleteStage = async (stage: StageDefinition, scopedStageId: string) => {
    const safeId = scopedStageId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 120);
    const ref = doc(db, 'users', profile.uid, 'lessonProgress', safeId);
    const alreadyDone = completedStages[safeId]?.status === 'completed';

    try {
      if (alreadyDone) {
        await updateDoc(ref, {
          status: 'completed',
          score: 100,
          xpEarned: stage.xpReward,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(ref, {
          userId: profile.uid,
          lessonId: safeId,
          language: profile.targetLanguage.slice(0, 40),
          level: profile.level,
          title: stage.title.slice(0, 120),
          status: 'completed',
          score: 100,
          xpEarned: stage.xpReward,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await awardProgress(stage.xpReward, 'skillReading', 6, 1, 0, 10);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}/lessonProgress/${safeId}`);
    }
  };

  const handleAddVocabCard = async (card: Omit<VocabularyCard, 'id' | 'userId'>) => {
    const wordId = `w-${Date.now()}`;
    const ref = doc(db, 'users', profile.uid, 'vocabulary', wordId);
    try {
      await setDoc(ref, {
        userId: profile.uid,
        word: card.word.slice(0, 120),
        translation: card.translation.slice(0, 120),
        pronunciation: card.pronunciation.slice(0, 120),
        example: card.example.slice(0, 300),
        language: card.language.slice(0, 40),
        mastery: card.mastery,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await awardProgress(10, 'skillVocabulary', 3);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${profile.uid}/vocabulary/${wordId}`);
    }
  };

  const handleUpdateVocabMastery = async (card: VocabularyCard, nextMastery: number) => {
    const ref = doc(db, 'users', profile.uid, 'vocabulary', card.id);
    try {
      await updateDoc(ref, {
        mastery: nextMastery,
        updatedAt: serverTimestamp(),
      });
      await awardProgress(10, 'skillVocabulary', 2);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}/vocabulary/${card.id}`);
    }
  };

  const handleDeleteVocab = async (cardId: string) => {
    const ref = doc(db, 'users', profile.uid, 'vocabulary', cardId);
    try {
      await deleteDoc(ref);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/vocabulary/${cardId}`);
    }
  };

  const handleAdvanceChallenge = async (ch: WeeklyChallengeProgress) => {
    if (ch.status === 'completed') return;
    const nextTasks = Math.min(ch.targetTasks, ch.completedTasks + 1);
    const nextStatus = nextTasks >= ch.targetTasks ? 'completed' : 'active';
    const ref = doc(db, 'users', profile.uid, 'weeklyChallenges', ch.id);
    try {
      await updateDoc(ref, {
        completedTasks: nextTasks,
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      if (nextStatus === 'completed') {
        await awardProgress(ch.xpReward, 'skillSpeaking', 5);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}/weeklyChallenges/${ch.id}`);
    }
  };

  const handleMarkNotifRead = async (notifId: string) => {
    const ref = doc(db, 'users', profile.uid, 'notifications', notifId);
    try {
      await updateDoc(ref, { read: true, updatedAt: serverTimestamp() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}/notifications/${notifId}`);
    }
  };

  const handleDeleteNotif = async (notifId: string) => {
    const ref = doc(db, 'users', profile.uid, 'notifications', notifId);
    try {
      await deleteDoc(ref);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/notifications/${notifId}`);
    }
  };

  const handleUpdateLearningPath = async (updates: {
    displayName: string;
    targetLanguage: string;
    level: 1 | 2 | 3 | 4 | 5;
    levelLabel: string;
    avatarId?: string;
    arabicCountryCode?: string;
  }) => {
    const ref = doc(db, 'users', profile.uid);
    try {
      await updateDoc(ref, {
        displayName: updates.displayName.slice(0, 80),
        targetLanguage: updates.targetLanguage.slice(0, 40),
        level: updates.level,
        levelLabel: updates.levelLabel.slice(0, 50),
        avatarId: (updates.avatarId || profile.avatarId || 'astro').slice(0, 32),
        arabicCountryCode: (updates.arabicCountryCode || profile.arabicCountryCode || 'DZ').slice(0, 4),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleQuickThemeChange = async (nextTheme: 'light' | 'dark') => {
    onThemeSync(nextTheme);
    playFeedbackSound('tap', profile.soundEnabled);
    const ref = doc(db, 'users', profile.uid);
    try {
      await updateDoc(ref, {
        theme: nextTheme,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleSaveSettings = async (settings: {
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    speechRate: number;
    notificationsEnabled: boolean;
    reminderTime: string;
    dailyGoalMinutes: number;
    weeklyTargetXp: number;
    arabicCountryCode: string;
  }) => {
    onThemeSync(settings.theme);
    const ref = doc(db, 'users', profile.uid);
    try {
      await updateDoc(ref, {
        ...settings,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const handleRequestBrowserPush = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      void Notification.requestPermission();
    }
  };

  const navItems: { id: MainTab; label: string; icon: typeof Home; activeCls: string }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home, activeCls: 'bg-emerald-600 text-white shadow-sm' },
    { id: 'exercises', label: 'المراحل والتمارين', icon: PenTool, activeCls: 'bg-violet-600 text-white shadow-sm' },
    { id: 'chat', label: 'المحادثة', icon: MessageSquare, activeCls: 'bg-sky-600 text-white shadow-sm' },
    { id: 'challenges', label: 'التحدي الأسبوعي', icon: Trophy, activeCls: 'bg-amber-500 text-white shadow-sm' },
    { id: 'flashcards', label: 'البطاقات الذكية', icon: Layers, activeCls: 'bg-indigo-600 text-white shadow-sm' },
    { id: 'notifications', label: 'الإشعارات', icon: Bell, activeCls: 'bg-rose-600 text-white shadow-sm' },
    { id: 'account', label: 'حسابي', icon: User, activeCls: 'bg-[#081B3E] text-white dark:bg-indigo-700 shadow-sm' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, activeCls: 'bg-cyan-700 text-white shadow-sm' },
  ];

  const mobileTabs: { id: MainTab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'الرئيسية', icon: Home },
    { id: 'exercises', label: 'المراحل', icon: PenTool },
    { id: 'chat', label: 'المحادثة', icon: MessageSquare },
    { id: 'challenges', label: 'التحدي', icon: Trophy },
    { id: 'account', label: 'حسابي', icon: User },
  ];

  const isDark = profile.theme === 'dark';

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Desktop Navigation Rail */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sticky top-0 h-[100dvh]">
        <div className="px-2 py-2 mb-4 space-y-3">
          <AppLogo size="xs" showText />
          <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <UserAvatar
              uid={profile.uid}
              displayName={profile.displayName}
              avatarId={profile.avatarId}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {profile.displayName}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                <LanguageFlag
                  language={profile.targetLanguage}
                  arabicCountryCode={profile.arabicCountryCode}
                  size="xs"
                />
                <span className="truncate">
                  {profile.targetLanguage} · م{profile.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  playFeedbackSound('tap', profile.soundEnabled);
                }}
                className={`w-full min-h-[44px] px-3.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? item.activeCls
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className="font-mono-num text-xs font-bold">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-[56px] px-3 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className="rounded-xl hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              aria-label="حسابي"
            >
              <UserAvatar
                uid={profile.uid}
                displayName={profile.displayName}
                avatarId={profile.avatarId}
                size="xs"
              />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 cursor-pointer shrink-0"
              aria-label="الرئيسية"
            >
              <AppLogo size="xs" />
              <span
                dir="ltr"
                className="font-display text-sm sm:text-base font-extrabold text-[#081B3E] dark:text-emerald-400 whitespace-nowrap hidden sm:inline"
              >
                My Language
              </span>
            </button>

            {/* Active Language National Flag Badge in Top Bar */}
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/60 transition-colors cursor-pointer shrink-0"
              title={`اللغة المختارة: ${profile.targetLanguage}`}
            >
              <LanguageFlag
                language={profile.targetLanguage}
                arabicCountryCode={profile.arabicCountryCode}
                size="sm"
              />
              <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                {profile.targetLanguage}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Energy & Subscription Trigger */}
            <button
              type="button"
              onClick={() => setEnergyModalOpen(true)}
              className={`min-h-[36px] px-2.5 rounded-xl border text-xs font-mono-num font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isPlus
                  ? 'border-amber-400/70 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                  : energy === 0
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 animate-pulse'
                  : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              }`}
              title="الطاقة والاشتراكات"
            >
              {isPlus ? <Crown className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
              <span>{isPlus ? '∞' : `${energy}/${maxEnergy}`}</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-sky-600 dark:text-sky-300 border-r border-slate-300 dark:border-slate-700 pr-1.5 mr-0.5">
                <Gem className="w-3 h-3" />
                <span>{gems}</span>
              </span>
            </button>

            {/* Instant 1-Tap Light / Dark Mode Switcher */}
            <button
              type="button"
              onClick={() => void handleQuickThemeChange(isDark ? 'light' : 'dark')}
              className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-sky-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label={isDark ? 'تبديل إلى الوضع النهاري' : 'تبديل إلى الوضع الليلي'}
              title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('challenges')}
              className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="التحدي الأسبوعي"
            >
              <Trophy className="w-4.5 h-4.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="الإشعارات"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 text-[10px] font-mono-num font-bold text-rose-600 dark:text-rose-400">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="الإعدادات"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 pb-24 lg:pb-8">
          {activeTab === 'home' && (
            <HomeView
              profile={profile}
              unreadNotifications={unreadCount}
              onNavigate={setActiveTab}
              onOpenRecharge={() => setEnergyModalOpen(true)}
            />
          )}

          {activeTab === 'exercises' && (
            <ExercisesView
              profile={profile}
              completedStages={completedStages}
              hasEnergy={hasEnergy}
              energy={energy}
              maxEnergy={maxEnergy}
              gems={gems}
              isPlus={isPlus}
              resettingStages={resettingStages}
              onConsumeEnergy={handleConsumeEnergy}
              onOpenRecharge={() => setEnergyModalOpen(true)}
              onResetStages={handleResetLevelStages}
              onCompleteStage={handleCompleteStage}
              onExerciseCompleted={async (skill, xp) => {
                const keyMap = {
                  writing: 'skillWriting',
                  speaking: 'skillSpeaking',
                  reading: 'skillReading',
                  listening: 'skillListening',
                  vocabulary: 'skillVocabulary',
                } as const;
                await awardProgress(xp, keyMap[skill], 5, 0, 1);
              }}
            />
          )}

          {activeTab === 'chat' && (
            <ChatView
              profile={profile}
              onPracticeTurn={async () => {
                await awardProgress(15, 'skillSpeaking', 3);
              }}
            />
          )}

          {activeTab === 'challenges' && (
            <ChallengesView
              profile={profile}
              challenges={challenges}
              onAdvanceChallenge={handleAdvanceChallenge}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsView
              profile={profile}
              cards={vocabCards}
              onAddCard={handleAddVocabCard}
              onUpdateMastery={handleUpdateVocabMastery}
              onDeleteCard={handleDeleteVocab}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkRead={handleMarkNotifRead}
              onDelete={handleDeleteNotif}
              onRequestBrowserPush={handleRequestBrowserPush}
            />
          )}

          {activeTab === 'account' && (
            <AccountView
              profile={profile}
              onUpdateLearningPath={handleUpdateLearningPath}
              onSignOut={onSignOut}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              onQuickThemeChange={handleQuickThemeChange}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 pb-safe bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-5 items-center">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                playFeedbackSound('tap', profile.soundEnabled);
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                active
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-semibold whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <EnergyRechargeModal
        open={energyModalOpen}
        profile={profile}
        onClose={() => setEnergyModalOpen(false)}
        onRechargeWithGems={handleRechargeWithGems}
        onSelectSubscription={handleSelectSubscription}
      />
    </div>
  );
}
