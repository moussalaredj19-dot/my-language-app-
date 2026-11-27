import { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  Check,
  Copy,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  Volume2,
} from 'lucide-react';
import LanguageFlag from '../LanguageFlag';
import TalkingAvatar from '../TalkingAvatar';
import UserAvatar from '../UserAvatar';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import {
  getFriendCode,
  getSortedPair,
  lookupFriendByQuery,
  makeChatId,
} from '../../lib/friends';
import { sendCoachChatTurn } from '../../lib/gemini';
import { playFeedbackSound } from '../../lib/sound';
import { createSpeechRecognizer, speakText, SpeechRecognitionLike } from '../../lib/speech';
import {
  FriendChatMessage,
  FriendChatThread,
  FriendRecord,
  UserProfile,
} from '../../types';

interface CoachMessage {
  id: string;
  role: 'user' | 'tutor';
  text: string;
  transliteration?: string;
  translation?: string;
  correction?: string;
  suggestions?: string[];
}

interface ChatViewProps {
  profile: UserProfile;
  onPracticeTurn: () => Promise<void>;
}

const SCENARIOS = [
  'محادثة يومية عامة',
  'في المطار والفندق',
  'مقابلة عمل احترافية',
  'في المطعم والمقهى',
  'حوار دراسي في الجامعة',
];

const STARTER_SUGGESTIONS: Record<string, string[]> = {
  العربية: ['مرحباً، كيف حالك اليوم؟', 'لنبدأ التدريب معاً!'],
  الفرنسية: ['Bonjour ! Comment ça va ?', 'Commençons la pratique !'],
  الإنجليزية: ['Hello, how are you?', 'Let us practice together!'],
  الروسية: ['Привет! Как дела?', 'Давай начнём практику!'],
  الإيطالية: ['Ciao! Come stai?', 'Iniziamo a praticare!'],
  الإسبانية: ['¡Hola! ¿Cómo estás?', '¡Empecemos a practicar!'],
  البرتغالية: ['Olá! Tudo bem com você?', 'Vamos praticar juntos!'],
  الألمانية: ['Hallo! Wie geht es dir?', 'Lass uns zusammen üben!'],
};

function getStarterSuggestions(targetLanguage: string): string[] {
  return (
    STARTER_SUGGESTIONS[targetLanguage] || [
      `مرحباً! لنتدرب على ${targetLanguage}`,
      `كيف تسير مرحلتك اليوم؟`,
    ]
  );
}

function buildWelcomeMessage(profile: UserProfile): CoachMessage {
  return {
    id: `welcome-${profile.targetLanguage}-${profile.level}`,
    role: 'tutor',
    text: `مرحباً ${profile.displayName}! أنا مدربك الذكي في ${profile.targetLanguage} (المستوى ${profile.level} — ${profile.levelLabel}). اكتب أو تحدث بصوتك لنبدأ الحوار.`,
    suggestions: getStarterSuggestions(profile.targetLanguage),
  };
}

