import React from 'react';
import { 
  Paperclip, 
  AtSign, 
  Sparkles, 
  GitCommit, 
  Ticket, 
  CheckCircle2, 
  History,
  MoreVertical,
  BrainCircuit
} from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityItem } from '../types';

export const Activity: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'commit',
      title: 'Implemented Laravel AWS S3 integration for media storage',
      timestamp: '2 hours ago',
      hash: '#a2f5e10',
      intelligence: [
        { skill: 'Laravel', level: 'Intermediate' },
        { skill: 'AWS S3', level: 'Basic' },
        { skill: 'Cloud Architecture', level: 'Theory' }
      ]
    },
    {
      id: '2',
      type: 'ticket',
      title: 'Refactored legacy auth middleware to support OAuth2 scopes',
      timestamp: '5 hours ago',
      ticketId: 'ENG-442',
      intelligence: [
        { skill: 'OAuth2', level: 'Advanced' },
        { skill: 'Security Compliance', level: 'Intermediate' }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8"
    >
      <div className="col-span-12 lg:col-span-8 space-y-8">
        <section className="bg-surface-container-low rounded-xl p-6 shadow-sm">
          <h2 className="font-headline text-2xl text-on-surface font-bold mb-4">Activity Pulse</h2>
          <div className="bg-surface-container-lowest rounded-lg p-4 shadow-sm">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-on-primary-container mb-2 uppercase tracking-wide">Manual Intelligence Entry</label>
                <textarea 
                  className="w-full bg-surface-container-high/50 border-none border-b-2 border-outline-variant/20 focus:border-primary-container focus:ring-0 text-on-surface p-0 pb-2 text-lg resize-none placeholder:text-outline-variant/60" 
                  placeholder="What did you work on today?"
                  rows={2}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/10">
              <div className="flex gap-2">
                <button className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors">
                  <Paperclip size={20} />
                </button>
                <button className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors">
                  <AtSign size={20} />
                </button>
              </div>
              <button className="bg-primary-container text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                <span>Analyze Activity</span>
                <Sparkles size={16} />
              </button>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          {activities.map((item) => (
            <div key={item.id} className={`group bg-surface-container-lowest rounded-xl overflow-hidden transition-all hover:shadow-md border-l-4 ${item.type === 'commit' ? 'border-secondary' : 'border-primary-container'}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'commit' ? 'bg-secondary-container' : 'bg-primary-container'}`}>
                      {item.type === 'commit' ? <GitCommit className="text-on-secondary-container" size={18} /> : <Ticket className="text-white" size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold uppercase tracking-tighter ${item.type === 'commit' ? 'text-secondary' : 'text-primary-container'}`}>
                          {item.type === 'commit' ? 'Commit' : 'Ticket Resolved'}
                        </span>
                        <span className="text-[10px] text-outline font-mono">{item.hash || item.ticketId}</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium">{item.timestamp}</p>
                    </div>
                  </div>
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-headline font-bold text-on-surface mb-4">{item.title}</h3>
                <div className="bg-surface-container-low rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="text-secondary" size={16} />
                      <h4 className="text-xs font-bold text-on-primary-container uppercase tracking-widest">Extracted Intelligence</h4>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-white text-on-surface border border-outline-variant/30 rounded-md text-[10px] font-bold hover:bg-surface transition-colors">EDIT</button>
                      <button className="px-3 py-1 bg-secondary text-white rounded-md text-[10px] font-bold flex items-center gap-1 hover:opacity-90">
                        <CheckCircle2 size={12} /> APPROVE
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {item.intelligence.map((intel, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg border border-secondary/10">
                        <span className="text-sm font-bold">{intel.skill}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-on-secondary-container/10 rounded uppercase">{intel.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-40">
            <History className="mb-2" size={32} />
            <p className="text-sm font-medium">Scanning for older activities...</p>
          </div>
        </div>
      </div>

      <aside className="hidden lg:block lg:col-span-4 space-y-6">
        <div className="bg-primary-container rounded-xl p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="font-headline text-lg font-bold mb-1">Weekly Velocity</h3>
            <p className="text-on-primary-container text-xs font-semibold mb-6">Jan 22 - Jan 29</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-on-primary-container mb-1">Skills Verified</p>
                <p className="text-2xl font-black">12</p>
              </div>
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <p className="text-[10px] uppercase font-bold text-on-primary-container mb-1">Level Ups</p>
                <p className="text-2xl font-black text-secondary-fixed-dim">03</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-secondary/20 blur-3xl rounded-full"></div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Engineering Team</h3>
            <button className="text-secondary text-[10px] font-bold">VIEW ALL</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Alex Rivera', role: 'active', img: 'alex' },
              { name: 'Sarah Chen', role: 'member', img: 'sarah' },
              { name: 'Marcus Thorne', role: 'member', img: 'marcus' }
            ].map((member, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${member.role === 'active' ? 'bg-surface-container-lowest' : 'hover:bg-surface-container-high transition-colors'}`}>
                <div className="flex items-center gap-3">
                  <img 
                    alt="Dev" 
                    className="w-8 h-8 rounded-full border border-outline-variant/30" 
                    src={`https://picsum.photos/seed/${member.img}/100/100`}
                    referrerPolicy="no-referrer"
                  />
                  <span className={`text-sm ${member.role === 'active' ? 'font-bold' : 'font-medium text-on-surface-variant'}`}>{member.name}</span>
                </div>
                {member.role === 'active' && <div className="w-2 h-2 rounded-full bg-secondary"></div>}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </motion.div>
  );
};
