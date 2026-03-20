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
  ChevronLeft,
  UserCheck,
  UserX,
  TrendingUp,
  ArrowLeft,
  Briefcase,
  Clock,
  Shuffle,
  DollarSign,
} from 'lucide-react';
import { UserRole, InterviewQuestion, UploadedFile, CvCandidate, Vacancy } from '../types';

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
  `$${n.toLocaleString('en-US')} USD/mo`;

const VACANCY_STATUS_CONFIG: Record<Vacancy['status'], { label: string; color: string; bg: string }> = {
  draft: { label: 'Draft', color: 'text-outline', bg: 'bg-surface-container-high' },
  generated: { label: 'JD Generated', color: 'text-primary-container', bg: 'bg-primary-container/10' },
  screening: { label: 'Screening CVs', color: 'text-amber-600', bg: 'bg-amber-500/10' },
  interviewing: { label: 'Interviews', color: 'text-secondary', bg: 'bg-secondary/10' },
  completed: { label: 'Completed', color: 'text-secondary', bg: 'bg-secondary/10' },
};

// ── MOCK DATA ──

// Base template shown in "JD Generated" step (generic, pre-candidate)
const MOCK_BASE_QUESTIONS: InterviewQuestion[] = [
  { id: '1', category: 'Technical Architecture', question: 'How would you design a queue system to process 10M events per second?', expectedAnswer: 'Should mention message brokers (Kafka/RabbitMQ), partitioning, backpressure, idempotency, and retry strategies with dead-letter queues.', candidateAnswer: '' },
  { id: '2', category: 'Problem Solving', question: 'Describe a situation where you had to refactor a critical legacy system. What strategy did you use?', expectedAnswer: 'Look for mention of strangler fig pattern, feature flags, exhaustive regression tests, gradual migration, and stakeholder communication.', candidateAnswer: '' },
  { id: '3', category: 'Team Collaboration', question: 'How do you handle technical disagreements with other senior engineers on the team?', expectedAnswer: 'Evidence of data-driven debate, prototypes/POCs to validate ideas, ability to concede when there is better evidence, and documentation of decisions (ADRs).', candidateAnswer: '' },
  { id: '4', category: 'DevOps & Infrastructure', question: 'What CI/CD strategy would you implement for a team of 15 developers?', expectedAnswer: 'Trunk-based development or GitFlow depending on context, pipelines with stages (lint, test, build, deploy), staging environments, canary/blue-green deployments.', candidateAnswer: '' },
];

// Which base question IDs to exclude per candidate (because personalized questions already cover that topic)
const EXCLUDED_BASE_BY_CANDIDATE: Record<string, string[]> = {
  cv1: ['1', '4'], // Exclude "Technical Architecture" (covered by Distributed Systems Depth) and "DevOps" (covered by Infrastructure Optimization)
  cv2: ['4'],      // Exclude "DevOps & Infrastructure" (covered by Infrastructure as Code / Terraform)
  cv3: ['2', '3'], // Exclude "Problem Solving / legacy" (covered by Event Sourcing Depth) and "Team Collaboration" (covered by Leadership Without Title)
};

// Mock answers for the base questions (used in mock mode)
const MOCK_BASE_ANSWERS: Record<string, string> = {
  '1': 'I would implement Kafka as a message broker with partitioning by tenant ID, using consumer groups to scale horizontally. I would apply backpressure with rate limiting and have dead-letter queues for failed messages with exponential retry.',
  '2': 'At my previous company I migrated a payment monolith using the strangler fig pattern. I started with the lowest-risk routes, used feature flags for safe rollback, and kept both systems running in parallel for 3 months with automated regression tests.',
  '3': 'I prefer proposing a quick POC when there is a technical disagreement. At my previous team we documented decisions in ADRs and voted based on performance and maintainability data, not opinions.',
  '4': 'I would implement trunk-based development with feature flags, CI pipelines with parallel lint/test/build, automatic deploy to staging, and canary releases to production with automatic rollback if metrics drop.',
};

// Personalized questions per candidate — generated by matching JD vs CV
const MOCK_PERSONALIZED_QUESTIONS: Record<string, InterviewQuestion[]> = {
  cv1: [
    {
      id: '1', category: 'Leadership at Scale',
      question: 'At MercadoLibre you led teams of 6+ people. How did you structure code reviews to maintain quality without becoming a bottleneck?',
      expectedAnswer: 'Asynchronous process with review SLAs, ownership by technical area, automated checklist (linters, tests), and constructive feedback culture. May mention pair programming for knowledge transfer.',
      candidateAnswer: '',
      tailoredFor: 'Technical leadership confirmed in CV — the role requires leading a team of 8',
    },
    {
      id: '2', category: 'Distributed Systems Depth',
      question: 'Given your experience handling Kafka at scale, describe how you would ensure eventual consistency in a system with multiple consumers processing payments from the same topic.',
      expectedAnswer: 'Consumer idempotency, exactly-once semantics or at-least-once with duplicate handling, sagas for distributed transactions, and compensating transactions.',
      candidateAnswer: '',
      tailoredFor: 'Kafka and event-driven listed as a key strength — validate actual depth',
    },
    {
      id: '3', category: 'Technical Decision Making',
      question: 'What was the most controversial architectural decision you made on your team? How did you convince stakeholders and what was the outcome?',
      expectedAnswer: 'Structured process: data-driven, prototype/POC, documented trade-off analysis (ADR), presentation to stakeholders with explicit risks. Measurable outcome.',
      candidateAnswer: '',
      tailoredFor: 'High technical match — explore organizational influence capability',
    },
    {
      id: '4', category: 'Infrastructure Optimization',
      question: 'What was the most complex Kubernetes challenge you solved on GCP? How did you optimize costs without sacrificing SLOs?',
      expectedAnswer: 'Node autoscaling, spot/preemptible nodes, well-calibrated resource requests/limits, VPA/HPA, namespace quotas, and granular cost monitoring per service.',
      candidateAnswer: '',
      tailoredFor: 'Kubernetes at scale is a CV strength — the role requires collaborating with SRE on costs',
    },
  ],
  cv2: [
    {
      id: '1', category: 'PostgreSQL Deep Dive',
      question: 'With your PostgreSQL sharding experience at Rappi, how would you migrate a 500GB database without downtime? What rollback strategy would you have?',
      expectedAnswer: 'Blue-green for database, logical replication for hot sync, idempotent migration scripts, feature flags to switch write path, replication lag monitoring.',
      candidateAnswer: '',
      tailoredFor: 'Advanced PostgreSQL and sharding is their main strength according to CV',
    },
    {
      id: '2', category: 'Infrastructure as Code',
      question: 'We see that your Terraform experience is limited. Our team uses it heavily with GCP. What is your current level and how do you plan to close that gap?',
      expectedAnswer: 'Honesty about current level, concrete learning plan, mention experience with similar tools (Pulumi, CDK, Bash/Python scripts), and willingness to pair with the SRE team.',
      candidateAnswer: '',
      tailoredFor: 'Gap identified in screening: limited Terraform experience — critical team skill',
    },
    {
      id: '3', category: 'API Design & gRPC',
      question: 'As Backend Lead at Rappi handling high traffic, how did you design gRPC contracts between services and how did you manage breaking changes without affecting consumers?',
      expectedAnswer: 'Buf for .proto linting, package versioning, backward compatibility as a rule, deprecation notices, consumer-driven contract testing, and coordinated rolling upgrades.',
      candidateAnswer: '',
      tailoredFor: 'gRPC and protobuf listed as a strength — validate API versioning management at scale',
    },
    {
      id: '4', category: 'Mentorship & Growth',
      question: 'You describe junior mentorship as a strength. How would you structure a development plan for a junior developer who wants to specialize in distributed systems over the next 6 months?',
      expectedAnswer: 'Plan with SMART objectives, recommended readings (DDIA, etc.), progressive projects with limited scope, weekly pair programming, progress metrics review, and gradual component ownership.',
      candidateAnswer: '',
      tailoredFor: 'The role requires active mentoring of the junior team — the CV mentions it explicitly',
    },
  ],
  cv3: [
    {
      id: '1', category: 'Gap: Orchestration',
      question: 'Your CV shows strong Go and event-driven experience, but we haven\'t seen Kubernetes in production. What is your current level and how quickly could you operate autonomously with K8s?',
      expectedAnswer: 'Honest level (Docker, basic concepts, etc.), gap closure plan, mention of experience with related tools, and examples of rapid adoption of new technologies in the past.',
      candidateAnswer: '',
      tailoredFor: 'Critical gap identified in screening: no direct Kubernetes experience',
    },
    {
      id: '2', category: 'Event Sourcing Depth',
      question: 'With CQRS and Event Sourcing at Nubank, how would you handle rebuilding a read model when there are 10M accumulated events and a new microservice needs to start up?',
      expectedAnswer: 'Periodic snapshots, parallel projections with checkpointing, partitioning by aggregate ID for concurrent processing, and gradual warm-up mechanism to avoid saturating the event store.',
      candidateAnswer: '',
      tailoredFor: 'Event Sourcing and CQRS are their main strength — dig deeper into edge cases',
    },
    {
      id: '3', category: 'Leadership Without Title',
      question: 'The role requires formal technical leadership, but your track record doesn\'t show that role. Can you describe situations where you influenced technical decisions on the team or acted as a reference?',
      expectedAnswer: 'Concrete examples of internal RFCs, accepted technical proposals, informal mentoring, presence in design reviews, or cross-team project leadership without hierarchical reporting.',
      candidateAnswer: '',
      tailoredFor: 'Gap identified: no formal leadership — role requires technical team leadership',
    },
    {
      id: '4', category: 'Testing Strategy',
      question: 'Your strong testing culture is a valuable asset. How would you approach a testing strategy for Go microservices with external dependencies like Kafka, Redis, and PostgreSQL?',
      expectedAnswer: 'Unit tests with mocks for external dependencies, integration tests with testcontainers, contract testing for gRPC APIs, chaos testing for resilience, and a CI pipeline that fails fast.',
      candidateAnswer: '',
      tailoredFor: 'Strong testing is a key strength — validate application to distributed architectures',
    },
  ],
};

