export type Screen = 'dashboard' | 'team-inputs' | 'vacancies' | 'match' | 'settings';

export type UserRole = 'hr' | 'hiring_manager';

export interface TeamMemberInput {
  id: string;
  name: string;
  role: string;
  avatar: string;
  activities: string;
  submittedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  role: string;
  tenure: string;
  matchScore: number;
  status: string;
}

export interface Metric {
  label: string;
  value: string;
  trend?: string;
  subtext?: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  expectedAnswer: string;
  candidateAnswer: string;
  tailoredFor?: string;
}

export interface UploadedFile {
  name: string;
  size: string;
  type: 'pdf' | 'doc' | 'other';
}

export interface CvCandidate {
  id: string;
  name: string;
  matchScore: number;
  status: 'approved' | 'rejected';
  currentRole: string;
  experience: string;
  strengths: string[];
  gaps: string[];
  feedback: string;
  crossMatchVacancy?: string;
}

export interface Vacancy {
  id: string;
  title: string;
  team: string;
  status: 'draft' | 'generated' | 'screening' | 'interviewing' | 'completed';
  createdAt: string;
  applicants: number;
  approved: number;
  rejected: number;
}
