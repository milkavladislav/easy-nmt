import { NotebookPen, Gift, Lock } from 'lucide-react';
import { WORLDS } from '../../quest/worlds';
import './quest.css';

// Початок сторінки курсу: історія подорожі крізь дев'ять світів і портали до кожного блоку.
export default function WorldsIntro({ course, topicsCount, ready, passed, openBlocks, onOpenJournal }) {
  const toBlock = (n) => document.getElementById(`block-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section className="quest q-embed q-bleed q-intro">
      <div className="q-intro-sky" aria-hidden="true" />
      <div className="relative z-[1] max-w-[1600px] mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-10 sm:pb-14">
        <p className="q-script text-2xl sm:text-3xl text-[var(--q-gold-soft)]">{course.title}</p>
        <h1 className="q-block-title text-4xl sm:text-6xl font-bold mt-1 leading-tight">Подорож крізь дев’ять світів</h1>
        <div className="text-lg sm:text-[21px] leading-snug font-medium text-[#f1ebff] mt-4 max-w-3xl space-y-3">
          <p>
            Усе починається вночі в старій школі чарів. Тарас здобуває там Кристал Числа — і кристал відчиняє портал.
            За ним ще вісім світів: пустеля пірамід, море під зорями, місто детективів, собор вітражів, космос,
            майстерня з паротягами, Карпати і, нарешті, кришталеві печери, де народився сам кристал.
          </p>
          <p className="text-[#cfc8ea]">
            У кожному світі — свій наставник, справжні задачі з НМТ і артефакт, що відкриває шлях далі.
            Мета подорожі — ≈18 тестових балів із 32.
          </p>
        </div>

        <div className="q-portals mt-7">
          {WORLDS.map((w) => {
            const open = openBlocks.has(w.block);
            const Icon = w.icon;
            return (
              <button key={w.block} type="button" onClick={() => toBlock(w.block)}
                className={`q-portal ${open ? 'open' : ''}`} style={{ '--w': w.color }}>
                <span className="q-portal-ring">
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  {!open && <span className="q-portal-lock sm:hidden"><Lock className="h-2.5 w-2.5" /></span>}
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] sm:text-sm text-[#cfc8ea]">Світ {w.block}</span>
                  <span className="block text-[13px] sm:text-base font-semibold text-[#f1ebff] leading-tight">{w.name}</span>
                  <span className={`${open ? 'block' : 'hidden sm:block'} text-[12px] sm:text-sm mt-0.5 leading-tight`} style={{ color: open ? w.color : '#9a93b8' }}>
                    {open ? w.artifact : <><Lock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />Портал зачинено</>}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          {[['Тем у подорожі', topicsCount], ['Уже доступно', ready], ['Тестів пройдено', passed]].map(([label, value]) => (
            <div key={label} className="q-intro-stat">
              <p className="text-[#cfc8ea] text-sm mb-1">{label}</p>
              <p className="text-3xl font-bold text-[var(--q-gold)]">{value}</p>
            </div>
          ))}
          <button onClick={onOpenJournal} className="q-intro-stat q-intro-btn flex items-center justify-center gap-2 font-semibold text-lg">
            <NotebookPen className="h-5 w-5" />Журнал експедиції
          </button>
        </div>

        <p className="mt-5 text-base text-[var(--q-gold-soft)] flex items-start gap-2">
          <Gift className="h-5 w-5 mt-0.5 shrink-0" />
          Безкоштовна проба: перший світ, блок 1 «{course.blocks[0].title}», відкритий після входу. Решта світів — у повному доступі.
        </p>
      </div>
    </section>
  );
}
