import { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, Clock, Calendar, Play, Plus } from 'lucide-react';

const STORAGE_KEY = 'nmt-tests';

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const parts = [];
  if (h) parts.push(`${h} год`);
  if (m) parts.push(`${m} хв`);
  return parts.join(' ') || '0 хв';
}

export default function NMT({ onNavigate }) {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState(null);
  const [jsonText, setJsonText] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTests(JSON.parse(raw));
    } catch {
      setTests([]);
    }
  }, []);

  const saveTests = (next) => {
    setTests(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.title || !Array.isArray(data.questions) || data.questions.length === 0) {
          setError('Неправильний формат JSON. Потрібні поля title та questions.');
          return;
        }
        const test = {
          id: data.id || data.slug || Date.now().toString(),
          title: data.title,
          slug: data.slug || data.id,
          year: data.year || '',
          timeSeconds: data.timeSeconds || 0,
          questionCount: data.questionCount || data.questions.length,
          subject: data.subject || 'math',
          questions: data.questions
        };
        const next = [...tests, test];
        saveTests(next);
      } catch (err) {
        setError('Не вдалося прочитати JSON. Перевірте файл.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDelete = (id) => {
    const next = tests.filter((t) => t.id !== id);
    saveTests(next);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-5 rounded-3xl mb-6 ring-4 ring-violet-500/30 shadow-2xl shadow-violet-500/20">
            <FileText className="h-12 w-12 text-violet-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">НМТ тести</h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            Завантажуйте тести у форматі JSON та проходьте їх у своєму темпі.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl border border-violet-500/20 p-6 sm:p-8 mb-8 shadow-2xl shadow-violet-500/10 animate-slide-up">
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-violet-500/30"
          >
            <Plus className="h-5 w-5" />
            <span>Завантажити JSON</span>
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <p className="mt-4 text-slate-400 text-sm">
            Файл має містити поля: <code className="text-violet-300 bg-slate-900/50 px-1 rounded">title</code>,{' '}
            <code className="text-violet-300 bg-slate-900/50 px-1 rounded">questions</code> та опціонально{' '}
            <code className="text-violet-300 bg-slate-900/50 px-1 rounded">timeSeconds</code>.
          </p>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/30 rounded-3xl border border-slate-700 animate-fade-in">
            <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Ще не завантажено жодного тесту</p>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {tests.map((test) => (
              <div
                key={test.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-700 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-violet-500/40 transition-all duration-300 shadow-lg"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{test.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    {test.year && (
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>{test.year}</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1.5">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(test.timeSeconds)}</span>
                    </span>
                    <span>{test.questionCount} питань</span>
                    <span className="uppercase text-xs bg-slate-700/50 px-2 py-1 rounded-lg">{test.subject}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    onClick={() => onNavigate('nmtTest', test)}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-violet-500/25"
                  >
                    <Play className="h-4 w-4" />
                    <span>Почати</span>
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl border border-slate-700 hover:border-red-500/30 transition-all duration-300"
                    title="Видалити"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
