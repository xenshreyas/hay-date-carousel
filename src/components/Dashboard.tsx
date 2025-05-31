
import { useState } from 'react';
import { Navigation } from './Navigation';
import { BrowseHorses } from './BrowseHorses';
import { MyHorses } from './MyHorses';
import { Matches } from './Matches';
import { Messages } from './Messages';
import { Profile } from './Profile';

export const Dashboard = () => {
  const [currentView, setCurrentView] = useState('home');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <BrowseHorses />;
      case 'horses':
        return <MyHorses />;
      case 'matches':
        return <Matches />;
      case 'messages':
        return <Messages />;
      case 'profile':
        return <Profile />;
      default:
        return <BrowseHorses />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {renderCurrentView()}
    </div>
  );
};