export default function ChatView({ profile, onPracticeTurn }: ChatViewProps) {
  const [chatSection, setChatSection] = useState<'friends' | 'coach'>('friends');

  // --- Friend Chat State ---
  const myFriendCode = useMemo(() => getFriendCode(profile.uid), [profile.uid]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [friends, setFriends] = useState<FriendRecord[]>([]);
  const [threadsA, setThreadsA] = useState<FriendChatThread[]>([]);
  const [threadsB, setThreadsB] = useState<FriendChatThread[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [friendMessages, setFriendMessages] = useState<FriendChatMessage[]>([]);

  const [lookupInput, setLookupInput] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendStatus, setFriendStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [friendMsgInput, setFriendMsgInput] = useState('');
  const [sendingFriendMsg, setSendingFriendMsg] = useState(false);
  const [lastHeardFriendText, setLastHeardFriendText] = useState('');
  const [recordingFriendVoice, setRecordingFriendVoice] = useState(false);
  const friendRecRef = useRef<SpeechRecognitionLike | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- AI Coach State ---
  const [scenario, setScenario] = useState(SCENARIOS[0]);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(() => [buildWelcomeMessage(profile)]);
  const [coachInput, setCoachInput] = useState('');
  const [sendingCoach, setSendingCoach] = useState(false);
  const [coachErrorMsg, setCoachErrorMsg] = useState<string | null>(null);
  const [recordingCoach, setRecordingCoach] = useState(false);
  const coachRecRef = useRef<SpeechRecognitionLike | null>(null);

  // Subscribe to saved friends + incoming/outgoing chat threads
  useEffect(() => {
    const uid = profile.uid;
    const qFriends = query(collection(db, 'users', uid, 'friends'), where('userId', '==', uid));
    const unsubFriends = onSnapshot(
      qFriends,
      (snap) => {
        setFriends(snap.docs.map((d) => d.data() as FriendRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/friends`)
    );

    const qThreadsA = query(collection(db, 'friendChats'), where('uidA', '==', uid));
    const unsubA = onSnapshot(
      qThreadsA,
      (snap) => {
        setThreadsA(snap.docs.map((d) => d.data() as FriendChatThread));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'friendChats')
    );

    const qThreadsB = query(collection(db, 'friendChats'), where('uidB', '==', uid));
    const unsubB = onSnapshot(
      qThreadsB,
      (snap) => {
        setThreadsB(snap.docs.map((d) => d.data() as FriendChatThread));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'friendChats')
    );

    return () => {
      unsubFriends();
      unsubA();
      unsubB();
    };
  }, [profile.uid]);

  // Combined contacts list from saved friends + active threads
  const contacts = useMemo(() => {
    const byChat = new Map<
      string,
      {
        chatId: string;
        peerUid: string;
        peerName: string;
        peerLang: string;
        friendCode?: string;
        levelLabel?: string;
        avatarId?: string;
        arabicCountryCode?: string;
        lastMessage?: string;
        savedFriend: boolean;
        updatedSec: number;
      }
    >();

    friends.forEach((f) => {
      byChat.set(f.chatId, {
        chatId: f.chatId,
        peerUid: f.friendUid,
        peerName: f.displayName,
        peerLang: f.targetLanguage,
        friendCode: f.friendCode,
        levelLabel: f.levelLabel,
        avatarId: f.avatarId,
        arabicCountryCode: f.arabicCountryCode,
        savedFriend: true,
        updatedSec: f.updatedAt?.seconds ?? 0,
      });
    });

    [...threadsA, ...threadsB].forEach((t) => {
      const amA = t.uidA === profile.uid;
      const peerUid = amA ? t.uidB : t.uidA;
      const peerName = amA ? t.nameB : t.nameA;
      const peerLang = amA ? t.langB : t.langA;
      const existing = byChat.get(t.chatId);
      byChat.set(t.chatId, {
        chatId: t.chatId,
        peerUid,
        peerName: existing?.peerName || peerName,
        peerLang: existing?.peerLang || peerLang,
        friendCode: existing?.friendCode,
        levelLabel: existing?.levelLabel,
        avatarId: existing?.avatarId,
        arabicCountryCode: existing?.arabicCountryCode,
        lastMessage: t.lastMessage,
        savedFriend: Boolean(existing?.savedFriend),
        updatedSec: Math.max(existing?.updatedSec ?? 0, t.updatedAt?.seconds ?? 0),
      });
    });

    return Array.from(byChat.values()).sort((a, b) => b.updatedSec - a.updatedSec);
  }, [friends, threadsA, threadsB, profile.uid]);

  useEffect(() => {
    if (!selectedChatId && contacts.length > 0) {
      setSelectedChatId(contacts[0].chatId);
    }
  }, [contacts, selectedChatId]);

  const activeContact = useMemo(
    () => contacts.find((c) => c.chatId === selectedChatId) || null,
    [contacts, selectedChatId]
  );

  // Subscribe to real-time messages of selected chat
  useEffect(() => {
    if (!activeContact) {
      setFriendMessages([]);
      return;
    }

    const { uidA, uidB } = getSortedPair(profile.uid, activeContact.peerUid);
    const qMsgs = query(
      collection(db, 'friendChats', activeContact.chatId, 'messages'),
      where('uidA', '==', uidA),
      where('uidB', '==', uidB)
    );

    const unsub = onSnapshot(
      qMsgs,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<FriendChatMessage, 'id'>),
        }));
        list.sort((a, b) => (a.createdAt?.seconds ?? 9999999999) - (b.createdAt?.seconds ?? 9999999999));
        setFriendMessages(list);
      },
      (err) =>
        handleFirestoreError(err, OperationType.LIST, `friendChats/${activeContact.chatId}/messages`)
    );

    return unsub;
  }, [activeContact, profile.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [friendMessages.length]);

  useEffect(() => {
    setCoachMessages([buildWelcomeMessage(profile)]);
    setCoachErrorMsg(null);
  }, [profile.targetLanguage, profile.level]);

  const handleCopyFriendCode = async () => {
    try {
      await navigator.clipboard.writeText(myFriendCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Clipboard fallback silently skipped
    }
  };

  const ensureChatThreadExists = async (peer: {
    uid: string;
    displayName: string;
    targetLanguage: string;
  }) => {
    const { uidA, uidB } = getSortedPair(profile.uid, peer.uid);
    const chatId = makeChatId(profile.uid, peer.uid);
    const chatRef = doc(db, 'friendChats', chatId);
    const snap = await getDoc(chatRef);
    if (!snap.exists()) {
      const amA = uidA === profile.uid;
      await setDoc(chatRef, {
        chatId,
        uidA,
        uidB,
        nameA: (amA ? profile.displayName : peer.displayName).slice(0, 80),
        nameB: (amA ? peer.displayName : profile.displayName).slice(0, 80),
        langA: (amA ? profile.targetLanguage : peer.targetLanguage).slice(0, 40),
        langB: (amA ? peer.targetLanguage : profile.targetLanguage).slice(0, 40),
        lastMessage: '',
        lastSenderId: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return chatId;
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = lookupInput.trim();
    if (!raw || addingFriend) return;

    setAddingFriend(true);
    setFriendStatus(null);
    try {
      const found = await lookupFriendByQuery(raw);
      if (!found) {
        setFriendStatus({
          type: 'err',
          text: 'لم يتم العثور على صديق بهذا الكود أو البريد. تأكد من كتابة كود الصديق (مثل ML-A1B2C3) أو بريده المسجل.',
        });
        return;
      }
      if (found.uid === profile.uid) {
        setFriendStatus({ type: 'err', text: 'لا يمكنك إضافة حسابك الشخصي كصديق.' });
        return;
      }

      const chatId = await ensureChatThreadExists(found);
      const friendRef = doc(db, 'users', profile.uid, 'friends', found.uid);
      await setDoc(friendRef, {
        userId: profile.uid,
        friendUid: found.uid,
        friendCode: found.friendCode,
        displayName: found.displayName.slice(0, 80),
        targetLanguage: found.targetLanguage.slice(0, 40),
        level: found.level,
        levelLabel: found.levelLabel.slice(0, 50),
        chatId,
        avatarId: (found.avatarId || 'astro').slice(0, 32),
        arabicCountryCode: (found.arabicCountryCode || 'DZ').slice(0, 4),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setLookupInput('');
      setSelectedChatId(chatId);
      setFriendStatus({
        type: 'ok',
        text: `تمت إضافة ${found.displayName} بنجاح! يمكنك بدء المحادثة الآن.`,
      });
      playFeedbackSound('success', profile.soundEnabled);
    } catch (err) {
      setFriendStatus({
        type: 'err',
        text: err instanceof Error ? err.message : 'تعذر إضافة الصديق حالياً.',
      });
    } finally {
      setAddingFriend(false);
    }
  };

  const handleRemoveFriend = async (friendUid: string) => {
    try {
      await deleteDoc(doc(db, 'users', profile.uid, 'friends', friendUid));
      if (activeContact?.peerUid === friendUid) {
        setSelectedChatId(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${profile.uid}/friends/${friendUid}`);
    }
  };

  const handleSendFriendMessage = async (textOverride?: string) => {
    if (!activeContact || sendingFriendMsg) return;
    const text = (textOverride ?? friendMsgInput).trim().slice(0, 1000);
    if (!text) return;

    setSendingFriendMsg(true);
    try {
      await ensureChatThreadExists({
        uid: activeContact.peerUid,
        displayName: activeContact.peerName,
        targetLanguage: activeContact.peerLang,
      });

      const { uidA, uidB } = getSortedPair(profile.uid, activeContact.peerUid);
      const msgId = `m-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const msgRef = doc(db, 'friendChats', activeContact.chatId, 'messages', msgId);

      await setDoc(msgRef, {
        chatId: activeContact.chatId,
        uidA,
        uidB,
        senderId: profile.uid,
        senderName: profile.displayName.slice(0, 80),
        text,
        language: profile.targetLanguage.slice(0, 40),
        createdAt: serverTimestamp(),
      });

      const amA = uidA === profile.uid;
      await updateDoc(doc(db, 'friendChats', activeContact.chatId), {
        [amA ? 'nameA' : 'nameB']: profile.displayName.slice(0, 80),
        [amA ? 'langA' : 'langB']: profile.targetLanguage.slice(0, 40),
        lastMessage: text.slice(0, 500),
        lastSenderId: profile.uid,
        updatedAt: serverTimestamp(),
      });

      if (!textOverride) setFriendMsgInput('');
      playFeedbackSound('tap', profile.soundEnabled);
      await onPracticeTurn();
    } catch (err) {
      setFriendStatus({
        type: 'err',
        text: err instanceof Error ? err.message : 'تعذر إرسال الرسالة.',
      });
    } finally {
      setSendingFriendMsg(false);
    }
  };

  const toggleFriendVoiceInput = () => {
    if (recordingFriendVoice) {
      friendRecRef.current?.stop();
      setRecordingFriendVoice(false);
      return;
    }

    const rec = createSpeechRecognizer(profile.targetLanguage);
    if (!rec) {
      setFriendStatus({
        type: 'err',
        text: 'التعرف الصوتي غير مدعوم في هذا المتصفح.',
      });
      return;
    }
    friendRecRef.current = rec;
    setRecordingFriendVoice(true);
    let finalStr = '';
    rec.onresult = (ev) => {
      finalStr = ev.results[ev.results.length - 1][0].transcript;
      setFriendMsgInput(finalStr);
    };
    rec.onerror = () => setRecordingFriendVoice(false);
    rec.onend = () => {
      setRecordingFriendVoice(false);
      if (finalStr.trim()) {
        void handleSendFriendMessage(finalStr);
      }
    };
    rec.start();
  };

  // --- AI Coach Handlers ---
  const sendCoachMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || sendingCoach) return;

    setCoachErrorMsg(null);
    const userMsg: CoachMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...coachMessages, userMsg];
    setCoachMessages(nextHistory);
    setCoachInput('');
    setSendingCoach(true);

    try {
      const data = await sendCoachChatTurn({
        nativeLanguage: profile.nativeLanguage,
        targetLanguage: profile.targetLanguage,
        level: profile.level,
        purpose: profile.purpose,
        scenario,
        history: nextHistory.map((m) => ({ role: m.role, text: m.text })),
        message: trimmed,
      });

      const tutorMsg: CoachMessage = {
        id: `t-${Date.now()}`,
        role: 'tutor',
        text: data.replyTarget,
        transliteration: data.replyTransliteration,
        translation: data.replyTranslation,
        correction: data.userCorrection,
        suggestions: data.suggestedReplies || [],
      };
      setCoachMessages((prev) => [...prev, tutorMsg]);
      speakText(data.replyTarget, profile.targetLanguage, profile.speechRate);
      playFeedbackSound('tap', profile.soundEnabled);
      await onPracticeTurn();
    } catch (err) {
      setCoachErrorMsg(err instanceof Error ? err.message : 'تعذر الاتصال بالمدرب.');
    } finally {
      setSendingCoach(false);
    }
  };

  const toggleCoachVoice = () => {
    if (recordingCoach) {
      coachRecRef.current?.stop();
      setRecordingCoach(false);
      return;
    }

    const rec = createSpeechRecognizer(profile.targetLanguage);
    if (!rec) {
      setCoachErrorMsg('التعرف الصوتي غير مدعوم في هذا المتصفح.');
      return;
    }
    coachRecRef.current = rec;
    setRecordingCoach(true);
    let finalStr = '';
    rec.onresult = (ev) => {
      finalStr = ev.results[ev.results.length - 1][0].transcript;
      setCoachInput(finalStr);
    };
    rec.onerror = () => setRecordingCoach(false);
    rec.onend = () => {
      setRecordingCoach(false);
      if (finalStr.trim()) {
        void sendCoachMessage(finalStr);
      }
    };
    rec.start();
  };

  return (
    <div className="space-y-4">
      {/* Section Switcher: Friends Chat vs AI Coach */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 gap-1">
          <button
            type="button"
            onClick={() => setChatSection('friends')}
            className={`min-h-[40px] px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              chatSection === 'friends'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>محادثة الأصدقاء</span>
          </button>
          <button
            type="button"
            onClick={() => setChatSection('coach')}
            className={`min-h-[40px] px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all ${
              chatSection === 'coach'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>المدرب الذكي</span>
          </button>
        </div>

        {/* User Friend Code Share Pill */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">كود الصداقة الخاص بك:</span>
          <button
            type="button"
            onClick={() => void handleCopyFriendCode()}
            className="min-h-[36px] px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-mono-num font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span dir="ltr">{myFriendCode}</span>
            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* MODE 1: REAL-TIME FRIEND CHAT */}
      {chatSection === 'friends' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Friends Sidebar + Add Friend */}
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
            <form onSubmit={(e) => void handleAddFriend(e)} className="space-y-2.5">
              <label htmlFor="add-friend-input" className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                <UserPlus className="w-4 h-4 text-sky-600" />
                <span>أضف صديقاً لتجربة التحدث معه</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="add-friend-input"
                  type="text"
                  dir="ltr"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="ML-XXXXXX أو email"
                  className="flex-1 min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="submit"
                  disabled={addingFriend || !lookupInput.trim()}
                  className="min-h-[42px] px-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {addingFriend ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إضافة'}
                </button>
              </div>
              {friendStatus && (
                <div
                  className={`rounded-xl p-2.5 text-xs font-medium ${
                    friendStatus.type === 'ok'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {friendStatus.text}
                </div>
              )}
            </form>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>أصدقاؤك ({contacts.length})</span>
              </div>

              {contacts.length === 0 ? (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    لا يوجد أصدقاء مضافون بعد
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    شارك كودك (<span className="font-mono-num font-bold" dir="ltr">{myFriendCode}</span>) مع أصدقائك أو أدخل كود الصديق / بريده بالأعلى لبدء المحادثة المباشرة بـ {profile.targetLanguage}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[380px] overflow-y-auto">
                  {contacts.map((c) => {
                    const active = c.chatId === activeContact?.chatId;
                    return (
                      <div
                        key={c.chatId}
                        className={`rounded-xl border p-3 flex items-center justify-between gap-2 transition-all ${
                          active
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 hover:border-sky-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedChatId(c.chatId)}
                          className="flex-1 min-w-0 flex items-center gap-2.5 text-right cursor-pointer"
                        >
                          <UserAvatar
                            uid={c.peerUid}
                            displayName={c.peerName}
                            avatarId={c.avatarId}
                            size="sm"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                {c.peerName}
                              </span>
                              <LanguageFlag
                                language={c.peerLang}
                                arabicCountryCode={c.arabicCountryCode}
                                size="xs"
                              />
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {c.lastMessage || `يتعلم ${c.peerLang}`}
                            </div>
                          </div>
                        </button>
                        {c.savedFriend && (
                          <button
                            type="button"
                            onClick={() => void handleRemoveFriend(c.peerUid)}
                            className="min-h-[34px] min-w-[34px] rounded-lg text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer"
                            aria-label="إزالة الصديق"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Active Friend Chat Area */}
          <section className="lg:col-span-8 flex flex-col h-[calc(100dvh-250px)] min-h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            {activeContact ? (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <TalkingAvatar
                      text={lastHeardFriendText || undefined}
                      languageName={profile.targetLanguage}
                      speechRate={profile.speechRate}
                      size="sm"
                      variant="sky"
                      label=""
                    />
                    <div>
                      <div className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {activeContact.peerName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        محادثة مباشرة · يتعلم {activeContact.peerLang}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getStarterSuggestions(profile.targetLanguage).map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => void handleSendFriendMessage(sug)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:border-sky-500 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {friendMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 space-y-2 p-4">
                      <MessageSquare className="w-8 h-8 text-sky-500" />
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        ابدأ التحدث مع {activeContact.peerName} بـ {profile.targetLanguage}!
                      </p>
                      <p className="text-xs max-w-sm">
                        جرب كتابة رسالة أو الضغط على الميكروفون للتحدث، واضغط على أي رسالة للاستماع لنطقها بالأفاتار.
                      </p>
                    </div>
                  ) : (
                    friendMessages.map((m) => {
                      const mine = m.senderId === profile.uid;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${mine ? 'items-start' : 'items-end'}`}
                        >
                          <div
                            className={`max-w-[84%] sm:max-w-[72%] rounded-2xl p-3.5 space-y-1.5 ${
                              mine
                                ? 'bg-[#081B3E] text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2.5">
                              <p className="text-sm font-semibold leading-relaxed">{m.text}</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setLastHeardFriendText(m.text);
                                  speakText(m.text, m.language || profile.targetLanguage, profile.speechRate);
                                }}
                                className={`min-h-[32px] min-w-[32px] rounded-lg flex items-center justify-center shrink-0 cursor-pointer ${
                                  mine
                                    ? 'bg-white/15 text-emerald-300'
                                    : 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300'
                                }`}
                                aria-label="سماع الرسالة"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className={`text-[10px] ${mine ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                              {m.senderName} · {m.language}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSendFriendMessage();
                  }}
                  className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950"
                >
                  <button
                    type="button"
                    onClick={toggleFriendVoiceInput}
                    className={`min-h-[46px] min-w-[46px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                      recordingFriendVoice
                        ? 'bg-rose-600 text-white'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                    aria-label={recordingFriendVoice ? 'إيقاف الميكروفون' : 'تحدث بالميكروفون'}
                  >
                    {recordingFriendVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <input
                    type="text"
                    value={friendMsgInput}
                    onChange={(e) => setFriendMsgInput(e.target.value)}
                    placeholder={`راسل ${activeContact.peerName} بـ ${profile.targetLanguage}...`}
                    className="flex-1 min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  <button
                    type="submit"
                    disabled={sendingFriendMsg || !friendMsgInput.trim()}
                    className="min-h-[46px] px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">إرسال</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <TalkingAvatar
                  size="lg"
                  variant="sky"
                  label="مساحة محادثة الأصدقاء"
                  subtitle="أضف صديقاً عبر كود الصداقة أو البريد الإلكتروني على اليمين لتختبر نفسك في محادثة حقيقية!"
                />
                <button
                  type="button"
                  onClick={() => setChatSection('coach')}
                  className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold cursor-pointer"
                >
                  أو تدرب الآن مع المدرب الذكي
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* MODE 2: AI PRACTICE COACH WITH TALKING AVATAR */}
      {chatSection === 'coach' && (
        <div className="flex flex-col h-[calc(100dvh-250px)] min-h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <TalkingAvatar
                languageName={profile.targetLanguage}
                speechRate={profile.speechRate}
                size="sm"
                variant="emerald"
                label=""
              />
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>المدرب الذكي لـ {profile.targetLanguage}</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  المستوى {profile.level} ({profile.levelLabel}) · تصحيح فوري ونطق صوتي
                </p>
              </div>
            </div>

            <select
              aria-label="سيناريو المحادثة"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {SCENARIOS.map((sc) => (
                <option key={sc} value={sc}>
                  {sc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {coachMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 ${
                    msg.role === 'user'
                      ? 'bg-[#081B3E] text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm sm:text-base font-semibold leading-relaxed">{msg.text}</p>
                    {msg.role === 'tutor' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, profile.targetLanguage, profile.speechRate)}
                        className="min-h-[36px] min-w-[36px] rounded-lg bg-white/80 dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 cursor-pointer"
                        aria-label="تشغيل الرد صوتياً"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {msg.transliteration && (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      النطق: {msg.transliteration}
                    </div>
                  )}

                  {msg.translation && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 pt-1.5 border-t border-slate-200/70 dark:border-slate-700">
                      الترجمة: {msg.translation}
                    </div>
                  )}

                  {msg.correction && (
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg p-2">
                      ملاحظة المدرب: {msg.correction}
                    </div>
                  )}

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => void sendCoachMessage(sug)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500 cursor-pointer"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sendingCoach && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>المدرب يكتب الرد...</span>
              </div>
            )}
          </div>

          {coachErrorMsg && (
            <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-200 border-t border-rose-200 dark:border-rose-900">
              {coachErrorMsg}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendCoachMessage(coachInput);
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950"
          >
            <button
              type="button"
              onClick={toggleCoachVoice}
              className={`min-h-[46px] min-w-[46px] rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                recordingCoach
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              aria-label={recordingCoach ? 'إيقاف التحدث' : 'تحدث بالميكروفون'}
            >
              {recordingCoach ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={coachInput}
              onChange={(e) => setCoachInput(e.target.value)}
              placeholder={`اكتب رسالتك بـ ${profile.targetLanguage} أو العربية...`}
              className="flex-1 min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={sendingCoach || !coachInput.trim()}
              className="min-h-[46px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">إرسال</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
