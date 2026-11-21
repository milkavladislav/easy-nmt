import { useMemo, useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import MathContent from '../MathContent';
import { LETTERS, normalizeQuestion, gradeQuestion } from '../../utils/nmtTest';

// Інтерактивне завдання уроку: вибір / відповідність, перевірка одразу і розв'язання.
// example=true — розібраний приклад: розв'язання можна відкрити й без відповіді.
export default function QuestionCard({ question, answer, number, example = false, initialResult, onResult }) {
  const q = useMemo(() => normalizeQuestion(question, 0, answer), [question, answer]);
  const [value, setValue] = useState(q.type === 'connect' ? {} : null);
  const [result, setResult] = useState(null);
  const [showSolution, setShowSolution] = useState(false);

  const complete = q.type === 'connect' ? Object.keys(value || {}).length === q.variants.length : value != null;
  const checked = result != null;

  const check = () => {
    const r = gradeQuestion(q, value);
    setResult(r);
    setShowSolution(true);
    onResult?.(r.ok);
  };
  const reset = () => {
    setValue(q.type === 'connect' ? {} : null);
    setResult(null);
    setShowSolution(false);
  };

  const correctIdx = q.type === 'single' ? q.variants.findIndex((v) => String(v.id) === String(q.correct)) : -1;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-orange-500/30 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${example ? 'bg-amber-400 text-amber-950' : 'bg-orange-500 text-white'}`}>
          {example ? 'Розібраний приклад' : `Задача ${number}`}
        </span>
        {question.src && <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-orange-200 border border-white/15">{question.src}</span>}
        {initialResult != null && !checked && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${initialResult ? 'text-green-400' : 'text-slate-400'}`}>
            {initialResult ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {initialResult ? 'Розв’язано' : 'Була помилка'}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{question.title}</h3>
      <MathContent html={q.content} className="text-white/95 text-[15px] sm:text-base leading-relaxed mb-4" />

      {q.type === 'single' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {q.variants.map((v, i) => {
            const picked = String(value) === String(v.id);
            const isCorrect = checked && i === correctIdx;
            const isWrong = checked && picked && i !== correctIdx;
            return (
              <button
                key={v.id}
                type="button"
                disabled={checked}
                onClick={() => setValue(v.id)}
                className={`rounded-2xl px-3 py-3 flex flex-col items-center gap-1 border transition-all text-white ${
                  isCorrect ? 'bg-green-500/25 border-green-400'
                    : isWrong ? 'bg-red-500/25 border-red-400'
                      : picked ? 'bg-orange-500/30 border-orange-400'
                        : 'bg-white/5 border-white/15 hover:border-orange-400/60'
                }`}
              >
                <span className="text-xs font-bold text-orange-300">{LETTERS[i]}</span>
                <MathContent html={v.content} className="text-base font-semibold text-center" />
              </button>
            );
          })}
        </div>
      )}

      {q.type === 'connect' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              {question.lh && <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{question.lh}</p>}
              {q.variants.map((v, i) => (
                <div key={v.id} className="flex items-start gap-2 text-white">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-orange-500 text-white text-sm font-bold flex items-center justify-center">{i + 1}</span>
                  <MathContent html={v.content} className="pt-0.5" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {question.rh && <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{question.rh}</p>}
              {q.variantsRight.map((v, i) => (
                <div key={v.id} className="flex items-start gap-2 text-white">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-white/15 text-orange-200 text-sm font-bold flex items-center justify-center">{LETTERS[i]}</span>
                  <MathContent html={v.content} className="pt-0.5" />
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-white text-sm">
              <thead>
                <tr>
                  <th />
                  {q.variantsRight.map((v, i) => <th key={v.id} className="px-2 pb-1 text-orange-300 font-bold">{LETTERS[i]}</th>)}
                </tr>
              </thead>
              <tbody>
                {q.variants.map((left, li) => (
                  <tr key={left.id}>
                    <td className="pr-3 font-bold">{li + 1}</td>
                    {q.variantsRight.map((right) => {
                      const picked = String(value?.[left.id]) === String(right.id);
                      const isCorrect = checked && String(q.correct?.[li]) === String(right.id);
                      const isWrong = checked && picked && !isCorrect;
                      return (
                        <td key={right.id} className="px-1 py-1">
                          <button
                            type="button"
                            disabled={checked}
                            aria-label={`${li + 1}${LETTERS[right.id] || ''}`}
                            onClick={() => setValue((prev) => ({ ...prev, [left.id]: right.id }))}
                            className={`w-9 h-9 rounded-lg border transition-all ${
                              isCorrect ? 'bg-green-500/40 border-green-400'
                                : isWrong ? 'bg-red-500/40 border-red-400'
                                  : picked ? 'bg-orange-500 border-orange-400'
                                    : 'bg-white/5 border-white/20 hover:border-orange-400/60'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-5">
        {!checked && (
          <button
            type="button"
            disabled={!complete}
            onClick={check}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Перевірити
          </button>
        )}
        {checked && (
          <>
            <span className={`flex items-center gap-1.5 text-sm font-semibold ${result.ok ? 'text-green-400' : 'text-red-400'}`}>
              {result.ok ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              {result.ok ? 'Правильно!' : q.type === 'connect' ? `Правильних пар: ${result.hits} з ${result.rows}` : 'Неправильно'}
            </span>
            <button type="button" onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white bg-white/10 hover:bg-white/20">
              <RotateCcw className="h-4 w-4" />Ще раз
            </button>
          </>
        )}
        {!showSolution && example && (
          <button type="button" onClick={() => setShowSolution(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20">
            <Lightbulb className="h-4 w-4" />Показати розв’язання
          </button>
        )}
      </div>

      {showSolution && question.solution && (
        <div className="mt-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-300 mb-1 flex items-center gap-1.5"><Lightbulb className="h-4 w-4" />Розв’язання</p>
          <MathContent html={question.solution} className="text-[15px] leading-relaxed" />
          {q.type === 'single' && correctIdx >= 0 && <p className="mt-2 text-sm font-semibold text-green-400">Відповідь: {LETTERS[correctIdx]}</p>}
          {q.type === 'connect' && q.correct && (
            <p className="mt-2 text-sm font-semibold text-green-400">Відповідь: {q.correct.map((c, i) => `${i + 1}${LETTERS[c]}`).join(' ')}</p>
          )}
        </div>
      )}
    </div>
  );
}
