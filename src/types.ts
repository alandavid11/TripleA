export type Screen = 'dashboard' | 'activity' | 'generator' | 'match' | 'settings';

export interface ActivityItem {
  id: string;
  type: 'commit' | 'ticket';
  title: string;
  timestamp: string;
  hash?: string;
  ticketId?: string;
  intelligence: {
    skill: string;
    level: 'Basic' | 'Intermediate' | 'Advanced' | 'Theory';
  }[];
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
