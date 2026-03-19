import React from 'react';
import { Search, Bell } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-surface flex justify-between items-center px-8">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary-container text-sm"
            placeholder="Search activities, commits, or tickets..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-on-surface-variant hover:bg-slate-200/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right">
            <p className="text-sm font-bold text-on-surface">Alex Rivera</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Senior Architect</p>
          </div>
          <img
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-highest"
            src="https://picsum.photos/seed/alex/100/100"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </header>
  );
};
