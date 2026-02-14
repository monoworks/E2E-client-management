export type ProjectStatus =
  | 'prospect'
  | 'proposing'
  | 'negotiating'
  | 'closed_won'
  | 'closed_lost'
  | 'deepening';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  prospect: '見込',
  proposing: '提案中',
  negotiating: '交渉中',
  closed_won: '成約',
  closed_lost: '失注',
  deepening: '深耕中',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  prospect: 'bg-gray-100 text-gray-800',
  proposing: 'bg-blue-100 text-blue-800',
  negotiating: 'bg-yellow-100 text-yellow-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-red-100 text-red-800',
  deepening: 'bg-purple-100 text-purple-800',
};

export const PIPELINE_STATUSES: ProjectStatus[] = [
  'prospect',
  'proposing',
  'negotiating',
  'closed_won',
  'deepening',
];

export interface Company {
  id: string;
  name: string;
  industry: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  companyId: string;
  name: string;
  status: ProjectStatus;
  amount: number;
  assignedTo: string;
  description: string;
  startDate: string;
  expectedCloseDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityType = 'meeting' | 'call' | 'email' | 'proposal' | 'other';

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  meeting: '会議',
  call: '電話',
  email: 'メール',
  proposal: '提案',
  other: 'その他',
};

export interface Activity {
  id: string;
  projectId: string;
  type: ActivityType;
  date: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}
