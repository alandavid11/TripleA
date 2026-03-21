import React from 'react';
import {
  LayoutDashboard,
  ClipboardEdit,
  Briefcase,
  Users,
  Settings,
} from 'lucide-react';
import { Screen, UserRole } from '../types';

interface SidebarProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  activeRole: UserRole;
}

const allNavItems: { id: Screen; label: string; icon: React.ElementType; roles: UserRole[] }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['hr', 'hiring_manager'] },
  { id: 'vacancies', label: 'Vacantes', icon: Briefcase, roles: ['hr', 'hiring_manager'] },
  { id: 'match', label: 'Match', icon: Users, roles: ['hr', 'hiring_manager'] },
  { id: 'settings', label: 'Configuración', icon: Settings, roles: ['hr', 'hiring_manager'] },
  { id: 'team-member', label: 'Mis Solicitudes', icon: ClipboardEdit, roles: ['team_member'] },
];

const roleLabels: Record<UserRole, string> = {
  hr: 'Recursos Humanos',
  hiring_manager: 'Hiring Manager',
  team_member: 'Team Member',
};

const roleDotColor: Record<UserRole, string> = {
  hr: 'bg-brand-teal',
  hiring_manager: 'bg-brand-gold',
  team_member: 'bg-brand-blue',
};

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onScreenChange, activeRole }) => {
  const navItems = allNavItems.filter((item) => item.roles.includes(activeRole));

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 flex flex-col py-6 z-50 border-r border-outline-variant/30 bg-surface-container-lowest">
      {/* Logo + app name */}
      <div className="px-5 mb-8">
        <img
          src={`${import.meta.env.BASE_URL}micoach-logo.png?v=2`}
          alt="miCoach"
          className="h-10 w-auto object-contain"
          style={{ background: 'transparent' }}
        />
        <p className="font-headline text-lg font-bold text-on-surface mt-3 tracking-tight leading-tight">
          Talent Aiquisition
        </p>
      </div>

      {/* Role badge */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-lg">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${roleDotColor[activeRole]}`} />
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider truncate">
            {roleLabels[activeRole]}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline text-sm font-semibold ${
                isActive
                  ? 'bg-brand-teal/10 text-brand-teal border border-brand-teal/20'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
              <item.icon
                size={18}
                className={isActive ? 'text-brand-teal' : 'text-outline'}
              />
              {item.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-teal" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: powered by */}
      <div className="px-5 mt-auto">
        <div
          className="rounded-xl p-4 text-white"
          style={{ background: 'linear-gradient(135deg, #04A28F 0%, #0057F0 100%)' }}
        >
          <p className="text-[10px] text-white/70 font-semibold uppercase tracking-widest mb-1">
            Plataforma
          </p>
          <p className="text-sm font-bold leading-tight">
            Talent Aiquisition
          </p>
          <p className="text-[10px] text-white/60 mt-1">powered by miCoach</p>
        </div>
      </div>
    </aside>
  );
};
