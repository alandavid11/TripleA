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
    <header className="w-full h-16 sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant/20 flex justify-between items-center px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={16} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal/50 text-sm transition-all outline-none"
            placeholder="Buscar vacantes, candidatos..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Role switcher */}
        <div className="flex bg-surface-container-low rounded-xl p-1 gap-0.5 border border-outline-variant/20">
          <button
            onClick={() => onRoleChange('hr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'hr'
                ? 'text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            style={activeRole === 'hr' ? { background: 'linear-gradient(135deg, #04A28F, #0057F0)' } : {}}
          >
            <UserCircle size={13} />
            RH
          </button>
          <button
            onClick={() => onRoleChange('hiring_manager')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'hiring_manager'
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Briefcase size={13} />
            HM
          </button>
          <button
            onClick={() => onRoleChange('team_member')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeRole === 'team_member'
                ? 'bg-brand-gold text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Users size={13} />
            Team
          </button>
        </div>

        <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface font-headline">{profile.name}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">{profile.title}</p>
          </div>
          <img
            alt="User profile"
            className="w-9 h-9 rounded-full object-cover border-2 border-brand-teal/30"
            src={`https://picsum.photos/seed/${profile.seed}/100/100`}
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
