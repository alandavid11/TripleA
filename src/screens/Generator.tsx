import React, { useState } from 'react';
import {
  Upload,
  FileText,
  X,
  Users,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Loader2,
  PlusCircle,
  FlaskConical,
} from 'lucide-react';
import { UserRole, InterviewQuestion, UploadedFile } from '../types';

interface GeneratorProps {
  activeRole: UserRole;
}

const MOCK_QUESTIONS: InterviewQuestion[] = [
  {
    id: '1',
    category: 'Technical Architecture',
    question: '¿Cómo diseñarías un sistema de colas para procesar 10M de eventos por segundo?',
    expectedAnswer: 'Debería mencionar message brokers (Kafka/RabbitMQ), particionamiento, backpressure, idempotencia y estrategias de retry con dead-letter queues.',
    candidateAnswer: '',
  },
  {
    id: '2',
    category: 'Problem Solving',
    question: '¿Describe una situación donde tuviste que refactorizar un sistema legacy crítico. ¿Qué estrategia usaste?',
    expectedAnswer: 'Buscar mención de strangler fig pattern, feature flags, pruebas de regresión exhaustivas, migración gradual y comunicación con stakeholders.',
    candidateAnswer: '',
  },
  {
    id: '3',
    category: 'Team Collaboration',
    question: '¿Cómo manejas desacuerdos técnicos con otros seniors del equipo?',
    expectedAnswer: 'Evidencia de debate basado en datos, prototipos/POCs para validar ideas, capacidad de ceder cuando hay mejor evidencia, y documentación de decisiones (ADRs).',
    candidateAnswer: '',
  },
  {
    id: '4',
    category: 'DevOps & Infrastructure',
    question: '¿Qué estrategia de CI/CD implementarías para un equipo de 15 desarrolladores?',
    expectedAnswer: 'Trunk-based development o GitFlow según contexto, pipelines con stages (lint, test, build, deploy), ambientes de staging, canary/blue-green deployments.',
    candidateAnswer: '',
  },
];

const MOCK_GENERATED_JD = {
  title: 'Senior Backend Engineer',
  summary: 'Buscamos un Senior Backend Engineer para liderar la evolución de nuestros sistemas distribuidos de alta escala. El candidato ideal arquitectará microservicios robustos, mentorizará al equipo junior y definirá el roadmap técnico del motor de procesamiento core.',
  skills: ['Go / Rust', 'Kubernetes', 'PostgreSQL', 'gRPC', 'CI/CD', 'System Design'],
  responsibilities: [
    'Diseñar y mantener microservicios de alta concurrencia.',
    'Liderar code reviews y establecer estándares arquitectónicos.',
    'Colaborar con SRE para optimizar costos de infraestructura.',
    'Definir y monitorear SLOs para servicios críticos.',
  ],
};

const MOCK_TEAM_ACTIVITIES = `- El equipo trabaja con microservicios en Go y gRPC
- Usan Kubernetes en GCP para orquestación de servicios
- Practican trunk-based development con CI/CD en GitHub Actions
- Sprint reviews cada 2 semanas con planning trimestral
- Necesitan alguien que lidere la migración a event-driven architecture
- Stack actual: Go, PostgreSQL, Redis, Kafka, Terraform`;

const MOCK_FILES: UploadedFile[] = [
  { name: 'JD_Senior_Backend_Engineer.pdf', size: '245.3 KB', type: 'pdf' },
  { name: 'Skills_Matrix_Platform_Team.pdf', size: '128.7 KB', type: 'pdf' },
];

const MOCK_CANDIDATE_ANSWERS: Record<string, string> = {
  '1': 'Implementaría Kafka como message broker con particionamiento por tenant ID, usando consumer groups para escalar horizontalmente. Aplicaría backpressure con rate limiting y tendría dead-letter queues para mensajes fallidos con retry exponencial.',
  '2': 'En mi empresa anterior migré un monolito de pagos usando strangler fig pattern. Empecé por las rutas de menor riesgo, usé feature flags para rollback seguro y mantuve ambos sistemas en paralelo 3 meses con tests de regresión automatizados.',
  '3': 'Prefiero proponer un POC rápido cuando hay desacuerdo técnico. En mi equipo anterior documentábamos las decisiones en ADRs y votábamos basándonos en datos de performance y mantenibilidad, no en opiniones.',
  '4': 'Implementaría trunk-based development con feature flags, pipelines de CI con lint/test/build paralelos, deploy automático a staging y canary releases a producción con rollback automático si las métricas caen.',
};

