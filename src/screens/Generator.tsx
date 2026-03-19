import React, { useState } from 'react';
import {
  Upload,
  FileText,
  X,
  Gift,
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
  AlertTriangle,
  Eye,
  Send,
  Inbox,
  ChevronRight,
  UserCheck,
  UserX,
  TrendingUp,
} from 'lucide-react';
import { UserRole, InterviewQuestion, UploadedFile, CvCandidate } from '../types';

interface GeneratorProps {
  activeRole: UserRole;
}

// ── MOCK DATA ──

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
  benefits: [
    'Trabajo 100% remoto con horario flexible',
    'Seguro de gastos médicos mayores y menores',
    'Vales de despensa y fondo de ahorro',
    'Presupuesto anual de capacitación ($2,000 USD)',
    '20 días de vacaciones desde el primer año',
  ],
};

const MOCK_TEAM_SUMMARY = `El equipo trabaja con microservicios en Go y gRPC, usa Kubernetes en GCP para orquestación, practica trunk-based development con CI/CD en GitHub Actions. Sprint reviews cada 2 semanas con planning trimestral. Necesitan alguien que lidere la migración a event-driven architecture. Stack: Go, PostgreSQL, Redis, Kafka, Terraform.`;

const MOCK_FILES: UploadedFile[] = [
  { name: 'JD_Senior_Backend_Engineer.pdf', size: '245.3 KB', type: 'pdf' },
  { name: 'Skills_Matrix_Platform_Team.pdf', size: '128.7 KB', type: 'pdf' },
];

const MOCK_BENEFITS = `- Trabajo 100% remoto con horario flexible\n- Seguro de gastos médicos mayores y menores\n- Vales de despensa y fondo de ahorro\n- Presupuesto anual de capacitación ($2,000 USD)\n- 20 días de vacaciones desde el primer año\n- Bonos trimestrales por desempeño`;

const MOCK_CV_CANDIDATES: CvCandidate[] = [
  {
    id: 'cv1',
    name: 'Diana Torres',
    matchScore: 91,
    status: 'approved',
    currentRole: 'Senior Backend Engineer @ MercadoLibre',
    experience: '7 años en sistemas distribuidos',
    strengths: ['Go y microservicios en producción', 'Kubernetes a escala', 'Experiencia con Kafka y event-driven', 'Liderazgo técnico de equipos de 6+'],
    gaps: [],
    feedback: '',
  },
  {
    id: 'cv2',
    name: 'Andrés Salazar',
    matchScore: 84,
    status: 'approved',
    currentRole: 'Backend Lead @ Rappi',
    experience: '6 años en backend de alto tráfico',
    strengths: ['PostgreSQL avanzado y sharding', 'CI/CD con GitHub Actions', 'gRPC y protobuf', 'Mentoría de juniors'],
    gaps: ['Poca experiencia con Terraform'],
    feedback: '',
  },
  {
    id: 'cv3',
    name: 'Valentina Rojas',
    matchScore: 76,
    status: 'approved',
    currentRole: 'Software Engineer III @ Nubank',
    experience: '5 años en fintech con Go',
    strengths: ['Go en producción 4 años', 'Event sourcing y CQRS', 'Cultura de testing fuerte'],
    gaps: ['Sin experiencia directa con Kubernetes', 'No ha liderado equipos formalmente'],
    feedback: '',
  },
  {
    id: 'cv4',
    name: 'Roberto Vega',
    matchScore: 38,
    status: 'rejected',
    currentRole: 'PHP Developer @ Agencia Web',
    experience: '4 años en desarrollo web',
    strengths: ['Buena actitud y ganas de aprender', 'Experiencia con Laravel'],
    gaps: ['Sin experiencia en sistemas distribuidos', 'No conoce Kubernetes ni contenedores', 'Experiencia limitada a monolitos PHP'],
    feedback: 'El candidato tiene buena actitud y capacidad de aprendizaje, pero su experiencia técnica está centrada en monolitos PHP y no cuenta con las bases necesarias en sistemas distribuidos, orquestación de contenedores ni message brokers que el puesto requiere. Recomendamos enfocarse en cursos de arquitectura de microservicios y Kubernetes.',
  },
  {
    id: 'cv5',
    name: 'Laura Méndez',
    matchScore: 45,
    status: 'rejected',
    currentRole: 'Backend Developer @ Startup',
    experience: '3 años en backend con Go',
    strengths: ['Conocimiento básico de Go', 'Familiaridad con PostgreSQL'],
    gaps: ['CI/CD limitado a deploys manuales', 'Sin experiencia con event-driven architecture', 'No ha trabajado a escala'],
    feedback: 'La candidata demuestra conocimiento en backend con Go, pero su experiencia en CI/CD se limita a scripts manuales y no ha trabajado con arquitecturas event-driven ni a la escala requerida. Sugerimos profundizar en GitHub Actions, pipelines automatizados y patrones como CQRS/Event Sourcing.',
  },
  {
    id: 'cv6',
    name: 'Pedro Castillo',
    matchScore: 22,
    status: 'rejected',
    currentRole: 'Junior Frontend Developer',
    experience: '1.5 años en frontend con React',
    strengths: ['Motivación para transicionar a backend'],
    gaps: ['Sin experiencia en backend', 'No conoce Go ni lenguajes de sistemas', 'Sin conocimiento de infraestructura cloud'],
    feedback: 'El candidato es desarrollador frontend junior y no cuenta con experiencia en backend, sistemas distribuidos ni infraestructura cloud. El perfil no se alinea con los requisitos del puesto. Recomendamos ganar experiencia en desarrollo backend antes de aplicar a posiciones senior.',
  },
];

