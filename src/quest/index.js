// Сюжети квесту за номером теми. Спільне (герої, репліки на правильні й хибні відповіді, нічна варта) — зі story01.
import story01, { CAST } from './story01';
import story02 from './story02';
import story03 from './story03';
import story04 from './story04';
import story05 from './story05';
import story06 from './story06';
import story07 from './story07';

const STORIES = { 1: story01, 2: story02, 3: story03, 4: story04, 5: story05, 6: story06, 7: story07 };
export const QUEST_NUMBERS = Object.keys(STORIES).map(Number);
export { CAST };

export function getStory(n) {
  const s = STORIES[n] || story01;
  return { correct: story01.correct, wrong: story01.wrong, ...s, homework: { ...story01.homework, ...s.homework } };
}
