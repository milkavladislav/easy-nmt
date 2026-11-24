import { useState, useEffect } from 'react';
import { FileText, Trash2, Clock, Calendar, Play, Plus, Loader2, Flag, Mountain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const ADMIN_EMAIL = 'milkav06062003@gmail.com';

// Формати: JSON-масив або по одній відповіді на рядок,
// де кілька токенів через пробіл — це завдання на відповідність
function parseAnswersText(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed);
    if (!Array.isArray(parsed)) throw new Error('not an array');
    return parsed.map((item) => (Array.isArray(item) ? item.join(' ') : item));
  }

  return trimmed
    .split(/[\n;]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const tokens = line.split(/\s+/).filter(Boolean);
      return tokens.length > 1 ? tokens.join(' ') : tokens[0];
    });
}

function sanitizeForFirestore(val) {
  if (val === undefined) return null;
  if (val === null || typeof val !== 'object') return val;

  if (Array.isArray(val)) {
    return val.map((item) => {
      if (Array.isArray(item)) {
        // Усуваємо вкладені масиви (Firestore не підтримує Array всередині Array)
        return item.join(' ');
      }
      return sanitizeForFirestore(item);
    });
  }

  const result = {};
  for (const [k, v] of Object.entries(val)) {
    if (v !== undefined) {
      result[k] = sanitizeForFirestore(v);
    }
  }
  return result;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (h) parts.push(`${h} год`);
  if (m) parts.push(`${m} хв`);
  return parts.join(' ') || '0 хв';
}

