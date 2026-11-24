import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, User, Compass, Eye, EyeOff, Map, Gem, Flag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { WORLDS } from '../quest/worlds';
import '../components/navbar.css'; // шрифт Cormorant Garamond

const SERIF = "font-['Cormorant_Garamond',serif]";
const FEATURES = [
  { icon: Map, title: 'Курс як подорож', text: '9 блоків математики — 9 світів: від чисел і виразів до стереометрії.' },
  { icon: Gem, title: 'Квести й артефакти', text: 'Розв’язуєш завдання теми — запалюєш знаки й знаходиш артефакт світу.' },
  { icon: Flag, title: 'Тести НМТ', text: 'Справжні варіанти НМТ з таймером і оцінкою за шкалою 200 балів.' },
];

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function Field({ icon: Icon, label, right, ...props }) {
  return (
    <label className="block">
      <span className="block text-sm text-[#c4bce6] mb-1.5">{label}</span>
      <span className="relative block">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#f5c86b]/60 pointer-events-none" />
        <input
          {...props}
          className="w-full bg-[#070b1f]/70 border border-[#f5c86b]/20 rounded-2xl pl-12 pr-12 py-3.5 text-[#f4ecdf] placeholder-[#f4ecdf]/30 focus:outline-none focus:border-[#f5c86b]/60 focus:ring-2 focus:ring-[#f5c86b]/15 transition-all"
        />
        {right}
      </span>
    </label>
  );
}

