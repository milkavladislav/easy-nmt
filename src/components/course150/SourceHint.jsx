import { useState } from 'react';

// Значок «?» біля умови: джерело задачі (ЗНО/НМТ, рік) показується при наведенні або дотику.
export default function SourceHint({ src, className = '', style, tipStyle }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <span className={`relative inline-flex align-middle ml-2 group ${className}`}>
      <button type="button" aria-label={`Джерело: ${src}`} onClick={() => setOpen((o) => !o)} onBlur={() => setOpen(false)}
        className="w-6 h-6 rounded-full border text-[13px] font-bold leading-none flex items-center justify-center opacity-70 hover:opacity-100 focus:opacity-100 transition-opacity"
        style={style}>?</button>
      <span role="tooltip"
        className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium shadow-lg pointer-events-none transition-opacity z-20 ${open ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={tipStyle}>{src}</span>
    </span>
  );
}
