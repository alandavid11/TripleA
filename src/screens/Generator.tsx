import React from 'react';
import { 
  Save, 
  Share2, 
  Sparkles, 
  CheckCircle2, 
  PlusCircle, 
  BrainCircuit,
  Rocket,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Generator: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end mb-12">
        <div>
          <nav className="flex text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-2">
            <span className="opacity-50">Engineering Intelligence</span>
            <span className="mx-2 opacity-50">/</span>
            <span>Profile Generator</span>
          </nav>
          <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Job Profile Architect</h2>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-lowest text-primary-container font-bold rounded-lg hover:bg-surface-container-high transition-colors text-sm shadow-sm">
            <Save size={18} />
            Save Draft
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-container text-white font-bold rounded-lg hover:opacity-90 transition-opacity text-sm shadow-md">
            <Share2 size={18} />
            Export to PDF/ATS
          </button>
        </div>
      </header>

      <section className="bg-surface-container-low p-8 rounded-2xl mb-12 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-outline ml-1">Team Context</label>
            <div className="relative">
              <select className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-sm font-semibold focus:ring-2 focus:ring-secondary transition-all appearance-none">
                <option>Platform Engineering</option>
                <option>Infrastructure & SRE</option>
                <option>Product & Growth</option>
                <option>Data & AI Systems</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={16} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-outline ml-1">Role Type</label>
            <input 
              className="w-full bg-surface-container-lowest border-none rounded-lg p-4 text-sm font-semibold focus:ring-2 focus:ring-secondary transition-all" 
              placeholder="e.g., Senior Backend Engineer" 
              type="text" 
              defaultValue="Senior Backend Engineer"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full h-14 bg-secondary text-white font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg">
              <Sparkles size={20} />
              Regenerate Profile
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-headline text-xl font-bold text-primary-container">Role Definition</h3>
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-widest rounded-full">AI Generated</span>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-tighter text-outline mb-2">Summary</h4>
                <p className="text-on-surface leading-relaxed text-sm">
                  We are seeking a Senior Backend Engineer to lead the evolution of our high-scale distributed systems. You will architect robust microservices, mentor junior staff, and drive the technical roadmap for our core processing engine that handles over 10M events per second.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <h4 className="text-[11px] font-black uppercase tracking-tighter text-outline mb-2">Core Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Go / Rust', 'Kubernetes', 'PostgreSQL', 'gRPC'].map(tech => (
                      <span key={tech} className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold">{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <h4 className="text-[11px] font-black uppercase tracking-tighter text-outline mb-2">Primary Goal</h4>
                  <p className="text-[12px] font-semibold text-primary-container">System Scalability & Resilience</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border-l-4 border-secondary">
              <h3 className="font-headline text-lg font-bold text-primary-container mb-4">Requirements</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-secondary mb-2">Must Have</h4>
                  <ul className="space-y-2 text-sm text-on-surface">
                    <li className="flex items-start gap-2"><CheckCircle2 className="text-secondary mt-0.5" size={16} /> 6+ years in high-traffic backend development.</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="text-secondary mt-0.5" size={16} /> Deep expertise in distributed databases.</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="text-secondary mt-0.5" size={16} /> Proven experience with CI/CD automation.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-outline mb-2">Nice to Have</h4>
                  <ul className="space-y-2 text-sm text-on-surface opacity-75">
                    <li className="flex items-start gap-2"><PlusCircle className="text-outline mt-0.5" size={16} /> Contributions to OSS projects.</li>
                    <li className="flex items-start gap-2"><PlusCircle className="text-outline mt-0.5" size={16} /> Experience with eBPF or low-level profiling.</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
              <h3 className="font-headline text-lg font-bold text-primary-container mb-4">Key Responsibilities</h3>
              <ul className="space-y-3">
                {[
                  'Design and maintain high-concurrency microservices.',
                  'Lead code reviews and drive architectural standards.',
                  'Collaborate with SRE to optimize infrastructure spend.',
                  'Define and monitor SLOs for critical path services.'
                ].map((resp, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary-container text-white text-[10px] font-bold rounded-full flex-shrink-0">0{i+1}</span>
                    <p className="text-sm leading-snug">{resp}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-primary-container text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -mr-10 -mt-10 rounded-full"></div>
            <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
              <BrainCircuit className="text-secondary" size={24} />
              Interview Intel
            </h3>
            <div className="space-y-6">
              <div className="group border-b border-white/10 pb-4 last:border-0">
                <p className="text-xs font-black uppercase text-on-primary-container tracking-widest mb-1">Architecture Q1</p>
                <p className="text-sm font-semibold mb-2 text-white">"How would you handle a sudden 10x spike in write-heavy traffic?"</p>
                <div className="p-3 bg-white/5 rounded-lg border-l-2 border-secondary">
                  <p className="text-[11px] text-on-primary-container uppercase font-bold mb-1">Look For:</p>
                  <p className="text-xs italic opacity-80">Knowledge of backpressure, message queues (Kafka), and database sharding vs scaling.</p>
                </div>
              </div>
              <div className="group border-b border-white/10 pb-4 last:border-0">
                <p className="text-xs font-black uppercase text-on-primary-container tracking-widest mb-1">Conflict Q2</p>
                <p className="text-sm font-semibold mb-2 text-white">"Describe a time you disagreed with a technical decision by a lead."</p>
                <div className="p-3 bg-white/5 rounded-lg border-l-2 border-secondary">
                  <p className="text-[11px] text-on-primary-container uppercase font-bold mb-1">Look For:</p>
                  <p className="text-xs italic opacity-80">Evidence of healthy technical debate, data-driven reasoning, and eventual alignment.</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-4 py-2 text-xs font-bold uppercase tracking-widest text-on-primary-container hover:text-white transition-colors">
              View 3 Additional Questions
            </button>
          </div>

          <div className="bg-surface-container-low p-8 rounded-2xl shadow-sm">
            <h3 className="font-headline text-lg font-bold text-primary-container mb-6">Evaluation Rubric</h3>
            <div className="space-y-3">
              {[
                { level: 'Junior', text: 'Writes clean code but requires significant oversight for architecture. Focuses on ticket completion.' },
                { level: 'Mid', text: 'Independent worker. Understands common design patterns and can own a complete feature lifecycle.' },
                { level: 'Senior', text: 'System-wide thinking. Influences architecture, mentors others, and considers long-term maintenance costs.', active: true }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl shadow-sm ${item.active ? 'ring-2 ring-secondary/50' : ''}`}>
                  <div className="w-16 text-center">
                    <p className={`text-[10px] font-black uppercase ${item.active ? 'text-secondary' : 'text-outline'}`}>Level</p>
                    <p className={`text-xs font-bold ${item.active ? 'text-secondary' : ''}`}>{item.level}</p>
                  </div>
                  <div className="h-8 w-px bg-outline-variant"></div>
                  <p className={`text-[11px] leading-snug ${item.active ? 'font-medium' : ''}`}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex items-center gap-4 px-6 py-4 glass-effect border border-white/40 shadow-2xl rounded-2xl z-40">
        <div className="w-4 h-4 bg-secondary rounded-full animate-pulse"></div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-primary-container">Mirror Engine Active</p>
          <p className="text-[10px] text-outline">Optimizing JD for engineering cultural fit...</p>
        </div>
        <button className="ml-4 text-xs font-bold text-error uppercase">Cancel</button>
      </div>
    </div>
  );
};
