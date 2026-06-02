import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TopicDetails from './pages/TopicDetails';
import QuizView from './components/QuizView';
import Navbar from './components/Navbar';

function AppContent() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
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
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'topicDetails':
        return <TopicDetails topic={viewData} onNavigate={handleNavigate} />;
      case 'quiz':
        return <QuizView topic={viewData.topic} test={viewData.test} onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
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
