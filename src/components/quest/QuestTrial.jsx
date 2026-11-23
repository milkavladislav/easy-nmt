import { WORDS } from '../../quest/story01';
import { useMemo, useRef, useState } from 'react';
import MathContent from '../MathContent';
import { LETTERS, normalizeQuestion, gradeQuestion } from '../../utils/nmtTest';
import { splitContentSource } from '../../utils/course150';
import SourceHint from '../course150/SourceHint';

// Випробування квесту: та сама перевірка, що й у звичайному уроці (normalizeQuestion / gradeQuestion),
// але у вигляді руни. example=true — наставник показує: розв’язання можна відкрити без відповіді.
// once=true — домашнє завдання: рахується перша спроба, без «Ще раз».
export default function QuestTrial({ question, answer, label, example = false, once = false, initial, onResult, words }) {
  const w = { ...WORDS, ...words };
  const q = useMemo(() => normalizeQuestion(question, 0, answer), [question, answer]);
  const body = useMemo(() => splitContentSource(q.content), [q.content]);
  const src = question.src || body.src;
  const empty = q.type === 'connect' ? {} : q.type === 'short' ? '' : null;
  const [value, setValue] = useState(empty);
  const [result, setResult] = useState(initial != null ? { ok: initial, restored: true } : null);
  const [showSolution, setShowSolution] = useState(initial != null);
  const [fx, setFx] = useState('');
  const castRef = useRef(null);
  const checked = result != null;
  const complete = q.type === 'connect' ? Object.keys(value || {}).length === q.variants.length
    : q.type === 'short' ? String(value).trim() !== '' : value != null;
  const correctIdx = q.type === 'single' ? q.variants.findIndex((v) => String(v.id) === String(q.correct)) : -1;

  const cast = () => {
    const r = gradeQuestion(q, value);
    setResult(r);
    setShowSolution(true);
    setFx(r.ok ? 'q-glow-good' : 'q-shake');
    setTimeout(() => setFx(''), 1200);
    onResult?.(r.ok, castRef.current?.getBoundingClientRect(), r, value);
  };
  const again = () => { setValue(empty); setResult(null); setShowSolution(false); };

  const stoneCls = (picked, good, bad) => `q-stone${good ? ' good' : bad ? ' bad' : picked ? ' picked' : ''}`;

  return (
    <div className={`q-trial p-5 sm:p-7 ${fx}`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="q-script text-2xl text-[var(--q-gold)]">{label}</span>
      </div>
      {question.title && <h3 className="text-2xl font-bold text-white mb-2">{question.title}</h3>}
      <div className="flex items-start gap-1 mb-5">
        <MathContent html={body.html} className="min-w-0 text-lg leading-relaxed text-[#f4ecdf]" />
        <SourceHint src={src} className="mt-1 shrink-0" style={{ borderColor: 'rgba(245,200,107,.6)', color: 'var(--q-gold-soft)' }}
          tipStyle={{ backgroundColor: '#26205a', color: '#f4ecdf', border: '1px solid rgba(245,200,107,.4)' }} />
      </div>

      {q.type === 'single' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {q.variants.map((v, i) => (
            <button key={v.id} type="button" disabled={checked} onClick={() => setValue(v.id)}
              className={`${stoneCls(String(value) === String(v.id), checked && i === correctIdx, checked && String(value) === String(v.id) && i !== correctIdx)} px-3 py-3 flex flex-col items-center gap-1 text-white`}>
              <span className="q-script text-xl text-[var(--q-gold)]">{LETTERS[i]}</span>
              <MathContent html={v.content} className="text-lg font-semibold text-center" />
            </button>
          ))}
        </div>
      )}

      {q.type === 'connect' && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              {q.variants.map((v, i) => (
                <div key={v.id} className="flex items-start gap-2"><span className="q-script text-xl text-[var(--q-gold)] w-6">{i + 1}</span><MathContent html={v.content} className="pt-0.5 text-lg" /></div>
              ))}
            </div>
            <div className="space-y-2">
              {q.variantsRight.map((v, i) => (
                <div key={v.id} className="flex items-start gap-2"><span className="q-script text-xl text-[var(--q-gold)] w-6">{LETTERS[i]}</span><MathContent html={v.content} className="pt-0.5 text-lg" /></div>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="text-white">
              <thead><tr><th />{q.variantsRight.map((v, i) => <th key={v.id} className="q-script text-lg text-[var(--q-gold)] px-1">{LETTERS[i]}</th>)}</tr></thead>
              <tbody>
                {q.variants.map((left, li) => (
                  <tr key={left.id}>
                    <td className="q-script text-lg pr-3 text-[var(--q-gold)]">{li + 1}</td>
                    {q.variantsRight.map((right) => {
                      const picked = String(value?.[left.id]) === String(right.id);
                      const good = checked && String(q.correct?.[li]) === String(right.id);
                      return (
                        <td key={right.id} className="p-1">
                          <button type="button" disabled={checked} aria-label={`${li + 1}${LETTERS[right.id] || ''}`}
                            onClick={() => setValue((p) => ({ ...p, [left.id]: right.id }))}
                            className={`compact-btn ${stoneCls(picked, good, checked && picked && !good)} w-10 h-10`} />
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

      {q.type === 'short' && (
        <div className="flex items-center gap-3">
          <span className="q-script text-xl text-[var(--q-gold)]">Відповідь:</span>
          <input className="q-input" inputMode="decimal" placeholder="число" value={value ?? ''} disabled={checked}
            onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && complete && !checked) cast(); }} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mt-6">
        {!checked && (
          <button ref={castRef} type="button" className="q-cast" disabled={!complete} onClick={cast}>{w.cast}</button>
        )}
        {checked && !result.restored && (
          <span className={`q-script text-2xl ${result.ok ? 'text-[#7ef0b4]' : 'text-[#ff9a9a]'}`}>
            {result.ok ? w.ok : q.type === 'connect' ? `Влучних пар: ${result.hits} з ${result.rows}` : w.bad}
          </span>
        )}
        {checked && result.restored && (
          <span className={`q-script text-2xl ${result.ok ? 'text-[#7ef0b4]' : 'text-[#ff9a9a]'}`}>{once ? (result.ok ? w.starOk : w.starBad) : result.ok ? w.okDone : w.badDone}</span>
        )}
        {checked && !once && <button type="button" className="q-ghost text-sm" onClick={again}>Ще раз</button>}
        {!showSolution && example && <button type="button" className="q-ghost text-sm" onClick={() => setShowSolution(true)}>{w.explain}</button>}
      </div>

      {showSolution && question.solution && (
        <div className="q-scroll mt-6 px-5 py-5">
          <p className="q-script text-xl mb-1">Пояснення</p>
          <MathContent html={question.solution} className="text-[17px] leading-relaxed" />
          {q.type === 'single' && correctIdx >= 0 && <p className="mt-2 font-bold">Відповідь: {LETTERS[correctIdx]}</p>}
          {q.type === 'connect' && q.correct && <p className="mt-2 font-bold">Відповідь: {q.correct.map((c, i) => `${i + 1}${LETTERS[c]}`).join(' ')}</p>}
          {q.type === 'short' && q.correct && <p className="mt-2 font-bold">Відповідь: {q.correct[0]}</p>}
        </div>
      )}
    </div>
  );
}