// Mock answers per candidate for mock mode (candidateId → questionId → answer)
const MOCK_PERSONALIZED_ANSWERS: Record<string, Record<string, string>> = {
  cv1: {
    '1': 'At MercadoLibre we established an asynchronous review process with a 24-hour SLA. We divided ownership by technical domain so reviews were among area experts, not just me. We used Danger for automated checks and an architecture checklist for critical PRs.',
    '2': 'We used Kafka with partitioning by merchant ID and idempotent consumers that checked Redis to see if the event had already been processed. For payment transactions we implemented the saga pattern with compensating transactions and a nightly reconciliation service.',
    '3': 'I proposed migrating from REST to gRPC for internal services. I created a complete ADR with benchmarks, a POC on the lowest-risk service, and an executive presentation showing a 40% latency reduction. The CTO approved it and we rolled it out in 4 sprints.',
    '4': 'We implemented cluster autoscaler with separate node pools for critical and non-critical workloads. We used spot instances for batch jobs, calibrated resource requests with VPA, and managed to reduce GKE costs by 35% without touching SLOs.',
  },
  cv2: {
    '1': 'At Rappi we migrated with Flyway and PostgreSQL logical replication. We created the new structure in parallel, synced data in real time, and used a feature flag to switch the write path. The complete cutover was in a 2-minute maintenance window.',
    '2': 'I know the concepts of Terraform and have written basic scripts. My experience is more with programmatic infrastructure in Python and Bash. I commit to completing the HashiCorp certification in the first 3 months and doing pair programming with the SRE team.',
    '3': 'We used Buf Schema Registry to version the .proto files. The rule was to never make breaking changes in the same major version. When we needed incompatible changes, we deprecated the old field for 2 sprints before removing it and used consumer-driven tests.',
    '4': 'With each junior I held an initial session to understand their goals. I assigned them medium-complexity issues with a detailed checklist, we did pair programming on Fridays, and monthly we reviewed progress with concrete metrics: PRs merged, code in production, incidents resolved.',
  },
  cv3: {
    '1': 'My current Kubernetes level is conceptual and lab-based. I have worked with Docker Compose in production and understand the concepts of pods, deployments, and services. At Nubank we used an internal platform on top of K8s. I believe in 4-6 weeks I could be autonomous with SRE team support.',
    '2': 'We used snapshots every 1000 events with compression. For new service warm-up we processed the snapshot first and then incremental events in parallel using goroutines with a worker pool. Startup time went from 45 minutes to 3 minutes.',
    '3': 'I proposed and implemented the migration of the audit system to Event Sourcing. I wrote the RFC, presented the trade-offs to the team, built the prototype, and led the implementation even though I wasn\'t the tech lead. I also informally mentored 2 junior developers for 6 months.',
    '4': 'We use testcontainers to spin up PostgreSQL, Redis, and Kafka in integration tests. For unit tests we mock the interfaces. We have a minimum 80% coverage rule for critical paths and integration tests run in CI with ephemeral Docker environments.',
  },
};

const MOCK_GENERATED_JD = {
  title: 'Senior Backend Engineer',
  summary: 'We are looking for a Senior Backend Engineer to lead the evolution of our high-scale distributed systems. The ideal candidate will architect robust microservices, mentor the junior team, and define the technical roadmap for the core processing engine.',
  skills: ['Go / Rust', 'Kubernetes', 'PostgreSQL', 'gRPC', 'CI/CD', 'System Design'],
  responsibilities: [
    'Design and maintain high-concurrency microservices.',
    'Lead code reviews and establish architectural standards.',
    'Collaborate with SRE to optimize infrastructure costs.',
    'Define and monitor SLOs for critical services.',
  ],
  benefits: [
    '100% remote work with flexible schedule',
    'Major and minor medical insurance',
    'Grocery vouchers and savings fund',
    'Annual training budget ($2,000 USD)',
    '20 vacation days from the first year',
  ],
};

const MOCK_TEAM_SUMMARY = `The team works with Go and gRPC microservices, uses Kubernetes on GCP for orchestration, practices trunk-based development with CI/CD on GitHub Actions. Sprint reviews every 2 weeks with quarterly planning. They need someone to lead the migration to event-driven architecture. Stack: Go, PostgreSQL, Redis, Kafka, Terraform.`;

const MOCK_FILES: UploadedFile[] = [
  { name: 'JD_Senior_Backend_Engineer.pdf', size: '245.3 KB', type: 'pdf' },
  { name: 'Skills_Matrix_Platform_Team.pdf', size: '128.7 KB', type: 'pdf' },
];

const MOCK_BENEFITS = `- 100% remote work with flexible schedule\n- Major and minor medical insurance\n- Grocery vouchers and savings fund\n- Annual training budget ($2,000 USD)\n- 20 vacation days from the first year\n- Quarterly performance bonuses`;

const MOCK_CV_CANDIDATES: CvCandidate[] = [
  { id: 'cv1', name: 'Diana Torres', matchScore: 91, status: 'approved', currentRole: 'Senior Backend Engineer @ MercadoLibre', experience: '7 years in distributed systems', strengths: ['Go and microservices in production', 'Kubernetes at scale', 'Experience with Kafka and event-driven', 'Technical leadership of teams of 6+'], gaps: [], feedback: '', expectedSalary: 5200 },
  { id: 'cv2', name: 'Andrés Salazar', matchScore: 84, status: 'approved', currentRole: 'Backend Lead @ Rappi', experience: '6 years in high-traffic backend', strengths: ['Advanced PostgreSQL and sharding', 'CI/CD with GitHub Actions', 'gRPC and protobuf', 'Junior mentorship'], gaps: ['Limited Terraform experience'], feedback: '', expectedSalary: 4200 },
  { id: 'cv3', name: 'Valentina Rojas', matchScore: 76, status: 'approved', currentRole: 'Software Engineer III @ Nubank', experience: '5 years in fintech with Go', strengths: ['Go in production 4 years', 'Event sourcing and CQRS', 'Strong testing culture'], gaps: ['No direct Kubernetes experience', 'Has not formally led teams'], feedback: '', expectedSalary: 3800 },
  { id: 'cv4', name: 'Roberto Vega', matchScore: 38, status: 'rejected', currentRole: 'PHP Developer @ Agencia Web', experience: '4 years in web development', strengths: ['Good attitude and eagerness to learn', 'Laravel experience'], gaps: ['No distributed systems experience', 'No Kubernetes or container knowledge', 'Experience limited to PHP monoliths'], feedback: 'The candidate has a good attitude and learning capacity, but their technical experience is centered on PHP monoliths and lacks the necessary foundation in distributed systems, container orchestration, and message brokers required by the position.', crossMatchVacancy: 'Frontend Lead', crossMatchScore: 68, expectedSalary: 2500 },
  { id: 'cv5', name: 'Laura Méndez', matchScore: 45, status: 'rejected', currentRole: 'Backend Developer @ Startup', experience: '3 years in backend with Go', strengths: ['Basic Go knowledge', 'PostgreSQL familiarity'], gaps: ['CI/CD limited to manual deploys', 'No experience with event-driven architecture', 'Has not worked at scale'], feedback: 'The candidate demonstrates backend knowledge with Go, but their CI/CD experience is limited to manual scripts and they have not worked with event-driven architectures or at the required scale.', expectedSalary: 2800 },
  { id: 'cv6', name: 'Pedro Castillo', matchScore: 22, status: 'rejected', currentRole: 'Junior Frontend Developer', experience: '1.5 years in frontend with React', strengths: ['Motivation to transition to backend'], gaps: ['No backend experience', 'No Go or systems language knowledge', 'No cloud infrastructure knowledge'], feedback: 'The candidate is a junior frontend developer with no backend or cloud infrastructure experience. The profile does not align with the position requirements.', crossMatchVacancy: 'Frontend Lead', crossMatchScore: 74, expectedSalary: 1800 },
];

const MOCK_CANDIDATE_ANSWERS: Record<string, string> = {
  '1': 'I would implement Kafka as a message broker with partitioning by tenant ID, using consumer groups to scale horizontally. I would apply backpressure with rate limiting and have dead-letter queues for failed messages with exponential retry.',
  '2': 'At my previous company I migrated a payment monolith using the strangler fig pattern. I started with the lowest-risk routes, used feature flags for safe rollback, and kept both systems running in parallel for 3 months with automated regression tests.',
  '3': 'I prefer proposing a quick POC when there is a technical disagreement. At my previous team we documented decisions in ADRs and voted based on performance and maintainability data, not opinions.',
  '4': 'I would implement trunk-based development with feature flags, CI pipelines with parallel lint/test/build, automatic deploy to staging, and canary releases to production with automatic rollback if metrics drop.',
};

// ── HM TECHNICAL INTERVIEW QUESTIONS ──

