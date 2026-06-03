import { useAuth } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, Trophy, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function QuizView({ topic, test, onNavigate, moduleId }) {
  const { user, addPoints } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const questions = test.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const options = ['А', 'Б', 'В', 'Г', 'Д'];

  const handleOptionSelect = (optionIndex) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
    setShowResult(true);

    const isCorrect = optionIndex === currentQuestion.correct_option;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      handleTestComplete();
    }
  };

  const handleTestComplete = async () => {
    setCompleted(true);
    setLoading(true);
    setError(null);

    try {
      const totalPoints = questions.reduce((sum, q) => sum + (q.points_reward || 10), 0);
      const earnedPoints = score * (questions[0]?.points_reward || 10);
      
      // Fetch all topic IDs in the module for completion checking
      let topicIds = [];
      if (moduleId) {
        const topicsQuery = query(collection(db, 'topics'), where('module_id', '==', moduleId));
        const topicsSnapshot = await getDocs(topicsQuery);
        topicIds = topicsSnapshot.docs.map(doc => doc.id);
      }
      
      const awarded = await addPoints(earnedPoints, test.id, moduleId, topicIds);
      setPointsAwarded(awarded);
    } catch (err) {
      setError('Не вдалося нарахувати бали. Спробуйте ще раз.');
      console.error('Error awarding points:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTopic = () => {
    onNavigate('topicDetails', topic);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full animate-fade-in">
          <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl rounded-3xl border border-orange-500/20 overflow-hidden shadow-2xl shadow-orange-500/10">
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-8 text-center">
              <span className="text-5xl mb-4 block">🎉</span>
              <h2 className="text-3xl font-bold text-white mb-2">Тест завершено!</h2>
              <p className="text-orange-200">Чудова робота! Ви пройшли практичний тест</p>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-slate-400 mb-2">Ваш результат</p>
                <p className="text-5xl font-bold text-white mb-2">
                  {score} / {questions.length}
                </p>
                <p className="text-indigo-400">
                  {Math.round((score / questions.length) * 100)}% правильних відповідей
                </p>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <Loader2 className="h-8 w-8 text-violet-400 animate-spin mx-auto mb-2" />
                  <p className="text-slate-400">Збереження прогресу...</p>
                </div>
              ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              ) : pointsAwarded ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                  <p className="text-green-400 text-sm text-center">
                    Ви заробили {score * (questions[0]?.points_reward || 10)} балів!
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <p className="text-yellow-400 text-sm text-center">
                    Ви вже пройшли цей тест. Додаткові бали не нараховано.
                  </p>
                </div>
              )}

              <button
                onClick={handleBackToTopic}
                className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/25"
              >
                Повернутися до теми
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-12 w-12 text-orange-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Завантаження питання...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-amber-900 to-orange-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => onNavigate('topicDetails', topic)}
          className="flex items-center space-x-2 text-slate-400 hover:text-orange-400 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Повернутися до теми</span>
        </button>

        <div className="bg-gradient-to-br from-orange-800/50 to-amber-900/50 backdrop-blur-xl rounded-3xl border border-orange-500/20 overflow-hidden mb-6 animate-slide-up shadow-2xl shadow-orange-500/10">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-200 text-sm">Питання {currentQuestionIndex + 1} з {questions.length}</span>
              <span className="bg-gradient-to-r from-orange-500/30 to-amber-500/30 px-3 py-1 rounded-full text-white text-sm">
                {currentQuestion.points_reward || 10} балів
              </span>
            </div>
            <div className="w-full bg-orange-900/50 rounded-full h-2 mb-4">
              <div
                className="bg-gradient-to-r from-orange-400 to-amber-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === currentQuestion.correct_option;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={showResult}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                      showCorrect
                        ? 'bg-green-500/20 border-green-500'
                        : showIncorrect
                        ? 'bg-red-500/20 border-red-500'
                        : isSelected
                        ? 'bg-orange-500/20 border-orange-500'
                        : 'bg-slate-700/50 border-slate-600 hover:border-orange-500/50'
                    } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showIncorrect
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-600 text-slate-300'
                    }`}>
                      {options[index]}
                    </div>
                    <span className={`flex-1 text-left ${
                      showCorrect ? 'text-green-400' : showIncorrect ? 'text-red-400' : 'text-white'
                    }`}>
                      {option}
                    </span>
                    {showCorrect && <CheckCircle className="h-5 w-5 text-green-400" />}
                    {showIncorrect && <XCircle className="h-5 w-5 text-red-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showResult && (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-600 hover:via-amber-600 hover:to-yellow-600 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/25"
          >
            {currentQuestionIndex < questions.length - 1 ? 'Наступне питання' : 'Завершити тест'}
          </button>
        )}
      </div>
    </div>
  );
}
