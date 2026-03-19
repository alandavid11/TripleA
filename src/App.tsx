import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './screens/Dashboard';
import { Activity } from './screens/Activity';
import { Generator } from './screens/Generator';
import { Match } from './screens/Match';
import { Screen, UserRole } from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('hr');

  useEffect(() => {
    fetch('http://localhost:3001/status')
      .then(response => response.text())
      .then(data => console.log('Backend status:', data))
      .catch(error => console.error('Error fetching backend status:', error));
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <Dashboard />;
      case 'activity':
        return <Activity />;
      case 'generator':
        return <Generator activeRole={activeRole} />;
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
      <Sidebar activeScreen={activeScreen} onScreenChange={setActiveScreen} />
      <main className="ml-64 min-h-screen">
        <TopBar activeRole={activeRole} onRoleChange={setActiveRole} />
        <div className="pb-24">
          {renderScreen()}
        </div>
      </main>
    </div>
  );
}
