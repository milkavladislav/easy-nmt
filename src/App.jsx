import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
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
        return <Course onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />;
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
        return <NMTTestRunner test={viewData} onNavigate={handleNavigate} />;
      default:
        return <Course onNavigate={handleNavigate} onOpenDovidnik={handleOpenDovidnik} />;
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
