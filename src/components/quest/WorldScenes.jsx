// Малюнки світів 3–9 унизу неба кожного блоку. Статичні SVG без анімацій — сторінка-список має бути легкою.
// Усі в одній системі координат 1200×420 і обрізаються по центру (q-castle wide).
const Svg = ({ children }) => (
  <svg className="q-castle wide" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">{children}</svg>
);

// 3 · Корабель-обсерваторія в нічному морі
export function Ship() {
  return (
    <Svg>
      <path d="M0 330 C 150 320, 300 338, 450 328 S 800 318, 1200 332 L1200 420 L0 420Z" fill="#0f2a4a" />
      <g transform="translate(600 0)">
        <path d="M-200 300 L200 300 L160 350 L-170 350 Z" fill="#3b2516" />
        <path d="M-200 300 L200 300 L194 310 L-194 310 Z" fill="#c99a56" />
        {[-120, -60, 0, 60, 120].map((x) => <circle key={x} cx={x} cy="327" r="6" fill="#ffd98a" />)}
        <rect x="-110" y="120" width="6" height="180" fill="#2a1a10" />
        <rect x="20" y="90" width="7" height="210" fill="#2a1a10" />
        <path d="M-104 130 Q -40 180 -104 270 Z" fill="#e9dcc0" />
        <path d="M27 100 Q 110 170 27 280 Z" fill="#f3e8cf" />
        <path d="M-104 130 L -170 270 L -104 270 Z" fill="#d8c8a6" opacity=".85" />
        <path d="M110 300 L110 258 A 45 45 0 0 1 200 258 L200 300 Z" fill="#b8863f" transform="translate(-40 0)" />
        <path d="M95 255 L170 205" stroke="#e7c27c" strokeWidth="9" strokeLinecap="round" />
        <path d="M30 90 L 50 96 L 30 102 Z" fill="#7fb8ff" />
      </g>
      <path d="M0 360 C 120 350, 220 372, 360 360 S 600 350, 760 364 S 1050 352, 1200 362 L1200 420 L0 420Z" fill="#0b2140" />
      <path d="M0 392 C 160 382, 300 400, 480 390 S 860 380, 1200 394 L1200 420 L0 420Z" fill="#071730" />
      <path d="M430 348 L 780 348" stroke="#ffd98a" strokeOpacity=".25" strokeWidth="3" strokeDasharray="20 18" />
    </Svg>
  );
}

// 4 · Нічне місто під дощем і детективне бюро
export function City() {
  const houses = [[0, 180, 160], [150, 240, 120], [270, 150, 140], [420, 280, 110], [740, 230, 130], [880, 170, 150], [1040, 260, 160]];
  return (
    <Svg>
      {houses.map(([x, h, w], i) => (
        <g key={x}>
          <rect x={x} y={420 - h} width={w} height={h} fill={i % 2 ? '#1c1512' : '#241a14'} />
          {Array.from({ length: Math.floor(h / 45) }, (_, r) => Array.from({ length: Math.floor(w / 40) }, (_, c) => (
            (r * 3 + c + i) % 4 === 0 && <rect key={`${r}-${c}`} x={x + 14 + c * 40} y={420 - h + 20 + r * 45} width="16" height="22" fill="#ffb648" opacity=".85" />
          )))}
        </g>
      ))}
      {/* бюро з вивіскою */}
      <rect x="530" y="170" width="210" height="250" fill="#2e2018" />
      <rect x="555" y="200" width="160" height="34" rx="4" fill="#120c09" stroke="#e0b07a" strokeWidth="2" />
      <text x="635" y="224" textAnchor="middle" fill="#ffcf8a" fontSize="20" fontFamily="PT Mono, monospace" letterSpacing="3">БЮРО</text>
      <rect x="560" y="260" width="60" height="80" fill="#ffc46b" opacity=".9" />
      <rect x="650" y="260" width="60" height="80" fill="#ffc46b" opacity=".6" />
      <path d="M560 262 L620 262 L600 300 Z" fill="#2e2018" opacity=".55" />
      <rect x="610" y="360" width="50" height="60" fill="#120c09" />
      {/* ліхтар */}
      <rect x="460" y="260" width="6" height="160" fill="#120c09" />
      <path d="M448 262 L478 262 L472 244 L454 244 Z" fill="#ffd98a" />
      <ellipse cx="463" cy="414" rx="90" ry="8" fill="#ffd98a" opacity=".2" />
    </Svg>
  );
}

