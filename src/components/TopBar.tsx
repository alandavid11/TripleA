import React from 'react';
import { Search, Bell, UserCircle, Briefcase, Users } from 'lucide-react';
import { UserRole } from '../types';

interface TopBarProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleProfiles: Record<UserRole, { name: string; title: string; seed: string }> = {
  hr: { name: 'María López', title: 'HR Recruiter', seed: 'maria' },
  hiring_manager: { name: 'Alex Rivera', title: 'Hiring Manager', seed: 'alex' },
  team_member: { name: 'Carlos Mendoza', title: 'Backend Engineer', seed: 'carlos' },
};

export const TopBar: React.FC<TopBarProps> = ({ activeRole, onRoleChange }) => {
  const profile = roleProfiles[activeRole];

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-surface flex justify-between items-center px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary-container text-sm"
            placeholder="Search vacancies, candidates, or activities..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex bg-surface-container-low rounded-lg p-1 gap-0.5">
          <button
            onClick={() => onRoleChange('hr')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'hr'
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <UserCircle size={14} />
            RH
          </button>
          <button
            onClick={() => onRoleChange('hiring_manager')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'hiring_manager'
                ? 'bg-primary-container text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Briefcase size={14} />
            HM
          </button>
          <button
            onClick={() => onRoleChange('team_member')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'team_member'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users size={14} />
            Team
          </button>
        </div>

        <button className="relative p-2 text-on-surface-variant hover:bg-slate-200/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">{profile.name}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">{profile.title}</p>
          </div>
          <img
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-highest"
            src={`https://picsum.photos/seed/${profile.seed}/100/100`}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
