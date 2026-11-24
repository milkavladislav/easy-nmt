// Сюжети квесту за номером теми. Спільне (герої, репліки на правильні й хибні відповіді, нічна варта) — зі story01.
import story01, { CAST, WORDS } from './story01';
import world02 from './world02';
import world03 from './world03';
import story13 from './story13';
import story14 from './story14';
import story15 from './story15';
import story08 from './story08';
import story09 from './story09';
import story10 from './story10';
import story11 from './story11';
import story12 from './story12';
import story02 from './story02';
import story03 from './story03';
import story04 from './story04';
import story05 from './story05';
import story06 from './story06';
import story07 from './story07';

const STORIES = { 1: story01, 2: story02, 3: story03, 4: story04, 5: story05, 6: story06, 7: story07, 8: story08, 9: story09, 10: story10, 11: story11, 12: story12, 13: story13, 14: story14, 15: story15 };
// світи блоків 2–9: свої герої, слова, сцена й домашнє завдання (блок 1 — школа чарів зі story01)
const WORLDS = { 2: world02, 3: world03 };
export const QUEST_NUMBERS = Object.keys(STORIES).map(Number);
export { CAST };

export function getStory(n) {
  const s = STORIES[n] || story01;
  const w = WORLDS[s.world] || {};
  return {
    correct: w.correct || story01.correct, wrong: w.wrong || story01.wrong, theme: w.theme || '', scene: w.scene || 'castle', ...s,
    cast: { ...CAST, ...w.cast, ...s.cast }, words: { ...WORDS, ...w.words, ...s.words },
    homework: { ...story01.homework, ...w.homework, ...s.homework },
  };
}
