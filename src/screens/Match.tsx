import React from 'react';
import { 
  Edit3, 
  Zap, 
  Rocket, 
  Search, 
  Bell, 
  Briefcase,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { Candidate } from '../types';

export const Match: React.FC = () => {
  const candidates: Candidate[] = [
    { id: '1', name: 'Sarah Jenkins', initials: 'SJ', role: 'SRE II', tenure: 'Eng Lead • 4y Tenure', matchScore: 92, status: 'Top Choice' },
    { id: '2', name: 'Marcus Rivera', initials: 'MR', role: 'Cloud Ops I', tenure: 'Software Eng • 2y Tenure', matchScore: 78, status: 'Developing' },
    { id: '3', name: 'Lena Kim', initials: 'LK', role: 'DevOps I', tenure: 'DevOps • 1y Tenure', matchScore: 74, status: 'External Lead' },
    { id: '4', name: 'David Vance', initials: 'DV', role: 'Senior Backend', tenure: 'Backend Eng • 5y Tenure', matchScore: 68, status: 'Pivot Candidate' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Active Profile</span>
              <h3 className="text-2xl font-headline font-bold mt-2">Senior DevOps Engineer</h3>
              <p className="text-on-surface-variant text-sm mt-1">Infrastructure • Platform Team • Level 5</p>
            </div>
            <button className="flex items-center gap-2 bg-primary-container text-white px-4 py-2 rounded-lg text-sm font-semibold">
              <Edit3 size={16} />
              Refine Profile
            </button>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-surface-container-low rounded-lg">
              <p className="text-[10px] uppercase font-bold text-outline-variant mb-1">Total Pool</p>
              <p className="text-xl font-headline font-bold text-primary-container">124 Candidates</p>
            </div>
            <div className="flex-1 p-4 bg-surface-container-low rounded-lg border-l-4 border-secondary">
              <p className="text-[10px] uppercase font-bold text-outline-variant mb-1">High Match (80%+)</p>
              <p className="text-xl font-headline font-bold text-secondary">8 Engineers</p>
            </div>
            <div className="flex-1 p-4 bg-surface-container-low rounded-lg">
              <p className="text-[10px] uppercase font-bold text-outline-variant mb-1">Avg. Gap</p>
              <p className="text-xl font-headline font-bold text-primary-container">14% Skill Variance</p>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-primary-container text-white p-6 rounded-xl flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-secondary fill-secondary" size={18} />
              <span className="text-xs font-bold uppercase tracking-widest text-on-primary-container">AI Recommendation</span>
            </div>
            <p className="text-sm font-medium leading-relaxed">
              Sarah Jenkins is 92% ready. Accelerating her AWS S3 Security Certification would bridge the final 8% gap within 2 weeks.
            </p>
          </div>
          <button className="mt-6 w-full py-2 bg-secondary text-white font-bold rounded-lg text-sm hover:opacity-90 transition-opacity">
            View Development Plan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-7 space-y-4">
          <h4 className="font-headline text-lg font-bold px-2">Internal Mobility Pipeline</h4>
          <div className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase font-black tracking-widest text-outline border-b border-outline-variant/10">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4 text-center">Match Score</th>
                  <th className="px-6 py-4">Current Role</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {candidates.map((c) => (
                  <tr key={c.id} className="bg-surface-container-lowest cursor-pointer hover:bg-surface-container-high transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-container-highest text-primary font-bold flex items-center justify-center text-xs">{c.initials}</div>
                        <div>
                          <p className="text-sm font-bold">{c.name}</p>
                          <p className="text-[10px] text-outline">{c.tenure}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span className={`text-lg font-headline font-black ${c.matchScore >= 80 ? 'text-secondary' : 'text-on-surface-variant'}`}>{c.matchScore}%</span>
                        <div className="w-16 h-1 bg-surface-container-high rounded-full overflow-hidden">
                          <div className={`${c.matchScore >= 80 ? 'bg-secondary' : 'bg-primary-container'} h-full`} style={{ width: `${c.matchScore}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{c.role}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${c.matchScore >= 80 ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-outline'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl p-8 sticky top-24">
            <div className="text-center mb-8">
              <h4 className="font-headline text-xl font-bold">Skill Mirror Analysis</h4>
              <p className="text-on-surface-variant text-sm">Comparing Sarah Jenkins vs. Job Profile</p>
            </div>
            
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 skill-radar-grid bg-surface-container-highest opacity-20 scale-100"></div>
              <div className="absolute inset-0 skill-radar-grid border-2 border-dashed border-outline-variant opacity-30"></div>
              <div className="absolute inset-0 skill-radar-grid bg-secondary-container/10 scale-[0.85]"></div>
              <div className="absolute inset-0 skill-radar-grid bg-secondary/20 border-2 border-secondary scale-[0.92]" style={{ clipPath: 'polygon(50% 5%, 95% 42%, 78% 90%, 25% 95%, 10% 35%)' }}></div>
              
              <span className="absolute -top-6 text-[10px] font-bold text-outline">Kubernetes</span>
              <span className="absolute top-1/3 -right-12 text-[10px] font-bold text-outline">Terraform</span>
              <span className="absolute bottom-4 -right-8 text-[10px] font-bold text-outline">AWS S3</span>
              <span className="absolute bottom-4 -left-8 text-[10px] font-bold text-outline">CI/CD</span>
              <span className="absolute top-1/3 -left-12 text-[10px] font-bold text-outline">Monitoring</span>
            </div>

            <div className="mt-12 space-y-4">
              <h5 className="text-[10px] uppercase font-black tracking-widest text-outline">Critical Development Gaps</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-surface-container rounded-lg group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                    <span className="text-xs font-bold">AWS S3 Security Architecture</span>
                  </div>
                  <span className="text-[10px] text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded font-bold">-8% Gap</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-container rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                    <span className="text-xs font-bold text-on-surface-variant">Prometheus/Grafana Advanced</span>
                  </div>
                  <span className="text-[10px] text-outline font-bold">Matched</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-outline-variant/10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-outline mb-1 uppercase">Readiness Score</p>
                  <p className="text-4xl font-black font-headline text-secondary">92%</p>
                </div>
                <button className="px-6 py-3 bg-primary-container text-white font-bold rounded-lg text-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
                  <Rocket size={16} />
                  Initiate Internal Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-[calc(16rem+2rem)] right-8 bg-inverse-surface text-inverse-on-surface p-4 rounded-xl flex justify-between items-center shadow-2xl z-40 backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-8 px-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-primary-container uppercase tracking-tighter">Org Impact</span>
            <span className="text-lg font-headline font-black text-secondary-fixed-dim">+$14k <small className="font-normal text-xs opacity-60">Hiring Savings</small></span>
          </div>
          <div className="h-8 w-[1px] bg-outline opacity-20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-primary-container uppercase tracking-tighter">Velocity</span>
            <span className="text-lg font-headline font-black">12 Days <small className="font-normal text-xs opacity-60">to Productivity</small></span>
          </div>
          <div className="h-8 w-[1px] bg-outline opacity-20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-on-primary-container uppercase tracking-tighter">Retention Risk</span>
            <span className="text-lg font-headline font-black text-error">Low <small className="font-normal text-xs opacity-60">Risk</small></span>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 border-l border-outline/20">
          <div className="w-10 h-10 rounded-full border-2 border-secondary flex items-center justify-center p-1">
            <img 
              alt="Sarah J" 
              className="rounded-full w-full h-full object-cover" 
              src="https://picsum.photos/seed/sarah/100/100"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <p className="text-xs font-bold leading-none">Drafting Offer</p>
            <p className="text-[10px] text-on-primary-container">Sarah Jenkins</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
