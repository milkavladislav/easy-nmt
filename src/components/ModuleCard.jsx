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
    violet: {
      bg: 'from-violet-500/20 to-purple-500/20',
      border: 'border-violet-500/30',
      hover: 'hover:border-violet-500/50',
      text: 'text-violet-400',
      icon: 'bg-violet-500/20',
      progress: 'from-violet-500 to-purple-500'
    },
    fuchsia: {
      bg: 'from-fuchsia-500/20 to-pink-500/20',
      border: 'border-fuchsia-500/30',
      hover: 'hover:border-fuchsia-500/50',
      text: 'text-fuchsia-400',
      icon: 'bg-fuchsia-500/20',
      progress: 'from-fuchsia-500 to-pink-500'
    },
    blue: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      hover: 'hover:border-blue-500/50',
      text: 'text-blue-400',
      icon: 'bg-blue-500/20',
      progress: 'from-blue-500 to-cyan-500'
    },
    emerald: {
      bg: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-500/30',
      hover: 'hover:border-emerald-500/50',
      text: 'text-emerald-400',
      icon: 'bg-emerald-500/20',
      progress: 'from-emerald-500 to-teal-500'
    },
    orange: {
      bg: 'from-orange-500/20 to-amber-500/20',
      border: 'border-orange-500/30',
      hover: 'hover:border-orange-500/50',
      text: 'text-orange-400',
      icon: 'bg-orange-500/20',
      progress: 'from-orange-500 to-amber-500'
    },
    rose: {
      bg: 'from-rose-500/20 to-pink-500/20',
      border: 'border-rose-500/30',
      hover: 'hover:border-rose-500/50',
      text: 'text-rose-400',
      icon: 'bg-rose-500/20',
      progress: 'from-rose-500 to-pink-500'
    }
  };

  const colors = colorClasses[module.color] || colorClasses.violet;

  return (
    <div className={`bg-gradient-to-br ${colors.bg} backdrop-blur-xl rounded-3xl border ${colors.border} ${colors.hover} transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-${module.color}-500/10 animate-slide-up`}>
      {/* Module Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`text-4xl`}>{module.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
              <p className="text-slate-400 text-sm">{module.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {isModuleCompleted && (
              <div className="flex items-center space-x-1 bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
                <Trophy className="h-4 w-4 text-green-400" />
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
                      : 'bg-slate-700/50 border-slate-600 hover:border-violet-500/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-500/20' : colors.icon}`}>
                      <BookOpen className={`h-5 w-5 ${isCompleted ? 'text-green-400' : colors.text}`} />
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
