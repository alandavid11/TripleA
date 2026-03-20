import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Clock,
  Cpu,
  Zap,
  MessageCircle,
  Users,
  ChevronRight,
  ChevronLeft,
  Tag,
  X,
  Lightbulb,
  Briefcase,
  ArrowLeft,
  FlaskConical,
  ThumbsUp,
} from 'lucide-react';

// ── MOCK INPUT REQUESTS ──

interface InputRequest {
  id: string;
  vacancyTitle: string;
  team: string;
  deadline: string;
  status: 'pending' | 'submitted';
  submittedAt?: string;
}

const MOCK_REQUESTS: InputRequest[] = [
  { id: 'req1', vacancyTitle: 'Senior Backend Engineer', team: 'Platform Engineering', deadline: '20 Mar 2026', status: 'pending' },
  { id: 'req2', vacancyTitle: 'DevOps / SRE Engineer', team: 'Infrastructure & SRE', deadline: '19 Mar 2026', status: 'submitted', submittedAt: '1 Mar 2026' },
  { id: 'req3', vacancyTitle: 'Frontend Lead', team: 'Product & Growth', deadline: '25 Mar 2026', status: 'pending' },
];

// ── FORM SECTIONS ──

const SECTIONS = [
  {
    key: 'tech',
    icon: Cpu,
    title: 'Stack Tecnológico',
    subtitle: 'Herramientas y tecnologías que usas a diario',
    placeholder: 'Describe las tecnologías con las que trabajas regularmente...',
    prompt: '¿Qué herramientas y lenguajes usas cada día?',
  },
  {
    key: 'day',
    icon: Zap,
    title: 'Día a Día',
    subtitle: 'Cuéntanos qué haces en una semana típica',
    placeholder: 'Cuéntanos como si le explicaras a un amigo...',
    prompt: '¿Qué ocupa la mayor parte de tu semana?',
  },
  {
    key: 'challenges',
    icon: MessageCircle,
    title: 'Retos del Equipo',
    subtitle: 'Problemas técnicos o de proceso que enfrenta el equipo',
    placeholder: 'Ej: Tenemos deuda técnica, los deploys son lentos, necesitamos más manos para reviews...',
    prompt: '¿Qué desafíos está enfrentando el equipo actualmente?',
  },
  {
    key: 'ideal',
    icon: Users,
    title: 'El Candidato Ideal',
    subtitle: '¿Qué skills y actitud buscarías en un nuevo compañero?',
    placeholder: 'Piensa en quién haría tu equipo más fuerte...',
    prompt: '¿Qué tipo de persona encajaría bien en el equipo?',
  },
] as const;

const TECH_SUGGESTIONS = [
  'Go', 'Kubernetes', 'PostgreSQL', 'Kafka', 'Redis', 'gRPC', 'Terraform',
  'GitHub Actions', 'Docker', 'Python', 'React', 'TypeScript', 'GraphQL',
  'AWS', 'GCP', 'Prometheus', 'Grafana',
];

const MOCK_FILL: Record<string, { techTags: string[]; tech: string; day: string; challenges: string; ideal: string }> = {
  req1: {
    techTags: ['Go', 'Kafka', 'PostgreSQL', 'Kubernetes', 'gRPC', 'Redis'],
    tech: 'Uso Go como lenguaje principal para todos los microservicios. Kafka para eventos entre servicios, PostgreSQL para persistencia y Redis para cache. K8s en GCP para orquestación.',
    day: 'Me la paso haciendo APIs en Go y code reviews. Esta semana migré endpoints de REST a gRPC y estuve optimizando queries lentas en PostgreSQL que afectaban el dashboard de reportes.',
    challenges: 'Necesitamos a alguien que tome ownership de la migración a event-driven architecture. Yo ya estoy muy saturado con los servicios de pagos y no puedo liderar eso también.',
    ideal: 'Alguien con experiencia real en Go en producción, que entienda sistemas distribuidos y pueda autosuficientarse en Kubernetes. Que no tenga miedo de los code reviews honestos.',
  },
  req3: {
    techTags: ['React', 'TypeScript', 'GraphQL', 'Storybook'],
    tech: 'Trabajo principalmente en React y TypeScript. Usamos GraphQL para algunas consultas y tenemos un Storybook para componentes. Mi trabajo está muy alineado con Diseño.',
    day: 'Implemento features de producto basadas en diseños de Figma. Esta semana estuve en el rediseño del dashboard principal y migración de componentes legacy a nuestro Design System.',
    challenges: 'Los cambios de backend a veces nos rompen cosas en el frontend sin previo aviso. Necesitamos mejores prácticas de contrato-first y alguien que entienda al consumidor de la API.',
    ideal: 'Un Frontend Lead que establezca estándares, defina el Design System y sea mentor del equipo. Que tenga visión de producto además de excelencia técnica.',
  },
};

