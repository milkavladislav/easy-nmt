import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Course150 from './pages/Course150';
import Quest150 from './pages/Quest150';
import Topic150 from './pages/Topic150';
import Lesson150 from './pages/Lesson150';
import Profile from './pages/Profile';
import Statistics from './pages/Statistics';
import Achievements from './pages/Achievements';
import TopicDetails from './pages/TopicDetails';
import QuizView from './components/QuizView';
import NMT from './pages/NMT';
import NMTTestRunner from './components/NMTTestRunner';
import Navbar from './components/Navbar';
import Dovidnik from './components/Dovidnik';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('course');
  const [viewData, setViewData] = useState(null);
  const [showDovidnik, setShowDovidnik] = useState(false);

  const handleNavigate = (view, data = null) => {
    setCurrentView(view);
    setViewData(data);
  };

  const handleOpenDovidnik = () => {
    setShowDovidnik(true);
  };

  const handleCloseDovidnik = () => {
    setShowDovidnik(false);
  };

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'course':
        return <Course150 onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />;
      case 'topic150':
        return <Topic150 topic={viewData} onNavigate={handleNavigate} />;
      case 'quest150':
        return <Quest150 topic={viewData} onNavigate={handleNavigate} />;
      case 'lesson150':
        return <Lesson150 topic={viewData} onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'statistics':
        return <Statistics onNavigate={handleNavigate} />;
      case 'achievements':
        return <Achievements onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'topicDetails':
        return <TopicDetails topic={viewData} onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />;
      case 'quiz':
        return <QuizView topic={viewData.topic} test={viewData.test} moduleId={viewData.moduleId} onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />;
      case 'nmt':
        return <NMT onNavigate={handleNavigate} />;
      case 'nmtTest':
        // з НМТ-тестів приходить сам тест; з курсу 150+ — { test, practice, exit }
        return viewData?.test
          ? <NMTTestRunner test={viewData.test} practice={viewData.practice} exit={viewData.exit} skin={viewData.skin} onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />
          : <NMTTestRunner test={viewData} onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />;
      default:
        return <Course150 onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />;
    }
  };

  return (
    <div>
      <Navbar onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />
      {renderView()}
      {showDovidnik && <Dovidnik onClose={handleCloseDovidnik} />}
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
