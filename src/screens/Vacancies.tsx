import React, { useState, useEffect, useRef } from 'react';
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
  ChevronLeft,
  UserCheck,
  UserX,
  TrendingUp,
  ArrowLeft,
  Briefcase,
  Clock,
  Shuffle,
  DollarSign,
  Trash2,
  Pencil,
  Check,
  Mail,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  PartyPopper,
  Copy,
} from 'lucide-react';
import { UserRole, InterviewQuestion, UploadedFile, CvCandidate, Vacancy, GeneratedJD } from '../types';
import {
  fetchVacancies,
  createVacancy,
  deleteVacancy,
  generateJD,
  fetchCandidates,
  processCVBatch,
  updateCandidateStatus,
  updateCandidateSalary,
  deleteCandidate,
  recomputeVacancyCounts,
  fetchQuestions,
  evaluateInterview,
  generateQuestions,
  updateCandidateHmDecision,
  updateVacancyStatus,
  transferCandidateToVacancy,
} from '../lib/vacanciesApi';
import { extractTextFromPDF } from '../lib/pdfParser';

interface VacanciesProps {
  activeRole: UserRole;
}

// ── MOCK VACANCIES LIST ──

const MOCK_VACANCIES: Vacancy[] = [
  { id: 'v1', title: 'Senior Backend Engineer', team: 'Platform Engineering', status: 'screening', createdAt: '12 Mar 2026', applicants: 6, approved: 3, rejected: 3, budget: 4500 },
  { id: 'v2', title: 'Frontend Lead', team: 'Product & Growth', status: 'generated', createdAt: '8 Mar 2026', applicants: 0, approved: 0, rejected: 0, budget: 4000 },
  { id: 'v3', title: 'Data Engineer', team: 'Data & AI Systems', status: 'draft', createdAt: '15 Mar 2026', applicants: 0, approved: 0, rejected: 0, budget: 5000 },
  { id: 'v4', title: 'DevOps / SRE Engineer', team: 'Infrastructure & SRE', status: 'interviewing', createdAt: '1 Mar 2026', applicants: 8, approved: 2, rejected: 6, budget: 5500 },
  { id: 'v5', title: 'QA Automation Engineer', team: 'Platform Engineering', status: 'completed', createdAt: '20 Feb 2026', applicants: 5, approved: 1, rejected: 4, budget: 3000 },
];

const fmtSalary = (n: number) =>
  `$${n.toLocaleString('en-US')} USD/mes`;

const VACANCY_STATUS_CONFIG: Record<Vacancy['status'], { label: string; color: string; bg: string }> = {
  draft: { label: 'Borrador', color: 'text-outline', bg: 'bg-surface-container-high' },
  generated: { label: 'JD Generada', color: 'text-primary-container', bg: 'bg-primary-container/10' },
  screening: { label: 'Screening CVs', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  interviewing: { label: 'Entrevistas', color: 'text-secondary', bg: 'bg-secondary/10' },
  completed: { label: 'Completada', color: 'text-secondary', bg: 'bg-secondary/10' },
};

// ── MOCK DATA ──

// Base template shown in "JD Generada" step (generic, pre-candidate)
const MOCK_BASE_QUESTIONS: InterviewQuestion[] = [
  { id: '1', category: 'Technical Architecture', question: '¿Cómo diseñarías un sistema de colas para procesar 10M de eventos por segundo?', expectedAnswer: 'Debería mencionar message brokers (Kafka/RabbitMQ), particionamiento, backpressure, idempotencia y estrategias de retry con dead-letter queues.', candidateAnswer: '', questionType: 'base' },
  { id: '2', category: 'Problem Solving', question: '¿Describe una situación donde tuviste que refactorizar un sistema legacy crítico. ¿Qué estrategia usaste?', expectedAnswer: 'Buscar mención de strangler fig pattern, feature flags, pruebas de regresión exhaustivas, migración gradual y comunicación con stakeholders.', candidateAnswer: '', questionType: 'base' },
  { id: '3', category: 'Team Collaboration', question: '¿Cómo manejas desacuerdos técnicos con otros seniors del equipo?', expectedAnswer: 'Evidencia de debate basado en datos, prototipos/POCs para validar ideas, capacidad de ceder cuando hay mejor evidencia, y documentación de decisiones (ADRs).', candidateAnswer: '', questionType: 'base' },
  { id: '4', category: 'DevOps & Infrastructure', question: '¿Qué estrategia de CI/CD implementarías para un equipo de 15 desarrolladores?', expectedAnswer: 'Trunk-based development o GitFlow según contexto, pipelines con stages (lint, test, build, deploy), ambientes de staging, canary/blue-green deployments.', candidateAnswer: '', questionType: 'base' },
];

// Which base question IDs to exclude per candidate (because personalized questions already cover that topic)
const EXCLUDED_BASE_BY_CANDIDATE: Record<string, string[]> = {
  cv1: ['1', '4'], // Excluir "Technical Architecture" (cubierto por Distributed Systems Depth) y "DevOps" (cubierto por Infrastructure Optimization)
  cv2: ['4'],      // Excluir "DevOps & Infrastructure" (cubierto por Infrastructure as Code / Terraform)
  cv3: ['2', '3'], // Excluir "Problem Solving / legacy" (cubierto por Event Sourcing Depth) y "Team Collaboration" (cubierto por Leadership Without Title)
};

// Mock answers for the base questions (used in mock mode)
const MOCK_BASE_ANSWERS: Record<string, string> = {
  '1': 'Implementaría Kafka como message broker con particionamiento por tenant ID, usando consumer groups para escalar horizontalmente. Aplicaría backpressure con rate limiting y tendría dead-letter queues para mensajes fallidos con retry exponencial.',
  '2': 'En mi empresa anterior migré un monolito de pagos usando strangler fig pattern. Empecé por las rutas de menor riesgo, usé feature flags para rollback seguro y mantuve ambos sistemas en paralelo 3 meses con tests de regresión automatizados.',
  '3': 'Prefiero proponer un POC rápido cuando hay desacuerdo técnico. En mi equipo anterior documentábamos las decisiones en ADRs y votábamos basándonos en datos de performance y mantenibilidad, no en opiniones.',
  '4': 'Implementaría trunk-based development con feature flags, pipelines de CI con lint/test/build paralelos, deploy automático a staging y canary releases a producción con rollback automático si las métricas caen.',
};

// Personalized questions per candidate — generated by matching JD vs CV
const MOCK_PERSONALIZED_QUESTIONS: Record<string, InterviewQuestion[]> = {
  cv1: [
    {
      id: '1', category: 'Leadership at Scale',
      question: 'En MercadoLibre lideraste equipos de 6+ personas. ¿Cómo estructuraste los code reviews para mantener calidad sin convertirte en cuello de botella?',
      expectedAnswer: 'Proceso asíncrono con SLAs de revisión, ownership por área técnica, checklist automatizado (linters, tests) y cultura de feedback constructivo. Posiblemente menciona pair programming para transferencia de conocimiento.',
      candidateAnswer: '',
      tailoredFor: 'Liderazgo técnico confirmado en CV — el puesto requiere liderar un equipo de 8',
    },
    {
      id: '2', category: 'Distributed Systems Depth',
      question: 'Dado tu manejo de Kafka a escala, describe cómo garantizarías consistencia eventual en un sistema con múltiples consumidores procesando pagos del mismo topic.',
      expectedAnswer: 'Idempotencia en consumidores, exactly-once semantics o al-menos-una-vez con manejo de duplicados, sagas para transacciones distribuidas, y compensating transactions.',
      candidateAnswer: '',
      tailoredFor: 'Kafka y event-driven listado como fortaleza clave — validar profundidad real',
    },
    {
      id: '3', category: 'Technical Decision Making',
      question: '¿Cuál fue la decisión arquitectónica más controversial que tomaste en tu equipo? ¿Cómo convenciste a los stakeholders y qué resultó?',
      expectedAnswer: 'Proceso estructurado: data-driven, prototipo/POC, análisis de trade-offs documentado (ADR), presentación a stakeholders con riesgos explícitos. Resultado medible.',
      candidateAnswer: '',
      tailoredFor: 'Alto match técnico — explorar capacidad de influencia organizacional',
    },
    {
      id: '4', category: 'Infrastructure Optimization',
      question: '¿Cuál ha sido el reto de Kubernetes más complejo que resolviste en GCP? ¿Cómo optimizaste costos sin sacrificar SLOs?',
      expectedAnswer: 'Node autoscaling, spot/preemptible nodes, resource requests/limits bien calibrados, VPA/HPA, namespace quotas, y monitoring granular de costos por servicio.',
      candidateAnswer: '',
      tailoredFor: 'Kubernetes a escala es fortaleza del CV — el puesto requiere colaborar con SRE en costos',
    },
  ],
  cv2: [
    {
      id: '1', category: 'PostgreSQL Deep Dive',
      question: 'Con tu experiencia en sharding de PostgreSQL en Rappi, ¿cómo migrarías una base de datos de 500GB sin downtime? ¿Qué estrategia de rollback tendrías?',
      expectedAnswer: 'Blue-green para base de datos, logical replication para sync en caliente, migration scripts idempotentes, feature flags para cambiar write path, monitoreo de lag de replicación.',
      candidateAnswer: '',
      tailoredFor: 'PostgreSQL avanzado y sharding es su principal fortaleza según CV',
    },
    {
      id: '2', category: 'Infrastructure as Code',
      question: 'Vemos que tu experiencia con Terraform es limitada. Nuestro equipo lo usa intensivamente con GCP. ¿Cuál es tu nivel actual y cómo planeas cerrar esa brecha?',
      expectedAnswer: 'Honestidad sobre el nivel actual, plan concreto de aprendizaje, mencionar experiencia con herramientas similares (Pulumi, CDK, scripts Bash/Python), y disposición a pair con el equipo de SRE.',
      candidateAnswer: '',
      tailoredFor: 'Gap identificado en el screening: poca experiencia con Terraform — skill crítico del equipo',
    },
    {
      id: '3', category: 'API Design & gRPC',
      question: 'Como Backend Lead en Rappi manejando alto tráfico, ¿cómo diseñaste contratos gRPC entre servicios y cómo gestionaste breaking changes sin afectar a los consumers?',
      expectedAnswer: 'Buf para linting de .proto, versionado de packages, backward compatibility como regla, deprecation notices, consumer-driven contract testing, y rolling upgrades coordinados.',
      candidateAnswer: '',
      tailoredFor: 'gRPC y protobuf listado como fortaleza — validar manejo de API versioning a escala',
    },
    {
      id: '4', category: 'Mentorship & Growth',
      question: 'Describes la mentoría de juniors como fortaleza. ¿Cómo estructurarías un plan de desarrollo para un developer junior que quiere especializarse en sistemas distribuidos en los próximos 6 meses?',
      expectedAnswer: 'Plan con objetivos SMART, lecturas recomendadas (DDIA, etc.), proyectos progresivos con scope acotado, pair programming semanal, revisión de métricas de progreso, y ownership gradual de componentes.',
      candidateAnswer: '',
      tailoredFor: 'El puesto requiere mentoría activa del equipo junior — el CV lo menciona explícitamente',
    },
  ],
  cv3: [
    {
      id: '1', category: 'Gap: Orquestación',
      question: 'Tu CV muestra fuerte experiencia en Go y event-driven, pero no hemos visto Kubernetes en producción. ¿Cuál es tu nivel actual y qué tan rápido podrías operar de forma autónoma con K8s?',
      expectedAnswer: 'Nivel honesto (Docker, conceptos básicos, etc.), plan de cierre de brecha, mención de experiencia con herramientas relacionadas, y ejemplos de adopción rápida de nuevas tecnologías en el pasado.',
      candidateAnswer: '',
      tailoredFor: 'Gap crítico identificado en screening: sin experiencia directa con Kubernetes',
    },
    {
      id: '2', category: 'Event Sourcing Depth',
      question: 'Con CQRS y Event Sourcing en Nubank, ¿cómo manejarías la reconstrucción de un read model cuando hay 10M de eventos acumulados y un nuevo microservicio necesita arrancar?',
      expectedAnswer: 'Snapshots periódicos, proyecciones paralelas con checkpointing, partición por aggregate ID para procesamiento concurrente, y mecanismo de warm-up gradual para no saturar el event store.',
      candidateAnswer: '',
      tailoredFor: 'Event Sourcing y CQRS son su fortaleza principal — profundizar en casos extremos',
    },
    {
      id: '3', category: 'Leadership Without Title',
      question: 'El puesto requiere liderazgo técnico formal, pero tu historial no muestra ese rol. ¿Puedes describir situaciones donde influyiste en decisiones técnicas del equipo o actúaste como referente?',
      expectedAnswer: 'Ejemplos concretos de RFC internos, propuestas técnicas aceptadas, mentoría informal, presencia en design reviews, o liderazgo de proyectos cross-equipo sin reporte jerárquico.',
      candidateAnswer: '',
      tailoredFor: 'Gap identificado: sin liderazgo formal — rol requiere liderazgo técnico del equipo',
    },
    {
      id: '4', category: 'Testing Strategy',
      question: 'Tu cultura de testing fuerte es un activo valioso. ¿Cómo plantearías una estrategia de testing para microservicios Go con dependencias externas como Kafka, Redis y PostgreSQL?',
      expectedAnswer: 'Unit tests con mocks para dependencias externas, integration tests con testcontainers, contract testing para APIs gRPC, pruebas de chaos para resiliencia, y pipeline de CI que falla rápido.',
      candidateAnswer: '',
      tailoredFor: 'Testing fuerte es fortaleza clave — validar aplicación a arquitecturas distribuidas',
    },
  ],
};

// Mock answers per candidate for mock mode (candidateId → questionId → answer)
const MOCK_PERSONALIZED_ANSWERS: Record<string, Record<string, string>> = {
  cv1: {
    '1': 'En MercadoLibre establecimos un proceso de revisión asíncrono con SLA de 24 horas. Dividimos ownership por dominio técnico para que los reviews fueran entre expertos del área, no solo yo. Usamos Danger para checks automáticos y un checklist de arquitectura en PRs críticos.',
    '2': 'Usamos Kafka con particionamiento por merchant ID y consumidores idempotentes que verificaban en Redis si el evento ya fue procesado. Para transacciones de pago implementamos el patrón saga con compensating transactions y un servicio de reconciliación nocturno.',
    '3': 'Propuse migrar de REST a gRPC para los servicios internos. Hice un ADR completo con benchmarks, un POC en el servicio de menor riesgo, y una presentación ejecutiva mostrando la reducción de latencia del 40%. El CTO lo aprobó y lo rollamos en 4 sprints.',
    '4': 'Implementamos cluster autoscaler con node pools separados para workloads críticos y no críticos. Usamos spot instances para batch jobs, calibramos resource requests con VPA y logramos reducir costos de GKE un 35% sin tocar los SLOs.',
  },
  cv2: {
    '1': 'En Rappi migramos con Flyway y replicación lógica de PostgreSQL. Creamos la nueva estructura en paralelo, sincronizamos datos en tiempo real, y usamos un feature flag para cambiar el write path. El cutover completo fue en una ventana de mantenimiento de 2 minutos.',
    '2': 'Conozco los conceptos de Terraform y he hecho scripts básicos. Mi experiencia es más con infraestructura programática en Python y Bash. Me comprometo a completar la certificación de HashiCorp en los primeros 3 meses y hacer pair programming con el equipo de SRE.',
    '3': 'Usamos Buf Schema Registry para versionar los .proto. La regla era nunca hacer breaking changes en el mismo major version. Cuando necesitábamos cambios incompatibles, deprecábamos el campo antiguo por 2 sprints antes de eliminarlo y usábamos consumer-driven tests.',
    '4': 'Con cada junior hacía una sesión inicial para entender sus objetivos. Les asignaba issues de complejidad media con checklist detallado, hacíamos pair programming los viernes, y mensualmente revisábamos el progreso con métricas concretas: PRs merged, código en producción, incidentes resueltos.',
  },
  cv3: {
    '1': 'Mi nivel actual con Kubernetes es conceptual y de lab. He trabajado con Docker Compose en producción y entiendo los conceptos de pods, deployments y services. En Nubank usábamos una plataforma interna sobre K8s. Creo que en 4-6 semanas podría ser autónomo con soporte del equipo de SRE.',
    '2': 'Usábamos snapshots cada 1000 eventos con compresión. Para el warm-up de nuevos servicios procesábamos el snapshot primero y luego los eventos incrementales en paralelo usando goroutines con un pool de workers. El tiempo de arranque pasó de 45 minutos a 3 minutos.',
    '3': 'Propuse e implementé la migración del sistema de auditoría a Event Sourcing. Escribí el RFC, presenté los trade-offs al equipo, hice el prototipo y lideré la implementación aunque no era el tech lead. También mentoricé a 2 developers junior informalmente durante 6 meses.',
    '4': 'Usamos testcontainers para levantar PostgreSQL, Redis y Kafka en los integration tests. Para unit tests mocks de las interfaces. Tenemos una regla de cobertura mínima del 80% para paths críticos y los tests de integración corren en CI con ambientes efímeros en Docker.',
  },
};

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
  { id: 'cv1', name: 'Diana Torres', matchScore: 91, status: 'approved', currentRole: 'Senior Backend Engineer @ MercadoLibre', experience: '7 años en sistemas distribuidos', strengths: ['Go y microservicios en producción', 'Kubernetes a escala', 'Experiencia con Kafka y event-driven', 'Liderazgo técnico de equipos de 6+'], gaps: [], feedback: '', expectedSalary: 5200 },
  { id: 'cv2', name: 'Andrés Salazar', matchScore: 84, status: 'approved', currentRole: 'Backend Lead @ Rappi', experience: '6 años en backend de alto tráfico', strengths: ['PostgreSQL avanzado y sharding', 'CI/CD con GitHub Actions', 'gRPC y protobuf', 'Mentoría de juniors'], gaps: ['Poca experiencia con Terraform'], feedback: '', expectedSalary: 4200 },
  { id: 'cv3', name: 'Valentina Rojas', matchScore: 76, status: 'approved', currentRole: 'Software Engineer III @ Nubank', experience: '5 años en fintech con Go', strengths: ['Go en producción 4 años', 'Event sourcing y CQRS', 'Cultura de testing fuerte'], gaps: ['Sin experiencia directa con Kubernetes', 'No ha liderado equipos formalmente'], feedback: '', expectedSalary: 3800 },
  { id: 'cv4', name: 'Roberto Vega', matchScore: 38, status: 'rejected', currentRole: 'PHP Developer @ Agencia Web', experience: '4 años en desarrollo web', strengths: ['Buena actitud y ganas de aprender', 'Experiencia con Laravel'], gaps: ['Sin experiencia en sistemas distribuidos', 'No conoce Kubernetes ni contenedores', 'Experiencia limitada a monolitos PHP'], feedback: 'El candidato tiene buena actitud y capacidad de aprendizaje, pero su experiencia técnica está centrada en monolitos PHP y no cuenta con las bases necesarias en sistemas distribuidos, orquestación de contenedores ni message brokers que el puesto requiere.', crossMatchVacancy: 'Frontend Lead', crossMatchScore: 68, expectedSalary: 2500 },
  { id: 'cv5', name: 'Laura Méndez', matchScore: 45, status: 'rejected', currentRole: 'Backend Developer @ Startup', experience: '3 años en backend con Go', strengths: ['Conocimiento básico de Go', 'Familiaridad con PostgreSQL'], gaps: ['CI/CD limitado a deploys manuales', 'Sin experiencia con event-driven architecture', 'No ha trabajado a escala'], feedback: 'La candidata demuestra conocimiento en backend con Go, pero su experiencia en CI/CD se limita a scripts manuales y no ha trabajado con arquitecturas event-driven ni a la escala requerida.', expectedSalary: 2800 },
  { id: 'cv6', name: 'Pedro Castillo', matchScore: 22, status: 'rejected', currentRole: 'Junior Frontend Developer', experience: '1.5 años en frontend con React', strengths: ['Motivación para transicionar a backend'], gaps: ['Sin experiencia en backend', 'No conoce Go ni lenguajes de sistemas', 'Sin conocimiento de infraestructura cloud'], feedback: 'El candidato es desarrollador frontend junior sin experiencia en backend ni infraestructura cloud. El perfil no se alinea con los requisitos del puesto.', crossMatchVacancy: 'Frontend Lead', crossMatchScore: 74, expectedSalary: 1800 },
];

