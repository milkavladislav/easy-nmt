import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Trophy, BookOpen, BarChart3, Award } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onNavigate }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-2xl shadow-violet-500/10 border-b border-violet-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('course')}>
            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-2.5 rounded-xl shadow-lg shadow-violet-500/30">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Підготовка до НМТ</span>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user && (
              <>
                <button
                  onClick={() => onNavigate('course')}
                  className="flex items-center space-x-2 text-slate-400 hover:text-violet-400 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-violet-500/10"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Курс</span>
                </button>
                <button
                  onClick={() => onNavigate('statistics')}
                  className="flex items-center space-x-2 text-slate-400 hover:text-violet-400 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-violet-500/10"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Статистика</span>
                </button>
                <button
                  onClick={() => onNavigate('achievements')}
                  className="flex items-center space-x-2 text-slate-400 hover:text-violet-400 px-4 py-2 rounded-xl transition-all duration-300 hover:bg-violet-500/10"
                >
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Досягнення</span>
                </button>
                <div className="w-px h-8 bg-slate-700 mx-2" />
                <div className="flex items-center space-x-3 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-5 py-2.5 rounded-full border border-violet-500/30 hover:border-violet-500/50 transition-all duration-300 backdrop-blur-sm cursor-pointer" onClick={() => onNavigate('profile')}>
                  <img
                    src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User')}
                    alt={user.displayName}
                    className="h-9 w-9 rounded-full ring-2 ring-violet-400"
                  />
                  <div className="flex items-center space-x-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{user.total_points || 0}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 text-red-400 px-5 py-2.5 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Вийти</span>
                </button>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 backdrop-blur-sm border-t border-violet-500/20">
          <div className="px-4 py-4 space-y-3">
            {user && (
              <>
                <div className="flex items-center space-x-3 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 px-4 py-3 rounded-xl border border-violet-500/30 cursor-pointer" onClick={() => onNavigate('profile')}>
                  <img
                    src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User')}
                    alt={user.displayName}
                    className="h-10 w-10 rounded-full ring-2 ring-violet-400"
                  />
                  <div>
                    <p className="text-white font-medium">{user.displayName}</p>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('course')}
                  className="w-full flex items-center space-x-3 text-slate-400 hover:text-violet-400 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-violet-500/10"
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Курс</span>
                </button>
                <button
                  onClick={() => onNavigate('statistics')}
                  className="w-full flex items-center space-x-3 text-slate-400 hover:text-violet-400 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-violet-500/10"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="font-medium">Статистика</span>
                </button>
                <button
                  onClick={() => onNavigate('achievements')}
                  className="w-full flex items-center space-x-3 text-slate-400 hover:text-violet-400 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-violet-500/10"
                >
                  <Award className="h-5 w-5" />
                  <span className="font-medium">Досягнення</span>
                </button>
                <div className="flex items-center justify-between bg-gradient-to-r from-yellow-500/10 to-amber-500/10 px-4 py-3 rounded-xl border border-yellow-500/30">
                  <span className="text-white font-medium">Загальні бали</span>
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-lg">{user.total_points || 0}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 text-red-400 px-4 py-3 rounded-xl transition-all duration-300 border border-red-500/30"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Вийти</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
