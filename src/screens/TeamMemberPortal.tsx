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
    placeholder: 'Describe las tecnologías con las que trabajas regularmente, frameworks, bases de datos, herramientas de infra...',
    prompt: '¿Qué herramientas y lenguajes usas cada día?',
  },
  {
    key: 'day',
    icon: Zap,
    title: 'Día a Día',
    subtitle: 'Cuéntanos qué haces en una semana típica',
    placeholder: 'Cuéntanos como si le explicaras a un amigo... "Básicamente me la paso haciendo APIs, revisando PRs, y peleando con Kubernetes cuando algo truena en staging..."',
    prompt: '¿Qué ocupa la mayor parte de tu semana?',
  },
  {
    key: 'challenges',
    icon: MessageCircle,
    title: 'Retos del Equipo',
    subtitle: 'Problemas técnicos o de proceso que enfrenta el equipo',
    placeholder: 'Ej: Tenemos deuda técnica en el módulo de pagos, los deploys son lentos porque el pipeline de CI no está paralelizado, nos faltan más manos para code reviews...',
    prompt: '¿Qué desafíos está enfrentando el equipo actualmente?',
  },
  {
    key: 'ideal',
    icon: Users,
    title: 'El Candidato Ideal',
    subtitle: '¿Qué skills y actitud buscarías en un nuevo compañero?',
    placeholder: 'Piensa en quién haría tu equipo más fuerte. ¿Qué técnico? ¿Qué actitud? ¿Qué experiencia ayudaría más?',
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

export const TeamMemberPortal: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<FormData>({
    tech: '',
    techTags: [],
    day: '',
    challenges: '',
    ideal: '',
  });

  const currentSection = SECTIONS[step];
  const isLastStep = step === SECTIONS.length - 1;
  const filledCount = SECTIONS.filter((s) => {
    if (s.key === 'tech') return form.tech.trim() || form.techTags.length > 0;
    return (form[s.key as keyof FormData] as string).trim().length > 0;
  }).length;

  const handleNext = () => {
    if (step < SECTIONS.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const addTag = (tag: string) => {
    if (tag && !form.techTags.includes(tag)) {
      setForm((prev) => ({ ...prev, techTags: [...prev.techTags, tag] }));
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
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-3">¡Gracias, Carlos!</h2>
        <p className="text-on-surface-variant mb-2">Tu feedback fue enviado al Hiring Manager.</p>
        <p className="text-sm text-outline mb-8">Se usará para enriquecer el perfil de la vacante y generar preguntas más relevantes para los candidatos.</p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-sm">
            <p className="font-headline text-2xl font-black text-secondary">{form.techTags.length + (form.tech ? 1 : 0)}</p>
            <p className="text-[10px] uppercase font-bold text-outline mt-1">Tech items</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-2xl text-center shadow-sm">
            <p className="font-headline text-2xl font-black text-secondary">{filledCount}</p>
            <p className="text-[10px] uppercase font-bold text-outline mt-1">Secciones</p>
          </div>
        </div>
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
              Hola, Carlos!
            </h2>
            <p className="text-on-surface-variant mt-1">
              Tu perspectiva ayuda a definir quién encajará mejor en el equipo. Solo toma 5 minutos.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
            <CheckCircle2 className="text-secondary" size={14} />
            <span className="text-xs font-bold text-on-surface-variant">{filledCount}/{SECTIONS.length} completadas</span>
          </div>
        </div>
      </header>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 bg-surface-container-lowest rounded-2xl p-2 shadow-sm">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          const active = i === step;
          const done = i < step || (i === step && (() => {
            if (s.key === 'tech') return form.tech.trim() || form.techTags.length > 0;
            return (form[s.key as keyof FormData] as string).trim().length > 0;
          })());
          return (
            <React.Fragment key={s.key}>
              <button
                onClick={() => setStep(i)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${
                  active
                    ? 'bg-secondary text-white shadow-md'
                    : done
                      ? 'text-secondary hover:bg-secondary/5 cursor-pointer'
                      : 'text-on-surface-variant hover:bg-surface-container-low cursor-pointer'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-white/20' : done ? 'bg-secondary text-white' : 'bg-surface-container-high'}`}>
                  {done && !active ? <CheckCircle2 size={12} className="text-white" /> : <Icon size={10} className={active ? 'text-white' : ''} />}
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">
                Agrega tecnologías rápido
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {TECH_SUGGESTIONS.filter((t) => !form.techTags.includes(t)).map((tag) => (
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
                  onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput.trim())}
                  placeholder="Otra tecnología... (Enter para agregar)"
                  className="flex-1 bg-surface-container-low border-none rounded-lg p-3 text-sm focus:ring-2 focus:ring-secondary transition-all"
                />
                <button
                  onClick={() => addTag(tagInput.trim())}
                  disabled={!tagInput.trim()}
                  className="px-4 py-2 bg-secondary text-white rounded-lg font-bold text-sm disabled:opacity-40"
                >
                  +
                </button>
              </div>
              {form.techTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.techTags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white text-[11px] font-bold rounded-lg">
                      {tag}
                      <button onClick={() => removeTag(tag)}><X size={10} /></button>
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
                placeholder="Cuéntanos más sobre el contexto: ¿para qué usas estas herramientas? ¿qué parte de la infra manejas?"
                rows={4}
              />
            </div>
          </div>
        )}

        {/* Other sections: free text */}
        {currentSection.key !== 'tech' && (
          <div className="space-y-4">
            <textarea
              value={form[currentSection.key as keyof FormData] as string}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [currentSection.key]: e.target.value }))
              }
              className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none"
              placeholder={currentSection.placeholder}
              rows={8}
            />
          </div>
        )}

        {/* Prompt tip */}
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
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg"
            >
              <Send size={16} />Enviar mi feedback
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
