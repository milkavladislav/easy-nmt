import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, CheckCircle2, Trophy } from 'lucide-react';

export default function ModuleCard({ module, topics, onTopicClick, completedTests }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedTopicsCount = topics.filter(topic => 
    completedTests.some(testId => testId.startsWith(topic.id))
  ).length;

  const totalTopicsCount = topics.length;
  const progress = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;
  const isModuleCompleted = progress === 100 && totalTopicsCount > 0;

  const colorClasses = {
    orange: {
      bg: 'from-orange-500/20 to-amber-500/20',
      border: 'border-orange-500/30',
      hover: 'hover:border-orange-500/50',
      text: 'text-orange-400',
      icon: 'bg-orange-500/20',
      progress: 'from-orange-500 to-amber-500'
    },
    amber: {
      bg: 'from-amber-500/20 to-yellow-500/20',
      border: 'border-amber-500/30',
      hover: 'hover:border-amber-500/50',
      text: 'text-amber-400',
      icon: 'bg-amber-500/20',
      progress: 'from-amber-500 to-yellow-500'
    },
    yellow: {
      bg: 'from-yellow-500/20 to-orange-500/20',
      border: 'border-yellow-500/30',
      hover: 'hover:border-yellow-500/50',
      text: 'text-yellow-400',
      icon: 'bg-yellow-500/20',
      progress: 'from-yellow-500 to-orange-500'
    },
    cream: {
      bg: 'from-orange-100/10 to-amber-100/10',
      border: 'border-orange-200/30',
      hover: 'hover:border-orange-200/50',
      text: 'text-orange-200',
      icon: 'bg-orange-100/20',
      progress: 'from-orange-200 to-amber-200'
    },
    black: {
      bg: 'from-slate-800/50 to-slate-900/50',
      border: 'border-slate-600/30',
      hover: 'hover:border-slate-500/50',
      text: 'text-slate-300',
      icon: 'bg-slate-700/50',
      progress: 'from-slate-600 to-slate-700'
    },
    white: {
      bg: 'from-white/10 to-slate-100/10',
      border: 'border-white/30',
      hover: 'hover:border-white/50',
      text: 'text-white',
      icon: 'bg-white/20',
      progress: 'from-white to-slate-200'
    }
  };

  const colors = colorClasses[module.color] || colorClasses.orange;

  return (
    <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl rounded-3xl border ${colors.border} ${colors.hover} transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-${module.color}-500/10 animate-slide-up`}>
      {/* Module Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`text-4xl`}>{module.icon || '🐱'}</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
              <p className="text-slate-400 text-sm">{module.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isModuleCompleted && (
              <div className="flex items-center space-x-1 bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
                <span className="text-lg">🎉</span>
                <span className="text-green-400 text-xs font-semibold">Завершено</span>
              </div>
            )}
            <div className={`p-2 rounded-lg ${colors.icon} ${colors.text} transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between mb-2">
            <span className="text-slate-400 text-sm">Прогрес</span>
            <span className={`${colors.text} font-semibold text-sm`}>{completedTopicsCount}/{totalTopicsCount} тем</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${colors.progress} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Topics */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-700/50 pt-4">
          <div className="space-y-3">
            {topics.map((topic, index) => {
              const isCompleted = completedTests.some(testId => testId.startsWith(topic.id));
              return (
                <div
                  key={topic.id}
                  onClick={() => onTopicClick(topic)}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30 hover:border-green-500/50' 
                      : 'bg-slate-700/50 border-slate-600 hover:border-orange-500/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : colors.icon}`}>
                      {isCompleted ? (
                        <span className="text-xl">😺</span>
                      ) : (
                        <span className="text-xl">🐾</span>
                      )}
                    </div>
                    <div>
                      <p className={`font-semibold ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                        {topic.title}
                      </p>
                      <p className="text-slate-400 text-xs">Тема {topic.order}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
