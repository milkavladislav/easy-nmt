import { useState, useEffect } from 'react';
import { FileText, Trash2, Clock, Calendar, Play, Plus, Loader2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-5 rounded-3xl mb-6 ring-4 ring-violet-500/30 shadow-2xl shadow-violet-500/20">
            <FileText className="h-12 w-12 text-violet-400" />
          </div>
          <h1 className="text-4xl sm:text-2xl font-bold text-white mb-4">НМТ тести</h1>
        </div>

        {isAdmin && (
          <>
            <div className="flex justify-center mb-8 animate-slide-up">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center space-x-3 bg-violet-500 hover:bg-violet-600 text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-violet-500/30"
              >
                <Plus className="h-5 w-5" />
                <span>Додати тест</span>
              </button>
            </div>

            {showAddModal && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowAddModal(false)}
              >
                <div
                  className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Додати тест</h2>
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="text-slate-400 hover:text-white text-3xl leading-none"
                      aria-label="Закрити"
                    >
                      ×
                    </button>
                  </div>

                  <label className="block text-slate-300 text-sm font-medium mb-2">JSON тесту</label>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-y font-mono text-sm mb-6"
                  />

                  <label className="block text-slate-300 text-sm font-medium mb-2">Відповіді</label>
                  <textarea
                    value={answersText}
                    onChange={(e) => setAnswersText(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-y font-mono text-sm mb-4"
                  />

                  <button
                    onClick={handleText}
                    disabled={!jsonText.trim() || saving}
                    className="w-full flex items-center justify-center space-x-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-violet-500/30"
                  >
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
                      <p className="text-red-400 text-sm text-center">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <Loader2 className="h-10 w-10 text-violet-400 animate-spin mb-4" />
            <p className="text-slate-400 text-base">Завантаження тестів...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-slate-700 animate-fade-in">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Ще не завантажено жодного тесту</p>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-violet-500/40 transition-all duration-300 shadow-lg"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{test.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    {test.year && (
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{test.year}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(test.timeSeconds)}</span>
                    </span>
                    <span>{test.questionCount} питань</span>
                    {test.answers && (
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-lg">з відповідями</span>
                    )}
                    <span className="uppercase text-xs bg-slate-700/50 px-2 py-1 rounded-lg">{test.subject}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigate('nmtTest', test)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
                  >
                    <Play className="h-4 w-4" />
                    <span>Почати</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl border border-slate-700 hover:border-red-500/30 transition-all duration-300"
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
