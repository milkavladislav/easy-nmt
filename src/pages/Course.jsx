import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ModuleCard from '../components/ModuleCard';
import { Loader2, Compass } from 'lucide-react';

export default function Course({ onNavigate }) {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [modulesWithTopics, setModulesWithTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch modules
        const modulesQuery = query(collection(db, 'modules'), orderBy('order', 'asc'));
        const modulesSnapshot = await getDocs(modulesQuery);
        const modulesData = modulesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setModules(modulesData);

        // Fetch all topics ordered by 'order'
        const allTopicsQuery = query(collection(db, 'topics'), orderBy('order', 'asc'));
        const allTopicsSnapshot = await getDocs(allTopicsQuery);
        const allTopicsData = allTopicsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Group topics by module
        const modulesWithTopicsData = modulesData.map(module => ({
          ...module,
          topics: allTopicsData.filter(topic => topic.module_id === module.id)
        }));
        setModulesWithTopics(modulesWithTopicsData);
      } catch (err) {
        setError('Не вдалося завантажити модулі. Спробуйте ще раз.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTopicClick = (topic) => {
    onNavigate('topicDetails', topic);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b1f] bg-gradient-to-b from-[#0d1236] via-[#070b1f] to-[#070b1f] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-12 w-12 text-[#f5c86b] animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Завантаження модулів...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center animate-fade-in">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b1f] bg-gradient-to-b from-[#0d1236] via-[#070b1f] to-[#070b1f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="mb-10">
            <div className="bg-gradient-to-r from-orange-600/20 via-amber-600/20 to-yellow-600/20 backdrop-blur-xl rounded-3xl p-4 sm:p-8 border border-orange-500/30 shadow-2xl shadow-orange-500/10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-x-0 sm:space-x-4 mb-4">
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 sm:p-4 rounded-2xl shadow-lg mb-4 sm:mb-0">
                  <Compass className="h-8 w-8 sm:h-9 sm:w-9 text-amber-300" />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
                    Експедиція НМТ
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-lg">
                    Оберіть модуль для початку навчання
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-3 sm:px-6 py-3 sm:py-4 border border-white/20">
                  <p className="text-slate-300 text-xs sm:text-sm mb-1">Всього модулів</p>
                  <p className="text-xl sm:text-3xl font-bold text-white">{modules.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-3 sm:px-6 py-3 sm:py-4 border border-white/20">
                  <p className="text-slate-300 text-xs sm:text-sm mb-1">Всього тем</p>
                  <p className="text-xl sm:text-3xl font-bold text-white">{modulesWithTopics.reduce((sum, m) => sum + m.topics.length, 0)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-3 sm:px-6 py-3 sm:py-4 border border-white/20">
                  <p className="text-slate-300 text-xs sm:text-sm mb-1">Пройдено тем</p>
                  <p className="text-xl sm:text-3xl font-bold text-white">
                    {modulesWithTopics.reduce((sum, m) => 
                      sum + m.topics.filter(t => user?.completed_tests?.some(testId => testId.startsWith(t.id))).length, 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Modules Section */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Модулі</h2>
              <span className="text-slate-400 text-sm">{modules.length} модулів</span>
            </div>
            {modulesWithTopics.length === 0 ? (
              <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-sm p-16 rounded-3xl border border-orange-500/20 text-center">
                <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/20 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/30">
                  <Compass className="h-12 w-12 text-amber-300" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Модулів ще немає</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
                  Навчальні матеріали готуються. Скоро з'являться нові модулі!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {modulesWithTopics.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    topics={module.topics}
                    onTopicClick={handleTopicClick}
                    completedTests={user?.completed_tests || []}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
