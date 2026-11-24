import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { pathFor, titleFor, resolvePath } from './router';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Course150 from './pages/Course150';
import Quest150 from './pages/Quest150';
import Topic150 from './pages/Topic150';
import Lesson150 from './pages/Lesson150';
import Profile from './pages/Profile';
import Journal from './pages/Journal';
import TopicDetails from './pages/TopicDetails';
import QuizView from './components/QuizView';
import NMT from './pages/NMT';
import NMTTestRunner from './components/NMTTestRunner';
import Navbar from './components/Navbar';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState(null); // null — адреса ще розбирається
  const [viewData, setViewData] = useState(null);

  const show = useCallback((view, data) => {
    setCurrentView(view);
    setViewData(data);
    document.title = titleFor(view, data);
    window.scrollTo(0, 0);
  }, []);

  const handleNavigate = (view, data = null) => {
    const path = pathFor(view, data);
    if (path && path !== window.location.pathname) window.history.pushState(null, '', path);
    show(view, data);
  };

  // адреса з браузера: перше відкриття сторінки й кнопки «назад / вперед»
  useEffect(() => {
    if (!user) return;
    let alive = true;
    const sync = () => resolvePath(window.location.pathname)
      .then((r) => {
        if (!alive) return;
        const path = pathFor(r.view, r.data);
        if (path && path !== window.location.pathname) window.history.replaceState(null, '', path);
        show(r.view, r.data);
      })
      .catch((err) => {
        console.error('route error:', err);
        if (alive) show('course', null);
      });
    sync();
    window.addEventListener('popstate', sync);
    return () => { alive = false; window.removeEventListener('popstate', sync); };
  }, [user, show]);

  if (!user) {
    return <Login />;
  }

  if (!currentView) {
    return (
      <div className="min-h-screen bg-[#070b1f] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-[#f5c86b] animate-spin" />
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'course':
        return <Course150 onNavigate={handleNavigate} />;
      case 'topic150':
        return <Topic150 topic={viewData} onNavigate={handleNavigate} />;
      case 'quest150':
        return <Quest150 topic={viewData} onNavigate={handleNavigate} />;
      case 'lesson150':
        return <Lesson150 topic={viewData} onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'journal':
        return <Journal onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'topicDetails':
        return <TopicDetails topic={viewData} onNavigate={handleNavigate} />;
      case 'quiz':
        return <QuizView topic={viewData.topic} test={viewData.test} moduleId={viewData.moduleId} onNavigate={handleNavigate} />;
      case 'nmt':
        return <NMT onNavigate={handleNavigate} />;
      case 'nmtTest':
        // з НМТ-тестів приходить сам тест; з курсу 150+ — { test, practice, exit }
        return viewData?.test
          ? <NMTTestRunner test={viewData.test} practice={viewData.practice} exit={viewData.exit} skin={viewData.skin} world={viewData.world} onNavigate={handleNavigate} />
          : <NMTTestRunner test={viewData} onNavigate={handleNavigate} />;
      default:
        return <Course150 onNavigate={handleNavigate} />;
    }
  };

  return (
    <div>
      {/* у квесті й квест-тесті блоку своя шапка з кнопкою «До курсу»; шапку сайту там ховає нерухоме небо */}
      {!(currentView === 'quest150' || viewData?.skin === 'quest') && <Navbar onNavigate={handleNavigate} current={currentView} />}
      {renderView()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
