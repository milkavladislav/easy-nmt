// Звуки квестів: синтез Web Audio прямо в браузері (без аудіофайлів і ліцензій).
// У кожного світу свій тембр і свій лад; знахідка артефакту — особлива урочиста мелодія світу.
const KEY = 'quest-sound';
let ctx = null;
let master = null;

export const soundOn = () => {
  try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
};
export const setSoundOn = (on) => {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* приватний режим */ }
};

function ac() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

// Світи: тембр (voice), тоніка (root, MIDI), лад (ступені в півтонах)
const WORLDS = {
  1: { voice: 'bell', root: 72, scale: [0, 2, 4, 7, 9, 12, 14, 16] },             // школа чарів: дзвіночки, пентатоніка
  2: { voice: 'pluck', root: 62, scale: [0, 1, 4, 5, 7, 8, 10, 12] },             // пустеля: щипкові струни, лад хіджаз
  3: { voice: 'marimba', root: 67, scale: [0, 2, 4, 6, 7, 9, 11, 12] },           // море: дерев’яні пластини, лідійський
  4: { voice: 'muted', root: 60, scale: [0, 3, 5, 6, 7, 10, 12, 15] },            // детективи: приглушений джаз, блюз
  5: { voice: 'glass', root: 76, scale: [0, 2, 4, 5, 7, 9, 11, 12] },             // вітражі: скло
  6: { voice: 'synth', root: 64, scale: [0, 2, 4, 6, 8, 10, 12, 14] },            // космос: синтезатор, цілотоновий
  7: { voice: 'clink', root: 65, scale: [0, 2, 4, 5, 7, 9, 10, 12] },             // майстерня: металевий дзенькіт, міксолідійський
  8: { voice: 'flute', root: 69, scale: [0, 2, 3, 5, 7, 9, 10, 12] },             // Карпати: сопілка, дорійський
  9: { voice: 'crystal', root: 79, scale: [0, 2, 4, 6, 7, 9, 11, 12] },           // кришталеві печери
};

// Одна нота заданим тембром
function note(voice, midi, t, dur = 0.5, vol = 0.25) {
  const c = ctx;
  const out = c.createGain();
  out.connect(master);
  const f = hz(midi);
  const env = (g, a, peak, d) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  };
  const osc = (type, freq, gainPeak, a, d, detune = 0) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type; o.frequency.value = freq; o.detune.value = detune;
    env(g, a, gainPeak, d);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + d + 0.05);
    return o;
  };
  out.gain.value = vol;
  switch (voice) {
    case 'bell':
      osc('sine', f, 1, 0.005, dur * 2.2); osc('sine', f * 2.76, 0.35, 0.005, dur * 0.9); osc('sine', f * 5.4, 0.12, 0.005, dur * 0.4);
      break;
    case 'pluck': {
      const o = c.createOscillator(); const flt = c.createBiquadFilter(); const g = c.createGain();
      o.type = 'sawtooth'; o.frequency.value = f; flt.type = 'lowpass'; flt.Q.value = 6;
      flt.frequency.setValueAtTime(f * 8, t); flt.frequency.exponentialRampToValueAtTime(f * 1.2, t + dur * 0.8);
      env(g, 0.004, 0.9, dur * 1.3); o.connect(flt).connect(g).connect(out); o.start(t); o.stop(t + dur * 1.4);
      break;
    }
    case 'marimba':
      osc('sine', f, 1, 0.003, dur * 0.9); osc('sine', f * 4, 0.25, 0.002, dur * 0.25);
      break;
    case 'muted': {
      const o = c.createOscillator(); const flt = c.createBiquadFilter(); const g = c.createGain();
      o.type = 'square'; o.frequency.value = f; flt.type = 'lowpass'; flt.frequency.value = f * 2.5;
      env(g, 0.01, 0.5, dur); o.connect(flt).connect(g).connect(out); o.start(t); o.stop(t + dur + 0.05);
      break;
    }
    case 'glass':
      osc('sine', f, 0.8, 0.002, dur * 1.8); osc('sine', f * 2.01, 0.4, 0.002, dur * 1.2, 7); osc('sine', f * 3.98, 0.15, 0.002, dur * 0.6);
      break;
    case 'synth': {
      const flt = c.createBiquadFilter(); const g = c.createGain();
      flt.type = 'lowpass'; flt.Q.value = 8; flt.frequency.setValueAtTime(300, t); flt.frequency.exponentialRampToValueAtTime(f * 6, t + dur * 0.5);
      env(g, 0.02, 0.6, dur * 1.2); flt.connect(g).connect(out);
      [-8, 8].forEach((dt) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt; o.connect(flt); o.start(t); o.stop(t + dur * 1.3); });
      break;
    }
    case 'clink':
      osc('triangle', f, 0.9, 0.002, dur * 0.7); osc('sine', f * 3.3, 0.4, 0.001, dur * 0.3); osc('sine', f * 6.1, 0.15, 0.001, dur * 0.15);
      break;
    case 'flute': {
      const o = osc('sine', f, 0.9, 0.06, dur * 1.1); osc('triangle', f * 2, 0.08, 0.06, dur);
      const lfo = c.createOscillator(); const lg = c.createGain(); lfo.frequency.value = 5.5; lg.gain.value = f * 0.008;
      lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + dur * 1.2);
      break;
    }
    case 'crystal':
      osc('sine', f, 0.8, 0.002, dur * 2.5); osc('sine', f * 2.4, 0.3, 0.002, dur * 1.5, -5); osc('sine', f * 4.2, 0.15, 0.002, dur);
      break;
    default:
      osc('sine', f, 1, 0.01, dur);
  }
}

