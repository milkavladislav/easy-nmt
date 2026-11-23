import { useEffect, useState } from 'react';
import { ArrowLeft, Presentation, ClipboardList, Play, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadTopicTest, loadBestResults, testIdFor, hasQuest } from '../utils/course150';

function Step({ n, icon, title, text, children }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-orange-500/30 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center">{n}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">{icon}{title}</h3>
          <p className="text-slate-300 text-sm mt-1 mb-4">{text}</p>
          <div className="flex flex-wrap gap-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Topic150({ topic, onNavigate }) {
  const { user } = useAuth();
  const [loadingTest, setLoadingTest] = useState(false);
  const [error, setError] = useState(null);
  const [best, setBest] = useState(null);
  const f = topic.files || {};

  useEffect(() => {
    loadBestResults(user?.uid).then((all) => setBest(all[testIdFor(topic.number)] || null)).catch(() => {});
  }, [user?.uid, topic.number]);

  const startTest = async () => {
    try {
      setLoadingTest(true);
      setError(null);
      const test = await loadTopicTest(topic);
      onNavigate('nmtTest', { test, practice: true, exit: { view: 'topic150', data: topic } });
    } catch (err) {
      console.error('course150 test load error:', err);
      setError('Не вдалося завантажити тест. Спробуйте ще раз.');
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b1f] bg-gradient-to-b from-[#0d1236] via-[#070b1f] to-[#070b1f]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <button onClick={() => onNavigate('course')} className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-6">
          <ArrowLeft className="h-5 w-5" />
          До курсу
        </button>

        <div className="mb-6">
          <p className="text-orange-300 text-sm font-semibold mb-1">НМТ 150+ · Тема {topic.number}</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{topic.title}</h1>
        </div>

        <div className="space-y-4">
          <Step n={1} icon={<Presentation className="h-5 w-5 text-orange-300" />} title="Заняття"
            text="Коротка теорія, розібрані приклади й задачі з НМТ минулих років — з перевіркою відповіді одразу.">
            {f.lessonData && (
              <button
                onClick={() => onNavigate('lesson150', topic)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                <Play className="h-4 w-4" />Почати заняття
              </button>
            )}
            {hasQuest(topic) && (
              <button
                onClick={() => onNavigate('quest150', topic)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border border-amber-300/40 shadow-lg shadow-violet-900/40"
              >
                <Sparkles className="h-4 w-4 text-amber-200" />Повернутись у квест
              </button>
            )}
          </Step>

          <Step n={2} icon={<ClipboardList className="h-5 w-5 text-orange-300" />} title="Домашнє завдання"
            text={`Тест на ${topic.testQuestions || ''} завдань з автоперевіркою: бали як на НМТ, після завершення — правильні відповіді й розв’язання.`}>
            {f.test && (
              <button
                onClick={startTest}
                disabled={loadingTest}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white disabled:opacity-60"
              >
                {loadingTest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                {best ? 'Пройти ще раз' : 'Почати ДЗ'}
              </button>
            )}
            {best && (
              <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-green-400">
                <CheckCircle2 className="h-4 w-4" />Найкращий результат: {best.earned} / {best.max}
              </span>
            )}
          </Step>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
}
