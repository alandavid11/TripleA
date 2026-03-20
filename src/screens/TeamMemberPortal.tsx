import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  Cpu,
  Zap,
  MessageCircle,
  Lightbulb,
  Users,
  ChevronRight,
  ChevronLeft,
  Tag,
  X,
  ThumbsUp,
  FlaskConical,
} from 'lucide-react';

const TECH_SUGGESTIONS = [
  'Go', 'Kubernetes', 'PostgreSQL', 'Kafka', 'Redis', 'gRPC', 'Terraform',
  'GitHub Actions', 'Docker', 'Python', 'React', 'TypeScript', 'GraphQL',
  'AWS', 'GCP', 'Prometheus', 'Grafana', 'Datadog',
];

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

type SectionKey = typeof SECTIONS[number]['key'];

interface FormData {
  tech: string;
  techTags: string[];
  day: string;
  challenges: string;
  ideal: string;
}

// ── TEAM MEMBERS ──

interface TeamMemberProfile {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mockData: FormData;
}

const TEAM_MEMBERS: TeamMemberProfile[] = [
  {
    id: 'tm1',
    name: 'Carlos Mendoza',
    role: 'Backend Engineer',
    avatar: 'carlos',
    mockData: {
      techTags: ['Go', 'Kafka', 'PostgreSQL', 'Kubernetes', 'gRPC', 'Redis'],
      tech: 'Uso Go como lenguaje principal para todos los microservicios. Kafka para eventos entre servicios, PostgreSQL para persistencia y Redis para cache. El stack de infra es Kubernetes en GCP.',
      day: 'Me la paso haciendo APIs en Go y code reviews. Esta semana migré endpoints de REST a gRPC y estuve optimizando queries lentas en PostgreSQL que afectaban el dashboard de reportes. Los viernes hago pair programming con los juniors.',
      challenges: 'Necesitamos a alguien que tome ownership de la migración a event-driven architecture. Yo ya estoy muy saturado con los servicios de pagos y no puedo liderar eso también. El pipeline de CI también está lento.',
      ideal: 'Alguien con experiencia real en Go en producción, que entienda sistemas distribuidos y pueda autosuficientarse en Kubernetes. Que no tenga miedo de los code reviews honestos y que tenga criterio técnico propio.',
    },
  },
  {
    id: 'tm2',
    name: 'Sarah Chen',
    role: 'Full-Stack Developer',
    avatar: 'sarah',
    mockData: {
      techTags: ['Go', 'React', 'TypeScript', 'PostgreSQL', 'GitHub Actions'],
      tech: 'Trabajo en React y TypeScript en el frontend, pero también toco Go en el backend cuando necesito. Conozco bien el API Gateway y los contratos de nuestra API.',
      day: 'Esta semana conecté el nuevo flujo de onboarding del producto con los endpoints del equipo y tuve que crear dos rutas nuevas en Go. Mi mayor reto es mantener consistencia entre contratos de API y la UI cuando el backend cambia rápido.',
      challenges: 'Falta alguien de backend puro que nos ayude con la carga. Muchas veces yo termino cubriendo cosas de backend que no son mi rol principal y se retrasa el trabajo de producto.',
      ideal: 'Alguien con ownership claro de la capa de backend, que comunique bien los cambios de API con anticipación y que tenga disposición a pair con el equipo de frontend cuando la integración es compleja.',
    },
  },
  {
    id: 'tm3',
    name: 'Marcus Thorne',
    role: 'DevOps / SRE Engineer',
    avatar: 'marcus',
    mockData: {
      techTags: ['Kubernetes', 'Terraform', 'GCP', 'GitHub Actions', 'Prometheus', 'Grafana', 'Docker'],
      tech: 'Mantengo toda la infra en GCP con Terraform. Kubernetes para orquestación, Prometheus y Grafana para observabilidad, GitHub Actions para CI/CD. Soy el único que toca el cluster de producción actualmente.',
      day: 'Configuro autoscalers, resuelvo problemas de OOM en pods, mantengo los pipelines. Esta semana el build de Go está tardando 28 minutos y quiero bajar eso. También toco bastante el monitoring y las alertas.',
      challenges: 'El equipo necesita alguien que entienda Kubernetes y pueda autosuficientarse en infra básica. No puedo ser el único cuello de botella para cualquier cosa que involucre el cluster. La documentación de la infra también está muy desactualizada.',
      ideal: 'Alguien que sepa Kubernetes a nivel operativo, no solo teoría. Que pueda leer los logs de un pod y debuggear un problema de networking sin necesitar mi ayuda cada vez. Bonus si sabe algo de Terraform.',
    },
  },
  {
    id: 'tm4',
    name: 'Ana Gutiérrez',
    role: 'Frontend Engineer',
    avatar: 'ana',
    mockData: {
      techTags: ['React', 'TypeScript', 'GraphQL', 'Figma', 'Storybook'],
      tech: 'Trabajo principalmente en React y TypeScript. Usamos GraphQL para algunas consultas y tenemos un Storybook para componentes. Mi trabajo está muy alineado con Diseño.',
      day: 'Implemento features de producto basadas en los diseños de Figma. Esta semana estuve en el rediseño del dashboard principal y en la migración de algunos componentes legacy a nuestro nuevo Design System.',
      challenges: 'Los cambios de backend a veces nos rompen cosas en el frontend sin previo aviso. Necesitamos mejores prácticas de contrato-first API y alguien que entienda la perspectiva del consumidor de la API.',
      ideal: 'Alguien empático con el frontend, que piense en el consumidor de la API al diseñarla. Que documente los cambios y avise con anticipación. Que tenga buena comunicación interdisciplinar.',
    },
  },
];

