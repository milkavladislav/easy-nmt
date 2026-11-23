import { useState } from 'react';
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
  const [currentView, setCurrentView] = useState('course');
  const [viewData, setViewData] = useState(null);

  const handleNavigate = (view, data = null) => {
    setCurrentView(view);
    setViewData(data);
  };

  if (!user) {
    return <Login />;
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
          ? <NMTTestRunner test={viewData.test} practice={viewData.practice} exit={viewData.exit} skin={viewData.skin} onNavigate={handleNavigate} />
          : <NMTTestRunner test={viewData} onNavigate={handleNavigate} />;
      default:
        return <Course150 onNavigate={handleNavigate} />;
    }
  };

  return (
    <div>
      <Navbar onNavigate={handleNavigate} current={currentView} />
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
