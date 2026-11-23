import { useEffect, useState } from 'react';
import { Mail, CalendarDays, LogOut, NotebookPen, ArrowRight, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WORLDS } from '../quest/worlds';
import { loadCourse150, readQuestSave } from '../utils/course150';
import '../components/quest/quest.css';

// Профіль у стилі курсу: «посвідчення мандрівника» з печатками дев'яти світів математики.
const ARTIFACT_AT = 10; // як на сторінці курсу й у журналі: 10 з 14 знаків — артефакт знайдено

function worldStamps(course, uid) {
  return WORLDS.map((w) => {
    const block = course?.blocks.find((b) => b.number === w.block);
    const topics = block?.topics || [];
    let found = 0;
    let started = false;
    topics.forEach((t) => {
      const save = readQuestSave(uid, t.number);
      const lit = Object.values(save.runes || {}).filter(Boolean).length;
      if (lit >= ARTIFACT_AT) found += 1;
      if ((save.step || 0) > 0 || lit) started = true;
    });
    return { ...w, title: block?.title || '', found, total: topics.length, started };
  });
}

export default function Profile({ onNavigate }) {
  const { user, logout } = useAuth();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    loadCourse150().then(setCourse).catch(() => setCourse(null));
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  const avatar = user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.displayName || 'User') + '&size=128';
  const since = user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' }) : null;
  const stamps = worldStamps(course, user?.uid);
  const visited = stamps.filter((s) => s.started).length;

  return (
    <div className="quest min-h-screen overflow-x-clip">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8 font-sans">
        <p className="flex items-center gap-2 text-[var(--q-gold)] text-sm tracking-wide uppercase mb-3">Посвідчення мандрівника</p>

        <section className="rounded-3xl border border-[rgba(245,200,107,.35)] overflow-hidden shadow-[0_20px_60px_rgba(3,5,20,.5)]"
          style={{ background: 'linear-gradient(160deg, rgba(139,108,255,.16), rgba(10,14,40,.9) 45%, rgba(245,200,107,.08))' }}>
          <div className="p-5 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-7 text-center sm:text-left">
            <img src={avatar} alt={user?.displayName}
              className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover shrink-0 shadow-[0_0_0_3px_#0b1030,0_0_0_5px_rgba(245,200,107,.8),0_0_30px_rgba(245,200,107,.3)]" />
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#f1ebff] leading-tight" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
                {user?.displayName || 'Мандрівник'}
              </h1>
              <p className="text-[#cfc8ea] mt-1">Мандрівник світами математики · готується до НМТ</p>
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/5 border border-white/10 text-[#cfc8ea] max-w-full">
                  <Mail className="h-4 w-4 shrink-0" /><span className="truncate">{user?.email}</span>
                </span>
                {since && (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-white/5 border border-white/10 text-[#cfc8ea]">
                    <CalendarDays className="h-4 w-4" />У подорожі з {since}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 bg-[rgba(245,200,107,.14)] border border-[rgba(245,200,107,.4)] text-[var(--q-gold)] font-semibold" title="Бали за розв’язані завдання">
                  <Star className="h-4 w-4 fill-current" aria-hidden="true" />{user?.total_points || 0} балів
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-[rgba(245,200,107,.3)] px-5 sm:px-8 py-5 sm:py-6">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-[#f1ebff]">Печатки світів</h2>
              <span className="text-sm text-[#9a93b8]">відвідано {visited} з 9</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-9 gap-3">
              {stamps.map((s) => {
                const Icon = s.icon;
                const on = s.started;
                return (
                  <div key={s.block} className="flex flex-col items-center text-center" title={`Блок ${s.block}. ${s.title} — ${s.name}`}>
                    <span className={`grid place-items-center h-14 w-14 rounded-full border-2 ${on ? '' : 'border-dashed'}`}
                      style={{ borderColor: on ? s.color : 'rgba(201,197,230,.25)', color: on ? s.color : 'rgba(201,197,230,.35)',
                        background: on ? `${s.color}1f` : 'transparent', transform: on ? `rotate(${(s.block % 3) * 6 - 6}deg)` : 'none' }}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="mt-1.5 text-[11px] leading-tight text-[#cfc8ea]">Блок {s.block}</span>
                    <span className="text-[11px] leading-tight" style={{ color: on ? s.color : '#6f6a8f' }}>
                      {s.found ? <><Sparkles className="inline h-3 w-3 -mt-0.5" /> {s.found} з {s.total}</> : on ? 'почато' : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => onNavigate('journal')}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold bg-[var(--q-gold)] text-[#1a1206] hover:brightness-110">
            <NotebookPen className="h-5 w-5" />Журнал експедиції<ArrowRight className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[#fca5a5] border border-[rgba(252,165,165,.3)] hover:bg-[rgba(252,165,165,.08)]">
            <LogOut className="h-5 w-5" />Вийти з акаунту
          </button>
        </div>
      </div>
    </div>
  );
}
