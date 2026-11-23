import { useEffect, useMemo, useState } from 'react';
import { Loader2, NotebookPen, Compass, BookOpenCheck, Trophy, Sparkles, RotateCcw, ChevronRight, Lock, Clock, Flag, ArrowRight,
  Footprints, Gem, PenLine, Star, Target, Crown, Map as MapIcon, Mountain, Medal, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WORLDS, WORLD_SECTIONS } from '../quest/worlds';
import { getStory } from '../quest';
import { loadCourse150, loadAllResults, bestByTest, readQuestSave, testIdFor, blockTestIdFor, canOpen, hasQuest } from '../utils/course150';
import '../components/quest/quest.css';

// «Журнал експедиції»: прогрес з математики в курсі 150+ мовою подорожі світами.
const WEAK_HW = 60;      // ДЗ нижче 60% — тему варто повторити
const ARTIFACT_AT = 10;  // як на сторінці курсу: 10 з 14 знаків — артефакт знайдено

const fmtDate = (d) => (d ? d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) : '');

function Bar({ value, color }) {
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round(value * 100)}%`, background: color }} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-2xl border border-[rgba(245,200,107,.25)] bg-white/[.04] p-4">
      <p className="flex items-center gap-2 text-[#cfc8ea] text-sm"><Icon className="h-4 w-4 text-[var(--q-gold)]" />{label}</p>
      <p className="mt-1 text-3xl font-bold text-[var(--q-gold)]">{value}</p>
      {note && <p className="text-xs text-[#9a93b8] mt-0.5">{note}</p>}
    </div>
  );
}

// Досягнення рахуються з тих самих даних, що й журнал: руни/знаки квестів, ДЗ, іспити блоків і тести НМТ.
function achievements(d) {
  const all = d.blocks.flatMap((b) => b.topics);
  const maxLit = all.reduce((m, x) => Math.max(m, x.lit), 0);
  const hwBest = all.reduce((m, x) => Math.max(m, x.hw?.percent || 0), 0);
  const fullWorld = d.blocks.some((b) => b.topics.length && b.topics.every((x) => x.artifact));
  const examBest = d.blocks.reduce((m, b) => Math.max(m, b.exam?.percent || 0), 0);
  const worldsStarted = d.blocks.filter((b) => b.topics.some((x) => x.started)).length;
  const hwCount = all.filter((x) => x.hw).length;
  return [
    { icon: Footprints, name: 'Перший крок', text: 'Розв’язати перше завдання квесту', got: maxLit > 0 },
    { icon: Gem, name: 'Перша знахідка', text: 'Знайти перший артефакт (10 з 14 у темі)', got: d.artifacts > 0, progress: [Math.min(maxLit, 10), 10] },
    { icon: PenLine, name: 'Домашнє зроблено', text: 'Пройти перше домашнє завдання', got: hwCount > 0 },
    { icon: Star, name: 'Відмінна робота', text: 'Набрати 90% або більше в ДЗ', got: hwBest >= 90, progress: [hwBest, 90, '%'] },
    { icon: Target, name: 'Без жодної помилки', text: 'Розв’язати всі 14 завдань теми', got: maxLit >= 14, progress: [maxLit, 14] },
    { icon: BookOpenCheck, name: 'Сумлінний учень', text: 'Пройти ДЗ у 5 темах', got: hwCount >= 5, progress: [Math.min(hwCount, 5), 5] },
    { icon: Crown, name: 'Хранитель світу', text: 'Зібрати всі артефакти одного світу', got: fullWorld },
    { icon: Trophy, name: 'Іспит складено', text: 'Пройти підсумковий тест блоку', got: d.exams > 0 },
    { icon: Medal, name: 'Майстер блоку', text: 'Набрати 80% у тесті блоку', got: examBest >= 80, progress: [examBest, 80, '%'] },
    { icon: MapIcon, name: 'Мандрівник', text: 'Почати подорож у двох світах', got: worldsStarted >= 2, progress: [Math.min(worldsStarted, 2), 2] },
    { icon: Flag, name: 'Перший тест НМТ', text: 'Пройти повний тест НМТ', got: d.nmt.length > 0 },
    { icon: Mountain, name: 'Вершина 150+', text: 'Набрати 150 або більше балів на тесті НМТ', got: d.nmtBest >= 150, progress: [d.nmtBest, 150] },
  ];
}

export default function Journal({ onNavigate }) {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCourse150().then(setCourse).catch(() => setError('Не вдалося завантажити журнал. Спробуйте ще раз.'));
  }, []);
  useEffect(() => {
    loadAllResults(user?.uid).then(setResults).catch(() => setResults([]));
  }, [user?.uid]);

  const data = useMemo(() => {
    if (!course || !results) return null;
    const best = bestByTest(results);
    const blocks = course.blocks.map((block) => {
      const world = WORLDS[block.number - 1];
      const topics = block.topics.map((t) => {
        const save = readQuestSave(user?.uid, t.number);
        const lit = Object.values(save.runes || {}).filter(Boolean).length;
        const hw = best[testIdFor(t.number)];
        const story = hasQuest(t) ? getStory(t.number) : null;
        return {
          topic: t, lit, hw, story, started: (save.step || 0) > 0 || Boolean(hw),
          artifact: lit >= ARTIFACT_AT, done: Boolean(hw) || lit >= ARTIFACT_AT,
          place: story?.place || WORLD_SECTIONS[block.number]?.places?.[t.number] || '',
        };
      });
      return { block, world, topics, exam: best[blockTestIdFor(block.number)], ready: block.topics.some((t) => t.ready), open: block.topics.some(canOpen) };
    });
    const all = blocks.flatMap((b) => b.topics);
    const hwList = all.filter((x) => x.hw);
    const next = all.find((x) => canOpen(x.topic) && !x.done);
    const weak = all.filter((x) => x !== next && canOpen(x.topic) && ((x.hw && x.hw.percent < WEAK_HW) || (x.started && !x.hw && x.lit < ARTIFACT_AT)));
    const examNext = !next && blocks.find((b) => b.open && b.block.test && b.topics.every((x) => x.done) && !b.exam);
    const nmt = results.filter((r) => !r.testId.startsWith('150-'));
    return {
      blocks, weak, next, examNext, nmt,
      done: all.filter((x) => x.done).length,
      openCount: all.filter((x) => canOpen(x.topic)).length,
      hwAvg: hwList.length ? Math.round(hwList.reduce((s, x) => s + x.hw.percent, 0) / hwList.length) : null,
      exams: blocks.filter((b) => b.exam).length,
      examsTotal: blocks.filter((b) => b.block.test).length,
      artifacts: all.filter((x) => x.artifact).length,
      nmtBest: nmt.reduce((m, r) => Math.max(m, r.scale200 || 0), 0),
    };
  }, [course, results, user?.uid]);

  const ach = data ? achievements(data) : [];
  const openTopic = (t) => canOpen(t) && onNavigate(hasQuest(t) ? 'quest150' : 'topic150', t);

  if (error) {
    return <div className="min-h-screen bg-[var(--q-night,#070b1f)] flex items-center justify-center p-4 text-red-300">{error}</div>;
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-[#070b1f] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#f5c86b] animate-spin" />
      </div>
    );
  }

  return (
    <div className="quest min-h-screen overflow-x-clip" style={{ fontFamily: 'inherit' }}>
      <div className="relative w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8 font-sans">
        <header className="mb-6">
          <p className="flex items-center gap-2 text-[var(--q-gold)] text-sm tracking-wide uppercase"><NotebookPen className="h-4 w-4" />Журнал експедиції</p>
          <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-[#f1ebff]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Твоя підготовка до НМТ з математики
          </h1>
          <p className="mt-2 text-[#cfc8ea]">Що вже вивчено, як пройдено домашні завдання й тести, і що варто повторити перед іспитом.</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat icon={BookOpenCheck} label="Теми вивчено" value={`${data.done}`} note={`з ${data.openCount} відкритих тем`} />
          <Stat icon={NotebookPen} label="Середній бал ДЗ" value={data.hwAvg == null ? '—' : `${data.hwAvg}%`} note={data.hwAvg == null ? 'ще немає ДЗ' : 'найкращі спроби'} />
          <Stat icon={Trophy} label="Іспити блоків" value={`${data.exams}`} note={`з ${data.examsTotal} готових`} />
          <Stat icon={Sparkles} label="Артефакти" value={`${data.artifacts}`} note="знайдено у світах" />
        </div>

        <div className="mt-6 grid gap-x-8 gap-y-2 xl:grid-cols-[minmax(0,1fr)_400px] items-start">
        <div className="min-w-0 [&>section:first-child]:mt-0">

        {(data.next || data.examNext) && (
          <section className="mt-6 rounded-2xl border border-[rgba(139,108,255,.45)] bg-[rgba(139,108,255,.12)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <Compass className="h-8 w-8 text-[var(--q-gold)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#cfc8ea]">Наступна зупинка</p>
              {data.next ? (
                <p className="text-lg font-semibold text-[#f1ebff]">Тема {data.next.topic.number}. {data.next.topic.title}
                  {data.next.place && <span className="block text-sm font-normal text-[#9a93b8]">{data.next.place}</span>}</p>
              ) : (
                <p className="text-lg font-semibold text-[#f1ebff]">Підсумковий тест блоку {data.examNext.block.number} «{data.examNext.block.title}»</p>
              )}
            </div>
            <button type="button" onClick={() => (data.next ? openTopic(data.next.topic) : onNavigate('course'))}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold bg-[var(--q-gold)] text-[#1a1206] hover:brightness-110">
              Продовжити <ArrowRight className="h-4 w-4" />
            </button>
          </section>
        )}

        {data.weak.length > 0 && (
          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#f1ebff]"><RotateCcw className="h-5 w-5 text-[#ff9f8a]" />Варто повторити</h2>
            <p className="text-sm text-[#9a93b8] mb-2">Теми, де ДЗ нижче {WEAK_HW}% або розшифровано менше {ARTIFACT_AT} знаків із 14.</p>
            <div className="space-y-2">
              {data.weak.map((x) => (
                <button key={x.topic.number} type="button" onClick={() => openTopic(x.topic)}
                  className="w-full flex items-center gap-3 text-left rounded-xl border border-[rgba(255,159,138,.3)] bg-[rgba(255,159,138,.07)] px-4 py-3 hover:border-[rgba(255,159,138,.6)]">
                  <span className="flex-1 min-w-0 text-[#f1ebff]">Тема {x.topic.number}. {x.topic.title}</span>
                  <span className="text-sm text-[#ffb4a3] shrink-0">{x.hw ? `ДЗ: ${x.hw.percent}%` : `${x.lit} з 14`}</span>
                  <ChevronRight className="h-4 w-4 text-white/50 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-[#f1ebff] mb-3">Світи й теми</h2>
          <div className="space-y-4">
            {data.blocks.map(({ block, world, topics, exam, ready, open }) => {
              const Icon = world?.icon || Flag;
              const done = topics.filter((x) => x.done).length;
              if (!ready) {
                return (
                  <div key={block.number} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 opacity-70">
                    <Icon className="h-5 w-5 shrink-0" style={{ color: '#9a93b8' }} />
                    <span className="flex-1 min-w-0 text-[#cfc8ea]"><b className="text-[#f1ebff]">Блок {block.number} · {block.title}</b>
                      <span className="hidden sm:inline text-[#9a93b8]"> — {world?.name}</span></span>
                    <span className="flex items-center gap-1 text-xs text-[#9a93b8]"><Clock className="h-3.5 w-3.5" />Готується</span>
                  </div>
                );
              }
              return (
                <div key={block.number} className="rounded-2xl border bg-white/[.04] p-4 sm:p-5" style={{ borderColor: `${world?.color}55` }}>
                  <div className="flex items-start gap-3">
                    <span className="grid place-items-center h-10 w-10 rounded-xl shrink-0" style={{ background: `${world?.color}22`, color: world?.color }}><Icon className="h-5 w-5" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#f1ebff]">Блок {block.number} · {block.title}</p>
                      <p className="text-sm text-[#9a93b8]">{world?.name} · артефакт світу: <span style={{ color: world?.color }}>{world?.artifact}</span></p>
                    </div>
                    <span className="text-sm text-[#cfc8ea] shrink-0">{done} з {topics.length}</span>
                  </div>
                  <div className="mt-3"><Bar value={topics.length ? done / topics.length : 0} color={world?.color} /></div>
                  {!open && <p className="mt-3 flex items-center gap-1.5 text-sm text-amber-300"><Lock className="h-4 w-4" />Відкривається з повним доступом</p>}
                  <div className="mt-3 divide-y divide-white/5">
                    {topics.map((x) => (
                      <button key={x.topic.number} type="button" disabled={!canOpen(x.topic)} onClick={() => openTopic(x.topic)}
                        className="w-full flex items-center gap-3 py-2.5 text-left disabled:cursor-default enabled:hover:bg-white/[.03] rounded-lg px-1">
                        <span className="w-7 text-center text-sm font-bold shrink-0" style={{ color: x.done ? world?.color : '#6f6a8f' }}>{x.topic.number}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[#f1ebff] leading-snug">{x.topic.title}</span>
                          <span className="block text-xs text-[#9a93b8]">
                            {!x.topic.ready ? 'Готується' : [
                              x.lit ? `${x.story?.words?.runes || 'Завдання'}: ${x.lit} з 14` : null,
                              x.hw ? `ДЗ: ${x.hw.earned} з ${x.hw.max} (${x.hw.percent}%)` : null,
                            ].filter(Boolean).join(' · ') || (canOpen(x.topic) ? 'Ще не почато' : 'Повний доступ')}
                          </span>
                        </span>
                        {x.artifact && x.story && (
                          <span className="hidden sm:flex items-center gap-1 text-xs shrink-0" style={{ color: world?.color }}><Sparkles className="h-3.5 w-3.5" />{x.story.artifact.name}</span>
                        )}
                        {x.artifact && <Sparkles className="sm:hidden h-4 w-4 shrink-0" style={{ color: world?.color }} />}
                      </button>
                    ))}
                  </div>
                  {block.test && (
                    <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-[#cfc8ea]">
                      <Trophy className="h-4 w-4 text-[var(--q-gold)]" />Підсумковий тест блоку:
                      <b className="text-[#f1ebff]">{exam ? `${exam.earned} з ${exam.max} (${exam.percent}%)` : 'ще не пройдено'}</b>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        </div>

        <aside className="min-w-0 xl:sticky xl:top-6">
        <section className="mt-8 xl:mt-0">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#f1ebff]"><Award className="h-5 w-5 text-[var(--q-gold)]" />Досягнення</h2>
            <span className="text-sm text-[#9a93b8]">{ach.filter((a) => a.got).length} з {ach.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
            {ach.map((a) => (
              <div key={a.name} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${a.got ? 'border-[rgba(245,200,107,.45)] bg-[rgba(245,200,107,.08)]' : 'border-white/10 bg-white/[.02]'}`}>
                <span className={`grid place-items-center h-10 w-10 rounded-full shrink-0 ${a.got ? 'bg-[var(--q-gold)] text-[#1a1206]' : 'border border-dashed border-white/20 text-[#6f6a8f]'}`}>
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block font-semibold leading-tight ${a.got ? 'text-[var(--q-gold)]' : 'text-[#cfc8ea]'}`}>{a.name}</span>
                  <span className="block text-xs text-[#9a93b8] leading-snug">{a.text}</span>
                </span>
                {!a.got && a.progress && (
                  <span className="text-xs text-[#9a93b8] shrink-0">{a.progress[0]}{a.progress[2] || ''} / {a.progress[1]}{a.progress[2] || ''}</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-[#f1ebff] mb-1"><Flag className="h-5 w-5 text-[var(--q-gold)]" />Тести НМТ</h2>
          {data.nmt.length ? (
            <>
              <p className="text-sm text-[#cfc8ea] mb-2">Спроб: {data.nmt.length} · найкращий результат: <b className="text-[var(--q-gold)]">{data.nmtBest}</b> зі 200</p>
              <div className="space-y-1.5">
                {data.nmt.slice(0, 5).map((r, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-white/[.04] px-4 py-2.5 text-sm">
                    <span className="flex-1 min-w-0 truncate text-[#f1ebff]">{r.title}</span>
                    <span className="text-[#9a93b8] shrink-0">{fmtDate(r.at)}</span>
                    <span className="text-[var(--q-gold)] font-semibold shrink-0">{r.scale200 ?? `${r.percent}%`}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#9a93b8]">Ще не пройдено жодного тесту НМТ. <button type="button" className="underline text-[var(--q-gold-soft)]" onClick={() => onNavigate('nmt')}>Перейти до тестів</button></p>
          )}
        </section>
        </aside>
        </div>
      </div>
    </div>
  );
}