const MOCK_HM_QUESTIONS: Record<string, InterviewQuestion[]> = {
  cv1: [
    { id: '1', category: 'Incident Response', question: 'Monday 9am. An alert comes in: the payments service is at 95% CPU and p99 went from 200ms to 4 seconds. No recent deploy. Walk me through your first 10 minutes of diagnosis.', expectedAnswer: 'Check Grafana dashboards (goroutines, GC, connection pool), tail logs looking for panics or timeouts, pprof on the pod for flame graph, verify traffic spike on load balancer. Quick decision: rollback or hotfix.', candidateAnswer: '', tailoredFor: 'The team has on-call rotations — we need to know how you react under real pressure' },
    { id: '2', category: 'Go Deep Dive', question: 'We have a Kafka consumer in Go that after 6 hours of operation starts accumulating memory and restarts with OOM every 30 minutes. How would you diagnose and reproduce the problem?', expectedAnswer: 'Expose /debug/pprof, heap profile before/after 30 min, look for linear growth. Goroutine trace to detect leaks. Reproduce locally with same volume + race detector. Suspect: closures capturing references in channels or unterminated goroutines.', candidateAnswer: '', tailoredFor: 'Kafka consumer is a core part of the team stack — validate memory management in Go' },
    { id: '3', category: 'Architecture Debate', question: 'Someone on the team proposes using Redis Streams instead of Kafka for internal events, arguing simplicity. You think it\'s a mistake. How do you handle that conversation?', expectedAnswer: 'Formal ADR, 3-day spike comparing: Kafka has native replay, consumer groups, configurable durable retention. Redis Streams loses ordering under failover and doesn\'t have exactly-once. Propose experiment on non-critical service to decide with data.', candidateAnswer: '', tailoredFor: 'The team makes collective architectural decisions — we want to see how you argue without imposing' },
    { id: '4', category: 'Team Unblock', question: '2 engineers have been blocked for 2 days over a disagreement: one wants GraphQL, the other REST for the new catalog API. Planning is tomorrow. How do you resolve it today?', expectedAnswer: '60-min session with objective technical criteria: latency, development overhead, clients consuming the API, future flexibility. Each defends for 15 min with data. If tied, the tech lead decides and documents. Don\'t let paralysis stall the sprint.', candidateAnswer: '', tailoredFor: 'Role requires technical leadership and team unblocking — real day-to-day situation' },
  ],
  cv2: [
    { id: '1', category: 'PostgreSQL in Production', question: 'A reporting query analyzing orders from the last 90 days takes 12 seconds. EXPLAIN shows a seq scan on a 50M row table. What is your diagnosis and plan without affecting production?', expectedAnswer: 'EXPLAIN ANALYZE to see the real plan. Index on date column if it doesn\'t exist (CREATE INDEX CONCURRENTLY). Check statistics with VACUUM ANALYZE. Verify table bloat. If reporting, consider read replica or pre-aggregated table with scheduled updates.', candidateAnswer: '', tailoredFor: 'Advanced PostgreSQL is their strength — we want to see their real depth in production cases' },
    { id: '2', category: 'CI/CD Optimization', question: 'Our GitHub Actions pipeline takes 28 minutes. The `go test ./...` step takes 18 of those. How do you tackle it? What would you change in the first 2 days?', expectedAnswer: 'Go module cache with cache-from. Separate unit tests (fast, in PR) from integration (scheduled job). Parallelization matrix in GitHub Actions by packages. Identify slow tests with go test -v -json and optimize or extract. Goal: get below 8 minutes.', candidateAnswer: '', tailoredFor: 'CI/CD with GitHub Actions is a CV strength — the current pipeline is a real team pain point' },
    { id: '3', category: 'On-call Reality', question: 'It\'s 2am. The checkout service returns 503 for 30% of requests. SRE escalates to you. What is your mental runbook for the first 5 minutes?', expectedAnswer: '1) Pod health checks 2) Error rate per endpoint in APM 3) Last hour logs (connection refused, timeouts) 4) Recent deploy that may have gone out 5) If DB, active connections and slow queries 6) Circuit breaker if problem is downstream. Communicate in incident channel with updates every 10 min.', candidateAnswer: '', tailoredFor: 'Backend Lead must handle incidents — we want their real mental process under pressure' },
    { id: '4', category: 'Terraform Ramp-up', question: 'Your first week: you need to add a new Cloud Run service with Secret Manager variables to the existing Terraform infrastructure. How do you approach it without prior Terraform experience?', expectedAnswer: '2-hour pair session with an SRE to understand the modular repo structure. Read the documentation for google_cloud_run_service and google_secret_manager_secret_iam_member resources. Clone a similar module and adapt. No pushing without code review from someone on the team for the first 2 weeks.', candidateAnswer: '', tailoredFor: 'Gap: Terraform — the team uses it heavily, we want to see if they can ramp up quickly' },
  ],
  cv3: [
    { id: '1', category: 'Pragmatic Kubernetes', question: 'One of our pods is being evicted frequently during peak hours. The node is at 90% memory. Kubernetes is not your main stack — what is your reasoning process to diagnose it?', expectedAnswer: 'kubectl describe pod to see the eviction reason. kubectl top nodes/pods to see actual consumption vs limits. If the pod doesn\'t have memory limits configured, that would be the first fix. If it does and overflows, check with pprof if there is a memory leak in the process. The debug process is the same regardless of the orchestrator.', candidateAnswer: '', tailoredFor: 'Critical gap: no direct K8s experience — we want to see their reasoning, not memorized knowledge' },
    { id: '2', category: 'Real Event Sourcing', question: 'We have aggregates with 50K events per active account. Rebuilding state takes 8 seconds. Without snapshotting implemented, how do you solve it without a complete rewrite?', expectedAnswer: 'Periodic snapshots: serialize complete state every N events (1000 as initial heuristic) and save with event number as checkpoint. When rebuilding: load last snapshot + process only subsequent events. For existing accounts, lazy migration: snapshot on first access. Metrics to validate improvement.', candidateAnswer: '', tailoredFor: 'Event Sourcing is their key strength — real practical case from the system they will work on' },
    { id: '3', category: 'Code Review Leadership', question: 'You receive a PR of 1200 lines for review that refactors the inventory domain. No new tests. The author is a senior with 4 years at the company. How do you approach the review and the conversation?', expectedAnswer: 'Understand the change at a high level first. The size and lack of tests are red flags regardless of seniority. Structured feedback in the PR (not Slack). Point out that any critical refactor needs regression tests. Offer to pair to write them. If there is pushback, escalate to the tech lead with documented arguments.', candidateAnswer: '', tailoredFor: 'No formal leadership — we want to see how they exercise technical influence with more senior peers' },
    { id: '4', category: 'Cultural Change', question: 'You notice the team has an error swallowing pattern in Go: `if err != nil { _ = err }` in critical services. You are not the tech lead. How would you change that practice?', expectedAnswer: 'Document the pattern with concrete codebase examples and real cases of silent failures. Bring it as a technical item to the retro or next tech sync. Make a model PR in a non-critical service showing the correct pattern with errors caught metrics. Propose a linter rule (errcheck) in the CI pipeline. Change culture with examples, not imposed rules.', candidateAnswer: '', tailoredFor: 'No formal authority — test lateral influence capability and team quality improvement' },
  ],
};

const MOCK_HM_ANSWERS: Record<string, Record<string, string>> = {
  cv1: {
    '1': 'First I open Grafana: check active goroutines, GC pause time, and connection pool exhaustion. Then I tail logs from the last hour looking for panics or connection refused. If nothing obvious, I access the pod with kubectl exec and run pprof for the CPU flame graph. In parallel, I verify if there is an unusual traffic spike on the load balancer or a scheduled job that ran at that time. With that info I decide whether it is rollback or hotfix.',
    '2': 'I suspect a goroutine leak. I expose /debug/pprof on the pod and take a heap profile at minute 1 and another at 30 minutes. If the heap grows linearly there is a leak. I check the goroutine trace to see which ones accumulate. To reproduce locally I use a benchmark with the same message throughput and enable the race detector. The most likely cause: closures in goroutines capturing references to buffers that are not freed.',
    '3': 'I propose a formal ADR with a 3-day spike. The criteria are objective: Kafka has native replay, consumer groups with offset management, durable retention, and exactly-once with idempotency. Redis Streams can simulate this but loses ordering under failover and doesn\'t have guaranteed exactly-once. I propose testing both on the notifications service, which is not critical, and letting the latency and reliability data decide.',
    '4': 'I call them both together that same day for a 60-minute session. I ask each to prepare 15 minutes defending their approach with concrete criteria: expected latency, development overhead, flexibility to evolve. Then the team votes on those criteria. If tied, I decide and document it in an ADR explaining the reasoning. We cannot enter planning without this decision made.',
  },
  cv2: {
    '1': 'With EXPLAIN ANALYZE I identify if the seq scan has a date filter. If the date column doesn\'t have an index, I create one with CREATE INDEX CONCURRENTLY to avoid blocking the table. If the index already exists, I check if statistics are updated with VACUUM ANALYZE. If the query is reporting only, I move it to the read replica. If there is table bloat I verify with pg_stat_user_tables and schedule a VACUUM FULL during a low-traffic window.',
    '2': 'Day 1: enable Go module cache in GitHub Actions with cache-from. Day 2: separate tests into two groups: unit tests that run in each PR (target under 5 min) and integration tests that go to a scheduled job. For Go tests I use go test -v -json | jq to identify the 10 slowest and optimize them. With parallelization matrix I can get unit tests from 18 down to 4-6 minutes.',
    '3': 'First I check the APM dashboard to see which endpoints have the 503 and if there is a temporal correlation. Then last hour logs looking for connection refused or database timeouts. I verify if there was any deploy in the last 4 hours. If the problem seems database-related, I check active connections with SELECT count(*) FROM pg_stat_activity. I communicate in the incident channel every 10 minutes even if I don\'t have a resolution yet.',
    '4': 'I ask someone from SRE for a 2-hour pair session to understand the modular structure of the Terraform repo before touching anything. I read the documentation for google_cloud_run_service and google_secret_manager_secret_iam_member. I clone the Cloud Run module most similar to what I need and adapt only the variables. All my code goes through code review by someone on the team for the first 2 weeks, no exceptions.',
  },
  cv3: {
    '1': 'With kubectl describe pod I see the exact eviction reason and if memory limits are configured. With kubectl top pods I see actual consumption. If there are no limits, that is the first fix: set appropriate requests and limits. If it has them and overflows, the problem is in the Go process: I use pprof to check for memory leaks. The debug process is the same as in any system: observe metrics, narrow down the problem, act from simplest to most complex.',
    '2': 'I implement periodic snapshotting: every 1000 events I serialize the complete aggregate state and save it in a table with the event number as checkpoint. When rebuilding, I load the last snapshot and process only subsequent events. In the worst case I process 999 events instead of 50K. For existing aggregates I do lazy migration: when one is accessed for the first time, I generate the snapshot on-demand. I add metrics to validate the improvement.',
    '3': 'First I understand the PR at a high level before reviewing line by line. The size and lack of tests are red flags that I point out in the review regardless of the author\'s seniority. I leave feedback in the PR constructively: I explain the why, not just the what. I offer to do a pair session to write regression tests together. If there is resistance, I escalate to the tech lead with my documented arguments.',
    '4': 'First I gather concrete codebase examples where error swallowing caused or could have caused a real problem. I bring them as a technical item to the next retro with evidence. I make a model PR in a non-critical service showing the correct pattern, with the appropriate error logger. I propose adding errcheck as a linter rule in the CI pipeline. I don\'t present it as "you\'re doing it wrong", I present it as "this is how we can improve together".',
  },
};

