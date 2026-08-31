import { ArrowLeft, Play, Loader2, BookOpen } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function TopicDetails({ topic, onNavigate, onOpenDovidnik }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        setError(null);
        const testsQuery = query(collection(db, 'tests'), where('topic_id', '==', topic.id));
        const querySnapshot = await getDocs(testsQuery);
        const testsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTests(testsData);
      } catch (err) {
        setError('Не вдалося завантажити тести. Спробуйте ще раз.');
        console.error('Error fetching tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [topic.id]);

  const handleStartTest = (test) => {
    onNavigate('quiz', { topic, test, moduleId: topic.module_id });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-12 w-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Завантаження деталей теми...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md text-center animate-fade-in">
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
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => onNavigate('course')}
            className="flex items-center space-x-2 text-slate-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="text-sm sm:text-base">Повернутися до курсу</span>
          </button>
          <button
            onClick={onOpenDovidnik}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/25"
          >
            <BookOpen className="h-4 sm:h-5 w-4 sm:w-5" />
            <span className="text-xs sm:text-sm font-medium">Довідник</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl rounded-3xl border border-orange-500/20 overflow-hidden mb-8 animate-slide-up shadow-2xl shadow-orange-500/10">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-4 sm:p-8">
            <span className="text-3xl sm:text-4xl mb-4 block">🐱</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{topic.title}</h1>
            <p className="text-orange-200 text-sm sm:text-base">Тема #{topic.order}</p>
          </div>
          
          <div className="p-4 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Теорія</h2>
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {topic.content}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Практичні тести</h2>
          {tests.length === 0 ? (
            <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-orange-500/20 text-center">
              <Play className="h-10 sm:h-12 w-10 sm:w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 text-sm sm:text-base">Практичні тести для цієї теми ще недоступні.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {tests.map((test, index) => (
                <div
                  key={test.id}
                  className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 animate-slide-up"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-white">Практичний тест</h3>
                    <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-orange-500/30">
                      <span className="text-orange-400 text-xs sm:text-sm font-medium">
                        {test.questions?.length || 0} питань
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-400 text-xs sm:text-sm mb-4 leading-relaxed">
                    Перевірте свої знання за допомогою {test.questions?.length || 0} питань з вибором відповіді
                  </p>
                  
                  <button
                    onClick={() => handleStartTest(test)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 text-sm sm:text-base"
                  >
                    <Play className="h-4 sm:h-5 w-4 sm:w-5" />
                    <span>Почати тест</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
