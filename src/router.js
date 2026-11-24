// Адреси сторінок без сторонніх бібліотек: view + data ↔ шлях у браузері.
// /                     курс
// /journal /profile /nmt  вкладки
// /nmt/:id              тест НМТ
// /topic/:n             квест теми (або сторінка теми, якщо квесту немає)
// /topic/:n/overview    сторінка теми
// /topic/:n/lesson      урок
// /topic/:n/homework    ДЗ теми
// /block/:b/exam        підсумковий тест блоку
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { loadCourse150, loadTopicTest, loadBlockTest, canOpen, hasQuest, isFree } from './utils/course150';

const TABS = { course: '/', journal: '/journal', profile: '/profile', nmt: '/nmt' };
const TITLES = { journal: 'Журнал експедиції', profile: 'Профіль', nmt: 'Тести НМТ' };
const BRAND = 'Експедиція НМТ';

/** Шлях для переходу onNavigate(view, data); null — адреса не змінюється (старі сторінки без адрес). */
export function pathFor(view, data) {
  if (TABS[view]) return TABS[view];
  const n = data?.number;
  switch (view) {
    case 'quest150': return `/topic/${n}`;
    case 'topic150': return `/topic/${n}/overview`;
    case 'lesson150': return `/topic/${n}/lesson`;
    case 'nmtTest': {
      const t = data?.test || data;
      const id = String(t?.id || '');
      let m = id.match(/^150-b(\d+)$/);
      if (m) return `/block/${m[1]}/exam`;
      m = id.match(/^150-(\d+)$/);
      if (m) return `/topic/${m[1]}/homework`;
      return id ? `/nmt/${encodeURIComponent(id)}` : null;
    }
    default: return null;
  }
}

export function titleFor(view, data) {
  if (TITLES[view]) return `${TITLES[view]} · ${BRAND}`;
  const t = data?.test || data;
  if (data?.title && data?.number) return `Тема ${data.number}. ${data.title} · ${BRAND}`;
  if (view === 'nmtTest' && t?.title) return `${t.title} · ${BRAND}`;
  return `${BRAND} — математика до НМТ`;
}

let coursePromise = null;
const course = () => (coursePromise ||= loadCourse150().catch((e) => { coursePromise = null; throw e; }));

async function findTopic(n) {
  const c = await course();
  for (const block of c.blocks) {
    const topic = block.topics.find((t) => t.number === n);
    if (topic) return { topic, block };
  }
  return {};
}

const HOME = { view: 'course', data: null };

/** Шлях → { view, data }. Недоступна або невідома адреса веде на курс. */
export async function resolvePath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const tab = Object.entries(TABS).find(([, p]) => p === path);
  if (tab) return { view: tab[0], data: null };

  let m = path.match(/^\/nmt\/(.+)$/);
  if (m) {
    const snap = await getDoc(doc(db, 'nmt_tests', decodeURIComponent(m[1])));
    return snap.exists() ? { view: 'nmtTest', data: { id: snap.id, ...snap.data() } } : { view: 'nmt', data: null };
  }

  m = path.match(/^\/topic\/(\d+)(?:\/(overview|lesson|homework))?$/);
  if (m) {
    const { topic } = await findTopic(Number(m[1]));
    if (!topic || !canOpen(topic)) return HOME;
    const part = m[2];
    if (!part) return { view: hasQuest(topic) ? 'quest150' : 'topic150', data: topic };
    if (part === 'overview') return { view: 'topic150', data: topic };
    if (part === 'lesson') return topic.files?.lessonData ? { view: 'lesson150', data: topic } : { view: 'topic150', data: topic };
    if (!topic.files?.test) return { view: 'topic150', data: topic };
    const test = await loadTopicTest(topic);
    return { view: 'nmtTest', data: { test, practice: true, exit: { view: 'topic150', data: topic } } };
  }

  m = path.match(/^\/block\/(\d+)\/exam$/);
  if (m) {
    const c = await course();
    const block = c.blocks.find((b) => b.number === Number(m[1]));
    const open = block?.test && block.topics.every((t) => t.ready) && isFree(block.topics[0]);
    if (!open) return HOME;
    const test = await loadBlockTest(block);
    return {
      view: 'nmtTest',
      data: { test, practice: true, skin: block.topics.every(hasQuest) ? 'quest' : null, world: block.number, exit: { view: 'course', label: 'Назад до курсу' } },
    };
  }
  return HOME;
}