export default function Login() {
  const { signInWithGoogle, signIn, signUp, resetPassword, clearError, error } = useAuth();
  const [mode, setMode] = useState('login'); // login | signup | reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [resetSent, setResetSent] = useState(false);
  const [prevError, setPrevError] = useState(error);

  // пошта вже зареєстрована — одразу перемикаємо на вхід
  if (error !== prevError) {
    setPrevError(error);
    if (error && error.includes('вже зареєстрована')) setMode('login');
  }

  const switchMode = (m) => {
    setMode(m);
    setLocalError(null);
    setResetSent(false);
    clearError?.();
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    if (mode === 'signup') {
      if (!name.trim()) return setLocalError('Вкажіть ім’я — так ми звертатимемось до тебе в експедиції.');
      if (password.length < 6) return setLocalError('Пароль має містити щонайменше 6 символів.');
      if (password !== password2) return setLocalError('Паролі не збігаються.');
    }
    setLoading(true);
    try {
      if (mode === 'login') await signIn(email, password);
      else if (mode === 'signup') await signUp(name.trim(), email, password);
      else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const shownError = localError || error;
  const eye = (
    <button
      type="button"
      onClick={() => setShowPass((v) => !v)}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#c4bce6] hover:text-[#f5c86b] transition-colors"
      aria-label={showPass ? 'Сховати пароль' : 'Показати пароль'}
    >
      {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
  );
  const submitLabel = { login: 'Увійти', signup: 'Почати експедицію', reset: 'Надіслати посилання' }[mode];
  const loadingLabel = { login: 'Вхід...', signup: 'Реєстрація...', reset: 'Надсилаємо...' }[mode];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070b1f] via-[#0b1030] to-[#070b1f] text-[#f4ecdf] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(900px 500px at 85% -10%, rgba(139,108,255,.18), transparent 60%), radial-gradient(800px 500px at 0% 110%, rgba(245,200,107,.10), transparent 60%)' }} />

      <div className="relative w-full max-w-6xl grid lg:grid-cols-[minmax(0,1fr)_440px] gap-10 lg:gap-16 items-center animate-fade-in">
        {/* Ліва колонка — про експедицію */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-b from-[#f8d78a] to-[#c98a32] shadow-[0_0_30px_rgba(245,200,107,.35)]">
              <Compass className="h-8 w-8 text-[#1a1206]" />
            </span>
            <span className="text-left">
              <span className={`${SERIF} block text-2xl font-semibold text-[#f5c86b] leading-none`}>Експедиція НМТ</span>
              <span className="block text-xs text-[#c4bce6] mt-1">Математика до НМТ</span>
            </span>
          </div>

          <h1 className={`${SERIF} text-4xl sm:text-5xl xl:text-6xl font-semibold leading-[1.05] mb-4`}>
            Підготовка до НМТ з математики <span className="text-[#f5c86b]">як подорож дев’ятьма світами</span>
          </h1>
          <p className="text-[#c4bce6] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8">
            Уроки з теорією й розв’язаними прикладами, домашні завдання, квести для закріплення й тести у форматі НМТ — усе в одному маршруті.
          </p>

          {/* маршрут світів */}
          <div className="flex items-center justify-center lg:justify-start gap-1.5 sm:gap-2 mb-8 flex-wrap" aria-label="Дев’ять світів курсу">
            {WORLDS.map((w, i) => (
              <span key={w.block} className="flex items-center gap-1.5 sm:gap-2">
                <span
                  title={`Блок ${w.block}: ${w.name}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
                  style={{ background: `${w.color}1f`, boxShadow: `inset 0 0 0 1px ${w.color}88` }}
                >
                  <w.icon className="h-4 w-4" style={{ color: w.color }} />
                </span>
                {i < WORLDS.length - 1 && <span className="w-1.5 sm:w-3 lg:w-1.5 xl:w-3 border-t border-dashed border-[#f5c86b]/40" />}
              </span>
            ))}
          </div>

          <div className="hidden sm:grid sm:grid-cols-3 gap-4 text-left">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl p-4 bg-[#141a45]/60 border border-[#f5c86b]/15">
                <f.icon className="h-5 w-5 text-[#f5c86b] mb-2" />
                <p className="font-semibold mb-1">{f.title}</p>
                <p className="text-sm text-[#c4bce6] leading-snug">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Права колонка — форма */}
        <div className="w-full max-w-md mx-auto lg:max-w-none rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-[#161c4a]/95 to-[#0b1030]/95 border border-[#f5c86b]/25 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
          {mode === 'reset' ? (
            <>
              <button type="button" onClick={() => switchMode('login')} className="flex items-center gap-1.5 text-sm text-[#c4bce6] hover:text-[#f5c86b] mb-4">
                <ArrowLeft className="h-4 w-4" /> До входу
              </button>
              <h2 className={`${SERIF} text-3xl font-semibold text-[#f5c86b] mb-2`}>Відновити пароль</h2>
              <p className="text-sm text-[#c4bce6] mb-6">Вкажи пошту — надішлемо посилання, щоб задати новий пароль.</p>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 p-1 mb-6 rounded-2xl bg-[#070b1f]/70 border border-[#f5c86b]/15">
                {[['login', 'Вхід'], ['signup', 'Реєстрація']].map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === m ? 'bg-gradient-to-b from-[#f8d78a] to-[#e0a84a] text-[#1a1206] shadow' : 'text-[#c4bce6] hover:text-[#f4ecdf]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <h2 className={`${SERIF} text-3xl font-semibold text-[#f5c86b] mb-1`}>
                {mode === 'login' ? 'З поверненням!' : 'Вирушаймо в експедицію'}
              </h2>
              <p className="text-sm text-[#c4bce6] mb-6">
                {mode === 'login' ? 'Увійди, щоб продовжити маршрут з того місця, де зупинився.' : 'Створи акаунт — прогрес, бали й знахідки збережуться.'}
              </p>
            </>
          )}

          {resetSent ? (
            <div className="rounded-2xl p-4 bg-[#7ef0b4]/10 border border-[#7ef0b4]/30 text-sm flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#7ef0b4] shrink-0" />
              <p>Якщо акаунт з поштою <b>{email}</b> існує, ми надіслали лист із посиланням. Перевір також «Спам».</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <Field icon={User} label="Ім’я" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Як до тебе звертатись" autoComplete="name" required />
              )}
              <Field icon={Mail} label="Електронна пошта" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required />
              {mode !== 'reset' && (
                <Field
                  icon={Lock}
                  label="Пароль"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Щонайменше 6 символів' : 'Твій пароль'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  right={eye}
                />
              )}
              {mode === 'signup' && (
                <Field icon={Lock} label="Повтори пароль" type={showPass ? 'text' : 'password'} value={password2} onChange={(e) => setPassword2(e.target.value)} placeholder="Ще раз той самий пароль" autoComplete="new-password" required />
              )}
              {mode === 'login' && (
                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => switchMode('reset')} className="text-sm text-[#c4bce6] hover:text-[#f5c86b] transition-colors">
                    Забули пароль?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[#f8d78a] to-[#e0a84a] hover:from-[#fbe2a6] hover:to-[#eab45a] text-[#1a1206] font-semibold px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-[#f5c86b]/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <><Loader2 className="h-5 w-5 animate-spin" /><span>{loadingLabel}</span></> : <span>{submitLabel}</span>}
              </button>
            </form>
          )}

          {shownError && !resetSent && (
            <div className="mt-4 p-3.5 bg-red-500/10 border border-red-400/30 rounded-xl animate-fade-in">
              <p className="text-red-300 text-sm text-center">{shownError}</p>
            </div>
          )}

          {mode !== 'reset' && (
            <>
              <div className="flex items-center gap-3 my-6 text-sm text-[#c4bce6]/70">
                <span className="flex-1 border-t border-[#f5c86b]/15" />або<span className="flex-1 border-t border-[#f5c86b]/15" />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#f4ecdf] text-[#1f1f1f] font-semibold px-6 py-3.5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <GoogleIcon />
                <span>{mode === 'signup' ? 'Зареєструватися через Google' : 'Увійти через Google'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
