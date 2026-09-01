export const LETTERS = 'АБВГДЕ';

const escapeAttr = (value) => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Різні джерела JSON називають поля по-різному, тому шукаємо перше непорожнє
function pickHtml(source, keys) {
  if (source == null) return '';
  if (typeof source === 'string' || typeof source === 'number') return String(source);
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) return value;
    if (typeof value === 'number') return String(value);
  }
  if (source.latex) return `<span data-latex="${escapeAttr(source.latex)}" data-type="inline-math"></span>`;
  return '';
}

const VARIANT_TEXT_KEYS = ['content', 'text', 'html', 'title', 'label', 'answer', 'value', 'name'];

function normalizeVariants(list) {
  if (!Array.isArray(list)) return [];
  return list.map((variant, idx) => ({
    id: variant?.id ?? variant?.key ?? idx,
    content: pickHtml(variant, VARIANT_TEXT_KEYS),
    image: variant?.image ?? variant?.img ?? variant?.picture ?? null
  }));
}

// Ключ відповіді може бути індексом (0-based), id варіанта або літерою
function resolveVariantId(variants, token) {
  if (token == null || !variants.length) return null;
  const raw = String(token).trim();
  const idx = Number(raw);
  if (Number.isInteger(idx) && idx >= 0 && idx < variants.length) return variants[idx].id;
  const byId = variants.find((v) => String(v.id) === raw);
  if (byId) return byId.id;
  const letterIdx = LETTERS.indexOf(raw.toUpperCase());
  if (letterIdx >= 0 && variants[letterIdx]) return variants[letterIdx].id;
  return null;
}

function normalizeCorrect(type, key, variants, variantsRight) {
  if (key == null) return null;
  let list;
  if (Array.isArray(key)) {
    list = key;
  } else if (type === 'connect' && typeof key === 'string') {
    list = key.trim().split(/[\s,]+/);
  } else {
    list = [key];
  }
  if (!list.length) return null;
  if (type === 'single') return resolveVariantId(variants, list[0]);
  if (type === 'connect') {
    const resolved = variants.map((_, i) => resolveVariantId(variantsRight, list[i]));
    return resolved.some((v) => v != null) ? resolved : null;
  }
  const texts = list.map((v) => String(v).trim()).filter(Boolean);
  return texts.length ? texts : null;
}

// Бали як у НМТ: 1 за вибір одного варіанта, 1 за кожну правильну пару, 2 за відкриту відповідь
function defaultPoints(type, rows) {
  if (type === 'connect') return rows || 1;
  if (type === 'short') return 2;
  return 1;
}

export function normalizeQuestion(question, idx, answerKey) {
  const variants = normalizeVariants(
    question.variants ?? question.answers ?? question.options ?? question.variantsLeft
  );
  const variantsRight = normalizeVariants(
    question.variantsRight ?? question.rightVariants ?? question.matches ?? question.variantsRigth
  );
  const type = question.type || (variantsRight.length ? 'connect' : variants.length ? 'single' : 'short');
  const rawCorrect = answerKey ?? question.correct ?? question.answer ?? question.correctAnswer;
  return {
    ...question,
    id: question.id ?? idx,
    content: pickHtml(question, ['content', 'text', 'html', 'question', 'title']),
    image: question.image ?? question.img ?? question.picture ?? null,
    type,
    variants,
    variantsRight,
    correct: normalizeCorrect(type, rawCorrect, variants, variantsRight),
    points: Number(question.points) || defaultPoints(type, variants.length)
  };
}

const normalizeShort = (value) =>
  String(value ?? '').trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.');

function shortEquals(a, b) {
  const na = normalizeShort(a);
  const nb = normalizeShort(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const fa = Number(na);
  const fb = Number(nb);
  return Number.isFinite(fa) && Number.isFinite(fb) && Math.abs(fa - fb) < 1e-9;
}

// null — правильної відповіді немає в JSON, оцінити неможливо
export function gradeQuestion(question, userAnswer) {
  const { correct, type, points } = question;
  if (correct == null) return null;

  if (type === 'single') {
    const ok = userAnswer != null && String(userAnswer) === String(correct);
    return { earned: ok ? points : 0, max: points, ok };
  }

  if (type === 'connect') {
    const map = userAnswer || {};
    const rows = question.variants.length || 1;
    const hits = question.variants.reduce((sum, left, i) => {
      const expected = correct[i];
      return expected != null && String(map[left.id]) === String(expected) ? sum + 1 : sum;
    }, 0);
    const perRow = points / rows;
    return { earned: Math.round(hits * perRow * 100) / 100, max: points, ok: hits === rows, hits, rows };
  }

  const ok = correct.some((variant) => shortEquals(userAnswer, variant));
  return { earned: ok ? points : 0, max: points, ok };
}

// 200-бальна шкала НМТ залежно від кількості тестових балів
export const TEST_POINTS_TO_200 = {
  5: 100, 6: 108, 7: 115, 8: 123, 9: 131,
  10: 134, 11: 137, 12: 140, 13: 143, 14: 145,
  15: 147, 16: 148, 17: 149, 18: 150, 19: 151,
  20: 152, 21: 155, 22: 159, 23: 163, 24: 167,
  25: 170, 26: 173, 27: 176, 28: 180, 29: 184,
  30: 189, 31: 194, 32: 200
};

export function to200Scale(testPoints) {
  if (testPoints < 5) return 0;
  if (testPoints >= 32) return 200;
  return TEST_POINTS_TO_200[testPoints] ?? 0;
}

export function isNmtPassed(testPoints) {
  return testPoints >= 5;
}