// ── HM DIRECT VIEW MOCK DATA (per vacancy) ──

const HM_GENERATED_JDS: Record<string, { title: string; summary: string; skills: string[]; responsibilities: string[] }> = {
  v2: {
    title: 'Frontend Lead',
    summary: 'We are looking for a Frontend Lead to lead the development of our high-traffic product interfaces. The ideal candidate combines technical excellence in React/TypeScript with product vision and the ability to set frontend standards in a team of 5 engineers.',
    skills: ['React', 'TypeScript', 'GraphQL', 'Design Systems', 'Web Performance', 'Storybook', 'Testing (Vitest/Cypress)'],
    responsibilities: [
      'Design and maintain the Design System and component architecture.',
      'Lead code reviews and establish frontend quality standards.',
      'Collaborate with Design and Product in feature definition.',
      'Optimize interface performance and Core Web Vitals.',
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
  experience: '5 years in cloud infrastructure and reliability engineering',
  cvScore: 82,
  hrScore: 78,
  strengths: ['Kubernetes in production at scale', 'Terraform and GCP expert', 'SLOs and error budgets', 'Led incident response'],
  gaps: ['Limited Go experience specifically', 'No Kafka experience'],
  expectedSalary: 5200,
};

const HM_SRE_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'sre1', category: 'Kubernetes Governance',
    question: 'We have 3 GKE clusters in multi-region with ~200 active pods. This week a deployment without resource limits crashed the production cluster due to an OOM cascade. How would you implement governance to prevent it from happening again?',
    expectedAnswer: 'Admission controller (OPA Gatekeeper or Kyverno) that rejects Deployments without resource requests/limits. LimitRange in each namespace with default values. CI rule that validates manifests with kubeval/conftest before merge. PodDisruptionBudgets for critical services.',
    candidateAnswer: '',
    tailoredFor: 'Real team incident this week — we want to know their systematic approach, not the patch',
  },
  {
    id: 'sre2', category: 'Terraform Drift',
    question: 'Someone did a manual `terraform apply` in production and broke the state. The statefile no longer matches the real infrastructure. There are orphaned resources and some the state doesn\'t know about. What is your process?',
    expectedAnswer: 'terraform plan to see the drift. terraform state list for inventory. terraform state rm for out-of-sync resources + terraform import to re-import them. Never forced apply. Post-mortem on how to prevent manual applies (drift detection job, remote statefile protection, mandatory CI).',
    candidateAnswer: '',
    tailoredFor: 'The team uses Terraform heavily — we need to know how they handle emergency situations in IaC',
  },
  {
    id: 'sre3', category: 'Observability',
    question: 'Our SLOs are configured in Prometheus but the Product team doesn\'t understand them. The Grafana dashboards are unreadable for non-technical people. How would you make observability useful for the entire organization?',
    expectedAnswer: 'Separate dashboards: technical (detailed SLIs, error budget burndown per service) and executive (uptime %, successful requests, latency in business language with green/yellow/red traffic lights). Weekly email alerts with automatic summary. Monthly SLO review with Product.',
    candidateAnswer: '',
    tailoredFor: 'The team has a real problem communicating reliability to Product — we want to see their solution',
  },
  {
    id: 'sre4', category: 'Incident Response',
    question: '3am: the service mesh (Istio) blocked 100% of traffic between the API Gateway and the authentication service. Uptime = 0%. SRE escalates to you. What is your mental runbook for the first 5 minutes?',
    expectedAnswer: 'Rollback the most recent Istio change. If no change, check VirtualService and DestinationRule for the auth service. Verify mTLS certificates (expiration). If it persists, temporary mesh bypass for auth while investigating. Updates in incident channel every 5 min. Never investigate silently during a P0.',
    candidateAnswer: '',
    tailoredFor: 'On-call rotation is part of the role — we need to see their composure and process under extreme pressure',
  },
];

const HM_SRE_ANSWERS: Record<string, string> = {
  sre1: 'I would implement Kyverno as an admission controller because it is simpler to maintain than OPA for this case. The policies reject any Deployment without defined resource requests and limits. I would also add LimitRange in each namespace with reasonable default values as fallback. In the CI pipeline I would add conftest validating manifests against policies before merge, so the error shows up in the PR, not in the cluster.',
  sre2: 'First: terraform plan -detailed-exitcode to see exactly what the drift shows. Second: terraform state list for the complete state inventory. For resources in the infra but not in the state, I terraform import them one by one after identifying them with the GCP API. For those in the state but no longer existing, terraform state rm. I never terraform apply until the plan is clean. After: post-mortem with corrective action to block manual applies via IAM and mandatory CI enforcement.',
  sre3: 'I create two levels of dashboards. The technical dashboard for the infra team: detailed SLIs, error budget burndown per service with Slack alerts when it burns more than 5% per hour. The executive dashboard for Product: three metrics in business language with color traffic lights, last month uptime, and p95 latency expressed as "X out of 100 users had a slow response". And an automatic weekly email on Monday with the previous week\'s reliability summary.',
  sre4: 'First I check the Istio changelog from the last 4 hours. If there was a VirtualService or DestinationRule change, immediate rollback. If no recent change, I verify that the mTLS certificates for the authentication namespace haven\'t expired with istioctl proxy-status. If the problem persists more than 3 minutes and I don\'t have the cause, I do a temporary mesh bypass only for the auth service using an exclusion DestinationRule, restore uptime, and then investigate calmly. Updates in the P0 channel every 5 minutes, even if I have nothing new to report.',
};

// ── HR STEP DEFINITIONS ──

const HR_STEPS = [
  { key: 'input', label: 'JD & Benefits' },
  { key: 'generated', label: 'JD Generated' },
  { key: 'screening', label: 'Screening CVs' },
  { key: 'interview', label: 'HR Interview' },
] as const;

type HrStep = typeof HR_STEPS[number]['key'];

// ── COMPONENT ──