// ── COMPONENT ──

export const TeamMemberPortal: React.FC = () => {
  const [activeMemberId, setActiveMemberId] = useState<string>('tm1');
  const [step, setStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<FormData>({
    tech: '',
    techTags: [],
    day: '',
    challenges: '',
    ideal: '',
  });

  const [tagInput, setTagInput] = useState('');

  const activeMember = TEAM_MEMBERS.find((m) => m.id === activeMemberId)!;
  const currentSection = SECTIONS[step];
  const isLastStep = step === SECTIONS.length - 1;

  const filledCount = SECTIONS.filter((s) => {
    if (s.key === 'tech') return form.tech.trim() || form.techTags.length > 0;
    return (form[s.key as keyof FormData] as string).trim().length > 0;
  }).length;

  const handleMemberSwitch = (id: string) => {
    setActiveMemberId(id);
    setStep(0);
    setSubmitted(false);
    setForm({ tech: '', techTags: [], day: '', challenges: '', ideal: '' });
    setTagInput('');
  };

  const handleMockFill = () => {
    setForm(activeMember.mockData);
  };

  const handleNext = () => {
    if (step < SECTIONS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const addTag = (tag: string) => {
    const clean = tag.trim();
    if (clean && !form.techTags.includes(clean)) {
      setForm((prev) => ({ ...prev, techTags: [...prev.techTags, clean] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({ ...prev, techTags: prev.techTags.filter((t) => t !== tag) }));
  };

  const handleSubmit = () => setSubmitted(true);

  if (submitted) {
    return (
      <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 shadow-xl shadow-secondary/30">
          <ThumbsUp className="text-white" size={36} />
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-3">¡Gracias, {activeMember.name.split(' ')[0]}!</h2>
        <p className="text-on-surface-variant mb-2">Tu feedback fue enviado al Hiring Manager.</p>
        <p className="text-sm text-outline mb-8">Se usará para enriquecer el perfil de la vacante y generar preguntas más relevantes.</p>
        <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-8">
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-sm">
            <p className="font-headline text-2xl font-black text-secondary">{form.techTags.length}</p>
            <p className="text-[10px] uppercase font-bold text-outline mt-1">Tecnologías</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-sm">
            <p className="font-headline text-2xl font-black text-secondary">{filledCount}</p>
            <p className="text-[10px] uppercase font-bold text-outline mt-1">Secciones</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-sm">
            <p className="font-headline text-2xl font-black text-secondary">4</p>
            <p className="text-[10px] uppercase font-bold text-outline mt-1">Equipo</p>
          </div>
        </div>

        {/* Summary card */}
        <div className="w-full bg-surface-container-lowest p-6 rounded-2xl shadow-sm text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Tu Feedback Resumido</p>
          {form.techTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {form.techTags.map((t) => (
                <span key={t} className="px-2 py-1 bg-secondary/10 text-secondary text-[11px] font-bold rounded-lg">{t}</span>
              ))}
            </div>
          )}
          {form.day && <p className="text-xs text-on-surface-variant leading-relaxed mb-2">{form.day.slice(0, 120)}...</p>}
        </div>

        <button onClick={() => handleMemberSwitch(activeMemberId)} className="mt-6 px-6 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-all">
          Enviar otro feedback
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <nav className="flex text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-2">
          <span className="opacity-50">TripleA</span>
          <span className="mx-2 opacity-50">/</span>
          <span>Mi Feedback</span>
        </nav>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">
              Hola, {activeMember.name.split(' ')[0]}!
            </h2>
            <p className="text-on-surface-variant mt-1">Tu perspectiva ayuda a definir quién encajará mejor en el equipo.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMockFill}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider bg-amber-500 text-white shadow-md shadow-amber-500/25 hover:opacity-90 transition-all"
            >
              <FlaskConical size={14} />
              Mock
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
              <CheckCircle2 className="text-secondary" size={14} />
              <span className="text-xs font-bold text-on-surface-variant">{filledCount}/{SECTIONS.length} completadas</span>
            </div>
          </div>
        </div>
      </header>

      {/* Member switcher (demo mode) */}
      <div className="mb-6 p-4 bg-surface-container-lowest rounded-2xl shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Seleccionar miembro del equipo (demo)</p>
        <div className="flex gap-3">
          {TEAM_MEMBERS.map((m) => (
            <button
              key={m.id}
              onClick={() => handleMemberSwitch(m.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                activeMemberId === m.id
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <img
                src={`https://picsum.photos/seed/${m.avatar}/100/100`}
                alt={m.name}
                className="w-7 h-7 rounded-full object-cover border-2 border-white/20"
                referrerPolicy="no-referrer"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-tight">{m.name.split(' ')[0]}</p>
                <p className={`text-[10px] ${activeMemberId === m.id ? 'text-white/70' : 'text-outline'}`}>{m.role.split(' ')[0]}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8 bg-surface-container-lowest rounded-2xl p-2 shadow-sm">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step || (form.tech.trim() || form.techTags.length > 0 ? s.key === 'tech' : false)
            || (s.key !== 'tech' && (form[s.key as keyof FormData] as string).trim().length > 0);
          return (
            <React.Fragment key={s.key}>
              <button
                onClick={() => setStep(i)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${
                  active
                    ? 'bg-secondary text-white shadow-md'
                    : 'text-on-surface-variant hover:bg-surface-container-low cursor-pointer'
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
          <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
            <currentSection.icon className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">{currentSection.title}</h3>
            <p className="text-xs text-on-surface-variant">{currentSection.subtitle}</p>
          </div>
        </div>

        {/* Tech section: tags + text */}
        {currentSection.key === 'tech' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Agrega tecnologías rápido</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {TECH_SUGGESTIONS.filter((t) => !form.techTags.includes(t)).slice(0, 12).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-container-low text-on-surface-variant text-[11px] font-bold rounded-lg border border-outline-variant/20 hover:border-secondary hover:text-secondary transition-all"
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
                  placeholder="Otra tecnología... (Enter para agregar)"
                  className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary transition-all"
                />
                <button onClick={() => addTag(tagInput)} disabled={!tagInput.trim()} className="px-4 py-2 bg-secondary text-white rounded-lg font-bold text-sm disabled:opacity-40">+</button>
              </div>
              {form.techTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.techTags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white text-[11px] font-bold rounded-lg">
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
                onChange={(e) => setForm((prev) => ({ ...prev, tech: e.target.value }))}
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none"
                placeholder="¿Para qué usas estas herramientas? ¿Qué parte de la infra manejas?"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Other sections */}
        {currentSection.key !== 'tech' && (
          <textarea
            value={form[currentSection.key as keyof FormData] as string}
            onChange={(e) => setForm((prev) => ({ ...prev, [currentSection.key]: e.target.value }))}
            className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none"
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
            <button onClick={handleBack} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-all">
              <ChevronLeft size={16} />Anterior
            </button>
          )}
        </div>
        <div>
          {!isLastStep ? (
            <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all shadow-lg">
              Siguiente<ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg">
              <Send size={16} />Enviar mi feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