const MOCK_CANDIDATE_ANSWERS: Record<string, string> = {
  '1': 'Implementaría Kafka como message broker con particionamiento por tenant ID, usando consumer groups para escalar horizontalmente. Aplicaría backpressure con rate limiting y tendría dead-letter queues para mensajes fallidos con retry exponencial.',
  '2': 'En mi empresa anterior migré un monolito de pagos usando strangler fig pattern. Empecé por las rutas de menor riesgo, usé feature flags para rollback seguro y mantuve ambos sistemas en paralelo 3 meses con tests de regresión automatizados.',
  '3': 'Prefiero proponer un POC rápido cuando hay desacuerdo técnico. En mi equipo anterior documentábamos las decisiones en ADRs y votábamos basándonos en datos de performance y mantenibilidad, no en opiniones.',
  '4': 'Implementaría trunk-based development con feature flags, pipelines de CI con lint/test/build paralelos, deploy automático a staging y canary releases a producción con rollback automático si las métricas caen.',
};

// ── HM TECHNICAL INTERVIEW QUESTIONS ──

const MOCK_HM_QUESTIONS: Record<string, InterviewQuestion[]> = {
  cv1: [
    { id: '1', category: 'Incident Response', question: 'Lunes 9am. Un alert llega: el servicio de pagos está al 95% de CPU y el p99 pasó de 200ms a 4 segundos. No hay deploy reciente. Walk me through tus primeros 10 minutos de diagnóstico.', expectedAnswer: 'Revisar dashboards de Grafana (goroutines, GC, connection pool), tail de logs buscando panics o timeouts, pprof en el pod para flame graph, verificar traffic spike en load balancer. Decisión rápida: rollback o hotfix.', candidateAnswer: '', tailoredFor: 'El equipo tiene on-call rotations — necesitamos saber cómo reaccionas bajo presión real' },
    { id: '2', category: 'Go Deep Dive', question: 'Tenemos un consumer de Kafka en Go que después de 6 horas de funcionamiento empieza a acumular memoria y se reinicia con OOM cada 30 minutos. ¿Cómo lo diagnosticarías y reproduces el problema?', expectedAnswer: 'Exponer /debug/pprof, heap profile antes/después de 30 min, buscar crecimiento lineal. Goroutine trace para detectar leaks. Reproducir localmente con mismo volumen + race detector. Sospecha: closures capturando referencias en canales o goroutines no terminadas.', candidateAnswer: '', tailoredFor: 'Kafka consumer es parte core del stack del equipo — validar manejo de memoria en Go' },
    { id: '3', category: 'Architecture Debate', question: 'Alguien del equipo propone usar Redis Streams en lugar de Kafka para los eventos internos, argumentando simplicidad. Tú crees que es un error. ¿Cómo llevas esa conversación?', expectedAnswer: 'ADR formal, spike de 3 días comparando: Kafka tiene replay nativo, consumer groups, retención durable configurable. Redis Streams pierde ordering bajo failover y no tiene exactly-once. Proponer experimento en servicio no crítico para decidir con datos.', candidateAnswer: '', tailoredFor: 'El equipo toma decisiones arquitectónicas colectivas — queremos ver cómo argumentas sin imponer' },
    { id: '4', category: 'Team Unblock', question: '2 engineers llevan 2 días bloqueados por un desacuerdo: uno quiere GraphQL, otro REST para la nueva API de catálogo. El planning es mañana. ¿Cómo lo resuelves hoy?', expectedAnswer: 'Sesión de 60 min con criterios técnicos objetivos: latencia, overhead de desarrollo, clientes que consumirán la API, flexibilidad futura. Cada uno defiende 15 min con datos. Si empatan, el tech lead decide y documenta. No dejar que la parálisis ate el sprint.', candidateAnswer: '', tailoredFor: 'Rol requiere liderazgo técnico y desbloqueo del equipo — situación real del día a día' },
  ],
  cv2: [
    { id: '1', category: 'PostgreSQL en Producción', question: 'Una query de reporting que analiza órdenes de los últimos 90 días tarda 12 segundos. EXPLAIN muestra un seq scan en una tabla de 50M rows. ¿Cuál es tu diagnosis y plan sin afectar producción?', expectedAnswer: 'EXPLAIN ANALYZE para ver el plan real. Índice en columna de fecha si no existe (CREATE INDEX CONCURRENTLY). Revisar statistics con VACUUM ANALYZE. Verificar table bloat. Si es reporting, considerar read replica o tabla de pre-agregados con actualización programada.', candidateAnswer: '', tailoredFor: 'PostgreSQL avanzado es su fortaleza — queremos ver su profundidad real en casos de producción' },
    { id: '2', category: 'CI/CD Optimization', question: 'Nuestro pipeline de GitHub Actions tarda 28 minutos. El paso de `go test ./...` toma 18 de esos. ¿Cómo lo atacas? ¿Qué cambiarías en los primeros 2 días?', expectedAnswer: 'Caché de módulos Go con cache-from. Separar tests unitarios (rápidos, en PR) de integración (scheduled job). Matrix de paralelización en GitHub Actions por packages. Identificar tests lentos con go test -v -json y optimizar o extraer. Objetivo: bajar a menos de 8 minutos.', candidateAnswer: '', tailoredFor: 'CI/CD con GitHub Actions es fortaleza del CV — el pipeline actual es un pain point real del equipo' },
    { id: '3', category: 'On-call Reality', question: 'Son las 2am. El servicio de checkout devuelve 503 al 30% de los requests. SRE te escala. ¿Cuál es tu runbook mental para los primeros 5 minutos?', expectedAnswer: '1) Health checks de pods 2) Rate de errors por endpoint en APM 3) Logs última hora (connection refused, timeouts) 4) Deploy reciente que se haya pasado 5) Si es DB, active connections y slow queries 6) Circuit breaker si el problema es downstream. Comunicar en canal de incident con updates cada 10 min.', candidateAnswer: '', tailoredFor: 'Backend Lead debe manejar incidentes — queremos su proceso mental real bajo presión' },
    { id: '4', category: 'Terraform Ramp-up', question: 'Tu primera semana: necesitas añadir un nuevo Cloud Run service con variables de Secret Manager a la infra Terraform existente. ¿Cómo lo abordas sin experiencia previa en Terraform?', expectedAnswer: 'Sesión de pair de 2h con un SRE para entender la estructura modular del repo. Leer la documentación de los recursos google_cloud_run_service y google_secret_manager_secret_iam_member. Clonar un módulo similar y adaptar. No hacer push sin code review de alguien del equipo las primeras 2 semanas.', candidateAnswer: '', tailoredFor: 'Gap: Terraform — el equipo lo usa intensivamente, queremos ver si puede rampearse rápido' },
  ],
  cv3: [
    { id: '1', category: 'Kubernetes Pragmático', question: 'Uno de nuestros pods se está evictando frecuentemente en horas pico. El nodo está al 90% de memoria. Kubernetes no es tu stack principal — ¿cuál es tu proceso de razonamiento para diagnosticarlo?', expectedAnswer: 'kubectl describe pod para ver el motivo de eviction. kubectl top nodes/pods para ver consumo real vs limits. Si el pod no tiene memory limits configurados, ese sería el primer fix. Si los tiene y se desborda, revisar con pprof si hay memory leak en el proceso. El proceso de debug es el mismo independientemente del orquestador.', candidateAnswer: '', tailoredFor: 'Gap crítico: sin experiencia directa con K8s — queremos ver su razonamiento, no el conocimiento memorizado' },
    { id: '2', category: 'Event Sourcing Real', question: 'Tenemos aggregates con 50K eventos por cuenta activa. Rebuilding el estado tarda 8 segundos. Sin snapshotting implementado, ¿cómo lo resuelves sin un rewrite completo?', expectedAnswer: 'Snapshots periódicos: serializar estado completo cada N eventos (1000 como heurística inicial) y guardar con el número de evento como checkpoint. Al rebuildar: cargar último snapshot + procesar solo eventos posteriores. Para cuentas existentes, migración lazy: snapshot al primer acceso. Métricas para validar mejora.', candidateAnswer: '', tailoredFor: 'Event Sourcing es su fortaleza clave — caso práctico real del sistema que van a tocar' },
    { id: '3', category: 'Code Review Leadership', question: 'Recibes para review un PR de 1200 líneas que refactoriza el dominio de inventario. Sin tests nuevos. El autor es un senior con 4 años en la empresa. ¿Cómo abordas el review y la conversación?', expectedAnswer: 'Entender el cambio a alto nivel primero. El tamaño y la falta de tests son señales de alarma independientemente del seniority. Feedback estructurado en el PR (no Slack). Señalar que cualquier refactor crítico necesita tests de regresión. Ofrecer pair para escribirlos. Si hay pushback, escalar al tech lead con los argumentos documentados.', candidateAnswer: '', tailoredFor: 'Sin liderazgo formal — queremos ver cómo ejerce influencia técnica con pares más senior' },
    { id: '4', category: 'Cambio Cultural', question: 'Notas que el equipo tiene un patrón de error swallowing en Go: `if err != nil { _ = err }` en servicios críticos. No eres el tech lead. ¿Cómo cambiarías esa práctica?', expectedAnswer: 'Documentar el patrón con ejemplos concretos del codebase y casos reales de fallos silenciosos. Llevarlo como item técnico a la retro o al siguiente tech sync. Hacer un PR modelo en un servicio no crítico mostrando el patrón correcto con métricas de errors caught. Proponer una regla de linter (errcheck) en el pipeline de CI. Cambiar cultura con ejemplos, no con reglas impuestas.', candidateAnswer: '', tailoredFor: 'Sin autoridad formal — probar capacidad de influencia lateral y mejora de calidad del equipo' },
  ],
};

const MOCK_HM_ANSWERS: Record<string, Record<string, string>> = {
  cv1: {
    '1': 'Primero abro Grafana: reviso goroutines activos, GC pause time y connection pool exhaustion. Luego hago tail de logs de la última hora buscando panics o connection refused. Si no hay nada obvio, accedo al pod con kubectl exec y corro pprof para el flame graph de CPU. Paralelamente verifico si hay traffic spike inusual en el load balancer o un scheduled job que corrió en ese momento. Con esa info decido si es rollback o hotfix.',
    '2': 'Sospecho goroutine leak. Expongo /debug/pprof en el pod y tomo un heap profile en el minuto 1 y otro a los 30 minutos. Si el heap crece linealmente hay un leak. Reviso el goroutine trace para ver cuáles se acumulan. Para reproducir localmente uso un benchmark con el mismo throughput de mensajes y activo el race detector. La causa más probable: closures en goroutines capturando referencias a buffers que no se liberan.',
    '3': 'Propongo un ADR formal con un spike de 3 días. Los criterios son objetivos: Kafka tiene replay nativo, consumer groups con offset management, retención durable y exactamente-una-vez con idempotencia. Redis Streams puede simular esto pero pierde ordering bajo failover y no tiene exactly-once garantizado. Propongo probar ambos en el servicio de notificaciones, que no es crítico, y dejar que los datos de latencia y confiabilidad decidan.',
    '4': 'Los llamo a los dos juntos ese mismo día para una sesión de 60 minutos. Pido que cada uno prepare 15 minutos defendiendo su approach con criterios concretos: latencia esperada, overhead de desarrollo, flexibilidad para evolucionar. Luego el equipo vota con esos criterios. Si empatan yo decido y lo documento en un ADR explicando el razonamiento. No podemos entrar al planning sin esta decisión tomada.',
  },
  cv2: {
    '1': 'Con EXPLAIN ANALYZE identifico si el seq scan tiene un filtro de fecha. Si la columna de fecha no tiene índice, creo uno con CREATE INDEX CONCURRENTLY para no bloquear la tabla. Si ya existe el índice, reviso si las estadísticas están actualizadas con VACUUM ANALYZE. Si la query es solo de reporting, la muevo a la read replica. Si hay table bloat lo verifico con pg_stat_user_tables y programo un VACUUM FULL en ventana de bajo tráfico.',
    '2': 'Día 1: activo caché de módulos Go en GitHub Actions con cache-from. Día 2: separo los tests en dos grupos: unitarios que corren en cada PR (target en menos de 5 min) e integración que van a un scheduled job. Para los tests Go uso go test -v -json | jq para identificar los 10 más lentos y los optimizo. Con matrix de paralelización puedo bajar de 18 a 4-6 minutos los tests unitarios.',
    '3': 'Primero reviso el dashboard del APM para ver qué endpoints tienen el 503 y si hay correlación temporal. Luego logs de la última hora buscando connection refused o database timeouts. Verifico si hubo algún deploy en las últimas 4 horas. Si el problema parece en la base de datos, reviso active connections con SELECT count(*) FROM pg_stat_activity. Comunico en el canal de incident cada 10 minutos aunque no tenga resolución todavía.',
    '4': 'Le pido a alguien de SRE una sesión de pair de 2 horas para entender la estructura modular del repo de Terraform antes de tocar nada. Leo la documentación de google_cloud_run_service y google_secret_manager_secret_iam_member. Clono el módulo de Cloud Run más similar al que necesito y adapto solo las variables. Todo mi código pasa por code review de alguien del equipo las primeras 2 semanas, sin excepción.',
  },
  cv3: {
    '1': 'Con kubectl describe pod veo el motivo exacto de eviction y si hay memory limits configurados. Con kubectl top pods veo el consumo real. Si no hay limits, ese es el primer fix: establecer requests y limits apropiados. Si los tiene y los desborda, el problema está en el proceso Go: uso pprof para verificar si hay memory leak. El proceso de debug es el mismo que en cualquier sistema: observar métricas, acotar el problema, actuar de lo más simple a lo más complejo.',
    '2': 'Implemento snapshotting periódico: cada 1000 eventos serializo el estado completo del aggregate y lo guardo en una tabla con el número de evento como checkpoint. Al rebuildar, cargo el último snapshot y proceso solo los eventos posteriores. En el peor caso proceso 999 eventos en lugar de 50K. Para los aggregates existentes hago la migración lazy: cuando se accede a uno por primera vez, genero el snapshot on-demand. Agrego métricas para validar la mejora.',
    '3': 'Primero entiendo el PR a alto nivel antes de revisar línea a línea. El tamaño y la falta de tests son señales de alarma que señalo en el review independientemente del seniority del autor. Dejo el feedback en el PR de forma constructiva: explico el por qué, no solo el qué. Ofrezco hacer un pair session para escribir los tests de regresión juntos. Si hay resistencia, escalo al tech lead con mis argumentos documentados.',
    '4': 'Primero recopilo ejemplos concretos del codebase donde el error swallowing causó o pudo causar un problema real. Los llevo como item técnico a la siguiente retro con evidencia. Hago un PR modelo en un servicio no crítico mostrando el patrón correcto, con el error logger apropiado. Propongo agregar errcheck como regla de linter en el pipeline de CI. No lo presento como "están haciendo mal", lo presento como "así podemos mejorar juntos".',
  },
};

// ── MOCK HM BASE QUESTIONS (advanced technical, stage: hm) ──
const MOCK_HM_BASE_QUESTIONS: InterviewQuestion[] = [
  { id: 'hmb1', category: 'Diseño de Sistemas', question: 'Diseña un sistema de procesamiento de pagos distribuido que maneje 100K TPS con garantías de exactly-once. ¿Qué componentes usarías y cómo evitas duplicados bajo network partitions?', expectedAnswer: 'Idempotency keys en cada transacción, saga pattern para transacciones distribuidas, Kafka con exactly-once semantics, base de datos con CRDT o lock optimista, circuit breakers y compensating transactions.', candidateAnswer: '', questionType: 'base', interviewStage: 'hm' },
  { id: 'hmb2', category: 'Rendimiento & Escalabilidad', question: 'Tu servicio Go en producción tiene un p99 de 800ms cuando debería ser <100ms. El profiler muestra que el 60% del tiempo está en accesos a base de datos. Walk me through el proceso completo de diagnóstico y optimización.', expectedAnswer: 'EXPLAIN ANALYZE de queries lentas, índices faltantes, N+1 queries, connection pool exhaustion, query cache, read replicas para queries de lectura, denormalización estratégica, caching en Redis para hot paths.', candidateAnswer: '', questionType: 'base', interviewStage: 'hm' },
  { id: 'hmb3', category: 'Arquitectura Avanzada', question: 'Tienes un monolito de 8 años con 500K líneas de código. El equipo quiere migrarlo a microservicios. ¿Cuál es tu estrategia y en qué orden descompones los bounded contexts?', expectedAnswer: 'Strangler fig pattern, identificar bounded contexts con DDD, extraer primero los dominios más independientes y de menor riesgo, mantener ambos sistemas con API gateway, usar feature flags para tráfico gradual, evitar el distributed monolith.', candidateAnswer: '', questionType: 'base', interviewStage: 'hm' },
  { id: 'hmb4', category: 'Confiabilidad & SRE', question: 'Eres el lead técnico y a las 2am cae el servicio de autenticación. 80K usuarios no pueden entrar. ¿Cuáles son tus primeros 5 minutos y cómo manejas la comunicación simultánea mientras diagnosticas?', expectedAnswer: 'Revisar dashboards/métricas, identificar si es un deploy reciente (rollback rápido), comunicar en slack interno cada 5 min aunque no haya resolución, status page para usuarios, activar runbook de incident response, escalar si es necesario.', candidateAnswer: '', questionType: 'base', interviewStage: 'hm' },
];

