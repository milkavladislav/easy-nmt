import { useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathContent({ html, className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !html) return;

    const elements = containerRef.current.querySelectorAll('[data-latex]');
    elements.forEach((el) => {
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
  }, [html]);

  if (!html) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
