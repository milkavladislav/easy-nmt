import { useMemo } from 'react';

// Нічне небо, місяць, Академія на скелі над річкою, туман і свічки, що плавають у повітрі.
// Усе — CSS/SVG, без зображень: легко замінити на згенеровані фони, коли вони з’являться.
function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Castle() {
  const win = (x, y, w = 6, h = 10) => <rect key={`${x}-${y}`} className="q-window" x={x} y={y} width={w} height={h} rx={w / 2} fill="#ffcf6b" />;
  return (
    <svg className="q-castle" viewBox="0 -110 1200 530" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="qRock" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1838" />
          <stop offset="1" stopColor="#0a0918" />
        </linearGradient>
        <linearGradient id="qWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2350" />
          <stop offset="1" stopColor="#141029" />
        </linearGradient>
        <linearGradient id="qRiver" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1b2a5a" stopOpacity=".2" />
          <stop offset=".5" stopColor="#7a8cff" stopOpacity=".45" />
          <stop offset="1" stopColor="#1b2a5a" stopOpacity=".2" />
        </linearGradient>
      </defs>
      {/* далекі пагорби */}
      <path d="M0 330 Q150 270 320 310 T640 300 T960 290 T1200 300 V420 H0Z" fill="#141233" />
      {/* скеля */}
      <path d="M330 420 L360 300 L400 270 L470 250 L560 236 L690 238 L780 252 L850 276 L890 320 L910 420Z" fill="url(#qRock)" />
      {/* мури */}
      <path d="M430 262 H840 V240 H430Z" fill="url(#qWall)" />
      {Array.from({ length: 21 }, (_, i) => <rect key={i} x={430 + i * 20} y={232} width={10} height={9} fill="#2a2350" />)}
      {/* вежі */}
      {[
        [450, 150, 46, 110], [560, 92, 58, 160], [660, 40, 70, 210], [780, 120, 50, 130], [520, 180, 34, 70], [725, 170, 30, 80],
      ].map(([x, y, w, h]) => (
        <g key={x}>
          <rect x={x} y={y} width={w} height={h} fill="url(#qWall)" />
          <path d={`M${x - 8} ${y} L${x + w / 2} ${y - w * 1.25} L${x + w + 8} ${y}Z`} fill="#3a2e74" />
          <circle cx={x + w / 2} cy={y - w * 1.25 - 6} r="3" fill="#f5c86b" />
        </g>
      ))}
      {/* вікна */}
      {[
        [467, 190], [467, 215], [580, 130], [597, 130], [588, 170], [588, 205], [683, 80], [703, 80], [690, 120], [690, 160], [690, 200],
        [797, 150], [797, 185], [532, 200], [736, 190], [470, 245], [520, 246], [610, 246], [760, 246], [820, 246],
      ].map(([x, y]) => win(x, y))}
      {/* міст і річка */}
      <path d="M0 395 Q300 380 600 392 T1200 388 V420 H0Z" fill="url(#qRiver)" />
      <path d="M200 372 Q260 340 330 360" stroke="#2a2350" strokeWidth="10" fill="none" />
    </svg>
  );
}

export default function QuestScene({ deep = false }) {
  const { stars, candles, dust } = useMemo(() => {
    const r = rand(42);
    return {
      dust: Array.from({ length: 18 }, () => ({ x: r() * 100, d: 14 + r() * 14, delay: -r() * 28, dx: (r() - 0.5) * 80 })),
      stars: Array.from({ length: 60 }, () => ({ x: r() * 100, y: r() * 60, d: 2 + r() * 4, delay: r() * 4, s: r() < 0.15 ? 3 : 2 })),
      candles: Array.from({ length: 7 }, () => ({ x: 4 + r() * 92, y: 8 + r() * 45, d: 5 + r() * 5, delay: r() * 4, s: 0.6 + r() * 0.6 })),
    };
  }, []);
  return (
    <div className="q-sky">
      {stars.map((s, i) => (
        <span key={i} className="q-star" style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, '--d': `${s.d}s`, '--delay': `${s.delay}s` }} />
      ))}
      <div className="q-moon" />
      <Castle />
      <div className="q-fog" />
      {dust.map((p, i) => (
        <span key={i} className="q-dust" style={{ left: `${p.x}%`, '--d': `${p.d}s`, '--delay': `${p.delay}s`, '--dx': `${p.dx}px` }} />
      ))}
      {candles.map((c, i) => (
        <span key={i} className="q-candle" style={{ left: `${c.x}%`, top: `${c.y}%`, transform: `scale(${c.s})`, '--d': `${c.d}s`, '--delay': `${c.delay}s` }} />
      ))}
      <div className={`q-dim${deep ? ' deep' : ''}`} />
    </div>
  );
}
