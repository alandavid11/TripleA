import React from 'react';
import {
  LayoutDashboard,
  ClipboardEdit,
  Briefcase,
  Users,
  Settings,
  Hexagon,
} from 'lucide-react';
import { Screen, UserRole } from '../types';

interface SidebarProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  activeRole: UserRole;
}

const allNavItems: { id: Screen; label: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['hr', 'hiring_manager'] },
  { id: 'team-inputs', label: 'Team Inputs', icon: ClipboardEdit, roles: ['hiring_manager'] },
  { id: 'vacancies', label: 'Vacancies', icon: Briefcase, roles: ['hr', 'hiring_manager'] },
  { id: 'match', label: 'Match', icon: Users, roles: ['hr', 'hiring_manager'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['hr', 'hiring_manager'] },
  { id: 'team-member', label: 'Mi Feedback', icon: ClipboardEdit, roles: ['team_member'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onScreenChange, activeRole }) => {
  const navItems = allNavItems.filter((item) => item.roles.includes(activeRole));

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-6 z-50">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
          <Hexagon className="text-secondary-fixed-dim fill-secondary-fixed-dim" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 leading-none font-headline">Talent AI-Quisition</h1>
          <p className="text-[10px] uppercase tracking-widest text-on-primary-container font-bold mt-1">Hiring Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeScreen === item.id
                ? 'text-primary-container font-bold border-r-4 border-primary-container bg-white/50'
                : 'text-slate-500 font-medium hover:text-slate-900 hover:bg-white/30'
            }`}
          >
            <item.icon size={20} />
            <span className="font-headline text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-6 mt-auto">
        <div className="p-4 bg-primary-container rounded-xl text-white">
          <p className="text-xs text-on-primary-container font-semibold mb-2">
            {activeRole === 'hr' ? 'Rol Activo' : 'Rol Activo'}
          </p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeRole === 'hr' ? 'bg-secondary' : activeRole === 'hiring_manager' ? 'bg-amber-400' : 'bg-blue-400'} shadow-[0_0_8px_rgba(0,106,97,0.8)]`} />
            <span className="text-sm font-medium">
              {activeRole === 'hr' ? 'Recursos Humanos' : activeRole === 'hiring_manager' ? 'Hiring Manager' : 'Team Member'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