interface FormState {
  tech: string;
  techTags: string[];
  day: string;
  challenges: string;
  ideal: string;
}

// ── COMPONENT ──

export const TeamMemberPortal: React.FC = () => {
  const [requests, setRequests] = useState<InputRequest[]>(MOCK_REQUESTS);
  const [activeRequest, setActiveRequest] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormState>({ tech: '', techTags: [], day: '', challenges: '', ideal: '' });
  const [tagInput, setTagInput] = useState('');

  const request = requests.find((r) => r.id === activeRequest);
  const currentSection = SECTIONS[step];
  const isLastStep = step === SECTIONS.length - 1;

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const submittedCount = requests.filter((r) => r.status === 'submitted').length;

  const openRequest = (id: string) => {
    setActiveRequest(id);
    setStep(0);
    setSubmitted(false);
    setForm({ tech: '', techTags: [], day: '', challenges: '', ideal: '' });
    setTagInput('');
  };

  const handleMock = () => {
    if (!activeRequest) return;
    const fill = MOCK_FILL[activeRequest];
    if (fill) setForm(fill);
  };

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !form.techTags.includes(clean)) setForm((p) => ({ ...p, techTags: [...p.techTags, clean] }));
    setTagInput('');
  };

  const removeTag = (tag: string) => setForm((p) => ({ ...p, techTags: p.techTags.filter((t) => t !== tag) }));

  const handleSubmit = () => {
    setSubmitted(true);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === activeRequest
          ? { ...r, status: 'submitted', submittedAt: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) }
          : r
      )
    );
  };

  // ── REQUEST LIST ──
  if (!activeRequest) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <header className="mb-10">
          <nav className="flex text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-2">
            <span className="opacity-50">TripleA</span>
            <span className="mx-2 opacity-50">/</span>
            <span>Mis Solicitudes</span>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Mis Solicitudes</h2>
              <p className="text-on-surface-variant mt-1">Tu Hiring Manager necesita tu perspectiva para estas vacantes.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-lg">
                <Clock className="text-amber-500" size={14} />
                <span className="text-xs font-bold text-amber-600">{pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg">
                <CheckCircle2 className="text-secondary" size={14} />
                <span className="text-xs font-bold text-secondary">{submittedCount} enviada{submittedCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-4">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => req.status === 'pending' && openRequest(req.id)}
              disabled={req.status === 'submitted'}
              className={`w-full flex items-center gap-5 p-6 rounded-2xl shadow-sm text-left transition-all group ${
                req.status === 'pending'
                  ? 'bg-surface-container-lowest hover:shadow-md hover:scale-[1.01] cursor-pointer'
                  : 'bg-surface-container-low opacity-70 cursor-default'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${req.status === 'pending' ? 'bg-primary-container' : 'bg-surface-container-high'}`}>
                <Briefcase className={req.status === 'pending' ? 'text-white' : 'text-outline'} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-headline text-lg font-bold text-on-surface">{req.vacancyTitle}</h3>
                  {req.status === 'pending' && (
                    <span className="px-2 py-0.5 bg-amber-500/15 text-amber-600 text-[10px] font-black uppercase rounded-full">Pendiente</span>
                  )}
                  {req.status === 'submitted' && (
                    <span className="px-2 py-0.5 bg-secondary/15 text-secondary text-[10px] font-black uppercase rounded-full">Enviada</span>
                  )}
                </div>
                <p className="text-sm text-on-surface-variant">{req.team}</p>
                <p className="text-[11px] text-outline mt-1">
                  {req.status === 'pending' ? `Fecha límite: ${req.deadline}` : `Enviado: ${req.submittedAt}`}
                </p>
              </div>
              {req.status === 'pending' ? (
                <ChevronRight className="text-outline group-hover:text-primary-container transition-colors flex-shrink-0" size={20} />
              ) : (
                <CheckCircle2 className="text-secondary flex-shrink-0" size={20} />
              )}
            </button>
          ))}
        </div>

        <div className="mt-8 p-5 bg-primary-container/5 border border-primary-container/20 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="text-primary-container" size={16} />
            <p className="text-xs font-bold text-primary-container">¿Para qué sirve tu feedback?</p>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Tu perspectiva del día a día se combina con la Job Description del cliente para generar una vacante más precisa. Esto ayuda a RH a encontrar candidatos que realmente encajen con el equipo, no solo con el papel.
          </p>
        </div>
      </div>
    );
  }

  // ── SUBMITTED CONFIRMATION ──
  if (submitted && request) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 shadow-xl shadow-secondary/30">
          <ThumbsUp className="text-white" size={36} />
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-2">¡Listo!</h2>
        <p className="text-on-surface-variant mb-1">Tu feedback para <strong>{request.vacancyTitle}</strong> fue enviado.</p>
        <p className="text-sm text-outline mb-8">El Hiring Manager lo recibirá junto con el del resto del equipo.</p>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {form.techTags.map((t) => (
            <span key={t} className="px-3 py-1.5 bg-secondary/10 text-secondary text-[11px] font-bold rounded-lg">{t}</span>
          ))}
        </div>
        <button
          onClick={() => setActiveRequest(null)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-all"
        >
          <ArrowLeft size={16} />Ver todas mis solicitudes
        </button>
      </div>
    );
  }

  // ── FORM ──
  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <button onClick={() => setActiveRequest(null)} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-4 hover:opacity-70 transition-opacity">
          <ArrowLeft size={12} />Mis Solicitudes
        </button>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="text-primary-container" size={18} />
              <span className="text-xs font-bold text-on-surface-variant">{request?.team}</span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-primary-container tracking-tight">{request?.vacancyTitle}</h2>
            <p className="text-on-surface-variant mt-1 text-sm">Sección {step + 1} de {SECTIONS.length} — {currentSection.title}</p>
          </div>
          {MOCK_FILL[activeRequest] && (
            <button
              onClick={handleMock}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:opacity-90 transition-all"
            >
              <FlaskConical size={14} />Mock
            </button>
          )}
        </div>
      </header>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 bg-surface-container-lowest rounded-2xl p-2 shadow-sm">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          return (
            <React.Fragment key={s.key}>
              <button
                onClick={() => setStep(i)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${
                  active ? 'bg-primary-container text-white shadow-md' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/20' : 'bg-surface-container-high'}`}>
                  <Icon size={10} className={active ? 'text-white' : 'text-outline'} />
                </div>
                <span className="hidden sm:block">{s.title}</span>
              </button>
              {i < SECTIONS.length - 1 && <div className="w-px h-6 bg-outline-variant/20 flex-shrink-0" />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Section card */}
      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
            <currentSection.icon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">{currentSection.title}</h3>
            <p className="text-xs text-on-surface-variant">{currentSection.subtitle}</p>
          </div>
        </div>

        {currentSection.key === 'tech' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Agrega tecnologías rápido</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {TECH_SUGGESTIONS.filter((t) => !form.techTags.includes(t)).slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-low text-on-surface-variant text-[11px] font-bold rounded-lg border border-outline-variant/20 hover:border-primary-container hover:text-primary-container transition-all"
                  >
                    <Tag size={10} />{tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput)}
                  placeholder="Otra tecnología... (Enter)"
                  className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary-container transition-all"
                />
                <button onClick={() => addTag(tagInput)} disabled={!tagInput.trim()} className="px-4 py-2 bg-primary-container text-white rounded-lg font-bold text-sm disabled:opacity-40">+</button>
              </div>
              {form.techTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.techTags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-container text-white text-[11px] font-bold rounded-lg">
                      {tag}<button onClick={() => removeTag(tag)}><X size={10} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Contexto adicional</label>
              <textarea
                value={form.tech}
                onChange={(e) => setForm((p) => ({ ...p, tech: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-container transition-all resize-none"
                placeholder="¿Para qué usas estas herramientas?"
                rows={4}
              />
            </div>
          </div>
        )}

        {currentSection.key !== 'tech' && (
          <textarea
            value={form[currentSection.key as keyof FormState] as string}
            onChange={(e) => setForm((p) => ({ ...p, [currentSection.key]: e.target.value }))}
            className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary-container transition-all resize-none"
            placeholder={currentSection.placeholder}
            rows={8}
          />
        )}

        <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
          <div className="flex items-center gap-2">
            <Lightbulb className="text-amber-500 flex-shrink-0" size={14} />
            <p className="text-xs text-on-surface-variant italic">"{currentSection.prompt}"</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <div>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-all">
              <ChevronLeft size={16} />Anterior
            </button>
          )}
        </div>
        <div>
          {!isLastStep ? (
            <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg">
              Siguiente<ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all shadow-lg">
              <Send size={16} />Enviar mi feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