const MOCK_HM_BASE_ANSWERS: Record<string, string> = {
  hmb1: 'Usaría Kafka con exactly-once semantics habilitado y un idempotency key por transacción almacenado en Redis con TTL de 24h. Para el saga pattern, cada servicio publica su evento de éxito o fallo, y un orquestador central ejecuta las compensating transactions. Bajo network partitions, los productores reintentan con backoff exponencial y los consumidores verifican el idempotency key antes de procesar. Los circuit breakers cortan el flujo si hay más del 5% de errores en 60 segundos.',
  hmb2: 'Con pprof veo que el 60% está en DB: ejecuto EXPLAIN ANALYZE en las queries más frecuentes. Si hay N+1 queries, los combino con JOINs o batch loading. Si hay índices faltantes, los creo con CREATE INDEX CONCURRENTLY. Reviso el connection pool: si está saturado, aumento el pool size o agrego una capa de PgBouncer. Para hot paths, agrego caching en Redis con TTL de 30 segundos. Si el problema es en queries de reporting, muevo esas a una read replica dedicada. Objetivo: bajar p99 de 800ms a menos de 100ms en iteraciones medibles.',
  hmb3: 'Aplico strangler fig pattern: primero mapeo los bounded contexts con DDD para identificar los dominios más independientes. Empiezo por los que tienen menos dependencias bidireccionales, como notificaciones o reportes. Pongo un API gateway enfrente del monolito desde el día 1 para rutear tráfico gradualmente. Uso feature flags para mover el 5%, 20%, 50%, 100% del tráfico a cada microservicio nuevo. El error más común es crear un distributed monolith: cada servicio debe ser autónomo, con su propia base de datos. Evito los joins cross-servicio y uso eventos para sincronizar datos eventualmente.',
  hmb4: 'En los primeros 2 minutos: reviso el dashboard de autenticación en Grafana, veo si hay un deploy reciente de ese servicio o sus dependencias, y si lo hay, rollback inmediato. Si no hay deploy reciente, reviso los logs de los últimos 15 minutos buscando connection refused o JWT validation errors. Verifico si el servicio de base de datos de usuarios está respondiendo. Paralelamente comunico en el canal de incident: "P0 activo - auth caída - investigando - próximo update en 5 min". Actualizo cada 5 minutos aunque no tenga resolución. Si el rollback no resuelve en 10 minutos, escalo a más personas del equipo.',
};

// ── HM DIRECT VIEW MOCK DATA (per vacancy) ──

const HM_GENERATED_JDS: Record<string, { title: string; summary: string; skills: string[]; responsibilities: string[] }> = {
  v2: {
    title: 'Frontend Lead',
    summary: 'Buscamos un Frontend Lead para liderar el desarrollo de nuestras interfaces de producto de alto tráfico. El candidato ideal combina excelencia técnica en React/TypeScript con visión de producto y capacidad para establecer estándares de frontend en un equipo de 5 engineers.',
    skills: ['React', 'TypeScript', 'GraphQL', 'Design Systems', 'Web Performance', 'Storybook', 'Testing (Vitest/Cypress)'],
    responsibilities: [
      'Diseñar y mantener el Design System y la arquitectura de componentes.',
      'Liderar code reviews y establecer estándares de calidad frontend.',
      'Colaborar con Diseño y Producto en la definición de features.',
      'Optimizar el rendimiento de las interfaces y los Core Web Vitals.',
    ],
  },
};

interface SreCandidateData {
  name: string;
  currentRole: string;
  experience: string;
  cvScore: number;
  hrScore: number;
  strengths: string[];
  gaps: string[];
  expectedSalary: number;
}

const HM_SRE_CANDIDATE: SreCandidateData = {
  name: 'Luis Montoya',
  currentRole: 'SRE Lead @ Clip',
  experience: '5 años en infraestructura cloud y reliability engineering',
  cvScore: 82,
  hrScore: 78,
  strengths: ['Kubernetes en producción a escala', 'Terraform y GCP expert', 'SLOs y error budgets', 'Incident response liderado'],
  gaps: ['Poca experiencia con Go específicamente', 'Sin experiencia con Kafka'],
  expectedSalary: 5200,
};

const HM_SRE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'sre1', category: 'Kubernetes Governance',
    question: 'Tenemos 3 clusters de GKE en multi-region con ~200 pods activos. Esta semana un deployment sin resource limits tumbó el cluster de producción por un OOM cascade. ¿Cómo implementarías governance para evitar que vuelva a pasar?',
    expectedAnswer: 'Admission controller (OPA Gatekeeper o Kyverno) que rechace Deployments sin resource requests/limits. LimitRange en cada namespace con valores por defecto. Regla en CI que valide manifests con kubeval/conftest antes del merge. PodDisruptionBudgets para servicios críticos.',
    candidateAnswer: '',
    tailoredFor: 'Incidente real del equipo esta semana — queremos saber su approach sistemático, no el parche',
  },
  {
    id: 'sre2', category: 'Terraform Drift',
    question: 'Alguien hizo un `terraform apply` manual en producción y rompió el state. El statefile ahora no coincide con la infra real. Hay recursos huérfanos y algunos que el state no conoce. ¿Cuál es tu proceso?',
    expectedAnswer: 'terraform plan para ver el drift. terraform state list para inventario. terraform state rm para recursos desincronizados + terraform import para re-importarlos. Nunca apply forzado. Post-mortem sobre cómo prevenir manual applies (drift detection job, protección del statefile remoto, CI obligatorio).',
    candidateAnswer: '',
    tailoredFor: 'El equipo usa Terraform intensivamente — necesitamos saber cómo maneja situaciones de emergencia en IaC',
  },
  {
    id: 'sre3', category: 'Observabilidad',
    question: 'Nuestros SLOs están configurados en Prometheus pero el equipo de Producto no los entiende. Los dashboards de Grafana son ilegibles para no-técnicos. ¿Cómo harías que la observabilidad sea útil para toda la organización?',
    expectedAnswer: 'Dashboards separados: técnico (SLIs detallados, error budget burndown por servicio) y ejecutivo (uptime %, requests exitosos, latencia en lenguaje de negocio con semáforos verde/amarillo/rojo). Alertas semanales por email con resumen automático. SLO review mensual con Producto.',
    candidateAnswer: '',
    tailoredFor: 'El equipo tiene un problema real de comunicación de reliability hacia Producto — queremos ver su solución',
  },
  {
    id: 'sre4', category: 'Incident Response',
    question: '3am: el service mesh (Istio) bloqueó el 100% del tráfico entre el API Gateway y el servicio de autenticación. Uptime = 0%. SRE te escala. ¿Cuál es tu runbook mental los primeros 5 minutos?',
    expectedAnswer: 'Rollback del cambio más reciente de Istio. Si no hay cambio, revisar VirtualService y DestinationRule del servicio de auth. Verificar certificados mTLS (expiración). Si persiste, bypass temporal del mesh para auth mientras se investiga. Updates en canal de incident cada 5 min. Nunca investigar en silencio durante un P0.',
    candidateAnswer: '',
    tailoredFor: 'On-call rotation es parte del rol — necesitamos ver su compostura y proceso bajo presión extrema',
  },
];

const HM_SRE_ANSWERS: Record<string, string> = {
  sre1: 'Implementaría Kyverno como admission controller porque es más sencillo de mantener que OPA para este caso. Las políticas rechazan cualquier Deployment sin resource requests y limits definidos. También agregaría LimitRange en cada namespace con valores por defecto razonables como fallback. En el pipeline de CI agregaría conftest validando los manifests contra las políticas antes del merge, para que el error se vea en el PR, no en el cluster.',
  sre2: 'Primero: terraform plan -detailed-exitcode para ver exactamente qué muestra el drift. Segundo: terraform state list para tener el inventario completo del state. Para los recursos que están en la infra pero no en el state, hago terraform import uno por uno después de identificarlos con la API de GCP. Para los que están en el state pero ya no existen, terraform state rm. Nunca hago terraform apply hasta tener el plan limpio. Después: post-mortem con la acción correctiva de bloquear applies manuales vía IAM y enforcement de CI obligatorio.',
  sre3: 'Creo dos niveles de dashboards. El dashboard técnico para el equipo de infra: SLIs detallados, error budget burndown por servicio con alertas en Slack cuando quema más del 5% por hora. El dashboard ejecutivo para Producto: tres métricas en lenguaje de negocio con semáforos de color, uptime del último mes y latencia p95 expresada como "X de cada 100 usuarios tuvieron respuesta lenta". Y un email automático semanal el lunes con el resumen de confiabilidad de la semana anterior.',
  sre4: 'Primero reviso el changelog de Istio de las últimas 4 horas. Si hubo un cambio de VirtualService o DestinationRule, rollback inmediato. Si no hay cambio reciente, verifico que los certificados mTLS del namespace de autenticación no hayan expirado con istioctl proxy-status. Si el problema persiste más de 3 minutos y no tengo la causa, hago bypass temporal del mesh solo para el servicio de auth usando un DestinationRule de exclusión, restauro el uptime y luego investigo con calma. Updates en el canal de P0 cada 5 minutos, así no tenga nada nuevo que reportar.',
};

// ── HR STEP DEFINITIONS ──

const HR_STEPS = [
  { key: 'input', label: 'JD & Beneficios' },
  { key: 'generated', label: 'JD Generada' },
  { key: 'screening', label: 'Screening CVs' },
  { key: 'interview', label: 'Entrevista RH' },
] as const;

type HrStep = typeof HR_STEPS[number]['key'];

// ── COMPONENT ──

