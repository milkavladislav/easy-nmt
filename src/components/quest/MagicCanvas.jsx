import { useEffect, useImperativeHandle, useRef } from 'react';

// Шар іскор поверх сцени: слід за «паличкою» (курсором) і спалахи заклять — burst(x, y, kind).
// Швидкодія: світіння кожної іскри — готовий спрайт (без shadowBlur), а цикл анімації
// працює лише поки є іскри; у спокої canvas нічого не малює.
const PALETTE = {
  gold: ['#fff6cf', '#f5c86b', '#ffd98a', '#ffffff'],
  violet: ['#e6ddff', '#a892ff', '#8b6cff', '#ffffff'],
  good: ['#d8ffe9', '#7ef0b4', '#f5c86b', '#ffffff'],
  bad: ['#ffd0d0', '#ff8a8a', '#7a5a8a'],
};
const MAX_PARTS = 260;
const SPRITE = 32;

function makeSprite(color, star) {
  const c = document.createElement('canvas');
  c.width = SPRITE; c.height = SPRITE;
  const g = c.getContext('2d');
  const h = SPRITE / 2;
  const grad = g.createRadialGradient(h, h, 0, h, h, h);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.18, color);
  grad.addColorStop(0.45, `${color}55`);
  grad.addColorStop(1, `${color}00`);
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE, SPRITE);
  if (star) {
    g.fillStyle = '#ffffff';
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const rr = i % 2 ? 2 : h * 0.95;
      const a = (i * Math.PI) / 4;
      g.lineTo(h + Math.cos(a) * rr, h + Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
  }
  return c;
}

const SPRITES = new Map();
function sprite(color, star) {
  const k = `${color}${star ? '*' : ''}`;
  if (!SPRITES.has(k)) SPRITES.set(k, makeSprite(color, star));
  return SPRITES.get(k);
}

export default function MagicCanvas({ ref }) {
  const canvasRef = useRef(null);
  const parts = useRef([]);
  const api = useRef({ wake: () => {} });

  useImperativeHandle(ref, () => ({
    burst(x, y, kind = 'gold', n = 50) {
      if (api.current.reduce) return;
      const cols = PALETTE[kind] || PALETTE.gold;
      const ps = parts.current;
      const count = Math.min(n, 45);
      if (ps.length + count > MAX_PARTS) ps.splice(0, ps.length + count - MAX_PARTS);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = (kind === 'bad' ? 2.5 : 5) + Math.random() * (kind === 'bad' ? 3 : 7);
        const star = Math.random() < 0.25;
        ps.push({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (kind === 'bad' ? 0 : 1.5),
          life: 1, decay: 0.03 + Math.random() * 0.025, s: (star ? 14 : 8) + Math.random() * 8,
          img: sprite(cols[(Math.random() * cols.length) | 0], star), g: kind === 'bad' ? -0.03 : 0.06,
        });
      }
      api.current.wake();
    },
  }));

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const handle = api.current;
    handle.reduce = reduce;
    let raf = 0;
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = 1; // іскри — розмиті плями, повна роздільність їм не потрібна, а заливка екрана дешевшає вдвічі-вчетверо
      w = window.innerWidth; h = window.innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.width = `${w}px`; cv.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let lastT = 0;
    const tick = (t) => {
      const dt = lastT ? Math.min((t - lastT) / 16.67, 3) : 1; // у «кадрах по 60 fps»
      lastT = t;
      ctx.clearRect(0, 0, w, h);
      const ps = parts.current;
      if (!ps.length) { raf = 0; lastT = 0; return; } // спокій — цикл зупиняється
      ctx.globalCompositeOperation = 'lighter';
      let alive = 0;
      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        const fr = 0.95 ** dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy = p.vy * fr + p.g * dt; p.vx *= fr; p.life -= p.decay * dt;
        if (p.life <= 0) continue;
        ps[alive++] = p;
        ctx.globalAlpha = p.life;
        ctx.drawImage(p.img, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ps.length = alive;
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    };
    const wake = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(tick); };
    handle.wake = wake;

    // слід «палички» лише для миші; на телефоні не навантажуємо
    let last = 0;
    const onMove = (e) => {
      if (reduce || e.pointerType !== 'mouse') return;
      const now = performance.now();
      if (now - last < 40) return;
      last = now;
      const ps = parts.current;
      if (ps.length > MAX_PARTS) return;
      ps.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 0.8, vy: Math.random() * 0.8, life: 0.8, decay: 0.05, s: 7 + Math.random() * 5, img: sprite(PALETTE.gold[(Math.random() * 3) | 0], false), g: 0.02 });
      wake();
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      handle.wake = () => {};
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-40 pointer-events-none" aria-hidden="true" />;
}
