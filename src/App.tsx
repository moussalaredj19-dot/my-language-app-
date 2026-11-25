import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import AuthScreen from './components/AuthScreen';
import ErrorBoundary from './components/ErrorBoundary';
import MainShell from './components/MainShell';
import OnboardingStep1, { OnboardingStep1Data } from './components/OnboardingStep1';
import OnboardingStep2, { OnboardingStep2Data } from './components/OnboardingStep2';
import WelcomeScreen from './components/WelcomeScreen';
import { getLocalProfilePhoto, saveLocalProfilePhoto } from './data/avatars';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { AppScreen, UserProfile } from './types';

function applyThemeToDocument(theme: 'light' | 'dark', isSpaceScreen: boolean) {
  if (typeof document === 'undefined') return;
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', isSpaceScreen ? '#02040a' : isDark ? '#020617' : '#ffffff');
  }
}

function getInitialSavedTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    return window.localStorage.getItem('ml_theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function AppContent() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(getInitialSavedTheme);

  const [step1Data, setStep1Data] = useState<OnboardingStep1Data>({
    displayName: '',
    dailyGoalMinutes: 15,
    learningStyle: 'متوازن (قراءة + كتابة + صوت)',
    avatarId: 'astro',
    customPhotoDataUrl: null,
  });

  const [savingOnboarding, setSavingOnboarding] = useState(false);
  const [onboardingError, setOnboardingError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
      if (!user) {
        setProfile(null);
        setProfileLoaded(false);
      }
    });
    return unsub;
  }, []);

  // Subscribe to user's Firestore profile when authenticated
  useEffect(() => {
    if (!authReady || !authUser) return;

    const ref = doc(db, 'users', authUser.uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          if (data.theme === 'dark' || data.theme === 'light') {
            setLocalTheme(data.theme);
            try {
              window.localStorage.setItem('ml_theme', data.theme);
            } catch {
              // Ignored
            }
          }
          setStep1Data({
            displayName: data.displayName || authUser.displayName || '',
            dailyGoalMinutes: data.dailyGoalMinutes || 15,
            learningStyle: data.learningStyle || 'متوازن (قراءة + كتابة + صوت)',
            avatarId: data.avatarId || 'astro',
            customPhotoDataUrl: getLocalProfilePhoto(authUser.uid),
          });
          setProfileLoaded(true);
          if (data.onboardingCompleted) {
            setScreen((prev) =>
              prev === 'auth' || prev === 'onboarding_1' || prev === 'onboarding_2' ? 'main' : prev
            );
          }
        } else {
          setProfile(null);
          setProfileLoaded(true);
          setStep1Data((prev) => ({
            ...prev,
            displayName: prev.displayName || authUser.displayName || authUser.email?.split('@')[0] || '',
            customPhotoDataUrl: getLocalProfilePhoto(authUser.uid),
          }));
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`)
    );

    return unsub;
  }, [authReady, authUser]);

  // Apply Tailwind dark mode class + theme-color meta cleanly across screens
  useEffect(() => {
    const activeTheme = profile?.theme || localTheme;
    const isSpaceScreen = screen !== 'main';
    applyThemeToDocument(activeTheme, isSpaceScreen);
  }, [profile?.theme, localTheme, screen]);

  const handleStartFromWelcome = () => {
    if (authUser && profileLoaded) {
      if (profile?.onboardingCompleted) {
        setScreen('main');
      } else {
        setScreen('onboarding_1');
      }
    } else {
      setScreen('auth');
    }
  };

  const handleAuthenticated = () => {
    if (profile?.onboardingCompleted) {
      setScreen('main');
    } else {
      setScreen('onboarding_1');
    }
  };

  const handleCompleteOnboarding = async (step2: OnboardingStep2Data) => {
    if (!authUser) {
      setScreen('auth');
      return;
    }

    setSavingOnboarding(true);
    setOnboardingError(null);

    const userRef = doc(db, 'users', authUser.uid);
    const safeName = (step1Data.displayName || authUser.displayName || 'متعلم').trim().slice(0, 80);
    const safeAvatarId = (step1Data.avatarId || 'astro').slice(0, 32);
    const safeArabCode = (step2.arabicCountryCode || 'DZ').slice(0, 4);

    if (step1Data.customPhotoDataUrl) {
      saveLocalProfilePhoto(authUser.uid, step1Data.customPhotoDataUrl);
    }

    try {
      if (profile) {
        await updateDoc(userRef, {
          displayName: safeName,
          nativeLanguage: step2.nativeLanguage.slice(0, 40),
          targetLanguage: step2.targetLanguage.slice(0, 40),
          level: step2.level,
          levelLabel: step2.levelLabel.slice(0, 50),
          purpose: step2.purpose.slice(0, 80),
          purposeFocus: step2.purposeFocus.slice(0, 160),
          learningStyle: step1Data.learningStyle.slice(0, 80),
          dailyGoalMinutes: step1Data.dailyGoalMinutes,
          avatarId: safeAvatarId,
          arabicCountryCode: safeArabCode,
          onboardingCompleted: true,
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(userRef, {
          uid: authUser.uid,
          displayName: safeName,
          email: (authUser.email || '').slice(0, 120),
          nativeLanguage: step2.nativeLanguage.slice(0, 40),
          targetLanguage: step2.targetLanguage.slice(0, 40),
          level: step2.level,
          levelLabel: step2.levelLabel.slice(0, 50),
          purpose: step2.purpose.slice(0, 80),
          purposeFocus: step2.purposeFocus.slice(0, 160),
          learningStyle: step1Data.learningStyle.slice(0, 80),
          dailyGoalMinutes: step1Data.dailyGoalMinutes,
          xp: 50,
          streakDays: 1,
          completedLessonsCount: 0,
          completedExercisesCount: 0,
          weeklyXp: 50,
          weeklyTargetXp: 350,
          onboardingCompleted: true,
          theme: localTheme,
          soundEnabled: true,
          speechRate: 1.0,
          notificationsEnabled: true,
          reminderTime: '20:00',
          skillReading: 15,
          skillWriting: 15,
          skillSpeaking: 15,
          skillListening: 15,
          skillVocabulary: 15,
          avatarId: safeAvatarId,
          arabicCountryCode: safeArabCode,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Seed starter weekly challenges & welcome notification
        const c1Ref = doc(db, 'users', authUser.uid, 'weeklyChallenges', 'week-lessons');
        await setDoc(c1Ref, {
          userId: authUser.uid,
          title: `أكمل 3 مراحل تمارين في ${step2.targetLanguage}`,
          targetTasks: 3,
          completedTasks: 0,
          xpReward: 120,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const c2Ref = doc(db, 'users', authUser.uid, 'weeklyChallenges', 'week-speaking');
        await setDoc(c2Ref, {
          userId: authUser.uid,
          title: 'أنجز 5 تمارين نطق وقراءة صوتية',
          targetTasks: 5,
          completedTasks: 0,
          xpReward: 150,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const nRef = doc(db, 'users', authUser.uid, 'notifications', 'welcome-notif');
        await setDoc(nRef, {
          userId: authUser.uid,
          title: 'مرحباً بك في My Language!',
          body: `تم إعداد مراحلك الخاصة في ${step2.targetLanguage} (${step2.levelLabel}) بنجاح. وحصلت على +50 XP للانطلاقة!`,
          category: 'achievement',
          read: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setScreen('main');
    } catch (err) {
      setOnboardingError(
        err instanceof Error ? err.message : 'تعذر حفظ بياناتك. يرجى المحاولة مجدداً.'
      );
      handleFirestoreError(err, OperationType.WRITE, `users/${authUser.uid}`);
    } finally {
      setSavingOnboarding(false);
    }
  };

  const handleThemeSync = (nextTheme: 'light' | 'dark') => {
    setLocalTheme(nextTheme);
    try {
      window.localStorage.setItem('ml_theme', nextTheme);
    } catch {
      // Ignored
    }
    applyThemeToDocument(nextTheme, screen !== 'main');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setScreen('welcome');
  };

  if (screen === 'welcome') {
    return <WelcomeScreen onStart={handleStartFromWelcome} />;
  }

  if (screen === 'auth') {
    return (
      <AuthScreen
        onBack={() => setScreen('welcome')}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  if (screen === 'onboarding_1') {
    return (
      <OnboardingStep1
        initialData={step1Data}
        onBack={() => setScreen('auth')}
        onNext={(data) => {
          setStep1Data(data);
          setScreen('onboarding_2');
        }}
      />
    );
  }

  if (screen === 'onboarding_2') {
    return (
      <OnboardingStep2
        initialData={{
          nativeLanguage: profile?.nativeLanguage || 'العربية',
          targetLanguage: profile?.targetLanguage || 'الإنجليزية',
          level: profile?.level || 1,
          levelLabel: profile?.levelLabel || 'مبتدئ',
          purpose: profile?.purpose || 'التواصل اليومي',
          purposeFocus: profile?.purposeFocus || '',
          arabicCountryCode: profile?.arabicCountryCode || 'DZ',
        }}
        saving={savingOnboarding}
        errorMsg={onboardingError}
        onBack={() => setScreen('onboarding_1')}
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] bg-[#02040a] flex items-center justify-center p-6">
        <div className="text-sm font-semibold text-slate-300">
          جاري تحميل مسارك التعليمي...
        </div>
      </div>
    );
  }

  return <MainShell profile={profile} onThemeSync={handleThemeSync} onSignOut={handleSignOut} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