export default function NMT({ onNavigate }) {
  const { user } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const [answersText, setAnswersText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    const testsRef = collection(db, 'nmt_tests');

    const unsubscribe = onSnapshot(
      testsRef,
      (snapshot) => {
        const loaded = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));

        // Сортуємо за часом створення або роком/назвою
        loaded.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
          return timeB - timeA;
        });

        setTests(loaded);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching NMT tests from Firestore:', err);
        setError('Не вдалося завантажити тести з бази даних.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addTest = async (data, manualAnswers = null) => {
    if (!isAdmin) return false;
    if (!data.title || !Array.isArray(data.questions) || data.questions.length === 0) {
      setError('Неправильний формат JSON. Потрібні поля title та questions.');
      return false;
    }
    const answerKey = manualAnswers || data.answers || data.correctAnswers || data.answerKey || null;
    if (answerKey && !Array.isArray(answerKey)) {
      setError('Поле answers має бути масивом відповідей у порядку питань.');
      return false;
    }
    if (answerKey && answerKey.length !== data.questions.length) {
      setError(`У answers ${answerKey.length} відповідей, а питань ${data.questions.length}. Кількість має збігатися.`);
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const testId = String(data.id || data.slug || Date.now());
      const rawTest = {
        title: data.title,
        slug: data.slug || data.id || testId,
        year: data.year || '',
        timeSeconds: data.timeSeconds || 0,
        questionCount: data.questionCount || data.questions.length,
        subject: data.subject || 'math',
        questions: data.questions,
        answers: answerKey || null
      };

      const test = sanitizeForFirestore(rawTest);
      test.createdAt = serverTimestamp();

      await setDoc(doc(db, 'nmt_tests', testId), test);
      return true;
    } catch (err) {
      console.error('Error saving test to Firestore:', err);
      setError('Не вдалося зберегти тест у базу даних: ' + (err.message || ''));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleText = async () => {
    if (!isAdmin || saving) return;
    if (!jsonText.trim()) return;

    let data;
    try {
      data = JSON.parse(jsonText);
    } catch {
      setError('Неправильний JSON. Перевірте текст тесту.');
      return;
    }

    let manualAnswers;
    try {
      manualAnswers = parseAnswersText(answersText);
    } catch {
      setError('Не вдалося розібрати відповіді. Вкажіть їх по одній на рядок або JSON-масивом.');
      return;
    }

    const ok = await addTest(data, manualAnswers);
    if (ok) {
      setJsonText('');
      setAnswersText('');
      setShowAddModal(false);
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    const ok = window.confirm('Ви впевнені, що хочете видалити цей тест?');
    if (!ok) return;

    try {
      await deleteDoc(doc(db, 'nmt_tests', id));
    } catch (err) {
      console.error('Error deleting test from Firestore:', err);
      setError('Не вдалося видалити тест: ' + (err.message || ''));
    }
  };

  const field = 'w-full bg-[#070b1f]/70 border border-[#f5c86b]/20 rounded-2xl p-4 text-[#f4ecdf] placeholder-[#f4ecdf]/30 focus:outline-none focus:border-[#f5c86b]/60 focus:ring-2 focus:ring-[#f5c86b]/15 transition-all resize-y font-mono text-sm';
  const goldBtn = 'flex items-center justify-center gap-2 bg-gradient-to-b from-[#f8d78a] to-[#e0a84a] hover:from-[#fbe2a6] hover:to-[#eab45a] text-[#1a1206] font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-[#f5c86b]/10 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b1f] via-[#0b1030] to-[#070b1f] py-8 text-[#f4ecdf]">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 animate-fade-in">
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex shrink-0 items-center justify-center w-16 h-16 rounded-full bg-[#f5c86b]/10 ring-2 ring-[#f5c86b]/50 shadow-[0_0_40px_rgba(245,200,107,.2)]">
              <Flag className="h-8 w-8 text-[#f5c86b]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#f5c86b]/70 mb-1">Фінальна вершина</p>
              <h1 className="font-['Cormorant_Garamond',serif] text-4xl sm:text-5xl font-semibold text-[#f5c86b] mb-2">Тести НМТ</h1>
              <p className="text-[#c4bce6] text-base max-w-2xl">
                Справжні варіанти НМТ з математики з таймером, як на іспиті. Тут перевіряєш, чого навчився у всіх світах.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="self-start sm:self-auto shrink-0 flex items-center justify-center gap-2 border border-[#f5c86b]/40 text-[#f5c86b] hover:bg-[#f5c86b]/10 font-semibold px-6 py-2.5 rounded-2xl transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              <span>Додати тест</span>
            </button>
          )}
        </div>

        {isAdmin && (
          <>
            {showAddModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={() => setShowAddModal(false)}
              >
                <div
                  className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0b1030] rounded-3xl border border-[#f5c86b]/25 p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-[#f5c86b]">Додати тест</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-[#c4bce6] hover:text-white text-3xl leading-none"
                      aria-label="Закрити"
                    >
                      ×
                    </button>
                  </div>

                  <label className="block text-[#c4bce6] text-sm font-medium mb-2">JSON тесту</label>
                  <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={4} className={`${field} mb-6`} />

                  <label className="block text-[#c4bce6] text-sm font-medium mb-2">Відповіді</label>
                  <textarea value={answersText} onChange={(e) => setAnswersText(e.target.value)} rows={2} className={`${field} mb-4`} />

                  <button onClick={handleText} disabled={!jsonText.trim() || saving} className={`${goldBtn} w-full px-8 py-3`}>
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Збереження...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>Додати тест</span>
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-300 text-sm text-center">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <Loader2 className="h-10 w-10 text-[#f5c86b] animate-spin mb-4" />
            <p className="text-[#c4bce6] text-base">Завантаження тестів...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 bg-[#0b1030]/70 rounded-3xl border border-[#f5c86b]/15 animate-fade-in">
            <FileText className="h-14 w-14 text-[#f5c86b]/40 mx-auto mb-4" />
            <p className="text-[#c4bce6] text-lg">Ще не завантажено жодного тесту</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 animate-slide-up">
            {tests.map((test) => (
              <div
                key={test.id}
                className="relative overflow-hidden bg-gradient-to-br from-[#141a45]/90 to-[#0b1030]/90 rounded-3xl border border-[#f5c86b]/20 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#f5c86b]/50 hover:shadow-[0_0_30px_rgba(245,200,107,.08)] transition-all duration-300"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="hidden sm:flex w-12 h-12 shrink-0 rounded-full items-center justify-center bg-[#f5c86b]/10 ring-1 ring-[#f5c86b]/40">
                    <Mountain className="h-6 w-6 text-[#f5c86b]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-semibold text-[#f4ecdf] mb-2 leading-tight">{test.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#c4bce6]">
                      {test.year && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-[#f5c86b]/70" />
                          <span>{test.year}</span>
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-[#f5c86b]/70" />
                        <span>{formatTime(test.timeSeconds)}</span>
                      </span>
                      <span>{test.questionCount} завдань</span>
                      {test.answers && (
                        <span className="text-xs bg-[#7ef0b4]/10 text-[#7ef0b4] px-2 py-1 rounded-lg">з перевіркою</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button onClick={() => onNavigate('nmtTest', test)} className={`${goldBtn} flex-1 sm:flex-none px-6 py-3`}>
                    <Play className="h-4 w-4" />
                    <span>Почати</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-3 text-[#c4bce6] hover:text-red-300 hover:bg-red-500/10 rounded-2xl border border-[#f5c86b]/15 hover:border-red-400/40 transition-all duration-300"
                      title="Видалити"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
