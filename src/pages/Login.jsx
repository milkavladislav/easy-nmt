import { useAuth } from '../context/AuthContext';
import { BookOpen, Trophy, Sparkles, Loader2, Mail, Lock, User } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Login() {
  const { signInWithGoogle, signIn, signUp, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (error && error.includes('вже зареєстрована')) {
      setIsLogin(true);
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(name, email, password);
      }
    } catch (err) {
      console.error('Email auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-6 rounded-3xl mb-8 ring-4 ring-violet-500/30 shadow-2xl shadow-violet-500/20 animate-pulse-slow">
            <BookOpen className="h-20 w-20 text-violet-400" />
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            Підготовка до НМТ
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Опануйте Національний мультипредметний тест за допомогою інтерактивних уроків, практичних тестів та гейміфікованого навчання
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl p-6 rounded-3xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Інтерактивні теми</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Повні теоретичні матеріали з усіх предметів</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl p-6 rounded-3xl border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Trophy className="h-7 w-7 text-violet-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Практичні тести</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Реалістичні тести з вибором відповіді та миттєвим зворотним зв'язком</p>
          </div>

          <div className="bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 backdrop-blur-xl p-6 rounded-3xl border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-fuchsia-500/10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-fuchsia-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Заробляйте бали</h3>
            <p className="text-slate-400 text-sm leading-relaxed">Гейміфіковане навчання з нагородами за прогрес</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-violet-500/20 max-w-md mx-auto animate-slide-up shadow-2xl shadow-violet-500/10" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Увійти' : 'Створити акаунт'}
          </h2>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше ім'я"
                  required={!isLogin}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Електронна пошта"
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white font-semibold px-6 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{isLogin ? 'Вхід...' : 'Реєстрація...'}</span>
                </>
              ) : (
                <span>{isLogin ? 'Увійти' : 'Зареєструватися'}</span>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-800/50 text-slate-400">або</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-slate-900/50 hover:bg-slate-900/80 text-white font-semibold px-6 py-4 rounded-2xl border border-slate-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Увійти через Google</span>
          </button>

          {error && (
            <div className="mt-4 p-4 bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-xl animate-fade-in">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-400">
            {isLogin ? 'Ще не маєте акаунта? ' : 'Вже маєте акаунт? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              {isLogin ? 'Зареєструватися' : 'Увійти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
