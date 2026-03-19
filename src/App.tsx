import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './screens/Dashboard';
import { TeamInputs } from './screens/TeamInputs';
import { Vacancies } from './screens/Vacancies';
import { Match } from './screens/Match';
import { Screen, UserRole } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('hr');

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'hr' && activeScreen === 'team-inputs') {
      setActiveScreen('dashboard');
    }
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'team-inputs':
        return <TeamInputs />;
      case 'vacancies':
        return <Vacancies activeRole={activeRole} />;
      case 'match':
        return <Match />;
      case 'settings':
        return (
          <div className="p-8 max-w-7xl mx-auto">
            <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Settings</h2>
            <p className="text-on-surface-variant mt-1">Manage your engineering intelligence preferences.</p>
            <div className="mt-8 p-12 border-2 border-dashed border-outline-variant rounded-2xl flex flex-col items-center justify-center text-on-surface-variant">
              <p className="font-medium">Settings module coming soon.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} activeRole={activeRole} />
      <main className="ml-64 min-h-screen">
        <TopBar activeRole={activeRole} onRoleChange={handleRoleChange} />
        <div className="pb-24">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}
