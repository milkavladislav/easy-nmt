import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Trophy, LogOut, Edit2 } from 'lucide-react';
import { useState } from 'react';

export default function Profile({ onNavigate }) {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Помилка виходу:', error);
    }
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Тут можна додати логіку оновлення профілю в Firebase
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl border border-violet-500/20 overflow-hidden mb-8 shadow-2xl shadow-violet-500/10">
            <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 p-8 text-center">
              <div className="relative inline-block">
                <img
                  src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.displayName || 'User') + '&size=128'}
                  alt={user?.displayName}
                  className="h-32 w-32 rounded-full ring-4 ring-white/30 shadow-2xl mx-auto mb-4"
                />
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute bottom-4 right-0 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
                >
                  <Edit2 className="h-5 w-5 text-white" />
                </button>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-center w-64"
                  />
                ) : (
                  user?.displayName || 'Користувач'
                )}
              </h1>
              <p className="text-violet-200">{user?.email}</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 p-4 rounded-2xl border border-violet-500/20">
                  <div className="bg-violet-500/20 p-3 rounded-xl">
                    <User className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Ім'я</p>
                    <p className="text-white font-semibold">{user?.displayName || 'Користувач'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-gradient-to-r from-fuchsia-500/10 to-pink-500/10 p-4 rounded-2xl border border-fuchsia-500/20">
                  <div className="bg-fuchsia-500/20 p-3 rounded-xl">
                    <Mail className="h-6 w-6 text-fuchsia-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-4 rounded-2xl border border-blue-500/20">
                  <div className="bg-blue-500/20 p-3 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Дата реєстрації</p>
                    <p className="text-white font-semibold">
                      {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('uk-UA') : 'Невідомо'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 p-4 rounded-2xl border border-yellow-500/20">
                  <div className="bg-yellow-500/20 p-3 rounded-xl">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Загальні бали</p>
                    <p className="text-white font-semibold">{user?.total_points || 0}</p>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/25"
                  >
                    Зберегти
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
                  >
                    Скасувати
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 text-red-400 px-6 py-3 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Вийти з акаунту</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
