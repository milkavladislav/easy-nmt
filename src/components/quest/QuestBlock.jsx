import { useMemo } from 'react';
import { Loader2, Lock, Clock, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { Castle } from './QuestScene';
import { Pyramids } from './DesertScene';
import { Ship, City, Cathedral, Space, Train, Mountains, Cave } from './WorldScenes';
import { getStory } from '../../quest';
import { canOpen, isFree, readQuestSave, hasQuest, BLOCK_TEST_MINUTES } from '../../utils/course150';
import { WORLD_SECTIONS } from '../../quest/worlds';
import './quest.css';

// Блок курсу в стилі свого світу (quest/worlds.js): кожна тема — «зала» світу зі своїм артефактом.
// Анімацій тут майже немає: це сторінка-список, вона має бути легкою.
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const plural = (n) => (n === 1 ? 'тема' : n < 5 ? 'теми' : 'тем');

function hallState(uid, topic) {
  const save = readQuestSave(uid, topic.number);
  const runes = save.runes || {};
  const lit = Object.values(runes).filter(Boolean).length;
  return { lit, started: save.step > 0, artifact: lit >= 10 }; // 10 з 14 ≈ 70% — як яскравий кристал у фіналі
}

function HallStatus({ topic, story, state, best }) {
  if (!topic.ready) return <span className="flex items-center gap-1.5 text-[#cfc8ea]"><Clock className="h-4 w-4" />Готується</span>;
  if (!isFree(topic)) return <span className="flex items-center gap-1.5 text-[var(--q-gold-soft)]"><Lock className="h-4 w-4" />Повний доступ</span>;
  return (
    <>
      <span className={`block ${state.artifact ? 'text-[var(--q-gold)]' : 'text-[#cfc8ea]'}`}>
        {state.artifact ? <><Sparkles className="inline h-4 w-4 mr-1" />{story.artifact.name}</> : state.lit ? `${story.words?.runes || 'Руни'}: ${state.lit} з 14` : state.started ? 'Почато' : 'Ще не відкрита'}
      </span>
      {best && <span className="block text-[#8ff5c0]">{story.homework?.name || 'Нічна варта'}: {best.earned} / {best.max}</span>}
    </>
  );
}

const SCENES = { castle: Castle, pyramids: Pyramids, ship: Ship, city: City, cathedral: Cathedral, space: Space, train: Train, mountains: Mountains, cave: Cave };

function Hall({ topic, index, state, best, onOpen, world }) {
  const story = hasQuest(topic) ? getStory(topic.number) : { place: world.places?.[topic.number] || topic.title, artifact: { name: '' } };
  const open = canOpen(topic);
  return (
    <button type="button" disabled={!open} onClick={() => onOpen(topic)}
      className={`q-hall w-full text-left flex items-center gap-4 sm:gap-5 px-4 sm:px-7 py-4 sm:py-5 ${open ? '' : 'locked'}`}>
      <span className={`q-hall-num${state.artifact ? ' lit' : ''}`}>{ROMAN[index] || index + 1}</span>
      <span className="flex-1 min-w-0">
        <span className="block q-script text-[26px] sm:text-[34px] leading-tight text-[var(--q-gold)]">{story.place}</span>
        <span className="block text-[17px] sm:text-[20px] font-medium text-[#f1ebff] mt-0.5">Тема {topic.number} · {topic.title}</span>
        <span className="sm:hidden block mt-1 text-[15px]"><HallStatus topic={topic} story={story} state={state} best={best} /></span>
      </span>
      <span className="hidden sm:flex flex-col items-end gap-1 shrink-0 text-[17px] font-medium">
        <HallStatus topic={topic} story={story} state={state} best={best} />
      </span>
      {open && <ChevronRight className="h-7 w-7 text-[var(--q-gold-soft)] shrink-0" />}
    </button>
  );
}

export default function QuestBlock({ block, uid, best, testIdFor, examBest, examLoading, onOpen, onExam }) {
  const world = WORLD_SECTIONS[block.number] || WORLD_SECTIONS[1];
  const Scene = SCENES[world.scene] || Castle;
  const states = useMemo(() => Object.fromEntries(block.topics.map((t) => [t.number, hallState(uid, t)])), [block.topics, uid]);
  const artifacts = block.topics.filter((t) => states[t.number].artifact).length;
  const examOpen = block.topics.every((t) => t.ready) && isFree(block.topics[0]);

  return (
    <section className={`quest q-embed q-bleed ${world.theme}`}>
      <div className="q-block-sky relative">
        {world.orb && <div className={world.orb} />}
        <div className="relative z-[1] max-w-[1600px] mx-auto px-4 sm:px-8 pt-12 pb-[250px] sm:pb-[290px] lg:pb-[340px]">
        <div className="flex items-baseline justify-between gap-3">
          <p className="q-script text-2xl sm:text-3xl text-[var(--q-gold-soft)]">Блок {block.number} · {block.topics.length} {plural(block.topics.length)}</p>
          <p className="text-lg sm:text-xl font-medium text-[#f1ebff]">{world.found}: <b className="text-[var(--q-gold)]">{artifacts}</b> з {block.topics.length}</p>
        </div>
        <h2 className="q-block-title text-5xl sm:text-7xl font-bold mt-2">{block.title}</h2>
        <p className="text-lg sm:text-[22px] leading-snug font-medium text-[#f1ebff] mt-3 max-w-3xl">
          {world.intro}
        </p>
        </div>
        <div className="q-block-castle" aria-hidden="true"><Scene /></div>
      </div>

      <div className="q-block-halls">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-3 pb-12 space-y-3">
        {block.topics.map((t, i) => (
          <Hall key={t.number} topic={t} index={i} state={states[t.number]} best={best[testIdFor(t.number)]} onOpen={onOpen} world={world} />
        ))}
        {block.test && (
          <button type="button" disabled={!examOpen || examLoading} onClick={onExam}
            className={`q-hall q-exam w-full text-left flex items-center gap-4 sm:gap-5 px-4 sm:px-7 py-5 ${examOpen ? '' : 'locked'}`}>
            <span className="q-hall-num lit">{examLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trophy className="h-6 w-6" />}</span>
            <span className="flex-1 min-w-0">
              <span className="block q-script text-[30px] sm:text-[38px] leading-tight text-[var(--q-gold)]">Іспит Блоку</span>
              <span className="block text-[17px] sm:text-[20px] font-medium text-[#f1ebff] mt-0.5">{block.test.questions} нових завдань з усіх залів · {BLOCK_TEST_MINUTES} хв</span>
            </span>
            {examBest && <span className="hidden sm:block text-[17px] font-medium text-[#8ff5c0] shrink-0">Найкраще: {examBest.earned} / {examBest.max}</span>}
            {examOpen && <ChevronRight className="h-7 w-7 text-[var(--q-gold-soft)] shrink-0" />}
          </button>
        )}
        </div>
      </div>
    </section>
  );
}