// 5 · Собор із вітражем-трояндою
export function Cathedral() {
  const petals = Array.from({ length: 12 }, (_, i) => i);
  const glass = ['#e0405e', '#2f9e6b', '#3f6fe0', '#f2b33d'];
  return (
    <Svg>
      <path d="M0 400 L1200 400 L1200 420 L0 420Z" fill="#1a1028" />
      <rect x="380" y="150" width="440" height="270" fill="#2b2040" />
      <path d="M380 150 L600 40 L820 150 Z" fill="#33264b" />
      <rect x="300" y="120" width="100" height="300" fill="#251a38" />
      <path d="M300 120 L350 20 L400 120 Z" fill="#2b2040" />
      <rect x="800" y="120" width="100" height="300" fill="#251a38" />
      <path d="M800 120 L850 20 L900 120 Z" fill="#2b2040" />
      {/* вітраж-троянда */}
      <g transform="translate(600 200)">
        <circle r="78" fill="#140c22" />
        {petals.map((i) => (
          <path key={i} d="M0 0 L -18 -68 A 70 70 0 0 1 18 -68 Z" fill={glass[i % 4]} opacity=".9" transform={`rotate(${i * 30})`} />
        ))}
        <circle r="22" fill="#f2b33d" />
        <circle r="78" fill="none" stroke="#120a1e" strokeWidth="6" />
      </g>
      {[330, 830].map((x) => (
        <g key={x}>
          <path d={`M${x} 330 L${x} 220 Q ${x + 20} 190 ${x + 40} 220 L${x + 40} 330 Z`} fill="#3f6fe0" opacity=".8" />
          <path d={`M${x} 275 L${x + 40} 275`} stroke="#120a1e" strokeWidth="3" />
        </g>
      ))}
      <path d="M560 420 L560 340 Q 600 300 640 340 L640 420 Z" fill="#120a1e" />
      <ellipse cx="600" cy="300" rx="260" ry="120" fill="#ff7a9c" opacity=".06" />
    </Svg>
  );
}

// 6 · Космічна місія: край планети, ракета і траєкторії-графіки
export function Space() {
  return (
    <Svg>
      <ellipse cx="600" cy="640" rx="900" ry="300" fill="#10203f" />
      <ellipse cx="600" cy="640" rx="900" ry="300" fill="none" stroke="#6ef0ff" strokeOpacity=".5" strokeWidth="3" />
      <path d="M80 380 C 300 380, 420 120, 760 100" stroke="#6ef0ff" strokeWidth="3" fill="none" strokeDasharray="12 10" />
      <path d="M200 400 Q 600 -40 1000 400" stroke="#ff7ad9" strokeWidth="2.5" fill="none" strokeDasharray="6 10" opacity=".8" />
      <path d="M100 300 C 300 260, 500 340, 700 300 S 1000 260, 1150 300" stroke="#a8ff7a" strokeWidth="2" fill="none" strokeDasharray="4 8" opacity=".7" />
      <circle cx="980" cy="150" r="40" fill="#c59bff" />
      <ellipse cx="980" cy="150" rx="70" ry="14" fill="none" stroke="#e6ddff" strokeWidth="4" transform="rotate(-18 980 150)" />
      <g transform="translate(760 100) rotate(60)">
        <path d="M0 -40 C 14 -24, 14 10, 10 30 L -10 30 C -14 10, -14 -24, 0 -40 Z" fill="#e8f4ff" />
        <circle cy="-8" r="6" fill="#6ef0ff" />
        <path d="M-10 18 L -22 34 L -10 30 Z M10 18 L 22 34 L 10 30 Z" fill="#ff7ad9" />
        <path d="M-7 31 L 0 52 L 7 31 Z" fill="#ffd27a" />
      </g>
    </Svg>
  );
}

// 7 · Залізниця винахідниці: мідні пагорби, віадук, паротяг і шестерні
export function Train() {
  const gear = (cx, cy, r, key) => (
    <g key={key} transform={`translate(${cx} ${cy})`}>
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x="-6" y={-r - 10} width="12" height="14" fill="#b4683a" transform={`rotate(${i * 36})`} />)}
      <circle r={r} fill="#b4683a" />
      <circle r={r * 0.35} fill="#2a160d" />
    </g>
  );
  return (
    <Svg>
      {gear(130, 150, 55, 'g1')}
      {gear(215, 95, 32, 'g2')}
      <path d="M0 300 C 200 250, 350 290, 500 270 S 900 240, 1200 280 L1200 420 L0 420Z" fill="#5a2e1a" />
      {/* віадук */}
      <rect x="250" y="250" width="800" height="16" fill="#8a4a2a" />
      {[300, 420, 540, 660, 780, 900, 1020].map((x) => <path key={x} d={`M${x - 50} 266 L${x + 50} 266 L${x + 50} 420 L${x + 34} 420 Q ${x} 330 ${x - 34} 420 L${x - 50} 420 Z`} fill="#6e3a22" />)}
      {/* паротяг */}
      <g transform="translate(560 190)">
        <rect x="0" y="20" width="120" height="40" rx="8" fill="#2a160d" />
        <rect x="90" y="-10" width="60" height="70" rx="6" fill="#3a1f12" />
        <rect x="102" y="2" width="36" height="22" fill="#ffc46b" />
        <rect x="20" y="-6" width="18" height="28" fill="#2a160d" />
        <rect x="160" y="30" width="90" height="30" rx="4" fill="#3a1f12" />
        {[25, 70, 120, 185, 230].map((x) => <circle key={x} cx={x} cy="62" r="14" fill="#c98a4a" stroke="#2a160d" strokeWidth="4" />)}
        <circle cx="0" cy="40" r="10" fill="#ffd98a" />
      </g>
      {[[580, 170, 22], [550, 140, 30], [500, 110, 38], [430, 90, 44]].map(([x, y, r]) => <circle key={x} cx={x} cy={y} r={r} fill="#f4e3cf" opacity=".55" />)}
      <path d="M0 370 C 300 350, 600 390, 1200 360 L1200 420 L0 420Z" fill="#3a1d10" />
    </Svg>
  );
}

