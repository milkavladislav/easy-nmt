import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Loader2, Map as MapIcon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MathContent from '../components/MathContent';
import QuestScene from '../components/quest/QuestScene';
import MagicCanvas from '../components/quest/MagicCanvas';
import QuestTrial from '../components/quest/QuestTrial';
import { CAST, getStory } from '../quest';
import { splitSource, loadTopicTest, saveCourseResult } from '../utils/course150';
import { normalizeQuestion } from '../utils/nmtTest';
import '../components/quest/quest.css';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const keyFor = (uid, n) => `course150:quest:${uid || 'anon'}:${n}`;
function readSave(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

// Карта квесту: усі частини, крім окремих рун і зірок (до них — через кружечки в шапці)
function mapLabel(s, k, STORY) {
  if (s.kind === 'title') return { tag: 'Початок', text: 'Титр' };
  if (s.kind === 'dialog' && s.hwIntro) return { tag: STORY.homework.name, text: 'Домашнє завдання' };
  if (s.kind === 'dialog' && s.phase === 'runes') return { tag: 'Брама', text: 'Руни · завдання заняття' };
  if (s.kind === 'dialog') return { tag: 'Пролог', text: 'Згасла Брама' };
  if (s.kind === 'scroll') return { tag: 'Сувій', html: s.section.title };
  if (s.kind === 'example') return { tag: `Приклад ${k}`, html: s.section.question.title || '' };
  if (s.kind === 'finale') return { tag: 'Фінал', text: STORY.artifact.name };
  if (s.kind === 'hwDone') return { tag: 'Світанок', text: 'Результат домашнього завдання' };
  return null;
}

function QuestMap({ steps, step, story, onGo, onClose }) {
  let ex = 0;
  const items = steps.map((s, i) => {
    const l = mapLabel(s, s.kind === 'example' ? ++ex : 0, story);
    return l && { ...l, i };
  }).filter(Boolean);
  return (
    <div className="fixed inset-0 z-50 bg-[rgba(4,5,16,.78)] flex items-start justify-center p-4 pt-16 overflow-y-auto" onClick={onClose}>
      <div className="q-dialog w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <p className="q-script text-3xl text-[var(--q-gold)]">Карта квесту</p>
          <button type="button" onClick={onClose} aria-label="Закрити" className="text-[var(--q-gold-soft)] hover:text-white"><X className="h-6 w-6" /></button>
        </div>
        <div className="space-y-1">
          {items.map((it) => (
            <button key={it.i} type="button" onClick={() => onGo(it.i)}
              className={`w-full text-left flex items-baseline gap-3 px-3 py-2 rounded-xl transition-colors ${it.i === step ? 'bg-[rgba(139,108,255,.25)]' : 'hover:bg-white/5'}`}>
              <span className="q-script text-lg text-[var(--q-gold)] shrink-0 w-28">{it.tag}</span>
              {it.html ? <MathContent html={it.html} className="text-[17px] text-[#f4ecdf] min-w-0" /> : <span className="text-[17px] text-[#f4ecdf]">{it.text}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Друкарська машинка для реплік; клік — показати одразу весь текст.
function useTypewriter(text, speed = 22) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), speed);
    return () => clearInterval(id);
  }, [text, speed]);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const shown = reduce ? text.length : n;
  return [text.slice(0, shown), shown >= text.length, () => setN(text.length)];
}

function Line({ line, onNext, nextLabel = 'Далі' }) {
  const who = CAST[line.who] || CAST.narrator;
  const [shown, done, finish] = useTypewriter(line.text);
  const narrator = line.who === 'narrator';
  return (
    <div className="q-dialog p-5 sm:p-6 cursor-pointer select-none" onClick={() => (done ? onNext?.() : finish())}>
      <div className={`flex items-start gap-4 ${who.side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        {!narrator && <div className={`q-avatar ${who.hue}`}>{who.short}</div>}
        <div className="flex-1 min-w-0">
          {!narrator && <p className="q-script text-xl text-[var(--q-gold)] mb-1">{who.name}</p>}
          <p className={`text-xl sm:text-2xl leading-snug ${narrator ? 'italic text-center text-[#e9e1ff]' : 'text-[#f4ecdf]'} ${done ? '' : 'q-caret'}`}>{shown}</p>
        </div>
      </div>
      {onNext && (
        <p className={`mt-3 text-sm text-right text-[var(--q-gold-soft)] transition-opacity ${done ? 'opacity-90' : 'opacity-0'}`}>{nextLabel} ▸</p>
      )}
    </div>
  );
}

function Dialog({ lines, onDone }) {
  const [i, setI] = useState(0);
  const line = lines[i];
  return <Line key={i} line={line} onNext={() => (i + 1 < lines.length ? setI(i + 1) : onDone())} nextLabel={i + 1 < lines.length ? 'Далі' : 'Продовжити'} />;
}

function Scroll({ section }) {
  return (
    <div className="q-scroll px-5 sm:px-8 py-8">
      <p className="text-xs tracking-[.2em] uppercase text-[#7a4a1c] font-bold">{section.tag}</p>
      <MathContent html={section.title} className="q-script text-4xl text-[#3a2210] mb-5" />
      <div className="grid sm:grid-cols-2 gap-3">
        {section.cards.map((c, i) => (
          <div key={i} className="q-rune-card p-4">
            {c.big && <MathContent html={c.big} className="text-2xl font-bold text-[#5a2d0c] mb-1" />}
            {c.title && <MathContent html={c.title} className="font-bold text-lg" />}
            {c.formula && <MathContent html={c.formula} className="text-lg my-1.5" />}
            {c.text && <MathContent html={c.text} className="text-[17px] leading-snug" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Runes({ total, runes, current, label = 'Руни Брами', onPick }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center" aria-label={label}>
      {Array.from({ length: total }, (_, k) => {
        const n = k + 1;
        const v = runes[n] && typeof runes[n] === 'object' ? runes[n].ok : runes[n];
        const st = v === true ? ' lit' : v === false ? ' dim' : '';
        return (
          <button key={n} type="button" onClick={() => onPick?.(n)} title={`Перейти до ${n}`}
            className={`q-rune hover:border-[var(--q-gold)]${st}${current === n ? ' now' : ''}`}>{n}</button>
        );
      })}
    </div>
  );
}

export default function Quest150({ topic, onNavigate }) {
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  const STORY = useMemo(() => getStory(topic.number), [topic.number]);
  const [hwTest, setHwTest] = useState(null);
  const key = keyFor(user?.uid, topic.number);
  const [save, setSave] = useState(() => readSave(key));
  const [step, setStep] = useState(() => readSave(key).step || 0);
  const [flash, setFlash] = useState(null);
  const [toast, setToast] = useState(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const magic = useRef(null);
  const runes = useMemo(() => save.runes || {}, [save.runes]);

  useEffect(() => {
    fetch(topic.files.lessonData)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setLesson)
      .catch((err) => {
        console.error('quest lesson load error:', err);
        setError('Не вдалося відкрити Браму. Спробуйте ще раз.');
      });
  }, [topic.files.lessonData]);

  useEffect(() => {
    if (!topic.files.test) return;
    loadTopicTest(topic).then(setHwTest).catch((err) => console.error('quest homework load error:', err));
  }, [topic]);

  // сценарій: титр → пролог → сувої й приклади → вступ до рун → руни → фінал → нічна варта (ДЗ) → світанок
  const hwQuestions = useMemo(() => {
    if (!hwTest) return [];
    return hwTest.questions.map((q, i) => ({ question: q, answer: hwTest.answers?.[i], n: i + 1, norm: normalizeQuestion(q, i, hwTest.answers?.[i]) }));
  }, [hwTest]);
  const steps = useMemo(() => {
    if (!lesson) return [];
    const out = [{ kind: 'title' }, { kind: 'dialog', lines: STORY.prologue }];
    let th = 0;
    let ex = 0;
    let n = 0;
    lesson.sections.map((s) => (s.question ? { ...s, question: splitSource(s.question) } : s)).forEach((s) => {
      if (s.kind === 'theory') out.push({ kind: 'scroll', section: s, line: STORY.theory[th++] });
      else if (s.kind === 'example') out.push({ kind: 'example', section: s, line: STORY.examples[ex++] });
      else {
        if (n === 0) out.push({ kind: 'dialog', lines: STORY.trialsIntro, phase: 'runes' });
        out.push({ kind: 'trial', section: s, n: ++n, phase: 'runes' });
      }
    });
    out.push({ kind: 'finale', phase: 'runes' });
    if (hwQuestions.length) {
      out.push({ kind: 'dialog', lines: STORY.homework.intro, phase: 'hw', hwIntro: true });
      hwQuestions.forEach((h) => out.push({ kind: 'hw', ...h, phase: 'hw' }));
      out.push({ kind: 'hwDone', phase: 'hw' });
    }
    return out;
  }, [lesson, hwQuestions, STORY]);
  const total = steps.filter((s) => s.kind === 'trial').length;
  const cur = steps[Math.min(step, steps.length - 1)];
  const lit = Object.values(runes).filter(Boolean).length;
  const hw = useMemo(() => save.hw || {}, [save.hw]);
  const hwScore = useMemo(() => hwQuestions.reduce((acc, h) => ({
    earned: acc.earned + (hw[h.n]?.earned || 0),
    max: acc.max + h.norm.points,
    ok: acc.ok + (hw[h.n]?.ok ? 1 : 0),
    answered: acc.answered + (hw[h.n] ? 1 : 0),
  }), { earned: 0, max: 0, ok: 0, answered: 0 }), [hwQuestions, hw]);

  const persist = (patch) => {
    setSave((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* приватний режим */
      }
      return next;
    });
  };

  // світанок: результат ДЗ записуємо в журнал курсу один раз за проходження
  const saveHw = () => {
    if (!user || save.hwSaved || !hwTest || !hwScore.answered) return;
    persist({ hwSaved: true });
    const answers = Object.fromEntries(Object.entries(hw).map(([n, v]) => [Number(n) - 1, v.value ?? null]));
    saveCourseResult(user, hwTest, { earned: hwScore.earned, max: hwScore.max, answers })
      .catch((err) => console.error('quest homework save error:', err));
  };

  const go = (to) => {
    const target = Math.max(0, Math.min(to, steps.length - 1));
    if (target === step) return;
    if (steps[target]?.kind === 'hwDone') saveHw();
    setStep(target);
    setGateOpen(false);
    persist({ step: target });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFlash({ id: Date.now(), x: `${30 + Math.random() * 40}%`, y: `${40 + Math.random() * 30}%` });
    magic.current?.burst(window.innerWidth / 2, window.innerHeight * 0.45, 'violet', 45);
  };

  useEffect(() => {
    if (cur?.kind !== 'finale') return undefined;
    const id = setTimeout(() => {
      setGateOpen(true);
      magic.current?.burst(window.innerWidth / 2, window.innerHeight * 0.4, 'gold', 160);
    }, 700);
    return () => clearTimeout(id);
  }, [cur]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  const onTrial = (n, ok, rect) => {
    persist({ runes: { ...runes, [n]: runes[n] || ok } });
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    magic.current?.burst(x, y, ok ? 'good' : 'bad', ok ? 110 : 40);
    setToast({ id: Date.now(), ok, text: pick(ok ? STORY.correct : STORY.wrong) });
  };

  const onHw = (n, ok, rect, r, value) => {
    if (hw[n]) return; // рахується перша спроба
    persist({ hw: { ...hw, [n]: { ok, earned: r.earned, max: r.max, value } } });
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    magic.current?.burst(x, y, ok ? 'gold' : 'bad', ok ? 60 : 30);
    setToast({ id: Date.now(), ok, text: pick(ok ? STORY.homework.correct : STORY.homework.wrong) });
  };

  const back = () => onNavigate('course');
  const toLesson = () => onNavigate('topic150', topic);

  if (error || !lesson) {
    return (
      <div className="quest flex items-center justify-center">
        <QuestScene />
        <div className="q-stage text-center">
          {error ? (
            <div className="q-dialog p-8 max-w-md">
              <p className="text-xl mb-4">{error}</p>
              <button type="button" className="q-cast" onClick={back}>До курсу</button>
            </div>
          ) : <Loader2 className="h-12 w-12 text-[var(--q-gold)] animate-spin" />}
        </div>
      </div>
    );
  }

  const firstDim = Object.keys(runes).map(Number).sort((a, b) => a - b).find((n) => runes[n] === false)
    || Array.from({ length: total }, (_, k) => k + 1).find((n) => runes[n] == null);
  const stepOfTrial = (n) => steps.findIndex((s) => s.kind === 'trial' && s.n === n);
  const strong = lit >= Math.ceil(total * 0.7);
  const hwStart = steps.findIndex((s) => s.hwIntro);
  const firstHwGap = hwQuestions.find((h) => !hw[h.n]);
  const restartHw = () => {
    persist({ hw: {}, hwSaved: false });
    go(hwStart + 1);
  };

  return (
    <div className="quest">
      <QuestScene deep={cur.kind !== 'title' && cur.kind !== 'finale'} />
      <MagicCanvas ref={magic} />
      {flash && <div key={flash.id} className="q-flash" style={{ '--x': flash.x, '--y': flash.y }} />}

      <div className="q-stage q-bar sticky top-0 z-30 border-b border-[rgba(245,200,107,.2)]">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <button type="button" onClick={back} className="flex items-center gap-1 text-sm text-[var(--q-gold-soft)] hover:text-white shrink-0">
            <ArrowLeft className="h-4 w-4" />До курсу
          </button>
          <div className="flex-1 min-w-0">
            {cur.phase === 'runes' ? <Runes total={total} runes={runes} current={cur.kind === 'trial' ? cur.n : null} onPick={(n) => go(stepOfTrial(n))} />
              : cur.phase === 'hw' ? <Runes total={hwQuestions.length} runes={hw} current={cur.kind === 'hw' ? cur.n : null} label="Зорі нічної варти"
                onPick={(n) => go(steps.findIndex((s) => s.kind === 'hw' && s.n === n))} /> : (
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#8b6cff] to-[#f5c86b] transition-all duration-700" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
              </div>
            )}
          </div>
          <span className="q-script text-lg text-[var(--q-gold)] shrink-0 hidden sm:block">{cur.phase === 'hw' ? STORY.homework.name : STORY.chapter}</span>
          <button type="button" onClick={() => setMapOpen(true)} className="flex items-center gap-1 text-sm text-[var(--q-gold-soft)] hover:text-white shrink-0">
            <MapIcon className="h-4 w-4" /><span className="hidden sm:inline">Карта</span>
          </button>
          <button type="button" onClick={toLesson} title="Звичайне заняття без квесту" className="flex items-center gap-1 text-sm text-[var(--q-gold-soft)] hover:text-white shrink-0">
            <BookOpen className="h-4 w-4" /><span className="hidden sm:inline">Без квесту</span>
          </button>
        </div>
      </div>

      <main className="q-stage max-w-4xl mx-auto px-4 pt-8 pb-28 min-h-[80vh]">
        <div key={step} className="q-enter space-y-6">
          {cur.kind === 'title' && (
            <div className="text-center pt-[12vh]">
              <h1 className="q-title q-shimmer text-5xl sm:text-7xl font-bold mb-4">{STORY.chapter}</h1>
              <p className="text-3xl sm:text-4xl text-white q-title mb-2">{STORY.place}</p>
              <p className="text-lg text-[#d9d0f5] italic mb-10">тема {topic.number} · {lesson.title}</p>
              <button type="button" className="q-cast text-2xl px-10 py-3" onClick={() => go(1)}>Увійти</button>
            </div>
          )}

          {cur.kind === 'dialog' && <div className="pt-[18vh]"><Dialog lines={cur.lines} onDone={() => go(step + 1)} /></div>}

          {cur.kind === 'scroll' && (
            <>
              {cur.line && <Line line={cur.line} />}
              <div className="pt-3"><Scroll section={cur.section} /></div>
            </>
          )}

          {cur.kind === 'example' && (
            <>
              {cur.line && <Line line={cur.line} />}
              <QuestTrial question={cur.section.question} answer={cur.section.answer} label="Наставниця показує" example
                onResult={(ok, rect) => magic.current?.burst(rect ? rect.left + rect.width / 2 : window.innerWidth / 2, rect ? rect.top : window.innerHeight / 2, ok ? 'good' : 'bad', ok ? 80 : 30)} />
            </>
          )}

          {cur.kind === 'trial' && (
            <QuestTrial key={cur.n} question={cur.section.question} answer={cur.section.answer} label={`Руна ${cur.n} з ${total}`}
              initial={runes[cur.n]} onResult={(ok, rect) => onTrial(cur.n, ok, rect)} />
          )}

          {cur.kind === 'finale' && (
            <div className="text-center pt-4 space-y-6">
              <div className={`q-gate${gateOpen ? ' open' : ''}`}>
                <div className="q-gate-light" />
                <div className="q-door l" />
                <div className="q-door r" />
              </div>
              <div className={`q-crystal${strong ? '' : ' faint'}`} />
              <p className="q-script text-3xl text-[var(--q-gold)]">{STORY.artifact.name}</p>
              <p className="text-xl text-white">Руни, що світяться: <b>{lit}</b> з {total}</p>
              <p className="text-lg text-[#d9d0f5] max-w-xl mx-auto">{STORY.artifact.text}</p>
              <Dialog key={strong ? 'o' : 'w'} lines={strong ? STORY.finale.open : STORY.finale.weak} onDone={() => {}} />
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {firstDim != null && <button type="button" className="q-ghost" onClick={() => go(stepOfTrial(firstDim))}>Перезарядити згаслі руни</button>}
                {hwStart > 0
                  ? <button type="button" className="q-cast" onClick={() => go(hwStart)}>{STORY.homework.name}: домашнє завдання</button>
                  : <button type="button" className="q-cast" onClick={toLesson}>До домашнього завдання</button>}
              </div>
            </div>
          )}

          {cur.kind === 'hw' && (
            <QuestTrial key={`hw${cur.n}-${hw[cur.n] ? 1 : 0}`} question={splitSource(cur.question)} answer={cur.answer} once
              label={`Зоря ${cur.n} з ${hwQuestions.length}`} initial={hw[cur.n]?.ok}
              onResult={(ok, rect, r, value) => onHw(cur.n, ok, rect, r, value)} />
          )}

          {cur.kind === 'hwDone' && (
            <div className="text-center pt-6 space-y-6">
              <p className="q-script text-4xl q-shimmer">Світанок</p>
              <p className="text-2xl text-white">Зорі: <b>{hwScore.ok}</b> з {hwQuestions.length}</p>
              <p className="text-lg text-[#d9d0f5]">Бали за домашнє завдання: <b className="text-white">{Math.round(hwScore.earned)}</b> з {hwScore.max}</p>
              {firstHwGap && <p className="text-[#ffb0b0]">Без відповіді лишилось завдань: {hwQuestions.length - hwScore.answered}</p>}
              <Dialog lines={STORY.homework.done} onDone={() => {}} />
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {firstHwGap && <button type="button" className="q-ghost" onClick={() => go(steps.findIndex((s) => s.kind === 'hw' && s.n === firstHwGap.n))}>Повернутись до пропущених</button>}
                <button type="button" className="q-ghost" onClick={restartHw}>Пройти варту ще раз</button>
                <button type="button" className="q-cast" onClick={back}>До курсу</button>
              </div>
            </div>
          )}
        </div>
      </main>

      {toast && (
        <div key={toast.id} className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 q-enter">
          <p className={`q-dialog q-script text-2xl px-6 py-2 ${toast.ok ? 'text-[#7ef0b4]' : 'text-[#ffb0b0]'}`}>{toast.text}</p>
        </div>
      )}

      {mapOpen && <QuestMap steps={steps} step={step} story={STORY} onClose={() => setMapOpen(false)} onGo={(i) => { setMapOpen(false); go(i); }} />}

      {cur.kind !== 'title' && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-gradient-to-t from-[rgba(5,6,20,.95)] to-transparent pt-8 pb-5">
          <div className="max-w-4xl mx-auto px-4 flex items-center justify-between gap-3">
            <button type="button" className="q-ghost flex items-center gap-1" onClick={() => go(step - 1)}><ChevronLeft className="h-4 w-4" />Назад</button>
            {cur.kind !== 'dialog' && cur.kind !== 'finale' && cur.kind !== 'hwDone' && (
              <button type="button" className="q-cast flex items-center gap-1" onClick={() => go(step + 1)}>
                {(cur.kind === 'trial' && runes[cur.n] == null) || (cur.kind === 'hw' && !hw[cur.n]) ? 'Пропустити' : 'Далі'}<ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
