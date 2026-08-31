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
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 'five_tests',
      icon: Star,
      title: 'Котик-початківець',
      description: 'Пройдіть 5 тестів',
      unlocked: (user?.completed_tests?.length || 0) >= 5,
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'ten_tests',
      icon: Award,
      title: 'Досвідчений кіт',
      description: 'Пройдіть 10 тестів',
      unlocked: (user?.completed_tests?.length || 0) >= 10,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'perfect_score',
      icon: Crown,
      title: 'Ідеальний кіт',
      description: 'Отримайте 100% у тесті',
      unlocked: false,
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 'hundred_points',
      icon: Target,
      title: 'Кот-мисливець',
      description: 'Заробіть 100 балів',
      unlocked: (user?.total_points || 0) >= 100,
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'five_hundred_points',
      icon: Zap,
      title: 'Кот-герой',
      description: 'Заробіть 500 балів',
      unlocked: (user?.total_points || 0) >= 500,
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'module1_complete',
      icon: BookOpen,
      title: 'Майстер чисел',
      description: 'Завершіть модуль "Базова математика"',
      unlocked: (user?.completed_modules || []).includes('module1'),
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 'module2_complete',
      icon: BookOpen,
      title: 'Функціональний кіт',
      description: 'Завершіть модуль "Рівняння та функції"',
      unlocked: (user?.completed_modules || []).includes('module2'),
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'module3_complete',
      icon: BookOpen,
      title: 'Кіт-аналітик',
      description: 'Завершіть модуль "Розширена алгебра"',
      unlocked: (user?.completed_modules || []).includes('module3'),
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'module4_complete',
      icon: BookOpen,
      title: 'Кіт-ймовірнісник',
      description: 'Завершіть модуль "Комбінаторика"',
      unlocked: (user?.completed_modules || []).includes('module4'),
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 'module5_complete',
      icon: BookOpen,
      title: 'Кіт-геометр',
      description: 'Завершіть модуль "Планіметрія"',
      unlocked: (user?.completed_modules || []).includes('module5'),
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      id: 'module6_complete',
      icon: BookOpen,
      title: 'Кіт-стереометр',
      description: 'Завершіть модуль "Стереометрія"',
      unlocked: (user?.completed_modules || []).includes('module6'),
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'all_modules_complete',
      icon: Crown,
      title: 'Кот-Магістр НМТ',
      description: 'Завершіть усі 6 модулів',
      unlocked: (user?.completed_modules || []).length >= 6,
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500'
    },
    {
      id: 'streak',
      icon: Flame,
      title: 'Котяча серія',
      description: 'Пройдіть тести 7 днів поспіль',
      unlocked: false,
      color: 'amber',
      gradient: 'from-amber-500 to-yellow-500'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progress = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-8 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Досягнення
          </h1>

          {/* Progress Overview */}
          <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl rounded-3xl border border-orange-500/20 p-4 sm:p-8 mb-6 sm:mb-8 animate-slide-up shadow-2xl shadow-orange-500/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Ваш прогрес</h2>
                <p className="text-slate-400 text-sm sm:text-base">Розблоковано {unlockedCount} з {totalCount} досягнень</p>
              </div>
              <div className="text-right w-full sm:w-auto">
                <p className="text-4xl sm:text-5xl font-bold text-orange-400">{progress}%</p>
              </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 sm:h-4">
              <div
                className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 h-2 sm:h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className={`bg-gradient-to-br ${achievement.unlocked ? 'from-slate-800/50 to-slate-900/50' : 'from-slate-900/30 to-slate-950/30'} backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 border ${achievement.unlocked ? `border-${achievement.color}-500/20 hover:border-${achievement.color}-500/40` : 'border-slate-700/50'} transition-all duration-300 hover:scale-105 hover:shadow-xl ${achievement.unlocked ? `hover:shadow-${achievement.color}-500/10` : ''} animate-slide-up`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className={`flex items-center justify-center mb-3 sm:mb-4 ${achievement.unlocked ? '' : 'opacity-30'}`}>
                  <div className={`bg-gradient-to-r ${achievement.gradient} p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg`}>
                    <achievement.icon className={`h-6 sm:h-8 w-6 sm:w-8 text-white`} />
                  </div>
                </div>

                <h3 className={`text-base sm:text-lg font-bold text-white mb-2 ${achievement.unlocked ? '' : 'opacity-50'}`}>
                  {achievement.title}
                </h3>

                <p className={`text-xs sm:text-sm mb-3 sm:mb-4 ${achievement.unlocked ? 'text-slate-400' : 'text-slate-500'}`}>
                  {achievement.description}
                </p>

                {achievement.unlocked ? (
                  <div className="flex items-center space-x-2 text-green-400">
                    <Award className="h-4 w-4" />
                    <span className="text-xs sm:text-sm font-semibold">Розблоковано</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Заблоковано</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Motivation */}
          <div className="mt-6 sm:mt-8 bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-600/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-orange-500/30 p-4 sm:p-8 text-center animate-slide-up" style={{ animationDelay: '1s' }}>
            <span className="text-4xl sm:text-5xl mb-4 block">🐱</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Продовжуйте вчитися!</h3>
            <p className="text-slate-300 text-sm sm:text-base">
              Пройдіть більше тестів, щоб розблокувати нові досягнення та стати найкращим котом-студентом НМТ!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
