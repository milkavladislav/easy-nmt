import { useEffect, useState } from 'react';
import { Loader2, BookOpen, Lock, Clock, CheckCircle2, ChevronRight, Gift, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import QuestBlock from '../components/quest/QuestBlock';
import { loadCourse150, loadBestResults, loadBlockTest, testIdFor, blockTestIdFor, canOpen, BLOCK_TEST_MINUTES, hasQuest } from '../utils/course150';

function TopicRow({ topic, best, onOpen }) {
  const open = canOpen(topic);
  const status = !topic.ready
    ? { icon: <Clock className="h-4 w-4" />, text: 'Готується', cls: 'text-slate-400 bg-white/5 border-white/10' }
    : !topic.free
      ? { icon: <Lock className="h-4 w-4" />, text: 'Повний доступ', cls: 'text-amber-300 bg-amber-500/10 border-amber-500/30' }
      : best
        ? { icon: <CheckCircle2 className="h-4 w-4" />, text: `Тест: ${best.earned} / ${best.max}`, cls: 'text-green-400 bg-green-500/10 border-green-500/30' }
        : { icon: <Gift className="h-4 w-4" />, text: 'Безкоштовно', cls: 'text-orange-300 bg-orange-500/10 border-orange-500/30' };

  return (
    <button
      type="button"
      disabled={!open}
      onClick={() => onOpen(topic)}
      className={`w-full text-left flex items-center gap-4 px-4 sm:px-5 py-4 rounded-2xl border transition-all duration-300 ${
        open
          ? 'bg-white/10 border-orange-500/30 hover:border-orange-400/60 hover:bg-white/15 cursor-pointer'
          : 'bg-white/5 border-white/10 cursor-not-allowed opacity-70'
      }`}
    >
      <span className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold flex items-center justify-center">
        {topic.number}
      </span>
      <span className="flex-1 min-w-0 text-white font-semibold leading-snug">{topic.title}</span>
      <span className={`hidden sm:flex shrink-0 items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${status.cls}`}>
        {status.icon}
        {status.text}
      </span>
      <span className={`sm:hidden shrink-0 ${status.cls.split(' ')[0]}`}>{status.icon}</span>
      {open && <ChevronRight className="h-5 w-5 text-white/60 shrink-0" />}
    </button>
  );
}

function BlockTestRow({ block, best, loading, onStart }) {
  const open = block.topics.every((t) => t.ready) && block.topics[0]?.free;
  return (
    <button
      type="button"
      disabled={!open || loading}
      onClick={onStart}
      className={`w-full text-left flex items-center gap-4 px-4 sm:px-5 py-4 rounded-2xl border transition-all duration-300 ${
        open
          ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/15 border-amber-400/50 hover:border-amber-300 cursor-pointer'
          : 'bg-white/5 border-white/10 cursor-not-allowed opacity-70'
      }`}
    >
      <span className="shrink-0 w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trophy className="h-5 w-5" />}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-white font-semibold leading-snug">Підсумковий тест блоку {block.number}</span>
        <span className="block text-slate-300 text-xs mt-0.5">{block.test.questions} нових завдань з усіх тем блоку · {BLOCK_TEST_MINUTES} хв</span>
      </span>
      {best ? (
        <span className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border text-green-400 bg-green-500/10 border-green-500/30">
          <CheckCircle2 className="h-4 w-4" /><span className="hidden sm:inline">Результат:</span> {best.earned} / {best.max}
        </span>
      ) : !open ? (
        <span className="shrink-0 text-slate-400"><Lock className="h-4 w-4" /></span>
      ) : null}
      {open && <ChevronRight className="h-5 w-5 text-white/60 shrink-0" />}
    </button>
  );
}

export default function Course150({ onNavigate, onOpenDovidnik }) {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [best, setBest] = useState({});
  const [error, setError] = useState(null);
  const [loadingBlock, setLoadingBlock] = useState(null);

  useEffect(() => {
    loadCourse150().then(setCourse).catch((err) => {
      console.error('course150 load error:', err);
      setError('Не вдалося завантажити курс. Спробуйте ще раз.');
    });
  }, []);

  useEffect(() => {
    loadBestResults(user?.uid).then(setBest).catch((err) => console.error('course150 results error:', err));
  }, [user?.uid]);

  const startBlockTest = async (block) => {
    try {
      setLoadingBlock(block.number);
      const test = await loadBlockTest(block);
      onNavigate('nmtTest', { test, practice: true, exit: { view: 'course', label: 'Назад до курсу' } });
    } catch (err) {
      console.error('course150 block test load error:', err);
      setError('Не вдалося завантажити тест. Спробуйте ще раз.');
    } finally {
      setLoadingBlock(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl">
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-orange-400 animate-spin" />
      </div>
    );
  }

  const topics = course.blocks.flatMap((b) => b.topics);
  const ready = topics.filter((t) => t.ready).length;
  const passed = topics.filter((t) => best[testIdFor(t.number)]).length;

  return (
    <div className="min-h-screen overflow-x-clip bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-600/20 backdrop-blur-xl rounded-3xl p-5 sm:p-8 border border-orange-500/30 shadow-2xl shadow-orange-500/10 mb-8">
          <p className="inline-block text-xs font-bold tracking-wide uppercase bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full px-3 py-1 mb-3">
            Самопідготовка
          </p>
          <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
            Короткий курс на ≈18 тестових балів із 32: прості завдання з вибором відповіді, на відповідність і легкі відкриті.
            У кожній темі — заняття з розібраними прикладами, задачі з НМТ минулих років, ДЗ і тест з автоперевіркою.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
              <p className="text-slate-300 text-xs mb-1">Тем у курсі</p>
              <p className="text-2xl font-bold text-white">{topics.length}</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
              <p className="text-slate-300 text-xs mb-1">Уже доступно</p>
              <p className="text-2xl font-bold text-white">{ready}</p>
            </div>
            <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
              <p className="text-slate-300 text-xs mb-1">Тестів пройдено</p>
              <p className="text-2xl font-bold text-white">{passed}</p>
            </div>
            <button
              onClick={onOpenDovidnik}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-4 py-3 rounded-2xl flex items-center justify-center gap-2"
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">Довідник</span>
            </button>
          </div>
          <p className="mt-5 text-sm text-orange-200/90 flex items-start gap-2">
            <Gift className="h-4 w-4 mt-0.5 shrink-0" />
            Безкоштовна проба: блок 1 «{course.blocks[0].title}» відкритий після входу. Решта блоків — у повному доступі.
          </p>
        </div>

        <div className="space-y-8">
          {course.blocks.map((block) => (block.topics.every(hasQuest) ? (
            <QuestBlock key={block.number} block={block} uid={user?.uid} best={best} testIdFor={testIdFor}
              examBest={best[blockTestIdFor(block.number)]} examLoading={loadingBlock === block.number}
              onOpen={(topic) => onNavigate('quest150', topic)} onExam={() => startBlockTest(block)} />
          ) : (
            <section key={block.number}>
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-xl font-bold text-white">
                  <span className="text-orange-400 mr-2">Блок {block.number}.</span>
                  {block.title}
                </h2>
                <span className="text-slate-400 text-sm">{block.topics.length} {block.topics.length === 1 ? 'тема' : block.topics.length < 5 ? 'теми' : 'тем'}</span>
              </div>
              <div className="space-y-2">
                {block.topics.map((t) => (
                  <TopicRow key={t.number} topic={t} best={best[testIdFor(t.number)]} onOpen={(topic) => onNavigate(hasQuest(topic) ? 'quest150' : 'topic150', topic)} />
                ))}
                {block.test && (
                  <BlockTestRow block={block} best={best[blockTestIdFor(block.number)]} loading={loadingBlock === block.number} onStart={() => startBlockTest(block)} />
                )}
              </div>
            </section>
          )))}
        </div>
      </div>
    </div>
  );
}