const MOCK_CANDIDATE_ANSWERS: Record<string, string> = {
  '1': 'Implementaría Kafka como message broker con particionamiento por tenant ID, usando consumer groups para escalar horizontalmente. Aplicaría backpressure con rate limiting y tendría dead-letter queues para mensajes fallidos con retry exponencial.',
  '2': 'En mi empresa anterior migré un monolito de pagos usando strangler fig pattern. Empecé por las rutas de menor riesgo, usé feature flags para rollback seguro y mantuve ambos sistemas en paralelo 3 meses con tests de regresión automatizados.',
  '3': 'Prefiero proponer un POC rápido cuando hay desacuerdo técnico. En mi equipo anterior documentábamos las decisiones en ADRs y votábamos basándonos en datos de performance y mantenibilidad, no en opiniones.',
  '4': 'Implementaría trunk-based development con feature flags, pipelines de CI con lint/test/build paralelos, deploy automático a staging y canary releases a producción con rollback automático si las métricas caen.',
};

// ── COMPONENT ──

export const Generator: React.FC<GeneratorProps> = ({ activeRole }) => {
  const [mockMode, setMockMode] = useState(false);
  const [jdFiles, setJdFiles] = useState<UploadedFile[]>([]);
  const [companyBenefits, setCompanyBenefits] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [teamContext, setTeamContext] = useState('Platform Engineering');
  const [roleType, setRoleType] = useState('Senior Backend Engineer');
  const [hmSubmitted, setHmSubmitted] = useState(false);

  // Step 3: CV Screening
  const [screeningVisible, setScreeningVisible] = useState(false);
  const [cvCandidates, setCvCandidates] = useState<CvCandidate[]>([]);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);

  // Step 4: Interview
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(MOCK_QUESTIONS);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const approvedCandidates = cvCandidates.filter((c) => c.status === 'approved');
  const rejectedCandidates = cvCandidates.filter((c) => c.status === 'rejected');
  const interviewCandidate = cvCandidates.find((c) => c.id === selectedCandidate);
  const answeredAll = questions.every((q) => q.candidateAnswer.trim().length > 0);
  const canGenerate = activeRole === 'hr' && (jdFiles.length > 0 || companyBenefits.trim().length > 0);

  const toggleMockMode = () => {
    const next = !mockMode;
    setMockMode(next);
    if (next) {
      setJdFiles(MOCK_FILES);
      setCompanyBenefits(MOCK_BENEFITS);
      setTeamContext('Platform Engineering');
      setRoleType('Senior Backend Engineer');
      setHmSubmitted(true);
      setCvCandidates(MOCK_CV_CANDIDATES);
      setQuestions(
        MOCK_QUESTIONS.map((q) => ({
          ...q,
          candidateAnswer: MOCK_CANDIDATE_ANSWERS[q.id] ?? '',
        }))
      );
    } else {
      setJdFiles([]);
      setCompanyBenefits('');
      setGenerated(false);
      setScreeningVisible(false);
      setCvCandidates([]);
      setSelectedCandidate(null);
      setMatchScore(null);
      setHmSubmitted(false);
      setExpandedCandidate(null);
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

  const handleShowScreening = () => {
    if (cvCandidates.length === 0) {
      setCvCandidates(MOCK_CV_CANDIDATES);
    }
    setScreeningVisible(true);
  };

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidate(id);
    setMatchScore(null);
    setQuestions(MOCK_QUESTIONS.map((q) => ({ ...q, candidateAnswer: mockMode ? (MOCK_CANDIDATE_ANSWERS[q.id] ?? '') : '' })));
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

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
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
                ? 'Genera perfiles, filtra candidatos por CV y entrevista a los mejores.'
                : 'Revisa los inputs del equipo y la información de la vacante.'}
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
                {activeRole === 'hr' ? 'Recursos Humanos' : 'Hiring Manager'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── FLOW INDICATOR ── */}
      <div className="flex items-center gap-3 mb-8 px-2 overflow-x-auto no-scrollbar">
        {[
          { label: activeRole === 'hr' ? 'JD & Beneficios' : 'JD & Documentos', done: jdFiles.length > 0 },
          { label: 'Generar con IA', done: generated, hrOnly: true },
          { label: 'Screening CVs', done: screeningVisible, hrOnly: true },
          { label: 'Entrevistas', done: matchScore !== null, hrOnly: true },
        ]
          .filter((s) => !s.hrOnly || activeRole === 'hr')
          .map((s, i, arr) => (
            <React.Fragment key={i}>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                    s.done ? 'bg-secondary text-white' : 'bg-surface-container-high text-outline'
                  }`}
                >
                  {s.done ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span className={`text-xs font-bold whitespace-nowrap ${s.done ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 min-w-[24px] h-px ${s.done ? 'bg-secondary' : 'bg-outline-variant/30'}`} />
              )}
            </React.Fragment>
          ))}
      </div>

      {/* ── STEP 1: INPUTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* JD Upload */}
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
                  <select value={teamContext} onChange={(e) => setTeamContext(e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-secondary transition-all appearance-none">
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
                <input value={roleType} onChange={(e) => setRoleType(e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-secondary transition-all" placeholder="e.g., Senior Backend Engineer" type="text" />
              </div>
            </div>
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant/40 rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all group">
              <Upload className="text-outline-variant group-hover:text-secondary mb-3 transition-colors" size={32} />
              <span className="text-sm font-bold text-on-surface-variant group-hover:text-secondary transition-colors">Arrastra archivos PDF o haz clic para subir</span>
              <span className="text-[10px] text-outline mt-1">Job Description, Skills Matrix</span>
              <input type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={handleFileUpload} />
            </label>
            {jdFiles.length > 0 && (
              <div className="space-y-2">
                {jdFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-error-container rounded-lg flex items-center justify-center"><FileText className="text-on-error-container" size={16} /></div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{file.name}</p>
                        <p className="text-[10px] text-outline">{file.size}</p>
                      </div>
                    </div>
                    <button onClick={() => removeFile(i)} className="p-1 hover:bg-surface-container-high rounded transition-colors"><X className="text-outline" size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right panel: role-specific */}
        {activeRole === 'hr' ? (
          <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Gift className="text-white" size={20} /></div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Beneficios de la Empresa</h3>
                <p className="text-xs text-on-surface-variant">Se incluirán en la Job Description generada</p>
              </div>
            </div>
            <textarea value={companyBenefits} onChange={(e) => setCompanyBenefits(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none" placeholder={"Ejemplo:\n- Trabajo remoto\n- Seguro de gastos médicos\n- Vales de despensa\n- Presupuesto de capacitación"} rows={6} />
            <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Agregar rápido</p>
              <div className="flex flex-wrap gap-2">
                {['Remoto', 'Híbrido', 'Seguro médico', 'Stock options', 'Capacitación', 'Bonos'].map((tag) => (
                  <button key={tag} onClick={() => setCompanyBenefits((prev) => prev + (prev ? '\n- ' : '- ') + tag)} className="px-3 py-1.5 bg-surface-container-lowest text-on-surface-variant text-[11px] font-bold rounded-lg border border-outline-variant/20 hover:border-secondary hover:text-secondary transition-all">
                    <PlusCircle className="inline mr-1" size={12} />{tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary-container/5 border border-primary-container/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-primary-container" size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-container">Resumen de Team Inputs (Hiring Manager)</p>
                {hmSubmitted ? <CheckCircle2 className="text-secondary ml-auto" size={14} /> : <AlertTriangle className="text-amber-500 ml-auto" size={14} />}
              </div>
              {hmSubmitted ? (
                <p className="text-xs text-on-surface-variant leading-relaxed">{MOCK_TEAM_SUMMARY}</p>
              ) : (
                <p className="text-xs text-amber-600 font-medium">El Hiring Manager aún no ha enviado los inputs del equipo.</p>
              )}
            </div>
          </section>
        ) : (
          <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Users className="text-white" size={20} /></div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">Resumen de Team Inputs</h3>
                <p className="text-xs text-on-surface-variant">Resumen agregado de las actividades del equipo</p>
              </div>
            </div>
            {hmSubmitted ? (
              <>
                <div className="p-4 bg-surface-container-low rounded-xl mb-4"><p className="text-sm text-on-surface leading-relaxed">{MOCK_TEAM_SUMMARY}</p></div>
                <div className="flex items-center gap-2 text-secondary"><CheckCircle2 size={16} /><span className="text-xs font-bold">Inputs enviados a RH para procesamiento</span></div>
              </>
            ) : (
              <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center text-center">
                <Users className="text-outline-variant mb-3" size={32} />
                <p className="text-sm font-bold text-on-surface-variant mb-1">Aún no se han recopilado los inputs del equipo</p>
                <p className="text-xs text-outline">Ve al tab de "Team Inputs" para que cada miembro registre sus actividades.</p>
              </div>
            )}
            <div className="mt-6 p-4 bg-surface-container-low rounded-xl">
              <div className="flex items-center gap-2 mb-2"><Eye className="text-outline" size={14} /><p className="text-[10px] font-black uppercase tracking-widest text-outline">Tu rol en este paso</p></div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Como Hiring Manager, tu trabajo es asegurarte de que el equipo haya llenado sus inputs y que la JD base esté cargada. RH se encargará de combinar toda la información y generar el perfil final con IA.</p>
            </div>
          </section>
        )}
      </div>

      {/* Generate Button — HR only */}
      {activeRole === 'hr' && !generated && (
        <div className="flex justify-center mb-12">
          <button onClick={handleGenerate} disabled={!canGenerate || isGenerating} className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${canGenerate && !isGenerating ? 'bg-primary-container text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}>
            {isGenerating ? (<><Loader2 className="animate-spin" size={20} />Procesando con IA...</>) : (<><Sparkles size={20} />Generar con IA</>)}
          </button>
        </div>
      )}

      {/* HM: info banner */}
      {activeRole === 'hiring_manager' && !generated && (
        <div className="flex items-center gap-4 p-5 bg-surface-container-low rounded-xl mb-8 border border-outline-variant/20">
          <div className="w-10 h-10 bg-surface-container-high rounded-lg flex items-center justify-center flex-shrink-0"><Send className="text-outline" size={18} /></div>
          <div>
            <p className="text-sm font-bold text-on-surface">El perfil será generado por RH</p>
            <p className="text-xs text-on-surface-variant">Una vez que RH tenga todos los inputs, generará el perfil con IA. Podrás ver los resultados aquí.</p>
          </div>
        </div>
      )}

      {/* ── STEP 2: GENERATED JD + QUESTIONS ── */}
      {generated && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center"><BrainCircuit className="text-on-secondary-container" size={20} /></div>
                    <div>
                      <h3 className="font-headline text-xl font-bold text-on-surface">{MOCK_GENERATED_JD.title}</h3>
                      <p className="text-xs text-on-surface-variant">Job Description optimizada por IA</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-widest rounded-full">AI Generated</span>
                </div>
                <p className="text-sm text-on-surface leading-relaxed mb-6">{MOCK_GENERATED_JD.summary}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Skills Requeridas</h4>
                    <div className="flex flex-wrap gap-2">
                      {MOCK_GENERATED_JD.skills.map((skill) => (<span key={skill} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-[11px] font-bold">{skill}</span>))}
                    </div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Equipo Destino</h4>
                    <p className="text-sm font-semibold text-primary-container">{teamContext}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{roleType}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Responsabilidades Clave</h4>
                  <ul className="space-y-3">
                    {MOCK_GENERATED_JD.responsibilities.map((resp, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary-container text-white text-[10px] font-bold rounded-full flex-shrink-0">0{i + 1}</span>
                        <p className="text-sm leading-snug">{resp}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3"><Gift className="inline mr-1" size={12} />Beneficios Incluidos</h4>
                  <ul className="space-y-1.5">
                    {MOCK_GENERATED_JD.benefits.map((b, i) => (<li key={i} className="flex items-center gap-2 text-sm text-on-surface"><CheckCircle2 className="text-secondary flex-shrink-0" size={14} />{b}</li>))}
                  </ul>
                </div>
              </div>
            </div>

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
                      <p className="text-[10px] font-black uppercase text-on-primary-container tracking-widest mb-1">{q.category} — Q{i + 1}</p>
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

          {/* ── STEP 3: CV SCREENING RESULTS ── */}
          {activeRole === 'hr' && (
            <section className="mb-8">
              {!screeningVisible ? (
                <div className="flex justify-center">
                  <button onClick={handleShowScreening} className="flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg cursor-pointer">
                    <Inbox size={20} />
                    Ver Screening de CVs Recibidos
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><Inbox className="text-white" size={20} /></div>
                      <div>
                        <h3 className="font-headline text-2xl font-bold text-on-surface">Screening de CVs</h3>
                        <p className="text-sm text-on-surface-variant">Se recibieron {cvCandidates.length} CVs. La IA los evaluó automáticamente.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg">
                        <UserCheck className="text-secondary" size={14} />
                        <span className="text-xs font-bold text-secondary">{approvedCandidates.length} Aprobados</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 rounded-lg">
                        <UserX className="text-error" size={14} />
                        <span className="text-xs font-bold text-error">{rejectedCandidates.length} Rechazados</span>
                      </div>
                    </div>
                  </div>

                  {/* Approved */}
                  <div className="mb-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3 ml-1">Candidatos Aprobados — Listos para Entrevista</p>
                    <div className="space-y-3">
                      {approvedCandidates.map((c) => (
                        <div key={c.id} className={`bg-surface-container-lowest rounded-2xl shadow-sm border-l-4 border-secondary overflow-hidden transition-all ${selectedCandidate === c.id ? 'ring-2 ring-secondary' : ''}`}>
                          <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-sm font-black">
                                {c.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-on-surface">{c.name}</p>
                                <p className="text-xs text-on-surface-variant">{c.currentRole} · {c.experience}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-headline font-black text-secondary">{c.matchScore}%</p>
                                <p className="text-[10px] font-bold text-secondary uppercase">Match</p>
                              </div>
                              <ChevronRight className={`text-outline transition-transform ${expandedCandidate === c.id ? 'rotate-90' : ''}`} size={18} />
                            </div>
                          </div>
                          {expandedCandidate === c.id && (
                            <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Fortalezas</p>
                                  <div className="space-y-1.5">
                                    {c.strengths.map((s, i) => (<div key={i} className="flex items-center gap-2 text-xs text-on-surface"><CheckCircle2 className="text-secondary flex-shrink-0" size={12} />{s}</div>))}
                                  </div>
                                </div>
                                {c.gaps.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Áreas de mejora</p>
                                    <div className="space-y-1.5">
                                      {c.gaps.map((g, i) => (<div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant"><AlertTriangle className="text-amber-500 flex-shrink-0" size={12} />{g}</div>))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button onClick={() => handleSelectCandidate(c.id)} className={`mt-4 flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${selectedCandidate === c.id ? 'bg-secondary/10 text-secondary cursor-default' : 'bg-secondary text-white hover:opacity-90'}`}>
                                {selectedCandidate === c.id ? (<><CheckCircle2 size={16} />Seleccionado para entrevista</>) : (<><MessageSquare size={16} />Seleccionar para entrevista</>)}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rejected */}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-error mb-3 ml-1">Candidatos Rechazados — Feedback de IA</p>
                    <div className="space-y-3">
                      {rejectedCandidates.map((c) => (
                        <div key={c.id} className="bg-surface-container-lowest rounded-2xl shadow-sm border-l-4 border-error/40 overflow-hidden">
                          <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-on-error-container text-sm font-black">
                                {c.name.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-on-surface">{c.name}</p>
                                <p className="text-xs text-on-surface-variant">{c.currentRole} · {c.experience}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-2xl font-headline font-black text-error">{c.matchScore}%</p>
                                <p className="text-[10px] font-bold text-error uppercase">No match</p>
                              </div>
                              <ChevronRight className={`text-outline transition-transform ${expandedCandidate === c.id ? 'rotate-90' : ''}`} size={18} />
                            </div>
                          </div>
                          {expandedCandidate === c.id && (
                            <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
                              <div className="mt-4 mb-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Gaps Identificados</p>
                                <div className="flex flex-wrap gap-2">
                                  {c.gaps.map((gap, gi) => (
                                    <span key={gi} className="flex items-center gap-1 px-3 py-1.5 bg-error/5 text-error text-[11px] font-bold rounded-lg border border-error/20">
                                      <AlertTriangle size={12} />{gap}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="p-4 bg-surface-container-low rounded-xl">
                                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Feedback para el candidato (generado por IA)</p>
                                <p className="text-sm text-on-surface leading-relaxed">{c.feedback}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {/* ── STEP 4: INTERVIEW (selected candidate) ── */}
          {activeRole === 'hr' && selectedCandidate && interviewCandidate && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><MessageSquare className="text-white" size={20} /></div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Entrevista: {interviewCandidate.name}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {interviewCandidate.currentRole} · CV Score: {interviewCandidate.matchScore}% — Ingresa las respuestas reales
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <div key={q.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 flex items-center justify-center bg-primary-container text-white text-xs font-bold rounded-lg flex-shrink-0">Q{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-on-surface mb-1">{q.question}</p>
                        <p className="text-[10px] text-outline uppercase font-bold mb-3">{q.category}</p>
                        <textarea value={q.candidateAnswer} onChange={(e) => handleCandidateAnswer(q.id, e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none" placeholder="Escribe la respuesta del candidato..." rows={3} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <button onClick={handleEvaluate} disabled={!answeredAll || isEvaluating} className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${answeredAll && !isEvaluating ? 'bg-secondary text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}>
                  {isEvaluating ? (<><Loader2 className="animate-spin" size={20} />Evaluando con IA...</>) : (<><BarChart3 size={20} />Evaluar Match con IA</>)}
                </button>
              </div>
            </section>
          )}

          {/* ── MATCH RESULT ── */}
          {matchScore !== null && activeRole === 'hr' && interviewCandidate && (
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-surface-container-high" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                      <circle className={matchScore >= 70 ? 'text-secondary' : 'text-error'} cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset={301 - (301 * matchScore) / 100} strokeWidth="8" strokeLinecap="round" />
                    </svg>
                    <span className={`absolute font-headline font-black text-3xl ${matchScore >= 70 ? 'text-secondary' : 'text-error'}`}>{matchScore}%</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">Resultado: {interviewCandidate.name}</h3>
                    <p className="text-xs text-on-surface-variant mb-1">CV Score: {interviewCandidate.matchScore}% → Entrevista: {matchScore}%</p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {matchScore >= 80 ? 'Excelente candidato. Altamente compatible con el perfil.' : matchScore >= 60 ? 'Buen candidato con áreas de desarrollo identificadas.' : 'El candidato necesita desarrollo significativo en áreas clave.'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={matchScore >= 70 ? 'text-secondary' : 'text-error'} size={20} />
                    <span className={`text-sm font-bold ${matchScore >= 70 ? 'text-secondary' : 'text-error'}`}>
                      {matchScore >= 80 ? 'Recomendado' : matchScore >= 60 ? 'Considerar' : 'No recomendado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <TrendingUp size={14} />
                    <span className="text-[10px] font-bold uppercase">Score combinado: {Math.round((interviewCandidate.matchScore + matchScore) / 2)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
