import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, Clock, Flag, CheckCircle, AlertCircle } from 'lucide-react';
import MathContent from './MathContent';

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function NMTTestRunner({ test, onNavigate }) {
  const questions = test.questions || [];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test.timeSeconds || 0);
  const [startedAt] = useState(Date.now());

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
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

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
    const current = answers[currentQuestion.id] || {};
    setAnswer(currentQuestion.id, { ...current, [leftId]: rightId });
  };

  const handleShortChange = (value) => {
    setAnswer(currentQuestion.id, value);
  };

  const renderQuestion = (question) => (
    <div className="space-y-6">
      <div className="bg-slate-900/30 rounded-2xl p-4 sm:p-6 border border-slate-700">
        <MathContent html={question.content} className="text-white text-base sm:text-lg leading-relaxed" />
        {question.image && (
          <img
            src={question.image}
            alt=""
            className="mt-4 rounded-xl border border-slate-700 max-h-96 object-contain bg-white"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>

      {question.type === 'single' && (
        <div className="space-y-3">
          {question.variants?.map((variant, idx) => {
            const selected = answers[question.id] === variant.id;
            const letter = String.fromCharCode(1040 + idx); // А, Б, В, Г, Д
            return (
              <button
                key={variant.id}
                onClick={() => handleSingleSelect(variant.id)}
                className={`w-full flex items-start space-x-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                  selected
                    ? 'bg-violet-500/20 border-violet-500'
                    : 'bg-slate-800/50 border-slate-700 hover:border-violet-500/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                  selected ? 'bg-violet-500 text-white' : 'bg-slate-700 text-slate-300'
                }`}>
                  {letter}
                </div>
                <div className="flex-1 pt-1.5">
                  <MathContent html={variant.content} className="text-white text-sm sm:text-base" />
                  {variant.image && (
                    <img
                      src={variant.image}
                      alt=""
                      className="mt-2 rounded-lg border border-slate-700 max-h-48 object-contain bg-white"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'connect' && (
        <div className="space-y-4">
          {question.variants?.map((left) => (
            <div
              key={left.id}
              className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <div className="flex-1">
                <MathContent html={left.content} className="text-white text-sm sm:text-base" />
              </div>
              <select
                value={(answers[question.id] || {})[left.id] ?? ''}
                onChange={(e) => handleConnectChange(left.id, e.target.value)}
                className="w-full sm:w-auto bg-slate-900 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-violet-500"
              >
                <option value="">— оберіть —</option>
                {question.variantsRight?.map((right) => (
                  <option key={right.id} value={right.id}>
                    {String.fromCharCode(1040 + right.id)}. {right.content?.replace(/<[^>]*>/g, '')}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {question.type === 'short' && (
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleShortChange(e.target.value)}
            placeholder="Ваша відповідь"
            className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      )}
    </div>
  );

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-violet-800/50 to-fuchsia-900/50 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-6 sm:p-10 text-center mb-8 shadow-2xl shadow-violet-500/10 animate-fade-in">
            <CheckCircle className="h-16 w-16 text-violet-400 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Тест завершено</h2>
            <p className="text-slate-300 mb-6">
              {answeredCount} з {questions.length} питань мають відповідь
            </p>
            {!test.questions?.[0]?.correct && (
              <div className="inline-flex items-center space-x-2 text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>У JSON відсутні правильні відповіді, тому автоматичне оцінювання неможливе</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-slate-800/50 rounded-3xl border border-slate-700 p-4 sm:p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-violet-400 font-bold">Питання {idx + 1}</span>
                  <span className="text-slate-400 text-sm uppercase">{q.type}</span>
                </div>
                <MathContent html={q.content} className="text-white mb-4 text-sm sm:text-base" />
                {q.image && (
                  <img src={q.image} alt="" className="rounded-xl border border-slate-700 max-h-64 object-contain bg-white mb-4" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-4">
                  <p className="text-slate-400 text-sm mb-1">Ваша відповідь</p>
                  {q.type === 'single' && (
                    <p className="text-white">
                      {q.variants?.find((v) => v.id === answers[q.id])?.content
                        ? <MathContent html={q.variants.find((v) => v.id === answers[q.id]).content} />
                        : <span className="text-slate-500">не обрано</span>}
                    </p>
                  )}
                  {q.type === 'connect' && (
                    <div className="space-y-2">
                      {q.variants?.map((left) => {
                        const rightId = (answers[q.id] || {})[left.id];
                        const right = q.variantsRight?.find((v) => String(v.id) === String(rightId));
                        return (
                          <div key={left.id} className="flex items-center space-x-2 text-sm">
                            <MathContent html={left.content} className="text-slate-300" />
                            <span className="text-slate-500">→</span>
                            {right ? <MathContent html={right.content} className="text-white" /> : <span className="text-slate-500">не обрано</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {q.type === 'short' && (
                    <p className="text-white">{answers[q.id] || <span className="text-slate-500">не вказано</span>}</p>
                  )}
                </div>
                {q.explanation && (
                  <details className="group">
                    <summary className="text-violet-400 cursor-pointer text-sm font-medium">Пояснення</summary>
                    <div className="mt-3 text-slate-300 text-sm">
                      <MathContent html={q.explanation} />
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('nmt')}
            className="w-full mt-8 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white font-semibold px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Назад до списку тестів
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => onNavigate('nmt')}
            className="flex items-center space-x-2 text-slate-400 hover:text-violet-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm">Назад</span>
          </button>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
            timeLeft < 300 ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-800/50 border-slate-700 text-slate-300'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 mb-6">
          <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
            <span>Питання {current + 1} з {questions.length}</span>
            <span>{answeredCount} відповідей</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-4 sm:p-8 mb-6 shadow-2xl">
          {renderQuestion(currentQuestion)}
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-800 text-white px-5 py-3 rounded-2xl border border-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Назад</span>
          </button>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center space-x-2 bg-violet-500 hover:bg-violet-600 text-white px-6 py-3 rounded-2xl transition-all shadow-lg"
            >
              <span>Далі</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white px-6 py-3 rounded-2xl transition-all shadow-lg"
            >
              <Flag className="h-5 w-5" />
              <span>Завершити</span>
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {questions.map((q, idx) => {
            const has = answers[q.id] !== undefined;
            const active = idx === current;
            return (
              <button
                key={q.id}
                onClick={() => setCurrent(idx)}
                className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? 'bg-violet-500 text-white'
                    : has
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
