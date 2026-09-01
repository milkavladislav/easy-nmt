import { useRef, useLayoutEffect } from 'react';
import katex from 'katex';
import renderMathInElement from 'katex/dist/contrib/auto-render.mjs';
import 'katex/dist/katex.min.css';

// HTML вставляємо самі, а не через dangerouslySetInnerHTML: React звіряє пропси
// за ідентичністю обʼєкта, тому на кожному ре-рендері (наприклад, тік таймера)
// він переприсвоював innerHTML і стирав уже відрендерені формули KaTeX.
export default function MathContent({ html, className = '', style }) {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = html || '';
    if (!html) return;

    container.querySelectorAll('[data-latex]').forEach((el) => {
      const latex = el.getAttribute('data-latex');
      const type = el.getAttribute('data-type');
      if (!latex) return;

      try {
        katex.render(latex, el, {
          throwOnError: false,
          strict: false,
          displayMode: type === 'block-math'
        });
      } catch (err) {
        console.warn('KaTeX render error:', err);
      }
    });

    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false }
      ],
      ignoredClasses: ['katex'],
      throwOnError: false,
      strict: false
    });
  }, [html]);

  if (!html) return null;

  return <div ref={containerRef} className={className} style={style} />;
}