// М’який шурхіт (перехід між сторінками)
function whoosh(t, vol = 0.06) {
  const len = 0.35;
  const buf = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = ctx.createBufferSource(); const flt = ctx.createBiquadFilter(); const g = ctx.createGain();
  src.buffer = buf; flt.type = 'bandpass'; flt.Q.value = 0.8;
  flt.frequency.setValueAtTime(600, t); flt.frequency.exponentialRampToValueAtTime(2400, t + len);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(flt).connect(g).connect(master); src.start(t);
}

// Мелодії подій: ступені ладу світу (індекси в scale), тривалість і гучність
const SEQ = {
  enter: [[0, 0], [2, 0.14], [4, 0.28], [5, 0.42, 0.9]],
  correct: [[2, 0], [4, 0.09], [5, 0.18, 0.7]],
  star: [[5, 0], [7, 0.08, 0.8]],
  wrong: [[1, 0, 0.45, 0.16], [0, 0.16, 0.6, 0.16]],
  complete: [[0, 0], [2, 0.1], [4, 0.2], [5, 0.3], [7, 0.4, 1.4]],
  dawn: [[0, 0, 1.6, 0.14], [2, 0.25, 1.6, 0.12], [4, 0.5, 1.8, 0.12]],
};

/** Програти подію квесту у світі world (1–9). */
export function play(event, world = 1) {
  if (!soundOn() || !ac()) return;
  const w = WORLDS[world] || WORLDS[1];
  const t0 = ctx.currentTime + 0.02;
  const deg = (i) => w.root + (i >= 0 ? w.scale[i % w.scale.length] + 12 * Math.floor(i / w.scale.length) : w.scale[0] - 12);
  if (event === 'step') { whoosh(t0); return; }
  if (event === 'wrong') {
    SEQ.wrong.forEach(([i, dt, dur, vol]) => note(w.voice, deg(i) - 12, t0 + dt, dur, vol));
    return;
  }
  if (event === 'artifact' || event === 'artifactWeak') {
    // особливий звук знахідки: м’який «підйом» шуму, арпеджіо вгору ладом світу, акорд і мерехтіння зверху
    whoosh(t0, 0.09);
    const up = [0, 2, 4, 5, 7, 9, 11, 12];
    up.forEach((i, k) => note(w.voice, deg(i), t0 + 0.25 + k * 0.085, 0.6, 0.18));
    const chordT = t0 + 0.25 + up.length * 0.085 + 0.05;
    const chord = event === 'artifact' ? [0, 2, 4, 7] : [0, 2, 4];
    chord.forEach((i) => note(w.voice, deg(i), chordT, 2.4, 0.16));
    note(w.voice, deg(0) - 12, chordT, 2.6, 0.2);
    if (event === 'artifact') [12, 11, 12, 14].forEach((i, k) => note(w.voice, deg(i), chordT + 0.5 + k * 0.12, 0.8, 0.07));
    return;
  }
  (SEQ[event] || []).forEach(([i, dt, dur = 0.5, vol = 0.22]) => note(w.voice, deg(i), t0 + dt, dur, vol));
}
