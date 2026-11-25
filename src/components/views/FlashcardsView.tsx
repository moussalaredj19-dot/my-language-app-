import { useState } from 'react';
import { Check, Plus, RotateCw, Trash2, Volume2 } from 'lucide-react';
import { speakText } from '../../lib/speech';
import { playFeedbackSound } from '../../lib/sound';
import { UserProfile, VocabularyCard } from '../../types';

interface FlashcardsViewProps {
  profile: UserProfile;
  cards: VocabularyCard[];
  onAddCard: (card: Omit<VocabularyCard, 'id' | 'userId'>) => Promise<void>;
  onUpdateMastery: (card: VocabularyCard, nextMastery: number) => Promise<void>;
  onDeleteCard: (cardId: string) => Promise<void>;
}

export default function FlashcardsView({
  profile,
  cards,
  onAddCard,
  onUpdateMastery,
  onDeleteCard,
}: FlashcardsViewProps) {
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [example, setExample] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim()) return;
    setAdding(true);
    try {
      await onAddCard({
        word: word.trim().slice(0, 120),
        translation: translation.trim().slice(0, 120),
        pronunciation: pronunciation.trim().slice(0, 120),
        example: example.trim().slice(0, 300),
        language: profile.targetLanguage,
        mastery: 1,
      });
      setWord('');
      setTranslation('');
      setPronunciation('');
      setExample('');
      playFeedbackSound('success', profile.soundEnabled);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">البطاقات الذكية للمفردات</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            راجع الكلمات التي أضفتها من المراحل والتمارين مع النطق الصوتي والترجمة.
          </p>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder={`الكلمة بـ ${profile.targetLanguage}`}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            placeholder={`المعنى بـ ${profile.nativeLanguage}`}
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={pronunciation}
            onChange={(e) => setPronunciation(e.target.value)}
            placeholder="النطق التقريبي (اختياري)"
            className="min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="مثال في جملة (اختياري)"
              className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={adding || !word.trim() || !translation.trim()}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </div>
        </form>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          لا توجد بطاقات محفوظة بعد. أضف أي كلمة جديدة بالأعلى لتدريب نفسك عليها.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => {
            const flipped = flippedId === card.id;
            return (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4"
              >
                <div
                  onClick={() => setFlippedId(flipped ? null : card.id)}
                  className="cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{card.language}</span>
                    <span className="font-mono-num">الإتقان: {card.mastery}/5</span>
                  </div>
                  <div className="py-3 text-center">
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      {flipped ? card.translation : card.word}
                    </div>
                    {!flipped && card.pronunciation && (
                      <div className="text-xs text-slate-500 mt-1">{card.pronunciation}</div>
                    )}
                    {flipped && card.example && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-2">{card.example}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => speakText(card.word, card.language, profile.speechRate)}
                      className="min-h-[38px] min-w-[38px] rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center cursor-pointer"
                      aria-label="نطق الكلمة"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlippedId(flipped ? null : card.id)}
                      className="min-h-[38px] min-w-[38px] rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer"
                      aria-label="قلب البطاقة"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void onUpdateMastery(card, Math.min(5, card.mastery + 1))}
                      className="min-h-[38px] px-2.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>أتقنتها</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDeleteCard(card.id)}
                      className="min-h-[38px] min-w-[38px] rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center cursor-pointer"
                      aria-label="حذف البطاقة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
