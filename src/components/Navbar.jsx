import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Map, NotebookPen, Flag, Compass, Star } from 'lucide-react';
import { useState } from 'react';
import './navbar.css';

// Розділи сайту: назви прості й зрозумілі, а підказка пояснює їх мовою подорожі.
const LINKS = [
  { view: 'course', icon: Map, label: 'Курс', hint: 'Карта курсу: 9 світів математики', match: ['course', 'topic150', 'quest150', 'lesson150'] },
  { view: 'journal', icon: NotebookPen, label: 'Журнал експедиції', hint: 'Твій прогрес з математики й знайдені артефакти', match: ['journal'] },
  { view: 'nmt', icon: Flag, label: 'Тести НМТ', hint: 'Фінальна вершина: справжні тести НМТ', match: ['nmt', 'nmtTest'] },
];

export default function Navbar({ onNavigate, current }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const go = (view) => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  const avatar = user && (user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User'));
  const points = user?.total_points || 0;

  return (
    <nav className="k-nav">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <button type="button" className="flex items-center gap-3 text-left" onClick={() => go('course')}>
            <span className="k-brand-medal" aria-hidden="true"><Compass className="h-6 w-6" strokeWidth={2.2} /></span>
            <span className="flex flex-col">
              <span className="k-brand-title">Експедиція НМТ</span>
              <span className="k-brand-sub">Математика до НМТ<span className="hidden sm:inline"> · подорож 9 світами</span></span>
            </span>
          </button>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {LINKS.map(({ view, icon: Icon, label, hint, match }) => (
                <button key={view} type="button" title={hint} onClick={() => go(view)}
                  className={`k-link ${match.includes(current) ? 'active' : ''}`}>
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{label}</span>
                </button>
              ))}
              <div className="w-px h-8 bg-white/10 mx-2" />
              <div className="k-traveler" onClick={() => go('profile')} title="Профіль мандрівника">
                <img src={avatar} alt={user.displayName} />
                <span className="k-points" title="Бали за розв’язані завдання">
                  <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />{points}
                </span>
              </div>
              <button type="button" onClick={handleLogout} className="k-logout ml-2" title="Вийти" aria-label="Вийти">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {user && (
            <div className="md:hidden flex items-center gap-2">
              <span className="k-points" title="Бали за розв’язані завдання"><Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />{points}</span>
              <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Меню"
                className="text-[#f8dfa4] p-2 rounded-lg hover:bg-white/5 transition-colors">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {user && mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0b0f2a]/95 backdrop-blur-sm">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[rgba(139,108,255,.35)] bg-[rgba(139,108,255,.1)] cursor-pointer" onClick={() => go('profile')}>
              <img src={avatar} alt={user.displayName} className="h-10 w-10 rounded-full ring-2 ring-[#f5c86b]" />
              <div className="min-w-0">
                <p className="text-white font-medium truncate">{user.displayName}</p>
                <p className="text-[#b9b4d8] text-sm truncate">Мандрівник · {points} балів</p>
              </div>
            </div>
            {LINKS.map(({ view, icon: Icon, label, hint, match }) => (
              <button key={view} type="button" onClick={() => go(view)}
                className={`k-link mobile ${match.includes(current) ? 'active' : ''}`}>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex flex-col items-start">
                  <span>{label}</span>
                  <span className="text-xs text-[#8f8ab0] font-normal">{hint}</span>
                </span>
              </button>
            ))}
            <button type="button" onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-[#fca5a5] px-4 py-3 rounded-xl border border-[rgba(252,165,165,.3)] hover:bg-[rgba(252,165,165,.08)] transition-colors">
              <LogOut className="h-5 w-5" />
              <span>Вийти</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
