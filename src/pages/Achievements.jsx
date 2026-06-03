import { useAuth } from '../context/AuthContext';
import { Award, Trophy, Star, Lock, Target, Zap, Flame, Crown, BookOpen } from 'lucide-react';

export default function Achievements({ onNavigate }) {
  const { user } = useAuth();

  const achievements = [
    {
      id: 'first_test',
      icon: Trophy,
      title: 'Перший крок',
      description: 'Пройдіть свій перший тест',
      unlocked: (user?.completed_tests?.length || 0) >= 1,
      color: 'violet',
      gradient: 'from-violet-500 to-fuchsia-500'
    },
    {
      id: 'five_tests',
      icon: Star,
      title: 'Студент',
      description: 'Пройдіть 5 тестів',
      unlocked: (user?.completed_tests?.length || 0) >= 5,
      color: 'fuchsia',
      gradient: 'from-fuchsia-500 to-pink-500'
    },
    {
      id: 'ten_tests',
      icon: Award,
      title: 'Відмінник',
      description: 'Пройдіть 10 тестів',
      unlocked: (user?.completed_tests?.length || 0) >= 10,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'perfect_score',
      icon: Crown,
      title: 'Ідеальний результат',
      description: 'Отримайте 100% у тесті',
      unlocked: false,
      color: 'yellow',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'hundred_points',
      icon: Target,
      title: 'Сотка',
      description: 'Заробіть 100 балів',
      unlocked: (user?.total_points || 0) >= 100,
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'five_hundred_points',
      icon: Zap,
      title: 'Майстер',
      description: 'Заробіть 500 балів',
      unlocked: (user?.total_points || 0) >= 500,
      color: 'orange',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'module1_complete',
      icon: BookOpen,
      title: 'Майстер чисел',
      description: 'Завершіть модуль "Базова математика"',
      unlocked: (user?.completed_modules || []).includes('module1'),
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      id: 'module2_complete',
      icon: BookOpen,
      title: 'Функціональний гений',
      description: 'Завершіть модуль "Рівняння та функції"',
      unlocked: (user?.completed_modules || []).includes('module2'),
      color: 'fuchsia',
      gradient: 'from-fuchsia-500 to-pink-500'
    },
    {
      id: 'module3_complete',
      icon: BookOpen,
      title: 'Аналітик',
      description: 'Завершіть модуль "Розширена алгебра"',
      unlocked: (user?.completed_modules || []).includes('module3'),
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'module4_complete',
      icon: BookOpen,
      title: 'Ймовірнісний експерт',
      description: 'Завершіть модуль "Комбінаторика"',
      unlocked: (user?.completed_modules || []).includes('module4'),
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      id: 'module5_complete',
      icon: BookOpen,
      title: 'Геометр',
      description: 'Завершіть модуль "Планіметрія"',
      unlocked: (user?.completed_modules || []).includes('module5'),
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 'module6_complete',
      icon: BookOpen,
      title: 'Стереометр',
      description: 'Завершіть модуль "Стереометрія"',
      unlocked: (user?.completed_modules || []).includes('module6'),
      color: 'rose',
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      id: 'all_modules_complete',
      icon: Crown,
      title: 'Магістр НМТ',
      description: 'Завершіть усі 6 модулів',
      unlocked: (user?.completed_modules || []).length >= 6,
      color: 'yellow',
      gradient: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'streak',
      icon: Flame,
      title: 'Серія',
      description: 'Пройдіть тести 7 днів поспіль',
      unlocked: false,
      color: 'rose',
      gradient: 'from-rose-500 to-pink-500'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Досягнення
          </h1>

          {/* Progress Overview */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-8 mb-8 animate-slide-up shadow-2xl shadow-violet-500/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Ваш прогрес</h2>
                <p className="text-slate-400">Розблоковано {unlockedCount} з {totalCount} досягнень</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-violet-400">{progress}%</p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`bg-gradient-to-br ${achievement.unlocked ? 'from-slate-800/50 to-slate-900/50' : 'from-slate-900/30 to-slate-950/30'} backdrop-blur-xl rounded-3xl p-6 border ${achievement.unlocked ? `border-${achievement.color}-500/20 hover:border-${achievement.color}-500/40` : 'border-slate-700/50'} transition-all duration-300 hover:scale-105 hover:shadow-xl ${achievement.unlocked ? `hover:shadow-${achievement.color}-500/10` : ''} animate-slide-up`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className={`flex items-center justify-center mb-4 ${achievement.unlocked ? '' : 'opacity-30'}`}>
                  <div className={`bg-gradient-to-r ${achievement.gradient} p-4 rounded-2xl shadow-lg`}>
                    <achievement.icon className={`h-8 w-8 text-white`} />
                  </div>
                </div>
                
                <h3 className={`text-lg font-bold text-white mb-2 ${achievement.unlocked ? '' : 'opacity-50'}`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-4 ${achievement.unlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                  {achievement.description}
                </p>

                {achievement.unlocked ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-semibold">Розблоковано</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">Заблоковано</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Motivation */}
          <div className="mt-8 bg-gradient-to-r from-violet-600/20 via-fuchsia-600/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-violet-500/30 p-8 text-center animate-slide-up" style={{ animationDelay: '1s' }}>
            <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Продовжуйте вчитися!</h3>
            <p className="text-slate-300">
              Пройдіть більше тестів, щоб розблокувати нові досягнення та стати найкращим студентом НМТ!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
