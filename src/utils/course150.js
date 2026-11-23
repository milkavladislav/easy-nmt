import { db } from '../firebase/config';
import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { to200Scale, isNmtPassed } from './nmtTest';
import { QUEST_NUMBERS } from '../quest';

// Курс «НМТ самопідготовка 150+»: вміст лежить у public/course150 (генерує export_app.py у папці курсу)
const BASE = '/course150';

// «НМТ-2024 (демо): …» на початку розв'язання — це джерело; виносимо його в мітку.
const SRC_RE = /^((?:НМТ|ЗНО)-\d{4}(?:\s*\(демо\))?):\s*/;
export function splitSource(question) {
  const m = (question.solution || '').match(SRC_RE);
  if (!m) return question;
  return { ...question, src: m[1], solution: question.solution.slice(m[0].length) };
}

export const testIdFor = (number) => `150-${number}`;
export const blockTestIdFor = (number) => `150-b${number}`;
export const BLOCK_TEST_MINUTES = 60;

export async function loadCourse150() {
  const res = await fetch(`${BASE}/course.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`course.json: ${res.status}`);
  return res.json();
}

// Тест ДЗ у форматі hwtest.py; розв'язання (solution) показуємо як пояснення в NMTTestRunner
export async function loadTopicTest(topic) {
  const res = await fetch(topic.files.test, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`test.json: ${res.status}`);
  const data = await res.json();
  return {
    id: testIdFor(topic.number),
    title: data.title,
    subject: 'math',
    timeSeconds: 0,
    questions: data.questions.map((q) => ({ ...q, explanation: q.explanation || q.solution })),
    answers: data.answers,
  };
}

// Підсумковий тест блоку: нові офіційні завдання з усіх тем блоку, з таймером
export async function loadBlockTest(block) {
  const res = await fetch(block.test.file, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`block test.json: ${res.status}`);
  const data = await res.json();
  return {
    id: blockTestIdFor(block.number),
    title: data.title,
    subject: 'math',
    timeSeconds: BLOCK_TEST_MINUTES * 60,
    questions: data.questions.map((q) => ({ ...q, explanation: q.explanation || q.solution })),
    answers: data.answers,
  };
}

// Найкращий результат по кожному тесту курсу: { '150-1': { earned, max, percent } }
export async function loadBestResults(uid) {
  if (!uid) return {};
  const snap = await getDocs(query(collection(db, 'nmt_results'), where('userId', '==', uid)));
  const best = {};
  snap.docs.forEach((d) => {
    const r = d.data();
    if (!String(r.testId || '').startsWith('150-')) return;
    const prev = best[r.testId];
    if (!prev || (r.percent ?? 0) > prev.percent) best[r.testId] = { earned: r.earned, max: r.max, percent: r.percent ?? 0 };
  });
  return best;
}

export const canOpen = (topic) => topic.ready && topic.free;

// Теми, для яких є сюжет квесту (src/quest/storyNN.js): клік по темі відкриває одразу гру
export const QUEST_TOPICS = new Set(QUEST_NUMBERS);
export const hasQuest = (topic) => QUEST_TOPICS.has(topic.number) && Boolean(topic.files?.lessonData);

// Результат ДЗ, пройденого в квесті, — у той самий журнал, що й звичайний тест (nmt_results)
export async function saveCourseResult(user, test, { earned, max, answers }) {
  if (!user) return;
  const points = Math.round(earned);
  await addDoc(collection(db, 'nmt_results'), {
    userId: user.uid,
    email: user.email,
    testId: test.id,
    testTitle: test.title,
    subject: test.subject || 'math',
    earned: points,
    max,
    percent: max ? Math.round((earned / max) * 100) : 0,
    scale200: to200Scale(points),
    passed: isNmtPassed(points),
    answers,
    mode: 'quest',
    createdAt: serverTimestamp(),
  });
}
