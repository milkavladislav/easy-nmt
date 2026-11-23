import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, BookOpen, Target, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MathContent from '../components/MathContent';
import QuestionCard from '../components/course150/QuestionCard';

const CARD = {
  sun: 'from-amber-400/25 to-yellow-500/10 border-amber-400/40 text-amber-300',
  mint: 'from-emerald-400/25 to-teal-500/10 border-emerald-400/40 text-emerald-300',
  coral: 'from-rose-400/25 to-orange-500/10 border-rose-400/40 text-rose-300',
  violet: 'from-violet-400/25 to-fuchsia-500/10 border-violet-400/40 text-violet-300',
  ink: 'from-slate-300/15 to-slate-500/10 border-slate-300/30 text-slate-200',
  white: 'from-white/15 to-white/5 border-white/30 text-white'
};

// «НМТ-2024 (демо): …» на початку розв'язання — це джерело; виносимо його в мітку.
const SRC_RE = /^((?:НМТ|ЗНО)-\d{4}(?:\s*\(демо\))?):\s*/;
function splitSource(question) {
  const m = (question.solution || '').match(SRC_RE);
  if (!m) return question;
  return { ...question, src: m[1], solution: question.solution.slice(m[0].length) };
}

const storageKey = (uid, n) => `course150:lesson:${uid || 'anon'}:${n}`;
function readProgress(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function Theory({ section }) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-orange-300 text-xs font-bold uppercase tracking-wide">{section.tag}</p>
        <MathContent html={section.title} className="text-2xl font-bold text-white" />
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {section.cards.map((c, i) => {
          const cls = CARD[c.color] || CARD.white;
          return (
            <div key={i} className={`rounded-2xl border bg-gradient-to-br p-4 ${cls}`}>
              {c.big && <MathContent html={c.big} className="text-3xl font-extrabold mb-1" />}
              {c.title && <MathContent html={c.title} className="font-bold text-white" />}
              {c.formula && <MathContent html={c.formula} className="text-lg text-white my-2" />}
              {c.text && <MathContent html={c.text} className="text-sm text-white/85 leading-relaxed mt-1" />}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Lesson150({ topic, onNavigate }) {
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  const key = storageKey(user?.uid, topic.number);
  const [progress, setProgress] = useState(() => readProgress(key));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetch(topic.files.lessonData)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setLesson)
      .catch((err) => {
        console.error('course150 lesson load error:', err);
        setError('Не вдалося завантажити заняття. Спробуйте ще раз.');
      });
  }, [topic.files.lessonData]);

  const sections = useMemo(
    () => {
      let n = 0;
      return (lesson?.sections || []).map((s) => ({
        ...s,
        ...(s.question && { question: splitSource(s.question) }),
        ...(s.kind === 'task' && { n: ++n })
      }));
    },
    [lesson]
  );
  const tasks = sections.filter((s) => s.kind === 'task');
  const firstTask = sections.findIndex((s) => s.kind === 'task');
  const solved = tasks.filter((t) => progress[t.n]).length;

  const record = (n, ok) => {
    setProgress((prev) => {
      const next = { ...prev, [n]: prev[n] || ok };
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* приватний режим — прогрес лише до перезавантаження */
      }
      return next;
    });
  };

  const back = () => onNavigate('topic150', topic);

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex items-center justify-center p-4">
        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={back} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-2 rounded-xl">До теми</button>
          </div>
        ) : (
          <Loader2 className="h-12 w-12 text-orange-400 animate-spin" />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950">
      <div className="sticky top-0 z-20 bg-orange-950/85 backdrop-blur border-b border-orange-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <button onClick={back} className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm shrink-0">
            <ArrowLeft className="h-4 w-4" />До теми
          </button>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all" style={{ width: `${tasks.length ? (solved / tasks.length) * 100 : 0}%` }} />
          </div>
          <span className="text-sm font-semibold text-white shrink-0">{solved} / {tasks.length}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <header className="bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-600/20 rounded-3xl p-5 sm:p-8 border border-orange-500/30">
          <p className="text-orange-300 text-sm font-semibold mb-1">НМТ 150+ · Тема {lesson.number} · Заняття</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{lesson.title}</h1>
          {lesson.intro?.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-2">
              {lesson.intro.map((p, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/10 rounded-2xl px-4 py-3 border border-white/15">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-orange-500 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <MathContent html={p.title} className="font-semibold text-white" />
                    <MathContent html={p.text} className="text-sm text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-orange-200/90 mt-4 flex items-start gap-2">
            <BookOpen className="h-4 w-4 mt-0.5 shrink-0" />
            Читай теорію, у прикладах спершу спробуй відповісти сам, а потім відкрий розв’язання. Наприкінці — {tasks.length} задач з офіційних тестів.
          </p>
        </header>

        {sections.map((s, i) => {
          if (s.kind === 'theory') return <Theory key={i} section={s} />;
          if (s.kind === 'example') return <QuestionCard key={i} question={s.question} answer={s.answer} example />;
          const { n } = s;
          return (
            <div key={i} className="space-y-8">
              {i === firstTask && (
                <div className="rounded-3xl bg-slate-950/70 border border-orange-500/30 p-6 text-center">
                  <Target className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold text-white">Тепер самостійно</h2>
                  <p className="text-slate-300 mt-1">{tasks.length} завдань з офіційних тестів НМТ і ЗНО. Перевірка — одразу.</p>
                </div>
              )}
              <QuestionCard question={s.question} answer={s.answer} number={n} initialResult={progress[n]} onResult={(ok) => record(n, ok)} />
            </div>
          );
        })}

        {lesson.summary?.length > 0 && (
          <section className="rounded-3xl bg-white/10 border border-orange-500/30 p-5 sm:p-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="h-6 w-6 text-amber-300" />Головне з теми</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {lesson.summary.map((p, i) => (
                <div key={i} className="rounded-2xl bg-white/5 border border-white/15 p-4">
                  <MathContent html={p.big} className="text-2xl font-extrabold text-amber-300 mb-1" />
                  <MathContent html={p.text} className="text-sm text-white/90" />
                </div>
              ))}
            </div>
          </section>
        )}

        <button onClick={back} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
          Розв’язано {solved} з {tasks.length} · Далі — домашнє завдання<ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
