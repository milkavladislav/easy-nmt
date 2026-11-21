import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

// Курс «НМТ самопідготовка 150+»: вміст лежить у public/course150 (генерує export_app.py у папці курсу)
const BASE = '/course150';

export const testIdFor = (number) => `150-${number}`;

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
