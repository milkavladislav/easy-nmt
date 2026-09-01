import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Sun, Moon, MoreVertical, Check, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import MathContent from './MathContent';
import { LETTERS, normalizeQuestion, gradeQuestion, to200Scale, isNmtPassed } from '../utils/nmtTest';

const THEMES = {
  dark: {
    bg: '#0a0c07',
    surface: '#232819',
    surfaceSoft: '#171b10',
    text: '#e6ead9',
    muted: '#98a186',
    activeBg: '#e2e8cf',
    activeText: '#181c10',
    correct: '#93c26d',
    wrong: '#d9806f'
  },
  light: {
    bg: '#f6f7f1',
    surface: '#e5e9d8',
    surfaceSoft: '#ecefe2',
    text: '#1b1f14',
    muted: '#5f6650',
    activeBg: '#2c3320',
    activeText: '#f2f4ea',
    correct: '#3f7a2a',
    wrong: '#b33a2b'
  }
};

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function NMTTestRunner({ test, onNavigate, onOpenDovidnik }) {
  const questions = useMemo(() => {
    const key = test.answers ?? test.correctAnswers ?? test.answerKey ?? [];
    return (test.questions || []).map((q, idx) => normalizeQuestion(q, idx, key[idx]));
  }, [test.questions, test.answers, test.correctAnswers, test.answerKey]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test.timeSeconds || 0);
  const [theme, setTheme] = useState(() => localStorage.getItem('nmt-theme') || 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const stripRef = useRef(null);
  const savedRef = useRef(false);
  const t = THEMES[theme] || THEMES.dark;
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('nmt-theme', theme);
  }, [theme]);

  useEffect(() => {
    const strip = stripRef.current;
    const chip = strip?.children[current];
    chip?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [current, questions]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  useEffect(() => {
    if (finished || timeLeft <= 0) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [finished, timeLeft]);

  const currentQuestion = questions[current];
  const isQuestionAnswered = (q, ans) =>
    ans !== undefined && (q?.type !== 'connect' || (typeof ans === 'object' && Object.keys(ans).length > 0));

  const answeredCount = useMemo(
    () => questions.filter((q) => isQuestionAnswered(q, answers[q.id])).length,
    [questions, answers]
  );

  const results = useMemo(
    () => questions.map((q) => gradeQuestion(q, answers[q.id])),
    [questions, answers]
  );
  const graded = results.some((r) => r !== null);
  const score = useMemo(
    () =>
      results.reduce(
        (acc, r) => (r ? { earned: acc.earned + r.earned, max: acc.max + r.max, ok: acc.ok + (r.ok ? 1 : 0) } : acc),
        { earned: 0, max: 0, ok: 0 }
      ),
    [results]
  );

  const percent = score.max ? Math.round((score.earned / score.max) * 100) : 0;
  const testPoints = Math.round(score.earned);
  const scale200 = to200Scale(testPoints);
  const passed = isNmtPassed(testPoints);

  useEffect(() => {
    if (!finished || savedRef.current || !user) return;

    savedRef.current = true;

    const save = async () => {
      try {
        await addDoc(collection(db, 'nmt_results'), {
          userId: user.uid,
          email: user.email,
          testId: test.id,
          testTitle: test.title,
          subject: test.subject || 'math',
          earned: testPoints,
          max: score.max,
          percent,
          scale200,
          passed,
          answers,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        console.error('Error saving NMT result to Firestore:', err);
      }
    };

    save();
  }, [finished, user, test, score, answers, percent, testPoints, scale200, passed]);

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFinish = () => {
    const unfinished = questions.length - answeredCount;
    if (unfinished > 0) {
      const ok = window.confirm(`Ви відповіли не на всі питання (залишилось ${unfinished}). Завершити тест?`);
      if (!ok) return;
    }
    setFinished(true);
  };

  const handleSingleSelect = (variantId) => {
    setAnswer(currentQuestion.id, variantId);
    if (current < questions.length - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 250);
    }
  };

  const handleConnectChange = (leftId, rightId) => {
    const currentAns = answers[currentQuestion.id] || {};
    const isCurrentlySelected = String(currentAns[leftId]) === String(rightId);
    const nextObj = { ...currentAns };
    if (isCurrentlySelected) {
      delete nextObj[leftId];
    } else {
      nextObj[leftId] = rightId;
    }
    setAnswer(currentQuestion.id, nextObj);
  };

  const handleShortChange = (value) => {
    setAnswer(currentQuestion.id, value);
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrent(0);
    setFinished(false);
    setTimeLeft(test.timeSeconds || 0);
  };

  const renderCorrectAnswer = (question) => {
    if (question.correct == null) return null;

    if (question.type === 'single') {
      const idx = question.variants.findIndex((v) => String(v.id) === String(question.correct));
      const variant = question.variants[idx];
      return (
        <div className="flex items-start space-x-2">
          <span className="font-bold" style={{ color: t.correct }}>{LETTERS[idx] || ''}</span>
          <MathContent html={variant?.content} className="text-sm sm:text-base" />
        </div>
      );
    }

    if (question.type === 'connect') {
      return (
        <div className="space-y-2">
          {question.variants.map((left, i) => {
            const right = question.variantsRight.find((v) => String(v.id) === String(question.correct[i]));
            return (
              <div key={left.id} className="flex items-center space-x-2 text-sm">
                <MathContent html={left.content} style={{ color: t.muted }} />
                <span style={{ color: t.muted }}>→</span>
                <MathContent html={right?.content} />
              </div>
            );
          })}
        </div>
      );
    }

    return <p>{question.correct.join(' або ')}</p>;
  };

  const renderSingleVariants = (question) => (
    <div className="mt-6 sm:mt-8 space-y-1">
      {question.variants?.map((variant, idx) => {
        const selected = answers[question.id] === variant.id;
        return (
          <button
            key={variant.id}
            onClick={() => handleSingleSelect(variant.id)}
            className="w-full flex items-start gap-5 sm:gap-7 rounded-lg px-2 py-1.5 text-left transition-colors"
            style={{ backgroundColor: selected ? t.surfaceSoft : 'transparent' }}
          >
            <span
              className="w-8 h-8 shrink-0 rounded-md flex items-center justify-center text-[13px] font-medium"
              style={{
                backgroundColor: selected ? t.activeBg : t.surface,
                color: selected ? t.activeText : t.text
              }}
            >
              {LETTERS[idx] || idx + 1}
            </span>
            <span className="flex-1 min-w-0 pt-0.5">
              <MathContent html={variant.content} className="text-[15px]" />
              {variant.image && (
                <img
                  src={variant.image}
                  alt=""
                  className="mt-2 rounded-md max-h-40 object-contain bg-white"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderConnectVariants = (question) => (
    <div className="mt-8">
      {/* 2 колонки: 1-3 ліворуч, А-Д праворуч */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-4">
        {/* Ліва колонка (1, 2, 3) */}
        <div className="space-y-4">
          {question.variants?.map((left, idx) => (
            <div key={left.id} className="flex items-start gap-4 sm:gap-5">
              <span
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-medium select-none"
                style={{ backgroundColor: t.surface, color: t.text }}
              >
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <MathContent html={left.content} className="text-[15px] leading-normal" />
                {left.image && (
                  <img
                    src={left.image}
                    alt=""
                    className="mt-2 rounded-md max-h-36 object-contain bg-white"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Права колонка (А, Б, В, Г, Д) */}
        <div className="space-y-4">
          {question.variantsRight?.map((right, idx) => (
            <div key={right.id} className="flex items-start gap-4 sm:gap-5">
              <span
                className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-[13px] font-medium select-none"
                style={{ backgroundColor: t.surface, color: t.text }}
              >
                {LETTERS[idx] || idx + 1}
              </span>
              <div className="flex-1 min-w-0 pt-0.5">
                <MathContent html={right.content} className="text-[15px] leading-normal" />
                {right.image && (
                  <img
                    src={right.image}
                    alt=""
                    className="mt-2 rounded-md max-h-36 object-contain bg-white"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Матриця відповідей (бланк) */}
      <div className="mt-8 sm:mt-12 inline-block">
        {/* Заголовки літер А Б В Г Д */}
        <div className="flex items-center gap-2 sm:gap-2.5 mb-2 pl-8 sm:pl-9">
          {question.variantsRight?.map((_, ri) => (
            <div
              key={ri}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-medium select-none"
              style={{ color: t.text }}
            >
              {LETTERS[ri] || ri + 1}
            </div>
          ))}
        </div>

        {/* Рядки 1, 2, 3 з квадратиками */}
        <div className="space-y-2 sm:space-y-2.5">
          {question.variants?.map((left, idx) => (
            <div key={left.id} className="flex items-center gap-2 sm:gap-2.5">
              <span
                className="w-6 sm:w-7 text-center text-sm font-medium select-none"
                style={{ color: t.text }}
              >
                {idx + 1}
              </span>

              {question.variantsRight?.map((right) => {
                const selected = String((answers[question.id] || {})[left.id]) === String(right.id);
                return (
                  <button
                    key={right.id}
                    type="button"
                    onClick={() => handleConnectChange(left.id, right.id)}
                    className="compact-btn w-7 h-7 sm:w-8 sm:h-8 rounded-lg border transition-all flex items-center justify-center hover:opacity-90"
                    style={{
                      borderColor: selected ? t.text : 'rgba(150, 150, 150, 0.35)',
                      backgroundColor: selected ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent',
                      color: t.text
                    }}
                  >
                    {selected && (
                      <span className="font-semibold text-sm leading-none select-none">✕</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderShortInput = (question) => (
    <div className="mt-6 sm:mt-8">
      <input
        type="text"
        value={answers[question.id] || ''}
        onChange={(e) => handleShortChange(e.target.value)}
        placeholder="Ваша відповідь"
        className="w-full sm:max-w-xs rounded-lg px-4 py-2.5 text-[15px] focus:outline-none"
        style={{ backgroundColor: t.surface, color: t.text }}
      />
    </div>
  );

  const renderQuestion = (question) => {
    const hasImage = Boolean(question.image);

    if (question.type === 'connect') {
      return (
        <div>
          {hasImage ? (
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 lg:gap-14 items-start">
              <div className="min-w-0">
                <MathContent html={question.content} className="text-[15px] sm:text-base leading-relaxed" />
              </div>
              <div className="shrink-0 flex justify-center md:justify-end">
                <img
                  src={question.image}
                  alt=""
                  className="rounded-xl max-h-60 sm:max-h-72 md:max-h-80 object-contain bg-white p-1.5 shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          ) : (
            <MathContent html={question.content} className="text-[15px] sm:text-base leading-relaxed" />
          )}

          {renderConnectVariants(question)}
        </div>
      );
    }

    return (
      <div>
        {hasImage ? (
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 lg:gap-14 items-start">
            <div className="min-w-0">
              <MathContent html={question.content} className="text-[15px] sm:text-base leading-relaxed" />
              {question.type === 'single' && renderSingleVariants(question)}
              {question.type === 'short' && renderShortInput(question)}
            </div>

            <div className="shrink-0 flex justify-center md:justify-end">
              <img
                src={question.image}
                alt=""
                className="rounded-xl max-h-60 sm:max-h-72 md:max-h-80 lg:max-h-96 max-w-xs sm:max-w-sm md:max-w-md object-contain bg-white p-1.5 shadow-sm"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        ) : (
          <div className="max-w-3xl">
            <MathContent html={question.content} className="text-[15px] sm:text-base leading-relaxed" />
            {question.type === 'single' && renderSingleVariants(question)}
            {question.type === 'short' && renderShortInput(question)}
          </div>
        )}
      </div>
    );
  };

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: t.bg, color: t.text }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between mb-10">
            <button
              onClick={() => onNavigate('nmt')}
              className="compact-btn w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: t.surface }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="compact-btn w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ color: t.muted }}
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          <h2 className="text-2xl font-semibold mb-3">Тест завершено</h2>
          {graded ? (
            <>
              <p className="text-4xl font-semibold mb-2">
                {score.earned}
                <span className="text-2xl" style={{ color: t.muted }}> / {score.max}</span>
              </p>
              <p className="text-sm" style={{ color: t.muted }}>
                {percent}% тестових балів · повністю правильних {score.ok} з {questions.length} · відповіді дано на {answeredCount}
              </p>
              <p
                className="text-2xl font-semibold mt-3"
                style={{ color: passed ? t.correct : t.wrong }}
              >
                {passed ? `${scale200}` : 'Не склав'}
                {passed ? (
                  <span className="text-base font-normal" style={{ color: t.muted }}> / 200</span>
                ) : null}
              </p>
            </>
          ) : (
            <p className="text-sm" style={{ color: t.muted }}>
              {answeredCount} з {questions.length} питань мають відповідь. У тесті немає ключа правильних відповідей, тому автоматичне оцінювання неможливе.
            </p>
          )}

          <div className="mt-10 space-y-3">
            {questions.map((q, idx) => {
              const result = results[idx];
              return (
              <div
                key={q.id}
                className="rounded-xl p-4 sm:p-5"
                style={{ backgroundColor: t.surfaceSoft }}
              >
                <div className="flex items-center justify-between mb-3 gap-3">
                  <span className="text-sm" style={{ color: t.muted }}>Питання {idx + 1}</span>
                  {result ? (
                    <span
                      className="text-sm"
                      style={{ color: result.ok ? t.correct : result.earned > 0 ? t.muted : t.wrong }}
                    >
                      {result.earned} / {result.max} б.
                    </span>
                  ) : (
                    <span className="text-xs uppercase" style={{ color: t.muted }}>{q.type}</span>
                  )}
                </div>
                <MathContent html={q.content} className="mb-4 text-[15px]" />
                {q.image && (
                  <img src={q.image} alt="" className="rounded-lg max-h-64 object-contain bg-white mb-4" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: t.bg }}>
                  <p className="text-xs mb-1" style={{ color: t.muted }}>Ваша відповідь</p>
                  {q.type === 'single' && (
                    <div className="text-[15px]">
                      {q.variants?.find((v) => v.id === answers[q.id])?.content
                        ? <MathContent html={q.variants.find((v) => v.id === answers[q.id]).content} />
                        : <span style={{ color: t.muted }}>не обрано</span>}
                    </div>
                  )}
                  {q.type === 'connect' && (
                    <div className="space-y-2">
                      {q.variants?.map((left, leftIdx) => {
                        const rightId = (answers[q.id] || {})[left.id];
                        const right = q.variantsRight?.find((v) => String(v.id) === String(rightId));
                        const rowOk = q.correct && String(q.correct[leftIdx]) === String(rightId);
                        return (
                          <div key={left.id} className="flex items-center space-x-2 text-sm">
                            <MathContent html={left.content} style={{ color: t.muted }} />
                            <span style={{ color: t.muted }}>→</span>
                            {right ? <MathContent html={right.content} style={{ color: rowOk ? t.correct : t.text }} /> : <span style={{ color: t.muted }}>не обрано</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.type === 'short' && (
                    <p className="text-[15px]">{answers[q.id] || <span style={{ color: t.muted }}>не вказано</span>}</p>
                  )}
                </div>
                {result && !result.ok && (
                  <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: t.bg }}>
                    <p className="text-xs mb-1" style={{ color: t.correct }}>Правильна відповідь</p>
                    {renderCorrectAnswer(q)}
                  </div>
                )}
                {q.explanation && (
                  <details>
                    <summary className="cursor-pointer text-sm" style={{ color: t.muted }}>Пояснення</summary>
                    <div className="mt-3 text-sm">
                      <MathContent html={q.explanation} />
                    </div>
                  </details>
                )}
              </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleRestart}
              className="flex-1 px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: t.surface, color: t.text }}
            >
              Пройти ще раз
            </button>
            <button
              onClick={() => onNavigate('nmt')}
              className="flex-1 px-6 py-3 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: t.activeBg, color: t.activeText }}
            >
              Назад до списку тестів
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLast = current === questions.length - 1;
  const currentAnswered = isQuestionAnswered(currentQuestion, answers[currentQuestion?.id]);
  const progress = questions.length ? ((current + 1) / questions.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: t.bg, color: t.text }}>
      <header className="flex items-center gap-2 px-3 pt-3">
        <button
          onClick={() => onNavigate('nmt')}
          title="Вийти з тесту"
          className="compact-btn w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ backgroundColor: t.surface }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div ref={stripRef} className="no-scrollbar flex-1 flex items-center gap-1.5 overflow-x-auto">
          {questions.map((q, idx) => {
            const has = isQuestionAnswered(q, answers[q.id]);
            const active = idx === current;
            return (
              <button
                key={q.id}
                onClick={() => setCurrent(idx)}
                className="compact-btn w-8 h-8 shrink-0 rounded-md text-[13px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? t.activeBg : t.surface,
                  color: active ? t.activeText : has ? t.text : t.muted
                }}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Змінити тему"
          className="compact-btn w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ color: t.muted }}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={() => onOpenDovidnik?.()}
          title="Довідник"
          className="compact-btn w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ color: t.muted }}
        >
          <BookOpen className="h-4 w-4" />
        </button>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            title="Меню"
            className="compact-btn w-9 h-9 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
            style={{ color: t.muted }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-56 rounded-xl p-1.5 text-sm z-10 shadow-xl"
              style={{ backgroundColor: t.surface, color: t.text }}
            >
              {test.timeSeconds > 0 && (
                <div className="px-3 py-2 flex items-center justify-between" style={{ color: t.muted }}>
                  <span>Залишилось часу</span>
                  <span className="font-mono">{formatTime(timeLeft)}</span>
                </div>
              )}
              <div className="px-3 py-2 flex items-center justify-between" style={{ color: t.muted }}>
                <span>Відповіді</span>
                <span>{answeredCount} / {questions.length}</span>
              </div>
              <button
                onClick={() => { setMenuOpen(false); handleFinish(); }}
                className="w-full text-left px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
              >
                Завершити тест
              </button>
              <button
                onClick={() => { setMenuOpen(false); handleRestart(); }}
                className="w-full text-left px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
              >
                Почати спочатку
              </button>
              <button
                onClick={() => { setMenuOpen(false); onNavigate('nmt'); }}
                className="w-full text-left px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
              >
                Вийти з тесту
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="px-3 pt-2">
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: t.surface }}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: t.muted }}
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentQuestion ? (
            renderQuestion(currentQuestion)
          ) : (
            <p style={{ color: t.muted }}>У цьому тесті немає завдань.</p>
          )}
        </div>
      </main>

      <footer className="px-4 sm:px-6 lg:px-8 pb-6 pt-2">
        <div className="max-w-5xl lg:max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => (isLast ? handleFinish() : setCurrent((c) => c + 1))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
            style={{ backgroundColor: t.surface, color: t.text }}
          >
            <span>{isLast ? 'Завершити' : currentAnswered ? 'Далі' : 'Пропустити'}</span>
            {isLast ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
