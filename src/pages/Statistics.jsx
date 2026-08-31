import { useAuth } from '../context/AuthContext';
import { Trophy, BookOpen, TrendingUp, Clock, Target, Award, Loader2 } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function Statistics({ onNavigate }) {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [modulesWithProgress, setModulesWithProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = [
    {
      icon: Trophy,
      label: 'Загальні бали',
      value: user?.total_points || 0,
      color: 'violet',
      gradient: 'from-violet-500/10 to-purple-500/10'
    },
    {
      icon: BookOpen,
      label: 'Завершені модулі',
      value: user?.completed_modules?.length || 0,
      color: 'fuchsia',
      gradient: 'from-fuchsia-500/10 to-pink-500/10'
    },
    {
      icon: TrendingUp,
      label: 'Середній бал',
      value: user?.total_points && user?.completed_tests?.length > 0 
        ? Math.round(user.total_points / user.completed_tests.length) 
        : 0,
      color: 'blue',
      gradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      icon: Clock,
      label: 'Час навчання',
      value: '--',
      color: 'emerald',
      gradient: 'from-emerald-500/10 to-teal-500/10'
    }
  ];

  const recentActivity = [
    { type: 'test', name: 'Тест з алгебри', score: '4/5', date: 'Сьогодні' },
    { type: 'test', name: 'Тест з орфографії', score: '5/5', date: 'Вчора' },
    { type: 'test', name: 'Тест з історії', score: '3/5', date: '2 дні тому' },
  ];

  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const modulesQuery = query(collection(db, 'modules'), orderBy('order', 'asc'));
        const modulesSnapshot = await getDocs(modulesQuery);
        const modulesData = modulesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setModules(modulesData);

        const modulesWithProgressData = await Promise.all(
          modulesData.map(async (module) => {
            const topicsQuery = query(collection(db, 'topics'), orderBy('order', 'asc'));
            const topicsSnapshot = await getDocs(topicsQuery);
            const topicsData = topicsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            const moduleTopics = topicsData.filter(t => t.module_id === module.id);
            const completedTopics = moduleTopics.filter(t => 
              user?.completed_tests?.some(testId => testId.startsWith(t.id))
            ).length;
            const progress = moduleTopics.length > 0 ? Math.round((completedTopics / moduleTopics.length) * 100) : 0;
            
            return {
              ...module,
              totalTopics: moduleTopics.length,
              completedTopics,
              progress
            };
          })
        );
        setModulesWithProgress(modulesWithProgressData);
      } catch (err) {
        console.error('Error fetching modules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-12 w-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Завантаження статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8 bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Статистика
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-${stat.color}-500/20 hover:border-${stat.color}-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-${stat.color}-500/10 animate-slide-up`}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <div className={`bg-${stat.color}-500/20 p-2 sm:p-3 rounded-lg sm:rounded-xl`}>
                    <stat.icon className={`h-4 w-4 sm:h-6 sm:w-6 text-${stat.color}-400`} />
                  </div>
                  <TrendingUp className={`h-3 w-3 sm:h-5 sm:w-5 text-${stat.color}-400`} />
                </div>
                <p className="text-slate-400 text-xs sm:text-sm mb-1">{stat.label}</p>
                <p className="text-white font-bold text-lg sm:text-2xl">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl rounded-3xl border border-orange-500/20 p-4 sm:p-8 mb-6 sm:mb-8 animate-slide-up shadow-2xl shadow-orange-500/10" style={{ animationDelay: '0.5s' }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Прогрес</h2>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-orange-500/30">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm sm:text-base">Загальний прогрес</span>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {modulesWithProgress.map((module) => {
                const colorClasses = {
                  orange: { text: 'text-orange-400', gradient: 'from-orange-500 to-amber-500' },
                  amber: { text: 'text-amber-400', gradient: 'from-amber-500 to-yellow-500' },
                  yellow: { text: 'text-yellow-400', gradient: 'from-yellow-500 to-orange-500' },
                  cream: { text: 'text-orange-200', gradient: 'from-orange-200 to-amber-200' },
                  black: { text: 'text-slate-300', gradient: 'from-slate-600 to-slate-700' },
                  white: { text: 'text-white', gradient: 'from-white to-slate-200' },
                  violet: { text: 'text-violet-400', gradient: 'from-violet-500 to-fuchsia-500' },
                  fuchsia: { text: 'text-fuchsia-400', gradient: 'from-fuchsia-500 to-pink-500' },
                  blue: { text: 'text-blue-400', gradient: 'from-blue-500 to-cyan-500' },
                  emerald: { text: 'text-emerald-400', gradient: 'from-emerald-500 to-teal-500' },
                  rose: { text: 'text-rose-400', gradient: 'from-rose-500 to-pink-500' }
                };
                const colors = colorClasses[module.color] || colorClasses.orange;
                
                return (
                  <div key={module.id}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300 text-sm sm:text-base">{module.title}</span>
                      <span className={`${colors.text} font-semibold text-sm sm:text-base`}>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 sm:h-3">
                      <div className={`bg-gradient-to-r ${colors.gradient} h-2 sm:h-3 rounded-full transition-all duration-500`} style={{ width: `${module.progress}%` }} />
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1">{module.completedTopics}/{module.totalTopics} тем</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl rounded-3xl border border-orange-500/20 p-4 sm:p-8 animate-slide-up shadow-2xl shadow-orange-500/10" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Остання активність</h2>
              <span className="text-2xl sm:text-3xl">🐾</span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600 hover:border-violet-500/50 transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="bg-orange-500/20 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                      <span className="text-lg sm:text-xl">🐾</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{activity.name}</p>
                      <p className="text-slate-400 text-xs sm:text-sm">{activity.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold text-base sm:text-lg">{activity.score}</p>
                    <p className="text-slate-400 text-xs sm:text-sm">Результат</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