export const Vacancies: React.FC<VacanciesProps> = ({ activeRole }) => {
  // Vacancy list vs detail
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);

  // Mock
  const [mockMode, setMockMode] = useState(false);

  // Real vacancies list (loaded from Supabase)
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoadingVacancies, setIsLoadingVacancies] = useState(false);
  const [vacancyError, setVacancyError] = useState<string | null>(null);

  // Wizard step (HR)
  const [currentStep, setCurrentStep] = useState<HrStep>('input');

  // Step 1: Inputs
  const [jdFiles, setJdFiles] = useState<UploadedFile[]>([]);
  const jdFileObjectsRef = useRef<File[]>([]);
  const [companyBenefits, setCompanyBenefits] = useState('');
  const [teamContext, setTeamContext] = useState('Platform Engineering');
  const [roleType, setRoleType] = useState('Senior Backend Engineer');
  const [hmSubmitted, setHmSubmitted] = useState(false);

  // Step 2: Generated
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [generatedJD, setGeneratedJD] = useState<GeneratedJD | null>(null);

  // Step 3: Screening — CV upload (real mode)
  const [isProcessingCVs, setIsProcessingCVs] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [cvProcessingError, setCvProcessingError] = useState<string | null>(null);
  const [cvCandidates, setCvCandidates] = useState<CvCandidate[]>([]);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [transferredCandidates, setTransferredCandidates] = useState<Set<string>>(new Set());
  const [transferringCandidateId, setTransferringCandidateId] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Step 4: HR Interview
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(MOCK_BASE_QUESTIONS);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [hrDecision, setHrDecision] = useState<'none' | 'continue' | 'reject'>('none');

  // Step 5: HM Technical Interview (HR wizard flow)
  const [hmQuestions, setHmQuestions] = useState<InterviewQuestion[]>([]);
  const [hmMatchScore, setHmMatchScore] = useState<number | null>(null);
  const [isHmEvaluating, setIsHmEvaluating] = useState(false);

  // HM direct view state (when role = hiring_manager)
  const [hmMockMode, setHmMockMode] = useState(false);
  const [hmDirectQuestions, setHmDirectQuestions] = useState<InterviewQuestion[]>([]);
  const [hmDirectScore, setHmDirectScore] = useState<number | null>(null);
  const [isHmDirectEvaluating, setIsHmDirectEvaluating] = useState(false);

  // Real HM interview state
  const [selectedHmCandidateId, setSelectedHmCandidateId] = useState<string | null>(null);
  const [hmRealQuestions, setHmRealQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoadingHmQ, setIsLoadingHmQ] = useState(false);
  const [isHmRealEvaluating, setIsHmRealEvaluating] = useState(false);
  const [hmRealScore, setHmRealScore] = useState<number | null>(null);
  const [hmRealJustification, setHmRealJustification] = useState('');
  const [isSavingHmDecision, setIsSavingHmDecision] = useState(false);

  // Final decision modals (HR role)
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectModalCandidate, setRejectModalCandidate] = useState<CvCandidate | null>(null);
  const [offerSent, setOfferSent] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Load vacancies from Supabase on mount and when returning to list view
  useEffect(() => {
    if (mockMode) return;
    setIsLoadingVacancies(true);
    setVacancyError(null);
    fetchVacancies()
      .then((vs) => {
        setVacancies(vs);
        // After vacancies load, restore state for the open vacancy
        if (selectedVacancy) {
          const v = vs.find((vac) => vac.id === selectedVacancy);
          if (v?.jdGenerated) {
            setGeneratedJD(v.jdGenerated as any);
            setGenerated(true);
            if (v.jdBenefits) setCompanyBenefits(v.jdBenefits);
          }
        }
      })
      .catch((err) => setVacancyError(String(err)))
      .finally(() => setIsLoadingVacancies(false));
  }, [mockMode, selectedVacancy]);

  // Auto-load candidates when opening a vacancy already in screening/interviewing
  useEffect(() => {
    if (!selectedVacancy || mockMode) return;
    const v = vacancies.find((vac) => vac.id === selectedVacancy);
    if (!v) return;
    if ((v.status === 'screening' || v.status === 'interviewing') && cvCandidates.length === 0) {
      fetchCandidates(selectedVacancy)
        .then(setCvCandidates)
        .catch((err) => console.error('Error auto-loading candidates:', err));
    }
  }, [selectedVacancy, vacancies]);

  // Create vacancy modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newVacancyTitle, setNewVacancyTitle] = useState('');
  const [newVacancyTeam, setNewVacancyTeam] = useState('Platform Engineering');
  const [newVacancyBudget, setNewVacancyBudget] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateVacancy = async () => {
    if (!newVacancyTitle.trim()) return;
    setIsCreating(true);
    try {
      const created = await createVacancy(
        newVacancyTitle.trim(),
        newVacancyTeam,
        newVacancyBudget ? parseInt(newVacancyBudget, 10) : undefined
      );
      setVacancies((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewVacancyTitle('');
      setNewVacancyBudget('');
      setNewVacancyTeam('Platform Engineering');
      // Navigate directly into the new vacancy
      handleOpenVacancy(created.id);
    } catch (err) {
      alert(`Error creando vacante: ${String(err)}`);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleListMockMode = () => {
    const next = !mockMode;
    setMockMode(next);
    if (next) {
      setVacancies(MOCK_VACANCIES);
    } else {
      setVacancies([]);
      fetchVacancies().then(setVacancies).catch(() => {});
    }
  };

  const approvedCandidates = cvCandidates.filter((c) => c.status === 'approved');
  const rejectedCandidates = cvCandidates.filter((c) => c.status === 'rejected');
  const pendingCandidates = cvCandidates.filter((c) => c.status === 'pending');
  const interviewCandidate = cvCandidates.find((c) => c.id === selectedCandidate);
  const answeredAll = questions.every((q) => q.candidateAnswer.trim().length > 0);
  const canGenerate = activeRole === 'hr' && (jdFiles.length > 0 || companyBenefits.trim().length > 0);

  const hmAnsweredAll = hmQuestions.every((q) => q.candidateAnswer.trim().length > 0);

  const resetVacancyState = () => {
    setCurrentStep('input');
    setJdFiles([]);
    jdFileObjectsRef.current = [];
    setCompanyBenefits('');
    setGenerated(false);
    setGeneratedJD(null);
    setCvCandidates([]);
    setSelectedCandidate(null);
    setMatchScore(null);
    setHrDecision('none');
    setHmQuestions([]);
    setHmMatchScore(null);
    setIsHmEvaluating(false);
    setHmSubmitted(false);
    setExpandedCandidate(null);
    setTransferredCandidates(new Set());
    setIsGenerating(false);
    setIsEvaluating(false);
    setIsProcessingCVs(false);
    setProcessingStatus('');
    setQuestions([]);
    setIsGeneratingQuestions(false);
    // Note: mockMode is intentionally NOT reset here so it persists through navigation
  };

  const toggleMockMode = () => {
    const next = !mockMode;
    setMockMode(next);
    if (next) {
      // Inject mock vacancies and base JD content
      setVacancies(MOCK_VACANCIES);
      setJdFiles(MOCK_FILES);
      setCompanyBenefits(MOCK_BENEFITS);
      setTeamContext('Platform Engineering');
      setRoleType('Senior Backend Engineer');
      setHmSubmitted(true);
      setGenerated(true);
      setGeneratedJD({
        summary: MOCK_GENERATED_JD.summary,
        requiredSkills: MOCK_GENERATED_JD.skills,
        responsibilities: MOCK_GENERATED_JD.responsibilities,
        benefits: MOCK_GENERATED_JD.benefits,
      });
      setCvCandidates(MOCK_CV_CANDIDATES);
      setCurrentStep('screening');
      // Pre-select vacancy v1 and candidate cv1 so the demo is fully navigable
      setSelectedVacancy('v1');
      // Pre-load merged interview questions for cv1 with answers
      const excludedIds = EXCLUDED_BASE_BY_CANDIDATE['cv1'] ?? [];
      const filteredBase = MOCK_BASE_QUESTIONS.filter((q) => !excludedIds.includes(q.id));
      const personalized = MOCK_PERSONALIZED_QUESTIONS['cv1'] ?? [];
      const personalizedAnswers = MOCK_PERSONALIZED_ANSWERS['cv1'] ?? {};
      const mergedBase = filteredBase.map((q) => ({ ...q, id: `b_${q.id}`, candidateAnswer: MOCK_BASE_ANSWERS[q.id] ?? '' }));
      const mergedPersonalized = personalized.map((q) => ({ ...q, candidateAnswer: personalizedAnswers[q.id] ?? '' }));
      setQuestions([...mergedBase, ...mergedPersonalized]);
      setSelectedCandidate('cv1');
      setHrDecision('continue');
    } else {
      resetVacancyState();
    }
  };

  // Demo mode for HM role — activates from the vacancy list or detail
  const toggleHmListMockMode = () => {
    const next = !mockMode;
    setMockMode(next);
    if (next) {
      setVacancies(MOCK_VACANCIES);
    } else {
      setVacancies([]);
      fetchVacancies().then(setVacancies).catch(() => {});
    }
  };

  const toggleHmDetailMockMode = () => {
    const next = !mockMode;
    setMockMode(next);
    if (next) {
      // Point HM demo to v4 (DevOps / SRE Engineer, status: interviewing)
      setVacancies(MOCK_VACANCIES);
      setSelectedVacancy('v4');
      setGeneratedJD({
        summary: 'Buscamos un DevOps / SRE Engineer para liderar la confiabilidad de nuestra infraestructura en GCP. El candidato ideal dominará Kubernetes, Terraform, y tendrá experiencia en incident response y SLOs.',
        requiredSkills: ['Kubernetes', 'Terraform', 'GCP', 'Prometheus / Grafana', 'Incident Response', 'Python / Go'],
        responsibilities: [
          'Gestionar y evolucionar la infraestructura GKE en producción.',
          'Definir y monitorear SLOs para los servicios críticos.',
          'Liderar incident response y post-mortems.',
          'Colaborar con Backend en optimización de costos de infra.',
        ],
        benefits: MOCK_GENERATED_JD.benefits,
      });
      setGenerated(true);
      setCurrentStep('interview');
      // Load approved mock candidates (the ones the HM should interview)
      setCvCandidates(MOCK_CV_CANDIDATES.filter((c) => c.status === 'approved'));
      // Pre-select first approved candidate and load their HM questions
      const firstApproved = MOCK_CV_CANDIDATES.find((c) => c.status === 'approved');
      if (firstApproved) {
        setSelectedHmCandidateId(firstApproved.id);
        const hmPersonalizedAnswers = MOCK_HM_ANSWERS[firstApproved.id] ?? {};
        const baseQs = MOCK_HM_BASE_QUESTIONS.map((q) => ({
          ...q,
          candidateAnswer: MOCK_HM_BASE_ANSWERS[q.id] ?? '',
        }));
        const personalizedQs = (MOCK_HM_QUESTIONS[firstApproved.id] ?? []).map((q) => ({
          ...q,
          id: `hmp_${q.id}`,
          questionType: 'personalized' as const,
          interviewStage: 'hm' as const,
          candidateAnswer: hmPersonalizedAnswers[q.id] ?? '',
        }));
        setHmRealQuestions([...baseQs, ...personalizedQs]);
      }
    } else {
      resetVacancyState();
    }
  };

  const toggleHmMockMode = () => {
    const next = !hmMockMode;
    setHmMockMode(next);
    if (next) {
      setHmDirectQuestions(HM_SRE_QUESTIONS.map((q) => ({ ...q, candidateAnswer: HM_SRE_ANSWERS[q.id] ?? '' })));
    } else {
      setHmDirectQuestions([]);
      setHmDirectScore(null);
    }
  };

  const handleHmDirectEvaluate = () => {
    setIsHmDirectEvaluating(true);
    setTimeout(() => {
      setIsHmDirectEvaluating(false);
      setHmDirectScore(84);
    }, 2200);
  };

  const handleHmDirectAnswer = (id: string, answer: string) => {
    setHmDirectQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, candidateAnswer: answer } : q)));
  };

  const handleHmSelectCandidate = async (candidateId: string) => {
    setSelectedHmCandidateId(candidateId);
    setHmRealScore(null);
    setHmRealJustification('');
    setHmRealQuestions([]);

    if (mockMode) {
      // Mock mode: combine base HM questions + personalized per candidate, with pre-filled answers
      const hmPersonalizedAnswers = MOCK_HM_ANSWERS[candidateId] ?? {};
      const baseQs = MOCK_HM_BASE_QUESTIONS.map((q) => ({
        ...q,
        candidateAnswer: MOCK_HM_BASE_ANSWERS[q.id] ?? '',
      }));
      const personalizedQs = (MOCK_HM_QUESTIONS[candidateId] ?? []).map((q) => ({
        ...q,
        id: `hmp_${q.id}`,
        questionType: 'personalized' as const,
        interviewStage: 'hm' as const,
        candidateAnswer: hmPersonalizedAnswers[q.id] ?? '',
      }));
      setHmRealQuestions([...baseQs, ...personalizedQs]);
      return;
    }

    if (!selectedVacancy) return;
    setIsLoadingHmQ(true);
    try {
      await generateQuestions(selectedVacancy);
      const qs = await fetchQuestions(selectedVacancy, candidateId, 'hm');
      setHmRealQuestions(qs.map((q) => ({ ...q, candidateAnswer: '' })));
    } catch (err) {
      console.error('Error loading HM questions:', err);
    } finally {
      setIsLoadingHmQ(false);
    }
  };

  const handleHmRealAnswer = (id: string, answer: string) => {
    setHmRealQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, candidateAnswer: answer } : q)));
  };

  const handleHmRealEvaluate = async () => {
    if (!selectedHmCandidateId) return;
    setIsHmRealEvaluating(true);

    if (mockMode) {
      setTimeout(() => {
        const answeredCount = hmRealQuestions.filter((q) => q.candidateAnswer.trim().length > 0).length;
        const score = Math.min(100, Math.round((answeredCount / Math.max(hmRealQuestions.length, 1)) * 80 + Math.random() * 14 + 3));
        const justification = score >= 75
          ? 'El candidato demuestra sólido dominio técnico avanzado y experiencia práctica en sistemas distribuidos. Sus respuestas evidencian capacidad de liderazgo técnico y pensamiento sistemático ante incidentes. Perfil muy recomendado para el rol.'
          : 'El candidato muestra conocimiento técnico adecuado pero sus respuestas carecen de la profundidad y especificidad esperada para un rol senior. Se recomienda evaluar si tiene el nivel de seniority requerido antes de continuar el proceso.';
        setHmRealScore(score);
        setHmRealJustification(justification);
        setCvCandidates((prev) =>
          prev.map((c) => c.id === selectedHmCandidateId ? { ...c, hmScore: score, hmFeedback: justification } : c)
        );
        setIsHmRealEvaluating(false);
      }, 1800);
      return;
    }

    if (!selectedVacancy) { setIsHmRealEvaluating(false); return; }
    try {
      const answered = hmRealQuestions.map((q) => ({ questionId: q.id, answer: q.candidateAnswer }));
      const result = await evaluateInterview(selectedVacancy, selectedHmCandidateId, answered, 'hm');
      setHmRealScore(result.score);
      setHmRealJustification(result.justification);
      // Save hm_score and hm_feedback optimistically to local state
      setCvCandidates((prev) =>
        prev.map((c) =>
          c.id === selectedHmCandidateId
            ? { ...c, hmScore: result.score, hmFeedback: result.justification }
            : c
        )
      );
    } catch (err) {
      console.error('Error evaluating HM interview:', err);
    } finally {
      setIsHmRealEvaluating(false);
    }
  };

  const handleHmDecision = async (decision: 'accepted' | 'rejected') => {
    if (!selectedHmCandidateId || hmRealScore === null) return;
    setIsSavingHmDecision(true);
    // Optimistic update
    setCvCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedHmCandidateId
          ? { ...c, hmDecision: decision, hmScore: hmRealScore, hmFeedback: hmRealJustification }
          : c
      )
    );
    if (mockMode) {
      setTimeout(() => setIsSavingHmDecision(false), 600);
      return;
    }
    try {
      await updateCandidateHmDecision(selectedHmCandidateId, decision, hmRealScore, hmRealJustification);
    } catch (err) {
      console.error('Error saving HM decision:', err);
    } finally {
      setIsSavingHmDecision(false);
    }
  };

  const handleTransferCandidate = async (candidate: CvCandidate) => {
    if (!candidate.crossMatchVacancy || !candidate.crossMatchScore) return;
    setTransferError(null);
    setTransferringCandidateId(candidate.id);
    try {
      // Match by title (fuzzy — AI may return title or "title (team)")
      const needle = candidate.crossMatchVacancy.toLowerCase();
      const targetVacancy = vacancies.find(
        (v) =>
          needle.includes(v.title.toLowerCase()) ||
          v.title.toLowerCase().includes(needle)
      );
      if (!targetVacancy) {
        setTransferError(`No se encontró la vacante "${candidate.crossMatchVacancy}" en el sistema. Asegúrate de que esté creada.`);
        return;
      }
      await transferCandidateToVacancy(candidate, targetVacancy.id, candidate.crossMatchScore);
      setTransferredCandidates((prev) => new Set([...prev, candidate.id]));
      // Refresh vacancies list to reflect updated counts
      fetchVacancies().then(setVacancies).catch(() => {});
    } catch (err) {
      console.error('Error transferring candidate:', err);
      setTransferError('Ocurrió un error al transferir el candidato. Intenta de nuevo.');
    } finally {
      setTransferringCandidateId(null);
    }
  };

  const handleMakeOffer = async () => {
    if (!selectedVacancy) return;
    setVacancies((prev) => prev.map((v) => v.id === selectedVacancy ? { ...v, status: 'completed' } : v));
    setOfferSent(true);
    if (!mockMode) {
      try {
        await updateVacancyStatus(selectedVacancy, 'completed');
      } catch (err) {
        console.error('Error completing vacancy:', err);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from<File>(files);
    jdFileObjectsRef.current = [...jdFileObjectsRef.current, ...fileArray];
    const newFiles: UploadedFile[] = fileArray.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.name.endsWith('.pdf') ? 'pdf' : f.name.endsWith('.doc') || f.name.endsWith('.docx') ? 'doc' : 'other',
    }));
    setJdFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    jdFileObjectsRef.current = jdFileObjectsRef.current.filter((_, i) => i !== index);
    setJdFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!selectedVacancy) return;
    setIsGenerating(true);
    setGenerateError(null);
    if (mockMode) {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerated(true);
        setGeneratedJD({
          summary: MOCK_GENERATED_JD.summary,
          requiredSkills: MOCK_GENERATED_JD.skills,
          responsibilities: MOCK_GENERATED_JD.responsibilities,
          benefits: MOCK_GENERATED_JD.benefits,
        });
        setCurrentStep('generated');
      }, 2000);
      return;
    }
    try {
      let jdRawText = '';
      const pdfFile = jdFileObjectsRef.current.find((f) => f.name.endsWith('.pdf'));
      if (pdfFile) {
        jdRawText = await extractTextFromPDF(pdfFile);
      }
      const vacancy = vacancies.find((v) => v.id === selectedVacancy);
      const jd = await generateJD(
        selectedVacancy,
        vacancy?.title ?? roleType,
        vacancy?.team ?? teamContext,
        jdRawText,
        companyBenefits
      );
      setGeneratedJD(jd);
      setGenerated(true);
      setCurrentStep('generated');
      fetchVacancies().then(setVacancies).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setGenerateError(`Error generando JD: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShowScreening = async () => {
    if (mockMode) {
      setCvCandidates(MOCK_CV_CANDIDATES);
      setCurrentStep('screening');
      return;
    }
    if (!selectedVacancy) return;
    setCurrentStep('screening');
    try {
      const candidates = await fetchCandidates(selectedVacancy);
      setCvCandidates(candidates);
    } catch (err) {
      console.error('Error fetching candidates:', err);
    }
  };

  const handleCVFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedVacancy) return;
    const pdfFiles = Array.from<File>(files).filter((f) => f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) return;
    e.target.value = '';
    setIsProcessingCVs(true);
    setCvProcessingError(null);
    setProcessingStatus(`Extrayendo texto de ${pdfFiles.length} CV(s)...`);
    try {
      const withText = await Promise.all(
        pdfFiles.map(async (file) => ({
          file,
          cvText: await extractTextFromPDF(file),
        }))
      );
      setProcessingStatus(`Analizando ${pdfFiles.length} CV(s) con IA...`);
      await processCVBatch(selectedVacancy, withText);
      setProcessingStatus('Cargando resultados...');
      const candidates = await fetchCandidates(selectedVacancy);
      setCvCandidates(candidates);
      fetchVacancies().then(setVacancies).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCvProcessingError(`Error procesando CVs: ${msg}`);
    } finally {
      setIsProcessingCVs(false);
      setProcessingStatus('');
    }
  };

  const handleSelectCandidate = async (id: string) => {
    setSelectedCandidate(id);
    setMatchScore(null);
    setHrDecision('none');
    setHmMatchScore(null);
    setHmQuestions([]);
    setQuestions([]);
    setCurrentStep('interview');

    if (mockMode) {
      const excludedIds = EXCLUDED_BASE_BY_CANDIDATE[id] ?? [];
      const filteredBase = MOCK_BASE_QUESTIONS.filter((q) => !excludedIds.includes(q.id));
      const personalized = MOCK_PERSONALIZED_QUESTIONS[id] ?? [];
      const personalizedAnswers = MOCK_PERSONALIZED_ANSWERS[id] ?? {};
      const mergedBase = filteredBase.map((q) => ({
        ...q,
        id: `b_${q.id}`,
        candidateAnswer: MOCK_BASE_ANSWERS[q.id] ?? '',
      }));
      const mergedPersonalized = personalized.map((q) => ({
        ...q,
        candidateAnswer: personalizedAnswers[q.id] ?? '',
      }));
      setQuestions([...mergedBase, ...mergedPersonalized]);
      return;
    }

    if (!selectedVacancy) return;
    // Only load from cache — do NOT auto-generate; HR triggers generation explicitly
    try {
      const qs = await fetchQuestions(selectedVacancy, id, 'hr');
      if (qs.length > 0) {
        setQuestions(qs);
      }
    } catch (err) {
      console.error('Error loading questions from cache:', err);
    }
  };

  const handleGenerateInterviewQuestions = async () => {
    if (!selectedVacancy || !selectedCandidate) return;
    setIsGeneratingQuestions(true);
    try {
      await generateQuestions(selectedVacancy);
      const qs = await fetchQuestions(selectedVacancy, selectedCandidate, 'hr');
      setQuestions(qs.length > 0 ? qs : []);
      fetchVacancies().then(setVacancies).catch(() => {});
    } catch (err) {
      console.error('Error generating interview questions:', err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleHrDecision = (decision: 'continue' | 'reject') => {
    setHrDecision(decision);
    // Candidate is now handed off to the Hiring Manager — HR flow ends here
    // HM conducts the technical interview from their own Vacancies view
  };

  const handleHmCandidateAnswer = (id: string, answer: string) => {
    setHmQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, candidateAnswer: answer } : q)));
  };

  const handleHmEvaluate = () => {
    setIsHmEvaluating(true);
    setTimeout(() => {
      setIsHmEvaluating(false);
      const answeredCount = hmQuestions.filter((q) => q.candidateAnswer.trim().length > 0).length;
      const base = answeredCount / hmQuestions.length;
      setHmMatchScore(Math.round(base * 88 + Math.random() * 12));
    }, 1800);
  };

  const handleCandidateAnswer = (id: string, answer: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, candidateAnswer: answer } : q)));
  };

  const handleEvaluate = async () => {
    if (mockMode || !selectedVacancy || !selectedCandidate) {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        const answeredCount = questions.filter((q) => q.candidateAnswer.trim().length > 0).length;
        const base = answeredCount / questions.length;
        setMatchScore(Math.round(base * 85 + Math.random() * 15));
      }, 1800);
      return;
    }
    setIsEvaluating(true);
    try {
      const answeredQuestions = questions
        .filter((q) => q.candidateAnswer.trim().length > 0)
        .map((q) => ({ questionId: q.id, answer: q.candidateAnswer }));
      const result = await evaluateInterview(selectedVacancy, selectedCandidate, answeredQuestions, 'hr');
      setMatchScore(result.score);
    } catch (err) {
      console.error('Error evaluating interview:', err);
      const answeredCount = questions.filter((q) => q.candidateAnswer.trim().length > 0).length;
      setMatchScore(Math.round((answeredCount / questions.length) * 85));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleApproveCandidateStatus = async (candidateId: string, status: 'approved' | 'rejected') => {
    setCvCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, status } : c))
    );
    if (!mockMode && selectedVacancy) {
      try {
        await updateCandidateStatus(candidateId, status);
        await recomputeVacancyCounts(selectedVacancy);
        fetchVacancies().then(setVacancies).catch(() => {});
      } catch (err) {
        console.error('Error updating candidate status:', err);
      }
    }
  };

  const handleOpenVacancy = (id: string) => {
    resetVacancyState();
    const v = vacancies.find((vac) => vac.id === id);
    if (v) {
      setTeamContext(v.team);
      setRoleType(v.title);

      if (v.jdGenerated) {
        // Real vacancy from Supabase with a persisted JD
        setGeneratedJD(v.jdGenerated as any);
        setGenerated(true);
        if (v.jdBenefits) setCompanyBenefits(v.jdBenefits);
        if (v.status === 'interviewing') {
          setCurrentStep('interview');
        } else if (v.status === 'screening' || v.applicants > 0) {
          setCurrentStep('screening');
        } else {
          setCurrentStep('generated');
        }
      } else if (mockMode && v.status !== 'draft') {
        // Mock vacancy: inject the mock JD and advance to the correct step
        setGeneratedJD({
          summary: MOCK_GENERATED_JD.summary,
          requiredSkills: MOCK_GENERATED_JD.skills,
          responsibilities: MOCK_GENERATED_JD.responsibilities,
          benefits: MOCK_GENERATED_JD.benefits,
        });
        setGenerated(true);
        setJdFiles(MOCK_FILES);
        setCompanyBenefits(MOCK_BENEFITS);
        setHmSubmitted(true);
        if (v.status === 'interviewing') {
          setCurrentStep('interview');
        } else if (v.status === 'screening') {
          setCurrentStep('screening');
        } else {
          setCurrentStep('generated');
        }
      }

      // Restore candidates for mock vacancies that have applicants
      if (mockMode && (v.status === 'interviewing' || v.status === 'screening')) {
        setCvCandidates(MOCK_CV_CANDIDATES);
      }
    }
    setSelectedVacancy(id);
  };

  const handleBackToList = () => {
    setSelectedVacancy(null);
    resetVacancyState();
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Candidate deletion
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);

  const handleDeleteCandidate = async (candidateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCandidateId(candidateId);
    try {
      if (!mockMode) {
        await deleteCandidate(candidateId);
        await recomputeVacancyCounts(selectedVacancy!);
        fetchVacancies().then(setVacancies).catch(() => {});
      }
      setCvCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      if (expandedCandidate === candidateId) setExpandedCandidate(null);
    } catch (err) {
      console.error('Error deleting candidate:', err);
    } finally {
      setDeletingCandidateId(null);
    }
  };

  // Salary inline editing
  const [editingSalaryId, setEditingSalaryId] = useState<string | null>(null);
  const [editingSalaryValue, setEditingSalaryValue] = useState('');

  const handleSaveSalary = async (candidateId: string) => {
    const parsed = parseInt(editingSalaryValue.replace(/\D/g, ''), 10);
    const newSalary = isNaN(parsed) ? null : parsed;
    setCvCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, expectedSalary: newSalary ?? undefined } : c))
    );
    setEditingSalaryId(null);
    if (!mockMode) {
      try {
        await updateCandidateSalary(candidateId, newSalary);
      } catch (err) {
        console.error('Error saving salary:', err);
      }
    }
  };

  const handleDeleteVacancy = async (id: string, e?: React.MouseEvent): Promise<boolean> => {
    e?.stopPropagation();
    if (!window.confirm('¿Eliminar esta vacante? Esta acción no se puede deshacer.')) return false;
    setDeletingId(id);
    try {
      if (!mockMode) await deleteVacancy(id);
      setVacancies((prev) => prev.filter((v) => v.id !== id));
      return true;
    } catch (err) {
      alert(`Error eliminando vacante: ${String(err)}`);
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  // Determine which steps are accessible
  const stepEnabled = (key: HrStep): boolean => {
    switch (key) {
      case 'input': return true;
      case 'generated': return generated;
      case 'screening': return generated;
      case 'interview': return cvCandidates.length > 0 && approvedCandidates.length > 0;
    }
  };

  const currentStepIndex = HR_STEPS.findIndex((s) => s.key === currentStep);

  // ── VACANCY LIST VIEW ──
  if (!selectedVacancy) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        {/* Create Vacancy Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl shadow-2xl p-8 mx-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
                    <PlusCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">Nueva Vacante</h3>
                    <p className="text-[11px] text-on-surface-variant">Se creará en estado Borrador</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-surface-container-high rounded-xl transition-colors">
                  <X className="text-outline" size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Título del puesto *</label>
                  <input
                    value={newVacancyTitle}
                    onChange={(e) => setNewVacancyTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateVacancy()}
                    className="w-full bg-surface-container-low border-none rounded-xl p-3.5 text-sm font-semibold focus:ring-2 focus:ring-primary-container transition-all"
                    placeholder="ej. Senior Backend Engineer"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Equipo</label>
                  <div className="relative">
                    <select
                      value={newVacancyTeam}
                      onChange={(e) => setNewVacancyTeam(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl p-3.5 text-sm font-semibold focus:ring-2 focus:ring-primary-container transition-all appearance-none"
                    >
                      <option>Platform Engineering</option>
                      <option>Infrastructure & SRE</option>
                      <option>Product & Growth</option>
                      <option>Data & AI Systems</option>
                      <option>Design</option>
                      <option>Operations</option>
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={14} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-outline mb-2">Budget máximo (USD/mes)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline" size={14} />
                    <input
                      value={newVacancyBudget}
                      onChange={(e) => setNewVacancyBudget(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-surface-container-low border-none rounded-xl p-3.5 pl-9 text-sm font-semibold focus:ring-2 focus:ring-primary-container transition-all"
                      placeholder="ej. 5000"
                      type="text"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateVacancy}
                  disabled={!newVacancyTitle.trim() || isCreating}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary-container/20"
                >
                  {isCreating ? <><Loader2 className="animate-spin" size={16} />Creando...</> : <><PlusCircle size={16} />Crear vacante</>}
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="mb-10">
          <nav className="flex text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-2">
            <span className="opacity-50">Talent AI-Quisition</span>
            <span className="mx-2 opacity-50">/</span>
            <span>Vacancies</span>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Vacantes</h2>
              <p className="text-on-surface-variant mt-1">
                {activeRole === 'hr' ? 'Gestiona todas las vacantes abiertas y su progreso.' : 'Consulta el estado de las vacantes de tu equipo.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeRole === 'hr' && (
                <>
                  <button
                    onClick={toggleListMockMode}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                      mockMode
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-amber-400/30 hover:border-amber-400'
                    }`}
                  >
                    <FlaskConical size={14} />Demo {mockMode ? 'ON' : 'OFF'}
                  </button>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    disabled={mockMode}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg shadow-primary-container/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <PlusCircle size={16} />Nueva vacante
                  </button>
                </>
              )}
              {activeRole === 'hiring_manager' && (
                <button
                  onClick={toggleHmListMockMode}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                    mockMode
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-amber-400/30 hover:border-amber-400'
                  }`}
                >
                  <FlaskConical size={14} />Demo {mockMode ? 'ON' : 'OFF'}
                </button>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
                <div className={`w-2 h-2 rounded-full ${activeRole === 'hr' ? 'bg-secondary' : 'bg-primary-container'}`} />
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {activeRole === 'hr' ? 'Recursos Humanos' : 'Hiring Manager'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Vacantes', value: vacancies.length, color: 'text-primary-container' },
            { label: 'En Screening', value: vacancies.filter((v) => v.status === 'screening').length, color: 'text-amber-600' },
            { label: 'En Entrevistas', value: vacancies.filter((v) => v.status === 'interviewing').length, color: 'text-secondary' },
            { label: 'Completadas', value: vacancies.filter((v) => v.status === 'completed').length, color: 'text-secondary' },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">{stat.label}</p>
              <p className={`font-headline text-3xl font-extrabold ${stat.color}`}>
                {isLoadingVacancies ? '...' : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Vacancy cards */}
        <div className="space-y-3">
          {isLoadingVacancies && (
            <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-medium">Cargando vacantes...</span>
            </div>
          )}
          {vacancyError && (
            <div className="flex items-center gap-3 p-4 bg-error/10 rounded-xl text-error text-sm">
              <AlertTriangle size={16} />{vacancyError}
            </div>
          )}
          {!isLoadingVacancies && vacancies.length === 0 && !vacancyError && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Briefcase className="text-outline-variant mb-4" size={48} />
              <p className="text-lg font-bold text-on-surface-variant mb-2">No hay vacantes todavía</p>
              <p className="text-sm text-outline">Activa el modo Mock para ver un demo, o crea tu primera vacante.</p>
            </div>
          )}
          {vacancies.map((v) => {
            const sc = VACANCY_STATUS_CONFIG[v.status];
            const stepNum = v.status === 'draft' ? 1 : v.status === 'generated' ? 2 : v.status === 'screening' ? 3 : v.status === 'interviewing' ? 3 : 4;
            return (
              <div key={v.id} onClick={() => handleOpenVacancy(v.id)} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-secondary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center group-hover:bg-primary-container/20 transition-colors">
                      <Briefcase className="text-primary-container" size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-on-surface group-hover:text-primary-container transition-colors">{v.title}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-on-surface-variant">{v.team}</span>
                        <span className="text-xs text-outline flex items-center gap-1"><Clock size={10} />{v.createdAt}</span>
                        {v.budget && (
                          <span className="text-xs font-bold text-secondary flex items-center gap-1">
                            <DollarSign size={10} />Budget: {fmtSalary(v.budget)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {v.applicants > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-on-surface-variant">{v.applicants} aplicantes</p>
                        <p className="text-[10px] text-outline">{v.approved} aprobados · {v.rejected} rechazados</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {/* Progress dots */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map((s) => (
                          <div key={s} className={`w-2 h-2 rounded-full ${s <= stepNum ? 'bg-secondary' : 'bg-surface-container-high'}`} />
                        ))}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${sc.color} ${sc.bg}`}>{sc.label}</span>
                      {activeRole === 'hr' && (
                        <button
                          onClick={(e) => handleDeleteVacancy(v.id, e)}
                          disabled={deletingId === v.id}
                          className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Eliminar vacante"
                        >
                          {deletingId === v.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        </button>
                      )}
                      <ChevronRight className="text-outline group-hover:text-secondary transition-colors" size={18} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── VACANCY DETAIL (PAGINATED WIZARD) ──
  const vacancy = vacancies.find((v) => v.id === selectedVacancy);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={handleBackToList} className="flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors text-sm font-bold">
            <ArrowLeft size={16} />Vacantes
          </button>
          <span className="text-outline mx-1">/</span>
          <span className="text-sm font-bold text-on-surface">{vacancy?.title}</span>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-primary-container tracking-tight">{vacancy?.title}</h2>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-on-surface-variant text-sm">{vacancy?.team}</p>
              {vacancy?.budget && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary text-xs font-black rounded-lg">
                  <DollarSign size={12} />Budget máx: {fmtSalary(vacancy.budget)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeRole === 'hr' && (
              <>
                <button onClick={toggleMockMode} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${mockMode ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                  <FlaskConical size={14} />Mock {mockMode ? 'ON' : 'OFF'}
                </button>
                {selectedVacancy && (
                  <button
                    onClick={async () => {
                      const deleted = await handleDeleteVacancy(selectedVacancy);
                      if (deleted) handleBackToList();
                    }}
                    disabled={!!deletingId}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs text-error hover:bg-error/10 transition-all disabled:opacity-40"
                    title="Eliminar vacante"
                  >
                    {deletingId ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                    Eliminar
                  </button>
                )}
              </>
            )}
            {activeRole === 'hiring_manager' && (
              <button onClick={toggleHmDetailMockMode} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${mockMode ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                <FlaskConical size={14} />Demo {mockMode ? 'ON' : 'OFF'}
              </button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
              <div className={`w-2 h-2 rounded-full ${activeRole === 'hr' ? 'bg-secondary' : 'bg-primary-container'}`} />
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {activeRole === 'hr' ? 'Recursos Humanos' : 'Hiring Manager'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── STEP INDICATOR (clickable, paginated) ── */}
      {activeRole === 'hr' && (
        <div className="flex items-center gap-0 mb-10 bg-surface-container-lowest rounded-2xl p-2 shadow-sm">
          {HR_STEPS.map((s, i) => {
            const enabled = stepEnabled(s.key);
            const active = currentStep === s.key;
            const done = (s.key === 'input' && (jdFiles.length > 0 || companyBenefits.trim().length > 0))
              || (s.key === 'generated' && generated)
              || (s.key === 'screening' && cvCandidates.length > 0)
              || (s.key === 'interview' && (matchScore !== null || hrDecision !== 'none'));
            return (
              <React.Fragment key={s.key}>
                <button
                  onClick={() => enabled && setCurrentStep(s.key)}
                  disabled={!enabled}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-primary-container text-white shadow-md'
                      : enabled
                        ? 'text-on-surface-variant hover:bg-surface-container-low cursor-pointer'
                        : 'text-outline/40 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    active ? 'bg-white/20 text-white' : done ? 'bg-secondary text-white' : 'bg-surface-container-high text-outline'
                  }`}>
                    {done && !active ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  {s.label}
                </button>
                {i < HR_STEPS.length - 1 && <div className="w-px h-8 bg-outline-variant/20" />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ── HM DIRECT VIEW (full status-based experience) ── */}
      {activeRole === 'hiring_manager' && (() => {
        const vacancy = vacancies.find((v) => v.id === selectedVacancy)!;

        // ── STATUS: DRAFT ──
        if (vacancy.status === 'draft') {
          return (
            <div className="space-y-8">
              <div className="flex items-center gap-4 p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="text-white" size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Vacante en borrador</p>
                  <p className="text-xs text-on-surface-variant">Sube la JD base y confirma los inputs del equipo para enviar a RH.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><FileText className="text-white" size={20} /></div>
                    <div><h3 className="font-headline text-lg font-bold text-on-surface">Job Description Base</h3><p className="text-xs text-on-surface-variant">Sube el PDF de la JD o skills matrix que recibirás de tu cliente</p></div>
                  </div>
                  <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary-container hover:bg-primary-container/5 transition-all group">
                    <Upload className="text-outline-variant group-hover:text-primary-container mb-3 transition-colors" size={32} />
                    <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary-container transition-colors">Arrastra o haz clic para subir</span>
                    <span className="text-[10px] text-outline mt-1">PDF, DOCX</span>
                    <input type="file" accept=".pdf,.doc,.docx" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                  {jdFiles.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {jdFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-error-container rounded-lg flex items-center justify-center"><FileText className="text-on-error-container" size={16} /></div>
                            <div><p className="text-sm font-bold text-on-surface">{file.name}</p><p className="text-[10px] text-outline">{file.size}</p></div>
                          </div>
                          <button onClick={() => removeFile(i)} className="p-1 hover:bg-surface-container-high rounded transition-colors"><X className="text-outline" size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Users className="text-white" size={20} /></div>
                    <div><h3 className="font-headline text-lg font-bold text-on-surface">Team Inputs</h3><p className="text-xs text-on-surface-variant">Resumen de las actividades del equipo (3/4 enviados)</p></div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl mb-4">
                    <p className="text-sm text-on-surface leading-relaxed">{MOCK_TEAM_SUMMARY}</p>
                  </div>
                  <div className="flex items-center gap-2 text-secondary"><CheckCircle2 size={16} /><span className="text-xs font-bold">3 de 4 miembros han enviado su feedback</span></div>
                </section>
              </div>
            </div>
          );
        }

        // ── STATUS: GENERATED ──
        if (vacancy.status === 'generated') {
          const jd = HM_GENERATED_JDS[vacancy.id] ?? {
            title: vacancy.title,
            summary: 'Job Description generada por IA combinando los inputs de RH y el equipo. Optimizada para atraer candidatos con el perfil exacto que necesita el equipo.',
            skills: ['React', 'TypeScript', 'GraphQL', 'Design Systems', 'Storybook', 'CSS-in-JS'],
            responsibilities: [
              'Liderar el desarrollo de nuevas features de producto en el frontend.',
              'Mantener y evolucionar el Design System de la empresa.',
              'Colaborar con Diseño y PM en la definición de experiencias.',
              'Establecer estándares de calidad y performance en el equipo de frontend.',
            ],
          };
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-5 bg-secondary/10 border border-secondary/30 rounded-xl">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0"><BrainCircuit className="text-white" size={18} /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">JD Generada por RH — Lista para publicar</p>
                  <p className="text-xs text-on-surface-variant">RH procesó los inputs y generó la Job Description final. Revisa y aprueba para postear la vacante.</p>
                </div>
                <span className="px-3 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full">AI Generated</span>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">{jd.title}</h3>
                <p className="text-sm text-on-surface leading-relaxed mb-6">{jd.summary}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Skills Requeridas</h4>
                    <div className="flex flex-wrap gap-2">{jd.skills.map((s) => (<span key={s} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-[11px] font-bold">{s}</span>))}</div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Responsabilidades</h4>
                    <ul className="space-y-2">{jd.responsibilities.map((r, i) => (<li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant"><CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={12} />{r}</li>))}</ul>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg">
                  <Send size={16} />Aprobar y publicar vacante
                </button>
              </div>
            </div>
          );
        }

        // ── STATUS: SCREENING ──
        if (vacancy.status === 'screening') {
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-5 bg-primary-container/10 border border-primary-container/30 rounded-xl">
                <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center flex-shrink-0"><BarChart3 className="text-white" size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Screening en progreso — RH está evaluando candidatos</p>
                  <p className="text-xs text-on-surface-variant">Se han recibido {vacancy.applicants} CVs. RH está haciendo el pre-filtro con IA y seleccionará los mejores perfiles para entrevista.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                  <p className="font-headline text-3xl font-black text-primary-container">{vacancy.applicants}</p>
                  <p className="text-[10px] uppercase font-bold text-outline mt-1">CVs recibidos</p>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                  <p className="font-headline text-3xl font-black text-secondary">{vacancy.approved ?? Math.round(vacancy.applicants * 0.3)}</p>
                  <p className="text-[10px] uppercase font-bold text-outline mt-1">En evaluación</p>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                  <p className="font-headline text-3xl font-black text-outline">...</p>
                  <p className="text-[10px] uppercase font-bold text-outline mt-1">Pendiente RH</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Candidatos en evaluación (vista previa)</p>
                <div className="space-y-3">
                  {MOCK_CV_CANDIDATES.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.matchScore >= 75 ? 'bg-secondary' : c.matchScore >= 60 ? 'bg-amber-400' : 'bg-error'}`} />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-on-surface">{c.name}</p>
                        <p className="text-xs text-on-surface-variant">{c.currentRole}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-headline text-xl font-black ${c.matchScore >= 75 ? 'text-secondary' : c.matchScore >= 60 ? 'text-amber-500' : 'text-error'}`}>{c.matchScore}%</p>
                        <p className="text-[10px] text-outline">match</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-outline text-center mt-4">Decisión final de entrevista: RH</p>
              </div>
            </div>
          );
        }

        // ── STATUS: INTERVIEWING → HM Technical Interview ──
        if (vacancy.status === 'interviewing') {
          const hmCandidate = cvCandidates.find((c) => c.id === selectedHmCandidateId);
          const hmAnsweredAll = hmRealQuestions.length > 0 && hmRealQuestions.every((q) => q.candidateAnswer.trim().length > 0);
          const overBudgetHm = vacancy.budget && hmCandidate?.expectedSalary ? hmCandidate.expectedSalary > vacancy.budget : false;

          return (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-300/50 rounded-xl">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0"><Briefcase className="text-white" size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Entrevista técnica avanzada — Hiring Manager</p>
                  <p className="text-xs text-on-surface-variant">{cvCandidates.filter((c) => c.status === 'approved').length} candidato(s) aprobados por RH. Preguntas técnicas profundas específicas al rol.</p>
                </div>
              </div>

              {/* Candidate selector */}
              {cvCandidates.filter((c) => c.status === 'approved').length === 0 ? (
                <div className="p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center text-center">
                  <UserCheck className="text-outline-variant mb-3" size={40} />
                  <p className="text-sm font-bold text-on-surface-variant mb-1">No hay candidatos aprobados por RH</p>
                  <p className="text-xs text-outline">RH debe completar la entrevista de screening primero.</p>
                </div>
              ) : (
                <>
                  <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Selecciona el candidato a entrevistar</p>
                    <div className="flex flex-wrap gap-3">
                      {cvCandidates.filter((c) => c.status === 'approved').map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleHmSelectCandidate(c.id)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedHmCandidateId === c.id ? 'bg-secondary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${selectedHmCandidateId === c.id ? 'bg-white/20 text-white' : 'bg-secondary-container text-on-secondary-container'}`}>
                            {c.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold">{c.name}</p>
                            <p className={`text-[10px] ${selectedHmCandidateId === c.id ? 'text-white/70' : 'text-outline'}`}>CV: {c.matchScore}%{c.expectedSalary ? ` · ${fmtSalary(c.expectedSalary)}` : ''}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Candidate detail card */}
                  {hmCandidate && (
                    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Perfil del candidato</p>
                      <div className="flex items-start gap-5">
                        <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container font-black text-lg flex-shrink-0">
                          {hmCandidate.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-headline text-xl font-bold text-on-surface">{hmCandidate.name}</h3>
                          <p className="text-sm text-on-surface-variant">{hmCandidate.currentRole}</p>
                          <p className="text-xs text-outline mt-0.5">{hmCandidate.experience}</p>
                          <div className="flex gap-3 mt-3 flex-wrap">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container/10 rounded-lg">
                              <span className="text-[10px] font-bold text-outline uppercase">CV Match</span>
                              <span className="font-headline font-black text-primary-container text-lg">{hmCandidate.matchScore}%</span>
                            </div>
                            {hmCandidate.expectedSalary && (
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${overBudgetHm ? 'bg-amber-500/10' : 'bg-secondary/10'}`}>
                                <DollarSign size={12} className={overBudgetHm ? 'text-amber-500' : 'text-secondary'} />
                                <span className="text-[10px] font-bold text-outline uppercase">Salario esperado</span>
                                <span className={`font-headline font-black text-base ${overBudgetHm ? 'text-amber-600' : 'text-secondary'}`}>{fmtSalary(hmCandidate.expectedSalary)}</span>
                                {overBudgetHm && <span className="text-[9px] text-amber-600 font-bold">↑ sobre budget</span>}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs shrink-0">
                          {hmCandidate.strengths.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black uppercase text-secondary mb-1">Fortalezas</p>
                              {hmCandidate.strengths.slice(0, 3).map((s) => <p key={s} className="flex items-center gap-1 text-on-surface-variant mb-0.5"><CheckCircle2 className="text-secondary" size={10} />{s}</p>)}
                            </div>
                          )}
                          {hmCandidate.gaps.length > 0 && (
                            <div>
                              <p className="text-[10px] font-black uppercase text-amber-500 mb-1">Gaps</p>
                              {hmCandidate.gaps.slice(0, 3).map((g) => <p key={g} className="flex items-center gap-1 text-on-surface-variant mb-0.5"><AlertTriangle className="text-amber-400" size={10} />{g}</p>)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  {selectedHmCandidateId && (
                    isLoadingHmQ ? (
                      <div className="flex items-center justify-center gap-3 py-12">
                        <Loader2 className="animate-spin text-secondary" size={24} />
                        <span className="text-sm font-semibold text-secondary">Generando preguntas con IA...</span>
                      </div>
                    ) : hmRealQuestions.length === 0 ? (
                      <div className="p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center text-center">
                        <MessageSquare className="text-outline-variant mb-3" size={40} />
                        <p className="text-sm font-bold text-on-surface-variant">No se pudieron cargar las preguntas</p>
                        <button onClick={() => handleHmSelectCandidate(selectedHmCandidateId)} className="mt-4 px-5 py-2 bg-secondary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-all">
                          Reintentar
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-1">
                          <Shuffle className="text-secondary" size={14} />
                          <p className="text-xs font-black text-secondary uppercase tracking-widest">
                            {hmRealQuestions.filter((q) => q.questionType === 'base').length} preguntas técnicas avanzadas + {hmRealQuestions.filter((q) => q.questionType !== 'base').length} personalizadas
                          </p>
                        </div>

                        {hmRealQuestions.map((q, i) => {
                          const isBaseQ = q.questionType === 'base';
                          return (
                            <div key={q.id} className={`p-6 rounded-2xl shadow-sm ${isBaseQ ? 'bg-amber-50/40 border border-amber-200/40' : 'bg-purple-50/40 border border-purple-200/40'}`}>
                              <div className="flex items-start gap-4">
                                <span className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-lg flex-shrink-0 ${isBaseQ ? 'bg-amber-500' : 'bg-purple-500'}`}>T{i + 1}</span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[10px] text-outline uppercase font-bold">{q.category}</p>
                                    {isBaseQ
                                      ? <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black uppercase rounded">Técnica Avanzada</span>
                                      : <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-[9px] font-black uppercase rounded">Deep Dive Personalizado</span>
                                    }
                                  </div>
                                  <p className="text-sm font-bold text-on-surface mb-2">{q.question}</p>
                                  {q.tailoredFor && (
                                    <div className="flex items-center gap-1.5 mb-3">
                                      <Shuffle className="text-secondary/60 flex-shrink-0" size={11} />
                                      <p className="text-[11px] text-secondary/70 italic">{q.tailoredFor}</p>
                                    </div>
                                  )}
                                  <div className="mb-3 p-3 bg-surface-container-low rounded-lg border-l-2 border-outline-variant/30">
                                    <p className="text-[10px] text-outline uppercase font-bold mb-1">Respuesta esperada (referencia):</p>
                                    <p className="text-xs text-on-surface-variant italic leading-relaxed">{q.expectedAnswer}</p>
                                  </div>
                                  <textarea
                                    value={q.candidateAnswer}
                                    onChange={(e) => handleHmRealAnswer(q.id, e.target.value)}
                                    className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none"
                                    placeholder="Escribe la respuesta del candidato..."
                                    rows={3}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex justify-center mt-6">
                          <button
                            onClick={handleHmRealEvaluate}
                            disabled={!hmAnsweredAll || isHmRealEvaluating}
                            className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${hmAnsweredAll && !isHmRealEvaluating ? 'bg-secondary text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}
                          >
                            {isHmRealEvaluating ? (<><Loader2 className="animate-spin" size={20} />Evaluando con IA...</>) : (<><BarChart3 size={20} />Evaluar Entrevista Técnica</>)}
                          </button>
                        </div>

                        {hmRealScore !== null && (() => {
                          const hmCandidateDecision = cvCandidates.find((c) => c.id === selectedHmCandidateId)?.hmDecision;
                          return (
                            <div className="space-y-4 mt-4">
                              {/* Score card */}
                              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg">
                                <div className="flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-6">
                                    <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                                      <svg className="w-full h-full transform -rotate-90">
                                        <circle className="text-surface-container-high" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                                        <circle className={hmRealScore >= 70 ? 'text-secondary' : 'text-error'} cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset={301 - (301 * hmRealScore) / 100} strokeWidth="8" strokeLinecap="round" />
                                      </svg>
                                      <span className={`absolute font-headline font-black text-3xl ${hmRealScore >= 70 ? 'text-secondary' : 'text-error'}`}>{hmRealScore}%</span>
                                    </div>
                                    <div>
                                      <h3 className="font-headline text-2xl font-bold text-on-surface">Resultado técnico: {hmCandidate?.name}</h3>
                                      <div className="flex items-center gap-3 mt-1 mb-2">
                                        <span className="text-xs text-on-surface-variant">CV Score: <strong className="text-primary-container">{hmCandidate?.matchScore}%</strong></span>
                                        <span className="text-outline">→</span>
                                        <span className="text-xs font-bold">Score Técnico HM: <strong className={hmRealScore >= 70 ? 'text-secondary' : 'text-error'}>{hmRealScore}%</strong></span>
                                      </div>
                                      {hmRealJustification && <p className="text-sm text-on-surface-variant max-w-md italic">{hmRealJustification}</p>}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className={hmRealScore >= 70 ? 'text-secondary' : 'text-error'} size={20} />
                                      <span className={`text-sm font-bold ${hmRealScore >= 70 ? 'text-secondary' : 'text-error'}`}>
                                        {hmRealScore >= 80 ? 'Perfil sólido' : hmRealScore >= 70 ? 'Aceptable' : 'No recomendado'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-on-surface-variant">
                                      <TrendingUp size={14} />
                                      <span className="text-[10px] font-bold uppercase">Evaluación IA — HM</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* HM Decision buttons or badge */}
                              {!hmCandidateDecision ? (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-4">Decisión del Hiring Manager — ¿Continúa el proceso?</p>
                                  <div className="flex gap-4">
                                    <button
                                      onClick={() => handleHmDecision('accepted')}
                                      disabled={isSavingHmDecision}
                                      className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all shadow-lg disabled:opacity-60"
                                    >
                                      {isSavingHmDecision ? <Loader2 className="animate-spin" size={18} /> : <ThumbsUp size={18} />}
                                      Apto para Oferta — Notificar a RH
                                    </button>
                                    <button
                                      onClick={() => handleHmDecision('rejected')}
                                      disabled={isSavingHmDecision}
                                      className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-error/10 text-error border border-error/30 hover:bg-error/20 transition-all disabled:opacity-60"
                                    >
                                      <ThumbsDown size={18} />
                                      Descartar — Notificar a RH
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className={`flex items-center gap-4 p-5 rounded-2xl border ${hmCandidateDecision === 'accepted' ? 'bg-secondary/10 border-secondary/30' : 'bg-error/10 border-error/30'}`}>
                                  {hmCandidateDecision === 'accepted'
                                    ? <Trophy className="text-secondary flex-shrink-0" size={24} />
                                    : <ThumbsDown className="text-error flex-shrink-0" size={24} />}
                                  <div>
                                    <p className={`text-sm font-bold ${hmCandidateDecision === 'accepted' ? 'text-secondary' : 'text-error'}`}>
                                      {hmCandidateDecision === 'accepted' ? 'Apto para oferta — Resultado enviado a RH' : 'Candidato descartado — Resultado enviado a RH'}
                                    </p>
                                    <p className="text-xs text-on-surface-variant">RH recibirá el feedback técnico y tomará la decisión final.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          );
        }

        // ── STATUS: COMPLETED ──
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-5 bg-secondary/10 border border-secondary/30 rounded-xl">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0"><CheckCircle2 className="text-white" size={18} /></div>
              <div>
                <p className="text-sm font-bold text-on-surface">Proceso completado exitosamente</p>
                <p className="text-xs text-on-surface-variant">La vacante fue cubierta. El candidato seleccionado pasó por todo el proceso de evaluación.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                <p className="font-headline text-3xl font-black text-primary-container">{vacancy.applicants}</p>
                <p className="text-[10px] uppercase font-bold text-outline mt-1">CVs recibidos</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                <p className="font-headline text-3xl font-black text-secondary">{vacancy.approved ?? 1}</p>
                <p className="text-[10px] uppercase font-bold text-outline mt-1">Contratados</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                <p className="font-headline text-3xl font-black text-error">{vacancy.rejected ?? vacancy.applicants - 1}</p>
                <p className="text-[10px] uppercase font-bold text-outline mt-1">Descartados</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm text-center">
              <TrendingUp className="text-secondary mx-auto mb-3" size={32} />
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Proceso archivado</h3>
              <p className="text-sm text-on-surface-variant">El proceso de contratación para esta vacante ha concluido. Puedes revisar el historial en el reporte final.</p>
            </div>
          </div>
        );
      })()}

      {/* ── HM: TEAM INPUTS PANEL (visible inside any vacancy) ── */}
      {activeRole === 'hiring_manager' && selectedVacancy && (() => {
        const vacancy = vacancies.find((v) => v.id === selectedVacancy)!;
        const HM_TEAM_INPUTS: Record<string, { name: string; role: string; avatar: string; status: 'submitted' | 'pending'; text: string; submittedAt: string }[]> = {
          v1: [
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'submitted', submittedAt: '18 Mar, 09:14', text: 'Me la paso haciendo APIs en Go y code reviews. Esta semana migré endpoints de REST a gRPC y estuve optimizando queries lentas en PostgreSQL. Necesitamos a alguien que tome ownership de la migración a event-driven architecture.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '18 Mar, 10:32', text: 'Trabajo en React/TypeScript y toco backend en Go cuando necesito. Falta alguien de backend puro que nos ayude con la carga.' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'submitted', submittedAt: '17 Mar, 16:55', text: 'Mantengo infra en GCP con Terraform y Kubernetes. Necesitamos a alguien que entienda K8s y pueda autosuficientarse sin ser mi cuello de botella.' },
            { name: 'Ana Gutiérrez', role: 'Frontend Engineer', avatar: 'ana', status: 'pending', submittedAt: '', text: '' },
          ],
          v2: [
            { name: 'Ana Gutiérrez', role: 'Frontend Engineer', avatar: 'ana', status: 'submitted', submittedAt: '8 Mar, 11:20', text: 'Implemento features con React y TypeScript, muy alineada con Diseño. Necesitamos un Frontend Lead que defina el Design System y establezca estándares de calidad.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '8 Mar, 14:05', text: 'Trabajo en el frontend y backend. Nos haría falta alguien con visión de producto y que sea mentor para el equipo de frontend.' },
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'pending', submittedAt: '', text: '' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'pending', submittedAt: '', text: '' },
          ],
          v3: [
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'pending', submittedAt: '', text: '' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'pending', submittedAt: '', text: '' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'pending', submittedAt: '', text: '' },
          ],
          v4: [
            { name: 'Marcus Thorne', role: 'DevOps / SRE Engineer', avatar: 'marcus', status: 'submitted', submittedAt: '1 Mar, 09:00', text: 'Soy el único que toca el cluster de producción. Necesitamos a alguien con Kubernetes operativo real, Terraform y experiencia en incident response. Bonus si conoce Istio.' },
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'submitted', submittedAt: '1 Mar, 10:15', text: 'Trabajaría muy de cerca con esta persona para los deployments de los servicios de pagos. Necesita saber Kubernetes y entender Go deployments.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '1 Mar, 11:30', text: 'Que sea buena comunicando cuando hay cambios de infra que nos impactan en el frontend. Que monitoree activamente y no espere a que todo truene.' },
          ],
          v5: [
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'submitted', submittedAt: '20 Feb, 08:45', text: 'Necesitamos QA que entienda APIs y pueda escribir pruebas de integración. Que no sea solo "clickeador manual".' },
            { name: 'Ana Gutiérrez', role: 'Frontend Engineer', avatar: 'ana', status: 'submitted', submittedAt: '20 Feb, 09:30', text: 'Alguien que haga pruebas E2E de los flujos de producto con Cypress o Playwright. Que trabaje cerca de diseño también.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '20 Feb, 10:00', text: 'Con experiencia en Playwright o Cypress. Que pueda hacer pruebas de regresión automáticas en el pipeline de CI.' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'submitted', submittedAt: '20 Feb, 10:45', text: 'Que sepa integrar los tests en GitHub Actions. Que entienda los pipelines y pueda agregar gates de calidad al CI/CD.' },
          ],
        };
        const members = HM_TEAM_INPUTS[vacancy.id] ?? [];
        if (members.length === 0) return null;
        const submittedCount = members.filter((m) => m.status === 'submitted').length;
        return (
          <div className="mt-8 bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-surface-container-high rounded-lg flex items-center justify-center"><Users className="text-outline" size={16} /></div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Team Inputs para esta vacante</h4>
                  <p className="text-[10px] text-outline">{submittedCount}/{members.length} miembros han enviado su feedback</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${(submittedCount / members.length) * 100}%` }} />
                </div>
                <span className="text-[11px] font-bold text-secondary">{Math.round((submittedCount / members.length) * 100)}%</span>
              </div>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {members.map((m) => (
                <div key={m.name} className="flex items-start gap-4 p-5">
                  <img src={`https://picsum.photos/seed/${m.avatar}/100/100`} alt={m.name} className="w-9 h-9 rounded-full object-cover border-2 border-surface-container-high flex-shrink-0 mt-0.5" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-on-surface">{m.name}</p>
                      <span className="text-[10px] text-outline">{m.role}</span>
                      {m.status === 'submitted' && <span className="ml-auto text-[10px] text-outline">{m.submittedAt}</span>}
                    </div>
                    {m.status === 'submitted' ? (
                      <p className="text-xs text-on-surface-variant leading-relaxed">{m.text}</p>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Clock className="text-amber-400" size={12} />
                        <span className="text-xs text-amber-600 font-medium">Pendiente de enviar</span>
                      </div>
                    )}
                  </div>
                  {m.status === 'submitted' ? (
                    <CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={16} />
                  ) : (
                    <Clock className="text-amber-400 flex-shrink-0 mt-0.5" size={16} />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── PAGE CONTENT (HR ONLY below) ── */}

      {/* STEP 1: INPUTS */}
      {activeRole === 'hr' && (currentStep === 'input') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* JD Upload */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><FileText className="text-white" size={20} /></div>
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
                        <div><p className="text-sm font-bold text-on-surface">{file.name}</p><p className="text-[10px] text-outline">{file.size}</p></div>
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
              <textarea value={companyBenefits} onChange={(e) => setCompanyBenefits(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none" placeholder={"Ejemplo:\n- Trabajo remoto\n- Seguro de gastos médicos\n- Vales de despensa"} rows={6} />
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
                  <div className="flex items-center gap-2 text-secondary"><CheckCircle2 size={16} /><span className="text-xs font-bold">Inputs enviados a RH</span></div>
                </>
              ) : (
                <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center text-center">
                  <Users className="text-outline-variant mb-3" size={32} />
                  <p className="text-sm font-bold text-on-surface-variant mb-1">Aún no se han recopilado los inputs</p>
                  <p className="text-xs text-outline">Ve al tab de "Team Inputs" para que cada miembro registre sus actividades.</p>
                </div>
              )}
              <div className="mt-6 p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-2 mb-2"><Eye className="text-outline" size={14} /><p className="text-[10px] font-black uppercase tracking-widest text-outline">Tu rol en este paso</p></div>
                <p className="text-xs text-on-surface-variant leading-relaxed">Como Hiring Manager, asegúrate de que los inputs del equipo estén completos y la JD base cargada. RH gestionará el proceso.</p>
              </div>
            </section>
          )}
        </div>
      )}

      {/* STEP 2: GENERATED JD */}
      {currentStep === 'generated' && activeRole === 'hr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-container rounded-xl flex items-center justify-center"><BrainCircuit className="text-on-secondary-container" size={20} /></div>
                  <div>
                    <h3 className="font-headline text-xl font-bold text-on-surface">{vacancy?.title ?? roleType}</h3>
                    <p className="text-xs text-on-surface-variant">Job Description optimizada por IA</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-widest rounded-full">AI Generated</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed mb-6">{generatedJD?.summary}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Skills Requeridas</h4>
                  <div className="flex flex-wrap gap-2">
                    {(generatedJD?.requiredSkills ?? []).map((skill) => (<span key={skill} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-[11px] font-bold">{skill}</span>))}
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Equipo Destino</h4>
                  <p className="text-sm font-semibold text-primary-container">{vacancy?.team ?? teamContext}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{vacancy?.title ?? roleType}</p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Responsabilidades Clave</h4>
                <ul className="space-y-3">
                  {(generatedJD?.responsibilities ?? []).map((resp, i) => (
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
                  {(generatedJD?.benefits ?? []).map((b, i) => (<li key={i} className="flex items-center gap-2 text-sm text-on-surface"><CheckCircle2 className="text-secondary flex-shrink-0" size={14} />{b}</li>))}
                </ul>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            {/* Personalization notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Sparkles className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-bold text-amber-700">Preguntas se personalizarán por candidato</p>
                <p className="text-[11px] text-amber-600 leading-relaxed mt-0.5">
                  Al iniciar la entrevista de cada candidato, la IA cruzará su CV con esta JD y generará preguntas específicas que profundizan en sus fortalezas y sondean sus gaps.
                </p>
              </div>
            </div>

            <div className="bg-primary-container text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -mr-10 -mt-10 rounded-full" />
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="text-secondary" size={24} />
                <div>
                  <h3 className="font-headline text-xl font-bold">Plantilla Base de Preguntas</h3>
                  <p className="text-xs text-on-primary-container">Template generado de la JD — se adaptará a cada candidato</p>
                </div>
              </div>
              <div className="space-y-5">
                {MOCK_BASE_QUESTIONS.map((q, i) => (
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
      )}

      {/* STEP 3: CV SCREENING */}
      {currentStep === 'screening' && activeRole === 'hr' && (
        <section>
          {cvCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="text-outline-variant mb-4" size={48} />
              <p className="text-lg font-bold text-on-surface-variant mb-2">
                {isProcessingCVs ? processingStatus : 'Sube los CVs de los candidatos'}
              </p>
              {cvProcessingError && (
                <div className="flex items-start gap-2 mt-4 px-4 py-3 bg-error/10 text-error rounded-xl text-xs font-semibold max-w-sm text-left">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{cvProcessingError}</span>
                </div>
              )}
              {isProcessingCVs ? (
                <div className="flex flex-col items-center gap-3 mt-4">
                  <Loader2 className="animate-spin text-primary-container" size={32} />
                  <span className="text-sm font-semibold text-primary-container">{processingStatus}</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-outline mb-6">
                    {mockMode
                      ? 'Estás en modo mock. Haz clic para cargar candidatos de demostración.'
                      : 'Sube PDFs de CVs para que la IA los evalúe automáticamente contra la JD.'}
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    {!mockMode && (
                      <label className="flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg cursor-pointer">
                        <Upload size={18} />Subir CVs (PDF)
                        <input type="file" accept=".pdf" multiple className="hidden" onChange={handleCVFilesUpload} />
                      </label>
                    )}
                    <button onClick={handleShowScreening} className="flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold text-sm bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high transition-all">
                      <FlaskConical size={16} />
                      {mockMode ? 'Cargar candidatos demo' : 'Cargar demo'}
                    </button>
                  </div>
                </>
              )}
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
                <div className="flex gap-3 items-center flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg"><UserCheck className="text-secondary" size={14} /><span className="text-xs font-bold text-secondary">{approvedCandidates.length} Aprobados</span></div>
                  {pendingCandidates.length > 0 && <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 rounded-lg"><Clock className="text-amber-500" size={14} /><span className="text-xs font-bold text-amber-600">{pendingCandidates.length} En revisión</span></div>}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 rounded-lg"><UserX className="text-error" size={14} /><span className="text-xs font-bold text-error">{rejectedCandidates.length} Rechazados</span></div>
                  {!mockMode && (
                    <div className="flex flex-col items-end gap-2">
                      {cvProcessingError && (
                        <div className="flex items-start gap-2 px-3 py-2 bg-error/10 text-error rounded-lg text-xs font-semibold max-w-xs text-right">
                          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                          <span>{cvProcessingError}</span>
                        </div>
                      )}
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${isProcessingCVs ? 'bg-surface-container-high text-outline cursor-not-allowed' : 'bg-primary-container/10 text-primary-container hover:bg-primary-container/20'}`}>
                        {isProcessingCVs ? <><Loader2 className="animate-spin" size={14} />{processingStatus || 'Procesando...'}</> : <><Upload size={14} />Agregar CVs</>}
                        <input type="file" accept=".pdf" multiple className="hidden" onChange={handleCVFilesUpload} disabled={isProcessingCVs} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Approved */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3 ml-1">Candidatos Aprobados — Listos para Entrevista</p>
                <div className="space-y-3">
                  {approvedCandidates.map((c) => {
                    const overBudget = vacancy?.budget && c.expectedSalary ? c.expectedSalary > vacancy.budget : false;
                    const salaryDiff = vacancy?.budget && c.expectedSalary ? c.expectedSalary - vacancy.budget : 0;
                    return (
                    <div key={c.id} className="bg-surface-container-lowest rounded-2xl shadow-sm border-l-4 border-secondary overflow-hidden transition-all group">
                      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-sm font-black">{c.name.split(' ').map((n) => n[0]).join('')}</div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{c.name}</p>
                            <p className="text-xs text-on-surface-variant">{c.currentRole} · {c.experience}</p>
                            <div className="flex items-center gap-1.5 mt-0.5" onClick={(e) => e.stopPropagation()}>
                              {editingSalaryId === c.id ? (
                                <div className="flex items-center gap-1">
                                  <DollarSign size={10} className="text-secondary" />
                                  <input
                                    autoFocus
                                    type="text"
                                    inputMode="numeric"
                                    value={editingSalaryValue}
                                    onChange={(e) => setEditingSalaryValue(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveSalary(c.id);
                                      if (e.key === 'Escape') setEditingSalaryId(null);
                                    }}
                                    className="w-20 text-[11px] font-bold bg-surface-container-low rounded px-1.5 py-0.5 border border-secondary/40 focus:outline-none focus:border-secondary"
                                    placeholder="USD/mes"
                                  />
                                  <button onClick={() => handleSaveSalary(c.id)} className="p-0.5 rounded text-secondary hover:bg-secondary/10">
                                    <Check size={12} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <DollarSign size={10} className={overBudget ? 'text-amber-500' : 'text-secondary'} />
                                  <span className={`text-[11px] font-bold ${overBudget ? 'text-amber-600' : 'text-secondary'}`}>
                                    {c.expectedSalary ? fmtSalary(c.expectedSalary) : 'Sin salario'}
                                  </span>
                                  {overBudget && (
                                    <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase rounded border border-amber-400/30">
                                      +{fmtSalary(salaryDiff)} sobre budget
                                    </span>
                                  )}
                                  {!overBudget && vacancy?.budget && c.expectedSalary && (
                                    <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[9px] font-black uppercase rounded">
                                      Dentro del budget
                                    </span>
                                  )}
                                  <button
                                    onClick={() => {
                                      setEditingSalaryId(c.id);
                                      setEditingSalaryValue(c.expectedSalary ? String(c.expectedSalary) : '');
                                    }}
                                    className="p-0.5 rounded text-outline hover:text-secondary hover:bg-secondary/10 transition-all"
                                    title="Editar salario"
                                  >
                                    <Pencil size={10} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-headline font-black text-secondary">{c.matchScore}%</p>
                            <p className="text-[10px] font-bold text-secondary uppercase">Match</p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteCandidate(c.id, e)}
                            disabled={deletingCandidateId === c.id}
                            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                            title="Eliminar candidato"
                          >
                            {deletingCandidateId === c.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                          </button>
                          <ChevronRight className={`text-outline transition-transform ${expandedCandidate === c.id ? 'rotate-90' : ''}`} size={18} />
                        </div>
                      </div>
                      {expandedCandidate === c.id && (
                        <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
                          {overBudget && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-400/30 rounded-xl">
                              <AlertTriangle className="text-amber-500 flex-shrink-0" size={14} />
                              <p className="text-xs text-amber-700">
                                El salario esperado de <strong>{fmtSalary(c.expectedSalary!)}</strong> supera el budget de la vacante (<strong>{fmtSalary(vacancy!.budget!)}</strong>) por <strong>{fmtSalary(salaryDiff)}</strong>. Considera negociar o ajustar el presupuesto.
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Fortalezas</p>
                              <div className="space-y-1.5">{c.strengths.map((s, i) => (<div key={i} className="flex items-center gap-2 text-xs text-on-surface"><CheckCircle2 className="text-secondary flex-shrink-0" size={12} />{s}</div>))}</div>
                            </div>
                            {c.gaps.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Áreas de mejora</p>
                                <div className="space-y-1.5">{c.gaps.map((g, i) => (<div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant"><AlertTriangle className="text-amber-500 flex-shrink-0" size={12} />{g}</div>))}</div>
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleSelectCandidate(c.id)} className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all">
                            <MessageSquare size={16} />Ir a Entrevista
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Pending — manual review by HR */}
              {pendingCandidates.length > 0 && (
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 ml-1">En Revisión — Requieren Decisión Manual de RH</p>
                  <div className="space-y-3">
                    {pendingCandidates.map((c) => (
                      <div key={c.id} className="bg-amber-50/60 rounded-2xl shadow-sm border-l-4 border-amber-400 overflow-hidden">
                        <div className="p-5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-black">{c.name.split(' ').map((n) => n[0]).join('')}</div>
                            <div>
                              <p className="text-sm font-bold text-on-surface">{c.name}</p>
                              <p className="text-xs text-on-surface-variant">{c.currentRole} · {c.experience}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-300">
                                  <BarChart3 size={10} />{c.matchScore}% match — Borderline
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleApproveCandidateStatus(c.id, 'approved')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-all"
                            >
                              <UserCheck size={14} />Aprobar
                            </button>
                            <button
                              onClick={() => handleApproveCandidateStatus(c.id, 'rejected')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-error/10 text-error text-xs font-bold rounded-xl border border-error/30 hover:bg-error/20 transition-all"
                            >
                              <UserX size={14} />Rechazar
                            </button>
                          </div>
                        </div>
                        {c.feedback && (
                          <div className="px-5 pb-4 pt-0">
                            <p className="text-xs text-on-surface-variant italic border-t border-amber-200 pt-3">{c.feedback}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-error mb-3 ml-1">Candidatos Rechazados — Feedback de IA</p>
                {transferError && (
                  <div className="flex items-start gap-2 mb-3 px-4 py-3 bg-error/10 text-error rounded-xl text-xs font-semibold border border-error/20">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span>{transferError}</span>
                    <button onClick={() => setTransferError(null)} className="ml-auto"><X size={12} /></button>
                  </div>
                )}
                {rejectedCandidates.length === 0 && (
                  <div className="p-6 border border-dashed border-outline-variant/30 rounded-xl text-center">
                    <p className="text-xs text-on-surface-variant">Ningún candidato fue descartado — todos pasaron el umbral de aprobación automática.</p>
                  </div>
                )}
                <div className="space-y-3">
                  {rejectedCandidates.map((c) => {
                    const isTransferred = transferredCandidates.has(c.id);
                    return (
                    <div key={c.id} className={`bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden group ${isTransferred ? 'border-l-4 border-blue-400' : 'border-l-4 border-error/40'}`}>
                      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black ${isTransferred ? 'bg-blue-100 text-blue-700' : 'bg-error-container text-on-error-container'}`}>
                            {c.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-bold text-on-surface">{c.name}</p>
                              {c.crossMatchVacancy && !isTransferred && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded-full border border-blue-500/20">
                                  <Shuffle size={10} />Fit: {c.crossMatchVacancy} · {c.crossMatchScore}%
                                </span>
                              )}
                              {isTransferred && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/15 text-blue-700 text-[10px] font-black rounded-full border border-blue-500/30">
                                  <CheckCircle2 size={10} />Transferido → {c.crossMatchVacancy}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant">{c.currentRole} · {c.experience}</p>
                            <div className="flex items-center gap-1.5 mt-0.5" onClick={(e) => e.stopPropagation()}>
                              {editingSalaryId === c.id ? (
                                <div className="flex items-center gap-1">
                                  <DollarSign size={10} className="text-outline" />
                                  <input
                                    autoFocus
                                    type="text"
                                    inputMode="numeric"
                                    value={editingSalaryValue}
                                    onChange={(e) => setEditingSalaryValue(e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveSalary(c.id);
                                      if (e.key === 'Escape') setEditingSalaryId(null);
                                    }}
                                    className="w-20 text-[11px] font-bold bg-surface-container-low rounded px-1.5 py-0.5 border border-outline/40 focus:outline-none focus:border-outline"
                                    placeholder="USD/mes"
                                  />
                                  <button onClick={() => handleSaveSalary(c.id)} className="p-0.5 rounded text-outline hover:bg-outline/10">
                                    <Check size={12} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <DollarSign size={10} className="text-outline" />
                                  <span className="text-[11px] font-bold text-outline">
                                    {c.expectedSalary ? fmtSalary(c.expectedSalary) : 'Sin salario'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingSalaryId(c.id);
                                      setEditingSalaryValue(c.expectedSalary ? String(c.expectedSalary) : '');
                                    }}
                                    className="p-0.5 rounded text-outline hover:text-on-surface-variant hover:bg-surface-container-high transition-all"
                                    title="Editar salario"
                                  >
                                    <Pencil size={10} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className={`text-2xl font-headline font-black ${isTransferred ? 'text-blue-600' : 'text-error'}`}>{c.matchScore}%</p>
                            <p className={`text-[10px] font-bold uppercase ${isTransferred ? 'text-blue-500' : 'text-error'}`}>No match</p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteCandidate(c.id, e)}
                            disabled={deletingCandidateId === c.id}
                            className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all opacity-0 group-hover:opacity-100"
                            title="Eliminar candidato"
                          >
                            {deletingCandidateId === c.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                          </button>
                          <ChevronRight className={`text-outline transition-transform ${expandedCandidate === c.id ? 'rotate-90' : ''}`} size={18} />
                        </div>
                      </div>
                      {expandedCandidate === c.id && (
                        <div className="px-5 pb-5 pt-0 border-t border-outline-variant/10">
                          {c.crossMatchVacancy && (
                            <div className={`mt-4 p-4 rounded-xl border ${isTransferred ? 'bg-blue-500/5 border-blue-400/40' : 'bg-blue-500/5 border-blue-500/20'}`}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <Shuffle className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                                  <div>
                                    <p className="text-xs font-bold text-blue-700 mb-0.5">
                                      {isTransferred ? `Transferido a: ${c.crossMatchVacancy}` : `Cross-match detectado por IA`}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                      {isTransferred
                                        ? `El candidato fue agregado al pool de screening de ${c.crossMatchVacancy}.`
                                        : `Este candidato podría encajar en la posición de `}
                                      {!isTransferred && <strong>{c.crossMatchVacancy}</strong>}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {/* Cross-match score ring */}
                                  <div className="flex flex-col items-center">
                                    <div className="relative w-14 h-14">
                                      <svg className="w-full h-full transform -rotate-90">
                                        <circle className="text-blue-100" cx="28" cy="28" fill="transparent" r="22" stroke="currentColor" strokeWidth="5" />
                                        <circle
                                          className="text-blue-500"
                                          cx="28" cy="28" fill="transparent" r="22"
                                          stroke="currentColor"
                                          strokeDasharray="138"
                                          strokeDashoffset={138 - (138 * (c.crossMatchScore ?? 0)) / 100}
                                          strokeWidth="5"
                                          strokeLinecap="round"
                                        />
                                      </svg>
                                      <span className="absolute inset-0 flex items-center justify-center font-headline font-black text-sm text-blue-600">
                                        {c.crossMatchScore}%
                                      </span>
                                    </div>
                                    <p className="text-[9px] font-bold text-blue-500 uppercase mt-0.5">Match</p>
                                  </div>
                                  {/* Transfer button */}
                                  {!isTransferred ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTransferCandidate(c);
                                      }}
                                      disabled={transferringCandidateId === c.id}
                                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 disabled:opacity-60"
                                    >
                                      {transferringCandidateId === c.id
                                        ? <><Loader2 className="animate-spin" size={13} />Transfiriendo...</>
                                        : <><Send size={13} />Transferir al pool</>}
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider rounded-xl">
                                      <CheckCircle2 size={13} />Transferido ✓
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="mt-4 mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Gaps Identificados</p>
                            <div className="flex flex-wrap gap-2">
                              {c.gaps.map((gap, gi) => (<span key={gi} className="flex items-center gap-1 px-3 py-1.5 bg-error/5 text-error text-[11px] font-bold rounded-lg border border-error/20"><AlertTriangle size={12} />{gap}</span>))}
                            </div>
                          </div>
                          <div className="p-4 bg-surface-container-low rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Feedback para el candidato (generado por IA)</p>
                            <p className="text-sm text-on-surface leading-relaxed">{c.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* STEP 4: INTERVIEW */}
      {currentStep === 'interview' && activeRole === 'hr' && (
        <section>
          {/* Candidate selector */}
          <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="text-secondary" size={18} />
              <p className="text-xs font-black uppercase tracking-widest text-outline">Candidato seleccionado</p>
            </div>
            <div className="flex gap-3">
              {approvedCandidates.map((c) => (
                <button key={c.id} onClick={() => { if (selectedCandidate !== c.id) handleSelectCandidate(c.id); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${selectedCandidate === c.id ? 'bg-secondary text-white shadow-md' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${selectedCandidate === c.id ? 'bg-white/20 text-white' : 'bg-secondary-container text-on-secondary-container'}`}>
                    {c.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">{c.name}</p>
                    <p className={`text-[10px] ${selectedCandidate === c.id ? 'text-white/70' : 'text-outline'}`}>
                      CV: {c.matchScore}%
                      {c.expectedSalary ? ` · ${fmtSalary(c.expectedSalary)}` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {interviewCandidate && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><MessageSquare className="text-white" size={20} /></div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Entrevista: {interviewCandidate.name}</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-on-surface-variant">{interviewCandidate.currentRole} · CV Score: {interviewCandidate.matchScore}%</p>
                    {interviewCandidate.expectedSalary && (() => {
                      const ob = vacancy?.budget && interviewCandidate.expectedSalary > vacancy.budget;
                      return (
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${ob ? 'bg-amber-500/10 text-amber-600 border border-amber-400/30' : 'bg-secondary/10 text-secondary'}`}>
                          <DollarSign size={11} />{fmtSalary(interviewCandidate.expectedSalary)}
                          {ob && <span className="ml-1 text-[10px]">↑ sobre budget</span>}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Question set: generate CTA or summary + list */}
              {questions.length === 0 && !mockMode ? (
                <div className="flex flex-col items-center gap-5 py-12 px-6 bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-sm mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #04A28F22, #0057F022)' }}>
                    <ClipboardList className="text-primary-container" size={28} />
                  </div>
                  <div className="text-center">
                    <p className="font-headline text-lg font-bold text-on-surface mb-1">Preguntas de entrevista RH</p>
                    <p className="text-sm text-on-surface-variant max-w-sm">
                      Genera el set personalizado de preguntas para <strong>{interviewCandidate.name}</strong> basado en su CV y la descripción del puesto.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateInterviewQuestions}
                    disabled={isGeneratingQuestions}
                    className="flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-lg hover:opacity-90 transition-all disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #04A28F 0%, #0057F0 100%)' }}
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Generando preguntas con IA…
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generar preguntas con IA
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-outline">Actitud & cultura · Preguntas personalizadas para el candidato</p>
                </div>
              ) : questions.length > 0 && (
                <>
                  <div className="flex items-center gap-4 mb-6 px-1">
                    <div className="flex items-center gap-1.5">
                      <ClipboardList className="text-outline" size={13} />
                      <p className="text-[11px] text-outline font-bold uppercase tracking-widest">
                        {questions.filter((q) => q.questionType === 'base' || q.id.startsWith('b_')).length} actitud & cultura
                      </p>
                    </div>
                    <span className="text-outline">+</span>
                    <div className="flex items-center gap-1.5">
                      <Shuffle className="text-teal-500" size={13} />
                      <p className="text-[11px] text-teal-600 font-bold uppercase tracking-widest">
                        {questions.filter((q) => q.questionType === 'personalized' || (!q.id.startsWith('b_') && q.questionType !== 'base')).length} personalizadas para {interviewCandidate.name}
                      </p>
                    </div>
                    <span className="text-outline">=</span>
                    <p className="text-[11px] font-black text-on-surface uppercase tracking-widest">{questions.length} preguntas RH</p>
                  </div>
                </>
              )}

              <div className="space-y-4">
                {questions.map((q, i) => {
                  const isBase = q.questionType === 'base' || q.id.startsWith('b_');
                  return (
                    <div key={q.id} className={`p-6 rounded-2xl shadow-sm ${isBase ? 'bg-teal-50/40 border border-teal-200/40' : 'bg-surface-container-lowest'}`}>
                      <div className="flex items-start gap-4">
                        <span className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-lg flex-shrink-0 ${isBase ? 'bg-brand-teal' : 'bg-primary-container'}`}>Q{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] text-outline uppercase font-bold">{q.category}</p>
                            {isBase ? (
                              <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[9px] font-black uppercase rounded">Actitud & Cultura</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-surface-container-high text-outline text-[9px] font-black uppercase rounded">Personalizada</span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-on-surface mb-1">{q.question}</p>
                          {q.tailoredFor && (
                            <div className="flex items-center gap-1.5 mb-3">
                              <Shuffle className="text-blue-500 flex-shrink-0" size={11} />
                              <p className="text-[11px] text-blue-600 italic">{q.tailoredFor}</p>
                            </div>
                          )}
                          {!q.tailoredFor && <div className="mb-3" />}
                          <textarea value={q.candidateAnswer} onChange={(e) => handleCandidateAnswer(q.id, e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none" placeholder="Escribe la respuesta del candidato..." rows={3} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {questions.length > 0 && (
                <div className="flex justify-center mt-8">
                  <button onClick={handleEvaluate} disabled={!answeredAll || isEvaluating} className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${answeredAll && !isEvaluating ? 'bg-secondary text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}>
                    {isEvaluating ? (<><Loader2 className="animate-spin" size={20} />Evaluando con IA...</>) : (<><BarChart3 size={20} />Evaluar Match con IA</>)}
                  </button>
                </div>
              )}

              {/* Match result */}
              {matchScore !== null && (
                <div className="mt-8 space-y-4">
                  <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg">
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
                          <p className="text-xs text-on-surface-variant mb-1">CV Score: {interviewCandidate.matchScore}% → Entrevista RH: {matchScore}%</p>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {matchScore >= 80 ? 'Excelente candidato. Altamente compatible.' : matchScore >= 60 ? 'Buen candidato con áreas de desarrollo.' : 'Necesita desarrollo significativo en áreas clave.'}
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

                  {/* HR Decision */}
                  {hrDecision === 'none' && (
                    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Decisión de RH — ¿Continúa el proceso?</p>
                      <div className="flex gap-4">
                        <button onClick={() => handleHrDecision('continue')} className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all shadow-lg cursor-pointer">
                          <CheckCircle2 size={20} />
                          Continuar → Hiring Manager
                        </button>
                        <button onClick={() => handleHrDecision('reject')} className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-error/10 text-error border border-error/30 hover:bg-error/20 transition-all cursor-pointer">
                          <UserX size={20} />
                          Descartar Candidato
                        </button>
                      </div>
                    </div>
                  )}

                  {hrDecision === 'continue' && (() => {
                    const hmDecision = interviewCandidate?.hmDecision;
                    const hmScore = interviewCandidate?.hmScore;
                    const hmFeedback = interviewCandidate?.hmFeedback;
                    const vacancy = vacancies.find((v) => v.id === selectedVacancy);

                    if (!hmDecision) {
                      return (
                        <div className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                          <Clock className="text-amber-500 flex-shrink-0 animate-pulse" size={24} />
                          <div>
                            <p className="text-sm font-bold text-amber-700">Aprobado por RH — Esperando evaluación técnica del Hiring Manager</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">El Hiring Manager recibirá las preguntas técnicas avanzadas para completar la evaluación.</p>
                          </div>
                        </div>
                      );
                    }

                    if (hmDecision === 'rejected') {
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-5 bg-error/10 border border-error/20 rounded-2xl">
                            <ThumbsDown className="text-error flex-shrink-0" size={24} />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-error">Hiring Manager descartó al candidato</p>
                              {hmScore !== undefined && <p className="text-xs text-on-surface-variant mt-0.5">Score técnico HM: <strong>{hmScore}%</strong></p>}
                              {hmFeedback && <p className="text-xs text-on-surface-variant mt-1 italic">"{hmFeedback}"</p>}
                            </div>
                          </div>
                          <button
                            onClick={() => { setRejectModalCandidate(interviewCandidate!); setRejectModalOpen(true); }}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-error/10 text-error border border-error/30 hover:bg-error/20 transition-all"
                          >
                            <Mail size={18} />
                            Enviar correo de rechazo con feedback
                          </button>
                        </div>
                      );
                    }

                    // hmDecision === 'accepted'
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-5 bg-secondary/10 border border-secondary/20 rounded-2xl">
                          <Trophy className="text-secondary flex-shrink-0" size={24} />
                          <div className="flex-1">
                            <p className="text-sm font-bold text-secondary">Hiring Manager aprobó al candidato ✓</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-on-surface-variant">Score RH: <strong>{matchScore ?? interviewCandidate?.matchScore}%</strong></span>
                              <span className="text-outline">·</span>
                              <span className="text-xs text-on-surface-variant">Score Técnico HM: <strong className="text-secondary">{hmScore}%</strong></span>
                            </div>
                            {hmFeedback && <p className="text-xs text-on-surface-variant mt-1 italic">"{hmFeedback}"</p>}
                          </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-outline px-1">Decisión final de RH</p>
                        <div className="flex gap-4">
                          <button
                            onClick={() => setOfferModalOpen(true)}
                            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm shadow-lg transition-all"
                            style={{ background: 'linear-gradient(135deg, #04A28F 0%, #0057F0 100%)', color: '#fff' }}
                          >
                            <PartyPopper size={20} />
                            Hacer oferta laboral
                          </button>
                          <button
                            onClick={() => { setRejectModalCandidate(interviewCandidate!); setRejectModalOpen(true); }}
                            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-high transition-all"
                          >
                            <Mail size={18} />
                            Enviar rechazo a otros candidatos
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {hrDecision === 'reject' && (
                    <div className="flex items-center gap-4 p-5 bg-error/10 border border-error/20 rounded-2xl">
                      <UserX className="text-error flex-shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-bold text-error">Candidato descartado por RH</p>
                        <p className="text-xs text-on-surface-variant">El candidato no avanzará en el proceso. Puedes seleccionar otro candidato aprobado.</p>
                      </div>
                      <button onClick={() => setHrDecision('none')} className="ml-auto px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-all">Cambiar decisión</button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* HANDOFF BANNER — shown after HR approves, process moves to HM */}
      {currentStep === 'interview' && hrDecision === 'continue' && interviewCandidate && (
        <div className="mt-8 p-6 bg-secondary/10 border border-secondary/30 rounded-2xl flex items-center gap-5">
          <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
            <Briefcase className="text-white" size={22} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-on-surface">
              {interviewCandidate.name} fue enviado al Hiring Manager para entrevista técnica
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              RH Score: <strong>{matchScore}%</strong> · CV Match: <strong>{interviewCandidate.matchScore}%</strong> · El HM recibirá las preguntas técnicas personalizadas para su entrevista.
            </p>
          </div>
          <span className="px-3 py-1.5 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full flex-shrink-0">
            En manos del HM
          </span>
        </div>
      )}

      {/* ── PAGE NAVIGATION (HR only) ── */}
      {activeRole === 'hr' && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-outline-variant/20">
          <div>
            {currentStepIndex > 0 && (
              <button onClick={() => setCurrentStep(HR_STEPS[currentStepIndex - 1].key)} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-all">
                <ChevronLeft size={18} />{HR_STEPS[currentStepIndex - 1].label}
              </button>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {generateError && (
              <div className="flex items-start gap-2 px-4 py-3 bg-error/10 text-error rounded-xl text-xs font-semibold max-w-xs text-right">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>{generateError}</span>
              </div>
            )}
            {currentStep === 'input' && !generated && (
              <button onClick={handleGenerate} disabled={!canGenerate || isGenerating} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${canGenerate && !isGenerating ? 'bg-primary-container text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}>
                {isGenerating ? (<><Loader2 className="animate-spin" size={18} />Procesando...</>) : (<><Sparkles size={18} />Generar con IA</>)}
              </button>
            )}
            {currentStep === 'input' && generated && (
              <button onClick={() => setCurrentStep('generated')} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all">
                Siguiente<ChevronRight size={18} />
              </button>
            )}
            {currentStep === 'generated' && (
              <button onClick={() => { if (cvCandidates.length === 0) setCvCandidates(MOCK_CV_CANDIDATES); setCurrentStep('screening'); }} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all">
                Screening CVs<ChevronRight size={18} />
              </button>
            )}
            {currentStep === 'screening' && approvedCandidates.length > 0 && (
              <button onClick={() => { if (!selectedCandidate) handleSelectCandidate(approvedCandidates[0].id); else setCurrentStep('interview'); }} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all">
                Entrevista RH<ChevronRight size={18} />
              </button>
            )}
            {/* Once approved, no next step for RH — process moves to HM */}
          </div>
        </div>
      )}

      {/* ── OFFER LETTER MODAL ── */}
      {offerModalOpen && interviewCandidate && (() => {
        const vacancy = vacancies.find((v) => v.id === selectedVacancy);
        const salaryStr = interviewCandidate.expectedSalary
          ? `$${interviewCandidate.expectedSalary.toLocaleString('es-CO')} COP`
          : 'A convenir';
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #04A28F, #0057F0)' }}>
                    <PartyPopper className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-bold text-on-surface">Carta de Oferta Laboral</h2>
                    <p className="text-xs text-on-surface-variant">Vista previa — para envío oficial</p>
                  </div>
                </div>
                <button onClick={() => setOfferModalOpen(false)} className="p-2 rounded-xl hover:bg-surface-container-low transition-all">
                  <X size={20} className="text-on-surface-variant" />
                </button>
              </div>

              {/* Letter content */}
              {offerSent ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="text-secondary" size={40} />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">¡Oferta enviada!</h3>
                  <p className="text-sm text-on-surface-variant mb-6">La vacante se marcó como completada. Se notificó a {interviewCandidate.name} con la oferta laboral.</p>
                  <button onClick={() => { setOfferModalOpen(false); setOfferSent(false); }} className="px-8 py-3 rounded-xl font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all">
                    Cerrar
                  </button>
                </div>
              ) : (
                <div className="p-8 space-y-6">
                  <div className="bg-surface-container-low rounded-2xl p-6 font-mono text-sm text-on-surface leading-relaxed space-y-4 border border-outline-variant/20">
                    <p className="text-right text-xs text-on-surface-variant">{new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold text-on-surface">Estimado/a {interviewCandidate.name},</p>
                    <p>Nos complace comunicarle que, tras un riguroso proceso de selección, ha sido seleccionado/a para ocupar el puesto de <strong>{vacancy?.title ?? 'Profesional'}</strong> en el equipo de <strong>{vacancy?.team ?? 'nuestra organización'}</strong>.</p>
                    <p>A continuación, los detalles de la oferta:</p>
                    <div className="bg-surface-container-lowest rounded-xl p-4 space-y-2 border border-outline-variant/20">
                      <div className="flex justify-between"><span className="text-on-surface-variant">Puesto:</span><strong>{vacancy?.title}</strong></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Equipo:</span><strong>{vacancy?.team}</strong></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Compensación:</span><strong>{salaryStr}</strong></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Modalidad:</span><strong>Por confirmar</strong></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Inicio estimado:</span><strong>A convenir</strong></div>
                    </div>
                    <p>Le solicitamos confirmar su aceptación dentro de los próximos <strong>5 días hábiles</strong>. En caso de tener dudas o requerir información adicional, no dude en contactarnos.</p>
                    <p>Estamos emocionados de que se una a nuestro equipo y confiamos en que su perfil aportará un gran valor a la organización.</p>
                    <p className="mt-4">Atentamente,</p>
                    <p className="font-bold">Equipo de Recursos Humanos<br /><span className="text-on-surface-variant font-normal">Talent Aiquisition · powered by miCoach</span></p>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setOfferModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-all">
                      Cancelar
                    </button>
                    <button
                      onClick={handleMakeOffer}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg hover:opacity-90 transition-all"
                      style={{ background: 'linear-gradient(135deg, #04A28F 0%, #0057F0 100%)' }}
                    >
                      <Send size={16} />
                      Confirmar y enviar oferta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── REJECTION EMAIL MODAL ── */}
      {rejectModalOpen && rejectModalCandidate && (() => {
        const vacancy = vacancies.find((v) => v.id === selectedVacancy);
        const hmFeedback = rejectModalCandidate.hmFeedback ?? rejectModalCandidate.feedback ?? '';
        const emailBody = `Estimado/a ${rejectModalCandidate.name},\n\nAgradecemos sinceramente su interés en la posición de ${vacancy?.title ?? 'la vacante'} en el equipo de ${vacancy?.team ?? 'nuestra organización'}, así como el tiempo y dedicación invertidos a lo largo de nuestro proceso de selección.\n\nLuego de una evaluación exhaustiva de todos los candidatos, hemos tomado la difícil decisión de continuar con otro perfil cuyas competencias se alinean de manera más cercana con los requerimientos del rol en este momento.\n\n${hmFeedback ? `Feedback de nuestro equipo técnico:\n"${hmFeedback}"\n\n` : ''}Le animamos a seguir desarrollando su perfil profesional. Su postulación ha sido valorada y quedará en nuestros registros para futuras oportunidades.\n\nLe deseamos mucho éxito en su búsqueda laboral y en sus próximos proyectos.\n\nAtentamente,\nEquipo de Recursos Humanos\nTalent Aiquisition · powered by miCoach`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface-container-lowest rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                    <Mail className="text-error" size={20} />
                  </div>
                  <div>
                    <h2 className="font-headline text-xl font-bold text-on-surface">Correo de Rechazo</h2>
                    <p className="text-xs text-on-surface-variant">Para: {rejectModalCandidate.name}</p>
                  </div>
                </div>
                <button onClick={() => { setRejectModalOpen(false); setCopiedEmail(false); }} className="p-2 rounded-xl hover:bg-surface-container-low transition-all">
                  <X size={20} className="text-on-surface-variant" />
                </button>
              </div>

              <div className="p-8 space-y-5">
                {/* Feedback from HM badge */}
                {hmFeedback && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-0.5">Feedback técnico del Hiring Manager incluido</p>
                      <p className="text-xs text-amber-800 italic">"{hmFeedback}"</p>
                    </div>
                  </div>
                )}

                {/* Email body */}
                <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/20">
                  <pre className="whitespace-pre-wrap text-sm text-on-surface leading-relaxed font-sans">{emailBody}</pre>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(emailBody).then(() => {
                        setCopiedEmail(true);
                        setTimeout(() => setCopiedEmail(false), 2000);
                      });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-outline-variant/30 hover:bg-surface-container-low transition-all"
                  >
                    {copiedEmail ? <><Check size={16} className="text-secondary" />Copiado</> : <><Copy size={16} />Copiar texto</>}
                  </button>
                  <button
                    onClick={() => { setRejectModalOpen(false); setCopiedEmail(false); }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-error text-white hover:opacity-90 transition-all shadow-lg"
                  >
                    <Send size={16} />
                    Marcar como enviado
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

