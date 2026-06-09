import { AnimatePresence } from 'framer-motion';
import { useApp } from './context/AppContext';
import ProgressIndicator from './components/ProgressIndicator';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import PersonalDetailsScreen from './components/PersonalDetailsScreen';
import DailyHealthLogScreen from './components/DailyHealthLogScreen';
import ConfirmationScreen from './components/ConfirmationScreen';

export default function App() {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen key="login" />;
      case 'dashboard':
        return <DashboardScreen key="dashboard" />;
      case 'personal-details':
        return <PersonalDetailsScreen key="personal-details" />;
      case 'daily-log':
        return <DailyHealthLogScreen key="daily-log" />;
      case 'confirmation':
        return <ConfirmationScreen key="confirmation" />;
      default:
        return <LoginScreen key="login" />;
    }
  };

  return (
    <div className="min-h-screen bg-navy">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <ProgressIndicator currentScreen={currentScreen} />
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </div>
    </div>
  );
}
