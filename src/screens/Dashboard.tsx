import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Code, 
  ChevronRight, 
  Zap,
  Cpu,
  Database,
  LineChart
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const metrics = [
    { label: 'Total Engineering Capacity', value: '142', trend: '+8.2%', trendType: 'up' },
    { label: 'Avg Skill Proficiency', value: 'L4.2', subtext: 'Sr. Engineer' },
    { label: 'Open Engineering Slots', value: '18', trend: '-3 Priority', trendType: 'down' },
    { label: 'Growth Index (30d)', value: '94.8', subtext: 'Optimal' },
  ];

  const skillDistribution = [
    { label: 'Backend', percentage: 75, subtext: 'Go, Node, Python', color: 'text-primary-container' },
    { label: 'Frontend', percentage: 60, subtext: 'React, TS, Tailwind', color: 'text-secondary' },
    { label: 'Infrastructure', percentage: 41, subtext: 'AWS, K8s, Terraform', color: 'text-on-primary-container' },
    { label: 'DevOps', percentage: 47, subtext: 'CI/CD, Monitoring', color: 'text-outline' },
  ];

  const hiringGaps = [
    { title: 'Senior Infrastructure Architect', subtext: 'Required for Q3 Scaling Project', status: 'CRITICAL', days: '42 Days', type: 'error' },
    { title: 'Staff Frontend Engineer', subtext: 'Design System & UX Excellence', status: 'HIGH', days: '12 Days', type: 'warning' },
    { title: 'Security Engineer (DevSecOps)', subtext: 'Compliance & Threat Modeling', status: 'MEDIUM', days: '5 Days', type: 'info' },
  ];

  const vacancies = [
    { title: 'Lead API Engineer', subtext: '3 Candidates in Review', icon: Code },
    { title: 'Senior Database Admin', subtext: '38 Total Applicants', icon: Database },
    { title: 'Data Science Lead', subtext: 'Final Interview Round', icon: LineChart },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">Engineering Intelligence Dashboard</h2>
        <p className="text-on-surface-variant mt-1">Live assessment of organizational skill distribution and recruitment velocity.</p>
      </div>

      <div className="flex gap-6 mb-8 overflow-x-auto pb-2 no-scrollbar">
        {metrics.map((metric, i) => (
          <div key={i} className="bg-surface-container-lowest p-6 rounded-xl flex-1 min-w-[200px] shadow-sm">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{metric.label}</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-headline font-extrabold text-primary-container">{metric.value}</span>
              {metric.trend && (
                <span className={`font-bold text-sm mb-1.5 ${metric.trendType === 'up' ? 'text-secondary' : 'text-error'}`}>
                  {metric.trend}
                </span>
              )}
              {metric.subtext && (
                <span className="text-on-surface-variant font-bold text-sm mb-1.5">{metric.subtext}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Team Skill Distribution</h3>
              <p className="text-sm text-on-surface-variant">Core competencies across all active engineering squads.</p>
            </div>
            <span className="px-3 py-1 bg-surface-container-low text-[10px] font-bold rounded uppercase tracking-wider">Live View</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {skillDistribution.map((skill, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-surface-container-low" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeWidth="8"></circle>
                    <circle 
                      className={skill.color} 
                      cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" 
                      strokeDasharray="339" 
                      strokeDashoffset={339 - (339 * skill.percentage) / 100} 
                      strokeWidth="8"
                      strokeLinecap="round"
                    ></circle>
                  </svg>
                  <span className="absolute font-headline font-bold text-xl">{skill.percentage}%</span>
                </div>
                <p className="mt-4 font-bold text-sm text-on-surface">{skill.label}</p>
                <p className="text-xs text-on-surface-variant">{skill.subtext}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Critical Hiring Gaps</h3>
          <div className="space-y-6">
            {hiringGaps.map((gap, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-lg ${gap.type === 'error' ? 'bg-error/5 border-l-4 border-error' : 'bg-surface-container-low'}`}>
                <div className={`p-2 rounded-lg ${gap.type === 'error' ? 'bg-error-container' : 'bg-secondary-container'}`}>
                  <AlertCircle className={gap.type === 'error' ? 'text-on-error-container' : 'text-on-secondary-container'} size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-on-surface">{gap.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-1">{gap.subtext}</p>
                  <div className="mt-3 flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${gap.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                      {gap.status}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">Vacant: {gap.days}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="font-headline text-xl font-bold text-on-surface">Skill Growth Trends</h3>
              <p className="text-sm text-on-surface-variant">Proficiency lift across technical domains (Last 30 Days)</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-secondary rounded-full"></span>
                <span className="text-xs font-bold text-on-surface-variant">Cloud Native</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-primary-container rounded-full"></span>
                <span className="text-xs font-bold text-on-surface-variant">AI/ML Implementation</span>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between h-48 gap-4 px-4 border-b border-outline-variant/20">
            {[1, 2, 3, 4].map((week) => (
              <div key={week} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex gap-1 justify-center items-end h-full">
                  <div className="w-4 bg-secondary/80 rounded-t-sm" style={{ height: `${20 + week * 15}%` }}></div>
                  <div className="w-4 bg-primary-container rounded-t-sm" style={{ height: `${10 + week * 18}%` }}></div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant mt-2">Week {week}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-surface-container-low p-8 rounded-xl border border-white shadow-sm">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Active Vacancies Pipeline</h3>
          <div className="space-y-4">
            {vacancies.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg group hover:bg-primary-container hover:text-white transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center group-hover:bg-white/10">
                    <v.icon className="text-primary-container group-hover:text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{v.title}</p>
                    <p className="text-xs text-on-surface-variant group-hover:text-on-primary-container/80">{v.subtext}</p>
                  </div>
                </div>
                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 border-2 border-primary-container text-primary-container font-bold text-sm rounded-lg hover:bg-primary-container hover:text-white transition-colors">
            Manage All Vacancies
          </button>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 bg-inverse-surface text-inverse-on-surface p-5 rounded-xl max-w-sm shadow-xl flex gap-4 items-start z-50">
        <div className="p-2 bg-secondary rounded-lg">
          <Zap className="text-white" size={20} />
        </div>
        <div>
          <p className="font-bold text-sm mb-1">Mirror AI Insight</p>
          <p className="text-xs leading-relaxed opacity-90">Backend capacity is trending towards a critical surplus while Infra knowledge remains siloed. We suggest redirecting current Node.js seniors to Terraform upskilling tracks to mitigate Q3 risk.</p>
          <div className="mt-4 flex gap-3">
            <button className="text-[10px] font-bold uppercase tracking-wider text-secondary">View Strategy</button>
            <button className="text-[10px] font-bold uppercase tracking-wider opacity-60">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
};
