// Долина Пірамід (світ блоку 2): сонце на заході, дюни, три піраміди, табір експедиції біля оазису.
// Статичний SVG, без анімацій — сторінка-список має бути легкою.
export function Pyramids() {
  const pyr = (x, base, h, key) => (
    <g key={key}>
      <polygon points={`${x - base / 2},400 ${x},${400 - h} ${x + base / 2},400`} fill="url(#dSun)" />
      <polygon points={`${x},${400 - h} ${x + base / 2},400 ${x + base * 0.12},400`} fill="url(#dShade)" />
      {[0.25, 0.5, 0.75].map((k) => (
        <line key={k} x1={x - (base / 2) * k} y1={400 - h * (1 - k)} x2={x + (base / 2) * k} y2={400 - h * (1 - k)} stroke="#7a3d1c" strokeOpacity=".25" strokeWidth="2" />
      ))}
    </g>
  );
  const palm = (x, y, s, key) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${s})`} fill="#2a140f">
      <path d="M0 0 C 4 -30, 2 -60, 8 -90 L 12 -90 C 7 -60, 9 -30, 6 0 Z" />
      <path d="M10 -90 C -10 -100, -30 -95, -42 -80 C -25 -88, -10 -88, 10 -88 Z" />
      <path d="M10 -90 C 30 -102, 50 -96, 60 -82 C 42 -90, 28 -90, 10 -88 Z" />
      <path d="M10 -90 C 0 -110, -20 -112, -30 -106 C -15 -104, 0 -100, 10 -89 Z" />
      <path d="M10 -90 C 22 -112, 40 -114, 48 -108 C 34 -104, 20 -100, 10 -89 Z" />
    </g>
  );
  return (
    <svg className="q-castle wide" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="dSun" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6b26b" />
          <stop offset="1" stopColor="#e08a4a" />
        </linearGradient>
        <linearGradient id="dShade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8a3f22" />
          <stop offset="1" stopColor="#5e2817" />
        </linearGradient>
        <linearGradient id="dDune1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c8743f" />
          <stop offset="1" stopColor="#9a4f2a" />
        </linearGradient>
        <linearGradient id="dDune2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d3a22" />
          <stop offset="1" stopColor="#3a1a14" />
        </linearGradient>
      </defs>
      <path d="M0 360 C 200 330, 380 350, 600 335 S 1000 325, 1200 345 L 1200 420 L 0 420 Z" fill="url(#dDune1)" opacity=".7" />
      {pyr(470, 330, 210, 'a')}
      {pyr(700, 250, 150, 'b')}
      {pyr(850, 150, 90, 'c')}
      <path d="M0 385 C 160 360, 330 395, 520 382 S 880 360, 1200 388 L 1200 420 L 0 420 Z" fill="url(#dDune2)" />
      {/* оазис і табір експедиції */}
      <ellipse cx="250" cy="402" rx="70" ry="7" fill="#4fd1c5" opacity=".55" />
      {palm(205, 404, 0.9, 'p1')}
      {palm(285, 406, 0.7, 'p2')}
      {palm(990, 404, 0.8, 'p3')}
      <polygon points="1040,406 1070,370 1100,406" fill="#e8d2b0" />
      <polygon points="1070,370 1100,406 1078,406" fill="#b89a74" />
      <line x1="1070" y1="370" x2="1070" y2="356" stroke="#3a1a14" strokeWidth="2" />
      <polygon points="1070,356 1086,361 1070,366" fill="#4fd1c5" />
    </svg>
  );
}