export const Vacancies: React.FC<VacanciesProps> = ({ activeRole }) => {
  // Vacancy list vs detail
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);

  // Mock
  const [mockMode, setMockMode] = useState(false);

  // Wizard step (HR)
  const [currentStep, setCurrentStep] = useState<HrStep>('input');

  // Step 1: Inputs
  const [jdFiles, setJdFiles] = useState<UploadedFile[]>([]);
  const [companyBenefits, setCompanyBenefits] = useState('');
  const [teamContext, setTeamContext] = useState('Platform Engineering');
  const [roleType, setRoleType] = useState('Senior Backend Engineer');
  const [hmSubmitted, setHmSubmitted] = useState(false);

  // Step 2: Generated
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  // Step 3: Screening
  const [cvCandidates, setCvCandidates] = useState<CvCandidate[]>([]);
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [transferredCandidates, setTransferredCandidates] = useState<Set<string>>(new Set());

  // Step 4: HR Interview
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>(MOCK_BASE_QUESTIONS);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
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

  const approvedCandidates = cvCandidates.filter((c) => c.status === 'approved');
  const rejectedCandidates = cvCandidates.filter((c) => c.status === 'rejected');
  const interviewCandidate = cvCandidates.find((c) => c.id === selectedCandidate);
  const answeredAll = questions.every((q) => q.candidateAnswer.trim().length > 0);
  const canGenerate = activeRole === 'hr' && (jdFiles.length > 0 || companyBenefits.trim().length > 0);

  const hmAnsweredAll = hmQuestions.every((q) => q.candidateAnswer.trim().length > 0);

  const resetVacancyState = () => {
    setCurrentStep('input');
    setJdFiles([]);
    setCompanyBenefits('');
    setGenerated(false);
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
    setQuestions(MOCK_BASE_QUESTIONS);
    setMockMode(false);
  };

  const toggleMockMode = () => {
    const next = !mockMode;
    setMockMode(next);
    if (next) {
      setJdFiles(MOCK_FILES);
      setCompanyBenefits(MOCK_BENEFITS);
      setTeamContext('Platform Engineering');
      setRoleType('Senior Backend Engineer');
      setHmSubmitted(true);
      setGenerated(true);
      setCvCandidates(MOCK_CV_CANDIDATES);
      // Pre-load merged interview questions for cv1 (base filtered + personalized)
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from<File>(files).map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.name.endsWith('.pdf') ? 'pdf' : f.name.endsWith('.doc') || f.name.endsWith('.docx') ? 'doc' : 'other',
    }));
    setJdFiles((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index: number) => setJdFiles((prev) => prev.filter((_, i) => i !== index));

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGenerated(true);
      setCurrentStep('generated');
    }, 2000);
  };

  const handleShowScreening = () => {
    if (cvCandidates.length === 0) setCvCandidates(MOCK_CV_CANDIDATES);
    setCurrentStep('screening');
  };

  const handleSelectCandidate = (id: string) => {
    setSelectedCandidate(id);
    setMatchScore(null);
    setHrDecision('none');
    setHmMatchScore(null);
    setHmQuestions([]);

    // Merge base + personalized questions, filtering topics already covered
    const excludedIds = EXCLUDED_BASE_BY_CANDIDATE[id] ?? [];
    const filteredBase = MOCK_BASE_QUESTIONS.filter((q) => !excludedIds.includes(q.id));
    const personalized = MOCK_PERSONALIZED_QUESTIONS[id] ?? [];
    const personalizedAnswers = mockMode ? (MOCK_PERSONALIZED_ANSWERS[id] ?? {}) : {};

    // Re-key base questions to avoid ID collision with personalized ones
    const mergedBase = filteredBase.map((q) => ({
      ...q,
      id: `b_${q.id}`,
      candidateAnswer: mockMode ? (MOCK_BASE_ANSWERS[q.id] ?? '') : '',
    }));
    const mergedPersonalized = personalized.map((q) => ({
      ...q,
      candidateAnswer: personalizedAnswers[q.id] ?? '',
    }));

    setQuestions([...mergedBase, ...mergedPersonalized]);
    setCurrentStep('interview');
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

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      const answeredCount = questions.filter((q) => q.candidateAnswer.trim().length > 0).length;
      const base = answeredCount / questions.length;
      setMatchScore(Math.round(base * 85 + Math.random() * 15));
    }, 1800);
  };

  const handleOpenVacancy = (id: string) => {
    resetVacancyState();
    setSelectedVacancy(id);
  };

  const handleBackToList = () => {
    setSelectedVacancy(null);
    resetVacancyState();
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
        <header className="mb-10">
          <nav className="flex text-[11px] font-bold uppercase tracking-widest text-on-primary-container mb-2">
            <span className="opacity-50">Talent AI-Quisition</span>
            <span className="mx-2 opacity-50">/</span>
            <span>Vacancies</span>
          </nav>
          <div className="flex justify-between items-end">
            <div>
              <h2 className="font-headline text-4xl font-extrabold text-primary-container tracking-tight">Vacancies</h2>
              <p className="text-on-surface-variant mt-1">
                {activeRole === 'hr' ? 'Manage all open vacancies and their progress.' : 'Check the status of your team\'s vacancies.'}
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
              <div className={`w-2 h-2 rounded-full ${activeRole === 'hr' ? 'bg-secondary' : 'bg-primary-container'}`} />
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {activeRole === 'hr' ? 'Human Resources' : 'Hiring Manager'}
              </span>
            </div>
          </div>
        </header>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Vacancies', value: MOCK_VACANCIES.length, color: 'text-primary-container' },
            { label: 'In Screening', value: MOCK_VACANCIES.filter((v) => v.status === 'screening').length, color: 'text-amber-600' },
            { label: 'In Interviews', value: MOCK_VACANCIES.filter((v) => v.status === 'interviewing').length, color: 'text-secondary' },
            { label: 'Completed', value: MOCK_VACANCIES.filter((v) => v.status === 'completed').length, color: 'text-secondary' },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-1">{stat.label}</p>
              <p className={`font-headline text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Vacancy cards */}
        <div className="space-y-3">
          {MOCK_VACANCIES.map((v) => {
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
                        <p className="text-xs text-on-surface-variant">{v.applicants} applicants</p>
                        <p className="text-[10px] text-outline">{v.approved} approved · {v.rejected} rejected</p>
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
  const vacancy = MOCK_VACANCIES.find((v) => v.id === selectedVacancy);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={handleBackToList} className="flex items-center gap-2 text-on-surface-variant hover:text-primary-container transition-colors text-sm font-bold">
            <ArrowLeft size={16} />Vacancies
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
                  <DollarSign size={12} />Max budget: {fmtSalary(vacancy.budget)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeRole === 'hr' && (
              <button onClick={toggleMockMode} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${mockMode ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'}`}>
                <FlaskConical size={14} />Mock {mockMode ? 'ON' : 'OFF'}
              </button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-lg">
              <div className={`w-2 h-2 rounded-full ${activeRole === 'hr' ? 'bg-secondary' : 'bg-primary-container'}`} />
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {activeRole === 'hr' ? 'Human Resources' : 'Hiring Manager'}
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
        const vacancy = MOCK_VACANCIES.find((v) => v.id === selectedVacancy)!;

        // ── STATUS: DRAFT ──
        if (vacancy.status === 'draft') {
          return (
            <div className="space-y-8">
              <div className="flex items-center gap-4 p-5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="text-white" size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Vacancy in draft</p>
                  <p className="text-xs text-on-surface-variant">Upload the base JD and confirm team inputs to send to HR.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><FileText className="text-white" size={20} /></div>
                    <div><h3 className="font-headline text-lg font-bold text-on-surface">Job Description Base</h3><p className="text-xs text-on-surface-variant">Upload the JD PDF or skills matrix you will receive from your client</p></div>
                  </div>
                  <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary-container hover:bg-primary-container/5 transition-all group">
                    <Upload className="text-outline-variant group-hover:text-primary-container mb-3 transition-colors" size={32} />
                    <span className="text-sm font-bold text-on-surface-variant group-hover:text-primary-container transition-colors">Drag or click to upload</span>
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
                    <div><h3 className="font-headline text-lg font-bold text-on-surface">Team Inputs</h3><p className="text-xs text-on-surface-variant">Team activity summary (3/4 submitted)</p></div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl mb-4">
                    <p className="text-sm text-on-surface leading-relaxed">{MOCK_TEAM_SUMMARY}</p>
                  </div>
                  <div className="flex items-center gap-2 text-secondary"><CheckCircle2 size={16} /><span className="text-xs font-bold">3 of 4 members have submitted their feedback</span></div>
                </section>
              </div>
            </div>
          );
        }

        // ── STATUS: GENERATED ──
        if (vacancy.status === 'generated') {
          const jd = HM_GENERATED_JDS[vacancy.id] ?? {
            title: vacancy.title,
            summary: 'AI-generated Job Description combining HR and team inputs. Optimized to attract candidates with the exact profile the team needs.',
            skills: ['React', 'TypeScript', 'GraphQL', 'Design Systems', 'Storybook', 'CSS-in-JS'],
            responsibilities: [
              'Lead the development of new product features on the frontend.',
              'Maintain and evolve the company\'s Design System.',
              'Collaborate with Design and PM in defining experiences.',
              'Establish quality and performance standards for the frontend team.',
            ],
          };
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-5 bg-secondary/10 border border-secondary/30 rounded-xl">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0"><BrainCircuit className="text-white" size={18} /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-on-surface">JD Generated by HR — Ready to publish</p>
                  <p className="text-xs text-on-surface-variant">HR processed the inputs and generated the final Job Description. Review and approve to post the vacancy.</p>
                </div>
                <span className="px-3 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full">AI Generated</span>
              </div>
              <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-2">{jd.title}</h3>
                <p className="text-sm text-on-surface leading-relaxed mb-6">{jd.summary}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">{jd.skills.map((s) => (<span key={s} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-[11px] font-bold">{s}</span>))}</div>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-xl">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Responsibilities</h4>
                    <ul className="space-y-2">{jd.responsibilities.map((r, i) => (<li key={i} className="flex items-start gap-2 text-xs text-on-surface-variant"><CheckCircle2 className="text-secondary flex-shrink-0 mt-0.5" size={12} />{r}</li>))}</ul>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg">
                  <Send size={16} />Approve and publish vacancy
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
                  <p className="text-sm font-bold text-on-surface">Screening in progress — HR is evaluating candidates</p>
                  <p className="text-xs text-on-surface-variant">{vacancy.applicants} CVs have been received. HR is doing the AI pre-screening and will select the best profiles for interviews.</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                  <p className="font-headline text-3xl font-black text-primary-container">{vacancy.applicants}</p>
                  <p className="text-[10px] uppercase font-bold text-outline mt-1">CVs received</p>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                  <p className="font-headline text-3xl font-black text-secondary">{vacancy.approved ?? Math.round(vacancy.applicants * 0.3)}</p>
                  <p className="text-[10px] uppercase font-bold text-outline mt-1">Under evaluation</p>
                </div>
                <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                  <p className="font-headline text-3xl font-black text-outline">...</p>
                  <p className="text-[10px] uppercase font-bold text-outline mt-1">Pending HR</p>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Candidates under evaluation (preview)</p>
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
                <p className="text-xs text-outline text-center mt-4">Final interview decision: HR</p>
              </div>
            </div>
          );
        }

        // ── STATUS: INTERVIEWING → HM Technical Interview ──
        if (vacancy.status === 'interviewing') {
          const hmDirectAnsweredAll = hmDirectQuestions.every((q) => q.candidateAnswer.trim().length > 0);
          return (
            <div className="space-y-6">
              {/* Mock toggle for HM */}
              <div className="flex items-center justify-between p-5 bg-secondary/10 border border-secondary/30 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0"><Briefcase className="text-white" size={18} /></div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">Candidate ready for your technical interview</p>
                    <p className="text-xs text-on-surface-variant">HR approved {HM_SRE_CANDIDATE.name} after the screening interview. Now it\'s your turn.</p>
                  </div>
                </div>
                <button
                  onClick={toggleHmMockMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${hmMockMode ? 'bg-amber-500 text-white shadow-md' : 'bg-surface-container-high text-on-surface-variant hover:bg-amber-500/10 hover:text-amber-600 border border-amber-400/30'}`}
                >
                  <FlaskConical size={14} />
                  {hmMockMode ? 'Mock ON' : 'Mock'}
                </button>
              </div>

              {/* Candidate context card */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Candidate approved by HR</p>
                <div className="flex items-start gap-5">
                  <img src="https://picsum.photos/seed/luis/100/100" alt={HM_SRE_CANDIDATE.name} className="w-14 h-14 rounded-xl object-cover border-2 border-surface-container-high" referrerPolicy="no-referrer" />
                  <div className="flex-1">
                    <h3 className="font-headline text-xl font-bold text-on-surface">{HM_SRE_CANDIDATE.name}</h3>
                    <p className="text-sm text-on-surface-variant">{HM_SRE_CANDIDATE.currentRole}</p>
                    <p className="text-xs text-outline mt-0.5">{HM_SRE_CANDIDATE.experience}</p>
                    <div className="flex gap-3 mt-3 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-container/10 rounded-lg">
                        <span className="text-[10px] font-bold text-outline uppercase">CV Match</span>
                        <span className="font-headline font-black text-primary-container text-lg">{HM_SRE_CANDIDATE.cvScore}%</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg">
                        <span className="text-[10px] font-bold text-outline uppercase">RH Score</span>
                        <span className="font-headline font-black text-secondary text-lg">{HM_SRE_CANDIDATE.hrScore}%</span>
                      </div>
                      {(() => {
                        const v4Budget = MOCK_VACANCIES.find((v) => v.id === 'v4')?.budget;
                        const ob = v4Budget && HM_SRE_CANDIDATE.expectedSalary > v4Budget;
                        return (
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${ob ? 'bg-amber-500/10' : 'bg-secondary/10'}`}>
                            <DollarSign size={12} className={ob ? 'text-amber-500' : 'text-secondary'} />
                            <span className="text-[10px] font-bold text-outline uppercase">Expected salary</span>
                            <span className={`font-headline font-black text-base ${ob ? 'text-amber-600' : 'text-secondary'}`}>{fmtSalary(HM_SRE_CANDIDATE.expectedSalary)}</span>
                            {ob && <span className="text-[9px] text-amber-600 font-bold">↑ over budget</span>}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] font-black uppercase text-secondary mb-1">Strengths</p>
                      {HM_SRE_CANDIDATE.strengths.map((s) => <p key={s} className="flex items-center gap-1 text-on-surface-variant mb-0.5"><CheckCircle2 className="text-secondary" size={10} />{s}</p>)}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-500 mb-1">Gaps</p>
                      {HM_SRE_CANDIDATE.gaps.map((g) => <p key={g} className="flex items-center gap-1 text-on-surface-variant mb-0.5"><AlertTriangle className="text-amber-400" size={10} />{g}</p>)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions or empty state */}
              {hmDirectQuestions.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-outline-variant/30 rounded-2xl flex flex-col items-center text-center">
                  <Briefcase className="text-outline-variant mb-4" size={40} />
                  <p className="text-sm font-bold text-on-surface-variant mb-1">Technical questions ready to load</p>
                  <p className="text-xs text-outline">Activate Mock mode to see personalized questions for {HM_SRE_CANDIDATE.name} and the SRE role.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Shuffle className="text-secondary" size={14} />
                    <p className="text-xs font-black text-secondary uppercase tracking-widest">Personalized Technical Interview — Stack: Kubernetes · Terraform · GCP · Prometheus</p>
                  </div>
                  {hmDirectQuestions.map((q, i) => (
                    <div key={q.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm">
                      <div className="flex items-start gap-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-secondary text-white text-xs font-bold rounded-lg flex-shrink-0">T{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-on-surface">{q.question}</p>
                          <p className="text-[10px] text-outline uppercase font-bold mt-1">{q.category}</p>
                          {q.tailoredFor && (
                            <div className="flex items-center gap-1.5 mt-1.5 mb-3">
                              <Shuffle className="text-secondary/60 flex-shrink-0" size={11} />
                              <p className="text-[11px] text-secondary/70 italic">{q.tailoredFor}</p>
                            </div>
                          )}
                          <div className="mb-3 p-3 bg-surface-container-low rounded-lg border-l-2 border-outline-variant/30">
                            <p className="text-[10px] text-outline uppercase font-bold mb-1">Expected answer (your reference):</p>
                            <p className="text-xs text-on-surface-variant italic leading-relaxed">{q.expectedAnswer}</p>
                          </div>
                          <textarea
                            value={q.candidateAnswer}
                            onChange={(e) => handleHmDirectAnswer(q.id, e.target.value)}
                            className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none"
                            placeholder="Enter the candidate's answer..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={handleHmDirectEvaluate}
                      disabled={!hmDirectAnsweredAll || isHmDirectEvaluating}
                      className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${hmDirectAnsweredAll && !isHmDirectEvaluating ? 'bg-secondary text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}
                    >
                      {isHmDirectEvaluating ? (<><Loader2 className="animate-spin" size={20} />Evaluating...</>) : (<><BarChart3 size={20} />Evaluate Technical Interview</>)}
                    </button>
                  </div>

                  {hmDirectScore !== null && (
                    <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-lg mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="relative w-28 h-28 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle className="text-surface-container-high" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8" />
                              <circle className={hmDirectScore >= 70 ? 'text-secondary' : 'text-error'} cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeDasharray="301" strokeDashoffset={301 - (301 * hmDirectScore) / 100} strokeWidth="8" strokeLinecap="round" />
                            </svg>
                            <span className={`absolute font-headline font-black text-3xl ${hmDirectScore >= 70 ? 'text-secondary' : 'text-error'}`}>{hmDirectScore}%</span>
                          </div>
                          <div>
                            <h3 className="font-headline text-2xl font-bold text-on-surface">Technical Result: {HM_SRE_CANDIDATE.name}</h3>
                            <div className="flex items-center gap-3 mt-1 mb-2">
                              <span className="text-xs text-on-surface-variant">CV: <strong className="text-primary-container">{HM_SRE_CANDIDATE.cvScore}%</strong></span>
                              <span className="text-outline">→</span>
                              <span className="text-xs text-on-surface-variant">RH: <strong className="text-outline">{HM_SRE_CANDIDATE.hrScore}%</strong></span>
                              <span className="text-outline">→</span>
                              <span className="text-xs font-bold">HM: <strong className="text-secondary">{hmDirectScore}%</strong></span>
                            </div>
                            <p className="text-sm text-on-surface-variant">
                              {hmDirectScore >= 80 ? 'Technically strong candidate. Highly recommended for hiring.' : 'Solid. Some manageable gaps with proper onboarding.'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={hmDirectScore >= 70 ? 'text-secondary' : 'text-error'} size={20} />
                            <span className={`text-sm font-bold ${hmDirectScore >= 70 ? 'text-secondary' : 'text-error'}`}>
                              {hmDirectScore >= 80 ? 'Hire' : 'Consider Offer'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            <TrendingUp size={14} />
                            <span className="text-[10px] font-bold uppercase">Final score: {Math.round((HM_SRE_CANDIDATE.cvScore + HM_SRE_CANDIDATE.hrScore + hmDirectScore) / 3)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
                <p className="text-sm font-bold text-on-surface">Process completed successfully</p>
                <p className="text-xs text-on-surface-variant">The vacancy was filled. The selected candidate went through the entire evaluation process.</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                <p className="font-headline text-3xl font-black text-primary-container">{vacancy.applicants}</p>
                <p className="text-[10px] uppercase font-bold text-outline mt-1">CVs received</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                <p className="font-headline text-3xl font-black text-secondary">{vacancy.approved ?? 1}</p>
                <p className="text-[10px] uppercase font-bold text-outline mt-1">Hired</p>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-2xl text-center shadow-sm">
                <p className="font-headline text-3xl font-black text-error">{vacancy.rejected ?? vacancy.applicants - 1}</p>
                <p className="text-[10px] uppercase font-bold text-outline mt-1">Discarded</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm text-center">
              <TrendingUp className="text-secondary mx-auto mb-3" size={32} />
              <h3 className="font-headline text-xl font-bold text-on-surface mb-2">Archived process</h3>
              <p className="text-sm text-on-surface-variant">The hiring process for this vacancy has concluded. You can review the history in the final report.</p>
            </div>
          </div>
        );
      })()}

      {/* ── HM: TEAM INPUTS PANEL (visible inside any vacancy) ── */}
      {activeRole === 'hiring_manager' && selectedVacancy && (() => {
        const vacancy = MOCK_VACANCIES.find((v) => v.id === selectedVacancy)!;
        const HM_TEAM_INPUTS: Record<string, { name: string; role: string; avatar: string; status: 'submitted' | 'pending'; text: string; submittedAt: string }[]> = {
          v1: [
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'submitted', submittedAt: '18 Mar, 09:14', text: 'I spend my time building APIs in Go and doing code reviews. This week I migrated endpoints from REST to gRPC and was optimizing slow PostgreSQL queries. We need someone to take ownership of the event-driven architecture migration.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '18 Mar, 10:32', text: 'I work in React/TypeScript and touch backend in Go when needed. We need a pure backend person to help us with the load.' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'submitted', submittedAt: '17 Mar, 16:55', text: 'I maintain infra on GCP with Terraform and Kubernetes. We need someone who understands K8s and can be self-sufficient without being my bottleneck.' },
            { name: 'Ana Gutiérrez', role: 'Frontend Engineer', avatar: 'ana', status: 'pending', submittedAt: '', text: '' },
          ],
          v2: [
            { name: 'Ana Gutiérrez', role: 'Frontend Engineer', avatar: 'ana', status: 'submitted', submittedAt: '8 Mar, 11:20', text: 'I implement features with React and TypeScript, closely aligned with Design. We need a Frontend Lead to define the Design System and establish quality standards.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '8 Mar, 14:05', text: 'I work on frontend and backend. We could use someone with product vision who can mentor the frontend team.' },
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'pending', submittedAt: '', text: '' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'pending', submittedAt: '', text: '' },
          ],
          v3: [
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'pending', submittedAt: '', text: '' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'pending', submittedAt: '', text: '' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'pending', submittedAt: '', text: '' },
          ],
          v4: [
            { name: 'Marcus Thorne', role: 'DevOps / SRE Engineer', avatar: 'marcus', status: 'submitted', submittedAt: '1 Mar, 09:00', text: 'I am the only one who touches the production cluster. We need someone with real operational Kubernetes, Terraform, and incident response experience. Bonus if they know Istio.' },
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'submitted', submittedAt: '1 Mar, 10:15', text: 'I would work very closely with this person for payment service deployments. They need to know Kubernetes and understand Go deployments.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '1 Mar, 11:30', text: 'They should be good at communicating when there are infra changes that impact us on the frontend. They should actively monitor and not wait for everything to break.' },
          ],
          v5: [
            { name: 'Carlos Mendoza', role: 'Backend Engineer', avatar: 'carlos', status: 'submitted', submittedAt: '20 Feb, 08:45', text: 'We need QA who understands APIs and can write integration tests. Not just a "manual clicker".' },
            { name: 'Ana Gutiérrez', role: 'Frontend Engineer', avatar: 'ana', status: 'submitted', submittedAt: '20 Feb, 09:30', text: 'Someone who does E2E testing of product flows with Cypress or Playwright. Who also works closely with design.' },
            { name: 'Sarah Chen', role: 'Full-Stack Developer', avatar: 'sarah', status: 'submitted', submittedAt: '20 Feb, 10:00', text: 'With experience in Playwright or Cypress. Who can run automated regression tests in the CI pipeline.' },
            { name: 'Marcus Thorne', role: 'DevOps Engineer', avatar: 'marcus', status: 'submitted', submittedAt: '20 Feb, 10:45', text: 'Who knows how to integrate tests into GitHub Actions. Who understands pipelines and can add quality gates to CI/CD.' },
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
                  <h4 className="text-sm font-bold text-on-surface">Team Inputs for this vacancy</h4>
                  <p className="text-[10px] text-outline">{submittedCount}/{members.length} members have submitted their feedback</p>
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
                        <span className="text-xs text-amber-600 font-medium">Pending submission</span>
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
                <p className="text-xs text-on-surface-variant">Upload the original JD and required skills documents</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-outline ml-1">Team</label>
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
                  <label className="block text-[10px] font-black uppercase tracking-widest text-outline ml-1">Role</label>
                  <input value={roleType} onChange={(e) => setRoleType(e.target.value)} className="w-full bg-surface-container-low border-none rounded-lg p-3 text-sm font-semibold focus:ring-2 focus:ring-secondary transition-all" placeholder="e.g., Senior Backend Engineer" type="text" />
                </div>
              </div>
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-outline-variant/40 rounded-xl cursor-pointer hover:border-secondary hover:bg-secondary/5 transition-all group">
                <Upload className="text-outline-variant group-hover:text-secondary mb-3 transition-colors" size={32} />
                <span className="text-sm font-bold text-on-surface-variant group-hover:text-secondary transition-colors">Drag PDF files or click to upload</span>
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
                  <h3 className="font-headline text-lg font-bold text-on-surface">Company Benefits</h3>
                  <p className="text-xs text-on-surface-variant">Will be included in the generated Job Description</p>
                </div>
              </div>
              <textarea value={companyBenefits} onChange={(e) => setCompanyBenefits(e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none" placeholder={"Example:\n- Remote work\n- Medical insurance\n- Grocery vouchers"} rows={6} />
              <div className="mt-4 p-4 bg-surface-container-low rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Quick add</p>
                <div className="flex flex-wrap gap-2">
                  {['Remote', 'Hybrid', 'Medical insurance', 'Stock options', 'Training', 'Bonuses'].map((tag) => (
                    <button key={tag} onClick={() => setCompanyBenefits((prev) => prev + (prev ? '\n- ' : '- ') + tag)} className="px-3 py-1.5 bg-surface-container-lowest text-on-surface-variant text-[11px] font-bold rounded-lg border border-outline-variant/20 hover:border-secondary hover:text-secondary transition-all">
                      <PlusCircle className="inline mr-1" size={12} />{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-primary-container/5 border border-primary-container/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-primary-container" size={16} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-container">Team Inputs Summary (Hiring Manager)</p>
                  {hmSubmitted ? <CheckCircle2 className="text-secondary ml-auto" size={14} /> : <AlertTriangle className="text-amber-500 ml-auto" size={14} />}
                </div>
                {hmSubmitted ? (
                  <p className="text-xs text-on-surface-variant leading-relaxed">{MOCK_TEAM_SUMMARY}</p>
                ) : (
                  <p className="text-xs text-amber-600 font-medium">The Hiring Manager has not yet sent the team inputs.</p>
                )}
              </div>
            </section>
          ) : (
            <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center"><Users className="text-white" size={20} /></div>
                <div>
                  <h3 className="font-headline text-lg font-bold text-on-surface">Team Inputs Summary</h3>
                  <p className="text-xs text-on-surface-variant">Aggregated summary of team activities</p>
                </div>
              </div>
              {hmSubmitted ? (
                <>
                  <div className="p-4 bg-surface-container-low rounded-xl mb-4"><p className="text-sm text-on-surface leading-relaxed">{MOCK_TEAM_SUMMARY}</p></div>
                  <div className="flex items-center gap-2 text-secondary"><CheckCircle2 size={16} /><span className="text-xs font-bold">Inputs sent to HR</span></div>
                </>
              ) : (
                <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-xl flex flex-col items-center justify-center text-center">
                  <Users className="text-outline-variant mb-3" size={32} />
                  <p className="text-sm font-bold text-on-surface-variant mb-1">Inputs have not been collected yet</p>
                  <p className="text-xs text-outline">Go to the "Team Inputs" tab for each member to register their activities.</p>
                </div>
              )}
              <div className="mt-6 p-4 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-2 mb-2"><Eye className="text-outline" size={14} /><p className="text-[10px] font-black uppercase tracking-widest text-outline">Your role in this step</p></div>
                <p className="text-xs text-on-surface-variant leading-relaxed">As Hiring Manager, make sure the team inputs are complete and the base JD is uploaded. HR will manage the process.</p>
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
                    <h3 className="font-headline text-xl font-bold text-on-surface">{MOCK_GENERATED_JD.title}</h3>
                    <p className="text-xs text-on-surface-variant">AI-optimized Job Description</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-black uppercase tracking-widest rounded-full">AI Generated</span>
              </div>
              <p className="text-sm text-on-surface leading-relaxed mb-6">{MOCK_GENERATED_JD.summary}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_GENERATED_JD.skills.map((skill) => (<span key={skill} className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-lg text-[11px] font-bold">{skill}</span>))}
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-xl">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Target Team</h4>
                  <p className="text-sm font-semibold text-primary-container">{teamContext}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{roleType}</p>
                </div>
              </div>
              <div className="mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-outline mb-3">Key Responsibilities</h4>
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
                <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3"><Gift className="inline mr-1" size={12} />Benefits Included</h4>
                <ul className="space-y-1.5">
                  {MOCK_GENERATED_JD.benefits.map((b, i) => (<li key={i} className="flex items-center gap-2 text-sm text-on-surface"><CheckCircle2 className="text-secondary flex-shrink-0" size={14} />{b}</li>))}
                </ul>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            {/* Personalization notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Sparkles className="text-amber-600 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs font-bold text-amber-700">Questions will be personalized per candidate</p>
                <p className="text-[11px] text-amber-600 leading-relaxed mt-0.5">
                  When starting each candidate's interview, the AI will cross-reference their CV with this JD and generate specific questions that dig deeper into their strengths and probe their gaps.
                </p>
              </div>
            </div>

            <div className="bg-primary-container text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl -mr-10 -mt-10 rounded-full" />
              <div className="flex items-center gap-3 mb-6">
                <ClipboardList className="text-secondary" size={24} />
                <div>
                  <h3 className="font-headline text-xl font-bold">Base Question Template</h3>
                  <p className="text-xs text-on-primary-container">Template generated from the JD — will be adapted to each candidate</p>
                </div>
              </div>
              <div className="space-y-5">
                {MOCK_BASE_QUESTIONS.map((q, i) => (
                  <div key={q.id} className="border-b border-white/10 pb-4 last:border-0">
                    <p className="text-[10px] font-black uppercase text-on-primary-container tracking-widest mb-1">{q.category} — Q{i + 1}</p>
                    <p className="text-sm font-semibold mb-2">"{q.question}"</p>
                    <div className="p-3 bg-white/5 rounded-lg border-l-2 border-secondary">
                      <p className="text-[10px] text-on-primary-container uppercase font-bold mb-1">Expected answer:</p>
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
              <p className="text-lg font-bold text-on-surface-variant mb-2">Waiting for CV reception</p>
              <p className="text-sm text-outline mb-6">Once the vacancy is published, CVs will be received and automatically evaluated by AI.</p>
              <button onClick={handleShowScreening} className="flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all shadow-lg">
                <Inbox size={18} />Simulate CV reception
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center"><Inbox className="text-white" size={20} /></div>
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">CV Screening</h3>
                    <p className="text-sm text-on-surface-variant">{cvCandidates.length} CVs were received. AI evaluated them automatically.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg"><UserCheck className="text-secondary" size={14} /><span className="text-xs font-bold text-secondary">{approvedCandidates.length} Approved</span></div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-error/10 rounded-lg"><UserX className="text-error" size={14} /><span className="text-xs font-bold text-error">{rejectedCandidates.length} Rejected</span></div>
                </div>
              </div>

              {/* Approved */}
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-3 ml-1">Approved Candidates — Ready for Interview</p>
                <div className="space-y-3">
                  {approvedCandidates.map((c) => {
                    const overBudget = vacancy?.budget && c.expectedSalary ? c.expectedSalary > vacancy.budget : false;
                    const salaryDiff = vacancy?.budget && c.expectedSalary ? c.expectedSalary - vacancy.budget : 0;
                    return (
                    <div key={c.id} className="bg-surface-container-lowest rounded-2xl shadow-sm border-l-4 border-secondary overflow-hidden transition-all">
                      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={() => setExpandedCandidate(expandedCandidate === c.id ? null : c.id)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container text-sm font-black">{c.name.split(' ').map((n) => n[0]).join('')}</div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{c.name}</p>
                            <p className="text-xs text-on-surface-variant">{c.currentRole} · {c.experience}</p>
                            {c.expectedSalary && (
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <DollarSign size={10} className={overBudget ? 'text-amber-500' : 'text-secondary'} />
                                <span className={`text-[11px] font-bold ${overBudget ? 'text-amber-600' : 'text-secondary'}`}>
                                  {fmtSalary(c.expectedSalary)}
                                </span>
                                {overBudget && (
                                  <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] font-black uppercase rounded border border-amber-400/30">
                                    +{fmtSalary(salaryDiff)} over budget
                                  </span>
                                )}
                                {!overBudget && vacancy?.budget && (
                                  <span className="px-1.5 py-0.5 bg-secondary/10 text-secondary text-[9px] font-black uppercase rounded">
                                    Dentro del budget
                                  </span>
                                )}
                              </div>
                            )}
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
                          {overBudget && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-400/30 rounded-xl">
                              <AlertTriangle className="text-amber-500 flex-shrink-0" size={14} />
                              <p className="text-xs text-amber-700">
                                The expected salary of <strong>{fmtSalary(c.expectedSalary!)}</strong> exceeds the vacancy budget (<strong>{fmtSalary(vacancy!.budget!)}</strong>) by <strong>{fmtSalary(salaryDiff)}</strong>. Consider negotiating or adjusting the budget.
                              </p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Strengths</p>
                              <div className="space-y-1.5">{c.strengths.map((s, i) => (<div key={i} className="flex items-center gap-2 text-xs text-on-surface"><CheckCircle2 className="text-secondary flex-shrink-0" size={12} />{s}</div>))}</div>
                            </div>
                            {c.gaps.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Areas for improvement</p>
                                <div className="space-y-1.5">{c.gaps.map((g, i) => (<div key={i} className="flex items-center gap-2 text-xs text-on-surface-variant"><AlertTriangle className="text-amber-500 flex-shrink-0" size={12} />{g}</div>))}</div>
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleSelectCandidate(c.id)} className="mt-4 flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all">
                            <MessageSquare size={16} />Go to Interview
                          </button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* Rejected */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-error mb-3 ml-1">Rejected Candidates — AI Feedback</p>
                <div className="space-y-3">
                  {rejectedCandidates.map((c) => {
                    const isTransferred = transferredCandidates.has(c.id);
                    return (
                    <div key={c.id} className={`bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden ${isTransferred ? 'border-l-4 border-blue-400' : 'border-l-4 border-error/40'}`}>
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
                                  <CheckCircle2 size={10} />Transferred → {c.crossMatchVacancy}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-on-surface-variant">{c.currentRole} · {c.experience}</p>
                            {c.expectedSalary && (
                              <span className="text-[11px] font-bold text-outline flex items-center gap-1 mt-0.5">
                                <DollarSign size={10} />{fmtSalary(c.expectedSalary)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-2xl font-headline font-black ${isTransferred ? 'text-blue-600' : 'text-error'}`}>{c.matchScore}%</p>
                            <p className={`text-[10px] font-bold uppercase ${isTransferred ? 'text-blue-500' : 'text-error'}`}>No match</p>
                          </div>
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
                                      {isTransferred ? `Transferred to: ${c.crossMatchVacancy}` : `Cross-match detected by AI`}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                      {isTransferred
                                        ? `The candidate was added to the screening pool of ${c.crossMatchVacancy}.`
                                        : `This candidate could fit the position of `}
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
                                        setTransferredCandidates((prev) => new Set([...prev, c.id]));
                                      }}
                                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                                    >
                                      <Send size={13} />Transfer
                                    </button>
                                  ) : (
                                    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-wider rounded-xl">
                                      <CheckCircle2 size={13} />Transferred
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="mt-4 mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Identified Gaps</p>
                            <div className="flex flex-wrap gap-2">
                              {c.gaps.map((gap, gi) => (<span key={gi} className="flex items-center gap-1 px-3 py-1.5 bg-error/5 text-error text-[11px] font-bold rounded-lg border border-error/20"><AlertTriangle size={12} />{gap}</span>))}
                            </div>
                          </div>
                          <div className="p-4 bg-surface-container-low rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-2">Candidate feedback (AI-generated)</p>
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
              <p className="text-xs font-black uppercase tracking-widest text-outline">Selected candidate</p>
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
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Interview: {interviewCandidate.name}</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-sm text-on-surface-variant">{interviewCandidate.currentRole} · CV Score: {interviewCandidate.matchScore}%</p>
                    {interviewCandidate.expectedSalary && (() => {
                      const ob = vacancy?.budget && interviewCandidate.expectedSalary > vacancy.budget;
                      return (
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold ${ob ? 'bg-amber-500/10 text-amber-600 border border-amber-400/30' : 'bg-secondary/10 text-secondary'}`}>
                          <DollarSign size={11} />{fmtSalary(interviewCandidate.expectedSalary)}
                          {ob && <span className="ml-1 text-[10px]">↑ over budget</span>}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Question set summary */}
              <div className="flex items-center gap-4 mb-6 px-1">
                <div className="flex items-center gap-1.5">
                  <ClipboardList className="text-outline" size={13} />
                  <p className="text-[11px] text-outline font-bold uppercase tracking-widest">
                    {questions.filter((q) => q.id.startsWith('b_')).length} base JD
                  </p>
                </div>
                <span className="text-outline">+</span>
                <div className="flex items-center gap-1.5">
                  <Shuffle className="text-blue-500" size={13} />
                  <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest">
                    {questions.filter((q) => !q.id.startsWith('b_')).length} personalized for {interviewCandidate.name}
                  </p>
                </div>
                <span className="text-outline">=</span>
                <p className="text-[11px] font-black text-on-surface uppercase tracking-widest">{questions.length} questions without duplicates</p>
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => {
                  const isBase = q.id.startsWith('b_');
                  return (
                    <div key={q.id} className={`p-6 rounded-2xl shadow-sm ${isBase ? 'bg-surface-container-lowest' : 'bg-blue-50/40 border border-blue-200/40'}`}>
                      <div className="flex items-start gap-4">
                        <span className={`w-8 h-8 flex items-center justify-center text-white text-xs font-bold rounded-lg flex-shrink-0 ${isBase ? 'bg-outline' : 'bg-primary-container'}`}>Q{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] text-outline uppercase font-bold">{q.category}</p>
                            {isBase ? (
                              <span className="px-1.5 py-0.5 bg-surface-container-high text-outline text-[9px] font-black uppercase rounded">Base JD</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] font-black uppercase rounded">Personalized</span>
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
                          <textarea value={q.candidateAnswer} onChange={(e) => handleCandidateAnswer(q.id, e.target.value)} className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-secondary transition-all resize-none" placeholder="Enter the candidate's answer..." rows={3} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center mt-8">
                <button onClick={handleEvaluate} disabled={!answeredAll || isEvaluating} className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${answeredAll && !isEvaluating ? 'bg-secondary text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}>
                  {isEvaluating ? (<><Loader2 className="animate-spin" size={20} />Evaluating with AI...</>) : (<><BarChart3 size={20} />Evaluate Match with AI</>)}
                </button>
              </div>

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
                          <h3 className="font-headline text-2xl font-bold text-on-surface">Result: {interviewCandidate.name}</h3>
                          <p className="text-xs text-on-surface-variant mb-1">CV Score: {interviewCandidate.matchScore}% → HR Interview: {matchScore}%</p>
                          <p className="text-sm text-on-surface-variant mt-1">
                            {matchScore >= 80 ? 'Excellent candidate. Highly compatible.' : matchScore >= 60 ? 'Good candidate with development areas.' : 'Needs significant development in key areas.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={matchScore >= 70 ? 'text-secondary' : 'text-error'} size={20} />
                          <span className={`text-sm font-bold ${matchScore >= 70 ? 'text-secondary' : 'text-error'}`}>
                            {matchScore >= 80 ? 'Recommended' : matchScore >= 60 ? 'Consider' : 'Not recommended'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <TrendingUp size={14} />
                          <span className="text-[10px] font-bold uppercase">Combined score: {Math.round((interviewCandidate.matchScore + matchScore) / 2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HR Decision */}
                  {hrDecision === 'none' && (
                    <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/20">
                      <p className="text-[10px] font-black uppercase tracking-widest text-outline mb-4">HR Decision — Does the process continue?</p>
                      <div className="flex gap-4">
                        <button onClick={() => handleHrDecision('continue')} className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-secondary text-white hover:opacity-90 transition-all shadow-lg cursor-pointer">
                          <CheckCircle2 size={20} />
                          Continue → Hiring Manager
                        </button>
                        <button onClick={() => handleHrDecision('reject')} className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm bg-error/10 text-error border border-error/30 hover:bg-error/20 transition-all cursor-pointer">
                          <UserX size={20} />
                          Discard Candidate
                        </button>
                      </div>
                    </div>
                  )}

                  {hrDecision === 'continue' && (
                    <div className="flex items-center gap-4 p-5 bg-secondary/10 border border-secondary/20 rounded-2xl">
                      <CheckCircle2 className="text-secondary flex-shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-bold text-secondary">Candidate approved by HR</p>
                        <p className="text-xs text-on-surface-variant">Moves to technical interview with the Hiring Manager. Go to the next step to continue.</p>
                      </div>
                    </div>
                  )}

                  {hrDecision === 'reject' && (
                    <div className="flex items-center gap-4 p-5 bg-error/10 border border-error/20 rounded-2xl">
                      <UserX className="text-error flex-shrink-0" size={24} />
                      <div>
                        <p className="text-sm font-bold text-error">Candidate discarded by HR</p>
                        <p className="text-xs text-on-surface-variant">The candidate will not advance in the process. You can select another approved candidate.</p>
                      </div>
                      <button onClick={() => setHrDecision('none')} className="ml-auto px-4 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-all">Change decision</button>
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
              {interviewCandidate.name} was sent to the Hiring Manager for technical interview
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              RH Score: <strong>{matchScore}%</strong> · CV Match: <strong>{interviewCandidate.matchScore}%</strong> · The HM will receive the personalized technical questions for their interview.
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
          <div>
            {currentStep === 'input' && !generated && (
              <button onClick={handleGenerate} disabled={!canGenerate || isGenerating} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${canGenerate && !isGenerating ? 'bg-primary-container text-white hover:opacity-90 cursor-pointer' : 'bg-surface-container-high text-outline cursor-not-allowed'}`}>
                {isGenerating ? (<><Loader2 className="animate-spin" size={18} />Processing...</>) : (<><Sparkles size={18} />Generate with AI</>)}
              </button>
            )}
            {currentStep === 'input' && generated && (
              <button onClick={() => setCurrentStep('generated')} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all">
                Next<ChevronRight size={18} />
              </button>
            )}
            {currentStep === 'generated' && (
              <button onClick={() => { if (cvCandidates.length === 0) setCvCandidates(MOCK_CV_CANDIDATES); setCurrentStep('screening'); }} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all">
                Screening CVs<ChevronRight size={18} />
              </button>
            )}
            {currentStep === 'screening' && approvedCandidates.length > 0 && (
              <button onClick={() => { if (!selectedCandidate) handleSelectCandidate(approvedCandidates[0].id); else setCurrentStep('interview'); }} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-primary-container text-white hover:opacity-90 transition-all">
                HR Interview<ChevronRight size={18} />
              </button>
            )}
            {/* Once approved, no next step for RH — process moves to HM */}
          </div>
        </div>
      )}
    </div>
  );
};