export const Generator: React.FC<GeneratorProps> = ({ activeRole }) => {
  const [mockMode, setMockMode] = useState(false);
  const [jdFiles, setJdFiles] = useState<UploadedFile[]>([]);
  const [teamActivities, setTeamActivities] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(MOCK_QUESTIONS);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [teamContext, setTeamContext] = useState('Platform Engineering');
  const [roleType, setRoleType] = useState('Senior Backend Engineer');

  const toggleMockMode = () => {
    const next = !mockMode;
    setMockMode(next);
    if (next) {
      setJdFiles(MOCK_FILES);
      setTeamActivities(MOCK_TEAM_ACTIVITIES);
      setTeamContext('Platform Engineering');
      setRoleType('Senior Backend Engineer');
      setQuestions(
        MOCK_QUESTIONS.map((q) => ({
          ...q,
          candidateAnswer: MOCK_CANDIDATE_ANSWERS[q.id] ?? '',
        }))
      );
    } else {
      setJdFiles([]);
      setTeamActivities('');
      setGenerated(false);
      setMatchScore(null);
      setQuestions(MOCK_QUESTIONS);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.name.endsWith('.pdf') ? 'pdf' : f.name.endsWith('.doc') || f.name.endsWith('.docx') ? 'doc' : 'other',
    }));
    setJdFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setJdFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  const handleCandidateAnswer = (id: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, candidateAnswer: answer } : q))
    );
  };

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const answeredCount = questions.filter((q) => q.candidateAnswer.trim().length > 0).length;
      const base = answeredCount / questions.length;
      setMatchScore(Math.round(base * 85 + Math.random() * 15));
    }, 1800);
  };

  const answeredAll = questions.every((q) => q.candidateAnswer.trim().length > 0);
  const hasInputs = jdFiles.length > 0 || teamActivities.trim().length > 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <nav className="flex text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-2">
          <span className="opacity-50">TripleA</span>
          <span className="mx-2 opacity-50">/</span>
          <span>Profile Generator</span>
        </nav>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">
              Job Profile Architect
            </h2>
            <p className="text-on-surface-variant mt-1">
              {activeRole === 'hr'
                ? 'Genera perfiles de puesto optimizados y evalúa candidatos con IA.'
                : 'Define requisitos técnicos y actividades del equipo para generar perfiles precisos.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMockMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${
                mockMode
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <FlaskConical size={14} />
              Mock {mockMode ? 'ON' : 'OFF'}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
              <div className={`w-2 h-2 rounded-full ${activeRole === 'hr' ? 'bg-secondary' : 'bg-primary-container'}`} />
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Vista: {activeRole === 'hr' ? 'Recursos Humanos' : 'Hiring Manager'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── STEP 1: INPUTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Job Description & Skills Upload */}
        <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Job Description & Skills</h3>
              <p className="text-xs text-on-surface-variant">Sube la JD original y documentos de habilidades requeridas</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-outline ml-1">Equipo</label>
                <div className="relative">
                  <select
                    value={teamContext}
                    onChange={(e) => setTeamContext(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-secondary transition-all appearance-none"
                  >
                    <option>Platform Engineering</option>
                    <option>Infrastructure & SRE</option>
                    <option>Product & Growth</option>
                    <option>Data & AI Systems</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={14} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-outline ml-1">Rol</label>
                <input
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-secondary transition-all"
                  placeholder="e.g., Senior Backend Engineer"
                  type="text"
                />
              </div>
            </div>

            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant/40 rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all group">
              <Upload className="text-outline-variant group-hover:text-secondary mb-3 transition-colors" size={32} />
              <span className="text-sm font-bold text-on-surface-variant group-hover:text-secondary transition-colors">
                Arrastra archivos PDF o haz clic para subir
              </span>
              <span className="text-[10px] text-outline mt-1">Job Description, Skills Matrix, Role Requirements</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>

            {jdFiles.length > 0 && (
              <div className="space-y-2">
                {jdFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-error-container rounded-lg flex items-center justify-center">
                        <FileText className="text-on-error-container" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{file.name}</p>
                        <p className="text-[10px] text-outline">{file.size}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(i)} className="p-1 hover:bg-surface-container-high rounded transition-colors">
                      <X className="text-outline" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Team Activities Input */}
        <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">Actividades del Equipo</h3>
              <p className="text-xs text-on-surface-variant">Describe las actividades actuales del equipo receptor</p>
            </div>
          </div>

          <textarea
            value={teamActivities}
            onChange={(e) => setTeamActivities(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none"
            placeholder={"Ejemplo:\n- El equipo trabaja con microservicios en Go y gRPC\n- Usan Kubernetes para orquestación\n- Practican trunk-based development\n- Sprint reviews cada 2 semanas\n- Necesitan alguien que lidere la migración a event-driven architecture"}
            rows={8}
          />

          <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
            <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Contexto rápido</p>
            <div className="flex flex-wrap gap-2">
              {['Microservicios', 'Monolito', 'Event-Driven', 'REST APIs', 'GraphQL', 'Data Pipeline'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTeamActivities((prev) => prev + (prev ? '\n- ' : '- ') + tag)}
                  className="px-3 py-1.5 bg-surface-container-lowest text-on-surface-variant text-[11px] font-bold rounded-lg border border-outline-variant/20 hover:border-secondary hover:text-secondary transition-all"
                >
                  <PlusCircle className="inline mr-1" size={12} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-12">
        <button
          onClick={handleGenerate}
          disabled={!hasInputs || isGenerating}
          className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
            hasInputs && !isGenerating
              ? 'bg-primary-container text-white hover:opacity-90 cursor-pointer'
              : 'bg-surface-container-high text-outline cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Procesando con IA...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generar con IA
            </>
          )}
        </button>
      </div>

      {/* ── STEP 2: GENERATED OUTPUT ── */}
      {generated && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            {/* Polished JD */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center">
                      <BrainCircuit className="text-on-secondary-container" size={20} />
                    </div>
                    <div>
                      <h3 className="font-headline text-xl font-bold text-on-surface">
                        {MOCK_GENERATED_JD.title}
                      </h3>
                      <p className="text-xs text-on-surface-variant">Job Description optimizada por IA</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-widest rounded-full">
                    AI Generated
                  </span>
                </div>

                <p className="text-sm text-on-surface leading-relaxed mb-6">{MOCK_GENERATED_JD.summary}</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Skills Requeridas</h4>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_GENERATED_JD.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-[11px] font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Equipo Destino</h4>
                    <p className="text-sm font-semibold text-primary-container">{teamContext}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{roleType}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Responsabilidades Clave</h4>
                  <ul className="space-y-3">
                    {MOCK_GENERATED_JD.responsibilities.map((resp, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary-container text-white text-[10px] font-bold rounded-full flex-shrink-0">
                          0{i + 1}
                        </span>
                        <p className="text-sm leading-snug">{resp}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Interview Questions Panel */}
            <div className="lg:col-span-5">
              <div className="bg-primary-container text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -mr-10 -mt-10 rounded-full" />
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardList className="text-secondary" size={24} />
                  <div>
                    <h3 className="font-headline text-xl font-bold">Preguntas de Entrevista</h3>
                    <p className="text-xs text-on-primary-container">Generadas por IA con respuestas esperadas</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {questions.map((q, i) => (
                    <div key={q.id} className="border-b border-white/10 pb-4 last:border-0">
                      <p className="text-[10px] font-black uppercase text-on-primary-container tracking-widest mb-1">
                        {q.category} — Q{i + 1}
                      </p>
                      <p className="text-sm font-semibold mb-2">"{q.question}"</p>
                      <div className="p-3 bg-white/5 rounded-lg border-l-2 border-secondary">
                        <p className="text-[10px] text-on-primary-container uppercase font-bold mb-1">Respuesta esperada:</p>
                        <p className="text-xs italic opacity-80">{q.expectedAnswer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── STEP 3: HR CANDIDATE EVALUATION ── */}
          {activeRole === 'hr' && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Evaluación del Candidato</h3>
                  <p className="text-sm text-on-surface-variant">
                    Ingresa las respuestas reales del candidato para obtener el porcentaje de match
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 flex items-center justify-center bg-primary-container text-white text-xs font-bold rounded-lg flex-shrink-0">
                        Q{i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-on-surface mb-1">{q.question}</p>
                        <p className="text-[10px] text-outline uppercase font-bold mb-3">{q.category}</p>
                        <textarea
                          value={q.candidateAnswer}
                          onChange={(e) => handleCandidateAnswer(q.id, e.target.value)}
                          className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none"
                          placeholder="Escribe la respuesta del candidato..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={handleEvaluate}
                  disabled={!answeredAll || isEvaluating}
                  className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${
                    answeredAll && !isEvaluating
                      ? 'bg-secondary text-white hover:opacity-90 cursor-pointer'
                      : 'bg-surface-container-high text-outline cursor-not-allowed'
                  }`}
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Evaluando con IA...
                    </>
                  ) : (
                    <>
                      <BarChart3 size={20} />
                      Evaluar Match con IA
                    </>
                  )}
                </button>
              </div>
            </section>
          )}

          {/* ── MATCH RESULT ── */}
          {matchScore !== null && (
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-surface-container-high" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                      <circle
                        className={matchScore >= 70 ? 'text-secondary' : 'text-error'}
                        cx="56"
                        cy="56"
                        fill="transparent"
                        r="48"
                        stroke="currentColor"
                        strokeDasharray="301"
                        strokeDashoffset={301 - (301 * matchScore) / 100}
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className={`absolute font-headline font-black text-3xl ${matchScore >= 70 ? 'text-secondary' : 'text-error'}`}>
                      {matchScore}%
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Match Score</h3>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {matchScore >= 80
                        ? 'Excelente candidato. Altamente compatible con el perfil.'
                        : matchScore >= 60
                          ? 'Buen candidato con áreas de desarrollo identificadas.'
                          : 'El candidato necesita desarrollo significativo en áreas clave.'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={matchScore >= 70 ? 'text-secondary' : 'text-error'} size={20} />
                  <span className={`text-sm font-bold ${matchScore >= 70 ? 'text-secondary' : 'text-error'}`}>
                    {matchScore >= 80 ? 'Recomendado' : matchScore >= 60 ? 'Considerar' : 'No recomendado'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