// 8 · Карпати: шари гір, ялиці, метеостанція з флюгером
export function Mountains() {
  const fir = (x, y, s, key) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${s})`} fill="#0f2a1c">
      <path d="M0 -70 L 18 -36 L 9 -36 L 24 -10 L -24 -10 L -9 -36 L -18 -36 Z" />
      <rect x="-3" y="-10" width="6" height="10" />
    </g>
  );
  return (
    <Svg>
      <path d="M0 260 L150 170 L260 230 L420 110 L560 220 L700 140 L860 230 L1000 150 L1200 250 L1200 420 L0 420Z" fill="#3c5a6b" />
      <path d="M420 110 L455 140 L430 135 L410 150 L395 130 Z M700 140 L730 165 L705 160 L690 172 L678 156 Z" fill="#e8f1f5" />
      <path d="M0 320 L200 240 L360 300 L520 230 L720 310 L900 240 L1200 320 L1200 420 L0 420Z" fill="#24443a" />
      <path d="M0 370 C 300 330, 600 360, 900 340 S 1100 350, 1200 360 L1200 420 L0 420Z" fill="#16301f" />
      {[[80, 380, 1], [130, 392, 0.8], [960, 376, 1.1], [1020, 388, 0.8], [1090, 380, 1]].map(([x, y, s], i) => fir(x, y, s, i))}
      {/* метеостанція */}
      <g transform="translate(560 300)">
        <rect x="0" y="0" width="90" height="60" fill="#e8dcc6" />
        <path d="M-10 4 L45 -30 L100 4 Z" fill="#8a3b2a" />
        <rect x="30" y="20" width="24" height="24" fill="#ffd27a" />
        <rect x="120" y="-60" width="4" height="120" fill="#e8dcc6" />
        <path d="M108 -60 L136 -60" stroke="#e8dcc6" strokeWidth="3" />
        {[108, 136].map((x) => <circle key={x} cx={x} cy="-60" r="6" fill="#8fe0a8" />)}
      </g>
      <g fill="#ffffff" opacity=".75">
        <ellipse cx="260" cy="120" rx="70" ry="20" /><ellipse cx="300" cy="105" rx="40" ry="22" />
        <ellipse cx="900" cy="90" rx="60" ry="16" /><ellipse cx="930" cy="78" rx="34" ry="18" />
      </g>
    </Svg>
  );
}

// 9 · Кришталеві печери: арка, сталактити, кристали-многогранники
export function Cave() {
  const crystal = (x, h, w, c, key) => (
    <g key={key}>
      <polygon points={`${x - w / 2},420 ${x - w / 2},${420 - h * 0.7} ${x},${420 - h} ${x + w / 2},${420 - h * 0.7} ${x + w / 2},420`} fill={c} opacity=".85" />
      <polygon points={`${x},${420 - h} ${x + w / 2},${420 - h * 0.7} ${x + w / 2},420 ${x},420`} fill="#000" opacity=".18" />
    </g>
  );
  return (
    <Svg>
      <path d="M0 0 L1200 0 L1200 420 L1080 420 C 1060 200, 900 80, 600 80 C 300 80, 140 200, 120 420 L0 420Z" fill="#120a24" />
      {[[260, 60], [380, 40], [520, 30], [690, 45], [820, 35], [940, 55]].map(([x, h]) => <path key={x} d={`M${x - 14} 90 L${x} ${90 + h} L${x + 14} 90 Z`} fill="#1d1236" />)}
      <ellipse cx="600" cy="420" rx="420" ry="90" fill="#c59bff" opacity=".12" />
      {[[230, 150, 50, '#8f6bff'], [300, 90, 36, '#4fd1c5'], [420, 200, 60, '#c59bff'], [520, 120, 40, '#6ef0ff'], [690, 240, 70, '#b07bff'], [800, 130, 44, '#4fd1c5'], [900, 180, 56, '#8f6bff'], [980, 100, 34, '#c59bff']].map(([x, h, w, c], i) => crystal(x, h, w, c, i))}
      <path d="M0 400 C 300 390, 900 396, 1200 402 L1200 420 L0 420Z" fill="#0b0618" />
    </Svg>
  );
}
