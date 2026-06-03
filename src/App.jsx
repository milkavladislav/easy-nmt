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
        return <Course onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'statistics':
        return <Statistics onNavigate={handleNavigate} />;
      case 'achievements':
        return <Achievements onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'topicDetails':
        return <TopicDetails topic={viewData} onNavigate={handleNavigate} />;
      case 'quiz':
        return <QuizView topic={viewData.topic} test={viewData.test} onNavigate={handleNavigate} />;
      default:
        return <Course onNavigate={handleNavigate} />;
    }
  };

  return (
    <div>
      <Navbar onNavigate={handleNavigate} />
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
