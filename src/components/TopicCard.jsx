import { BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function TopicCard({ topic, onClick, completed, index = 0 }) {
  const colors = [
    'from-blue-500/20 to-cyan-500/20 border-blue-500/20 hover:border-blue-500/40',
    'from-violet-500/20 to-purple-500/20 border-violet-500/20 hover:border-violet-500/40',
    'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/20 hover:border-fuchsia-500/40',
    'from-emerald-500/20 to-teal-500/20 border-emerald-500/20 hover:border-emerald-500/40',
    'from-orange-500/20 to-amber-500/20 border-orange-500/20 hover:border-orange-500/40',
    'from-rose-500/20 to-red-500/20 border-rose-500/20 hover:border-rose-500/40',
  ];
  
  const colorClass = colors[index % colors.length];
  const iconColors = [
    'text-blue-400 bg-blue-500/20',
    'text-violet-400 bg-violet-500/20',
    'text-fuchsia-400 bg-fuchsia-500/20',
    'text-emerald-400 bg-emerald-500/20',
    'text-orange-400 bg-orange-500/20',
    'text-rose-400 bg-rose-500/20',
  ];
  const iconColorClass = iconColors[index % iconColors.length];
  
  return (
    <div
      onClick={() => onClick(topic)}
      className={`group bg-gradient-to-br ${colorClass} backdrop-blur-xl p-6 rounded-3xl border transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl animate-slide-up`}
      style={{ animationDelay: `${(index + 1) * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${iconColorClass}`}>
          <BookOpen className="h-7 w-7" />
        </div>
        {completed && (
          <div className="bg-green-500/20 px-3 py-1.5 rounded-full border border-green-500/30">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              <span className="text-green-400 text-xs font-semibold">Завершено</span>
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 group-hover:translate-x-1 transition-transform duration-300">
        {topic.title}
      </h3>
      
      <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">
        {topic.content?.substring(0, 100)}...
      </p>
      
      <div className="flex items-center text-white/80 text-sm font-medium group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
        <span>Почати навчання</span>
        <ChevronRight className="h-5 w-5 ml-1" />
      </div>
    </div>
  );
}
