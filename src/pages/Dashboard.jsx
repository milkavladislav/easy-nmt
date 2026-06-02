import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import TopicCard from '../components/TopicCard';
import { Trophy, User, Loader2, BookOpen, TrendingUp, Clock, Star } from 'lucide-react';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        const topicsQuery = query(collection(db, 'topics'), orderBy('order', 'asc'));
        const querySnapshot = await getDocs(topicsQuery);
        const topicsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTopics(topicsData);
      } catch (err) {
        setError('Не вдалося завантажити теми. Спробуйте ще раз.');
        console.error('Error fetching topics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  const handleTopicClick = (topic) => {
    onNavigate('topicDetails', topic);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-950 to-slate-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-12 w-12 text-violet-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Завантаження тем...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-primary-950 to-slate-950 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-10 animate-fade-in">
          <div className="bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 backdrop-blur-xl rounded-3xl p-8 border border-violet-500/30 shadow-2xl shadow-violet-500/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Вітаємо, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{user?.displayName?.split(' ')[0]}</span>! 👋
                </h1>
                <p className="text-slate-300 text-lg">Готові продовжити підготовку до НМТ?</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="text-slate-300 text-sm">Бали</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{user?.total_points || 0}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-5 w-5 text-fuchsia-400" />
                    <span className="text-slate-300 text-sm">Тести</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{user?.completed_tests?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500/20 p-3 rounded-xl">
                <User className="h-6 w-6 text-blue-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Профіль</p>
            <p className="text-white font-semibold text-lg truncate">{user?.displayName}</p>
          </div>

          <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-violet-500/10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-violet-500/20 p-3 rounded-xl">
                <Trophy className="h-6 w-6 text-violet-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-violet-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Загальні бали</p>
            <p className="text-white font-bold text-2xl">{user?.total_points || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-fuchsia-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-fuchsia-500/20 hover:border-fuchsia-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-fuchsia-500/10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-fuchsia-500/20 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-fuchsia-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-fuchsia-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Пройдені тести</p>
            <p className="text-white font-bold text-2xl">{user?.completed_tests?.length || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-emerald-400" />
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-slate-400 text-sm mb-1">Час навчання</p>
            <p className="text-white font-bold text-2xl">--</p>
          </div>
        </div>

        {/* Topics Section */}
        <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Теми для навчання</h2>
            <span className="text-slate-400 text-sm">{topics.length} доступно</span>
          </div>
          {topics.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm p-16 rounded-3xl border border-violet-500/20 text-center">
              <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-violet-500/30">
                <BookOpen className="h-12 w-12 text-violet-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Тем ще немає</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto text-lg">
                Навчальні матеріали готуються. Скоро з'являться нові теми!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-5 py-3 rounded-xl border border-blue-500/30">
                  <span className="text-blue-300 text-sm font-medium">📚 Математика</span>
                </div>
                <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 px-5 py-3 rounded-xl border border-violet-500/30">
                  <span className="text-violet-300 text-sm font-medium">🔬 Природничі науки</span>
                </div>
                <div className="bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 px-5 py-3 rounded-xl border border-fuchsia-500/30">
                  <span className="text-fuchsia-300 text-sm font-medium">📖 Українська мова</span>
                </div>
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-5 py-3 rounded-xl border border-emerald-500/30">
                  <span className="text-emerald-300 text-sm font-medium">🌍 Історія України</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic, index) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onClick={handleTopicClick}
                  completed={user?.completed_tests?.some(testId => testId.startsWith(topic.id))}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
