// Сюжети квесту за номером теми. Спільне (герої, репліки на правильні й хибні відповіді, нічна варта) — зі story01.
import story01, { CAST, WORDS } from './story01';
import world02 from './world02';
import world03 from './world03';
import world04 from './world04';
import world05 from './world05';
import world06 from './world06';
import world07 from './world07';
import world08 from './world08';
import world09 from './world09';
import story37 from './story37';
import story38 from './story38';
import story39 from './story39';
import story40 from './story40';
import story41 from './story41';
import story42 from './story42';
import story43 from './story43';
import story34 from './story34';
import story35 from './story35';
import story36 from './story36';
import story31 from './story31';
import story32 from './story32';
import story33 from './story33';
import story26 from './story26';
import story27 from './story27';
import story28 from './story28';
import story29 from './story29';
import story30 from './story30';
import story22 from './story22';
import story23 from './story23';
import story24 from './story24';
import story25 from './story25';
import story16 from './story16';
import story17 from './story17';
import story18 from './story18';
import story19 from './story19';
import story20 from './story20';
import story21 from './story21';
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

const STORIES = { 1: story01, 2: story02, 3: story03, 4: story04, 5: story05, 6: story06, 7: story07, 8: story08, 9: story09, 10: story10, 11: story11, 12: story12, 13: story13, 14: story14, 15: story15,
  16: story16, 17: story17, 18: story18, 19: story19, 20: story20, 21: story21,
  22: story22, 23: story23, 24: story24, 25: story25,
  26: story26, 27: story27, 28: story28, 29: story29, 30: story30,
  31: story31, 32: story32, 33: story33,
  34: story34, 35: story35, 36: story36,
  37: story37, 38: story38, 39: story39, 40: story40, 41: story41, 42: story42, 43: story43 };
// світи блоків 2–9: свої герої, слова, сцена й домашнє завдання (блок 1 — школа чарів зі story01)
const WORLDS = { 2: world02, 3: world03, 4: world04, 5: world05, 6: world06, 7: world07, 8: world08, 9: world09 };
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
