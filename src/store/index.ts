import type { Company, Project, Activity, Member } from '../types';

const STORAGE_KEYS = {
  companies: 'crm_companies',
  projects: 'crm_projects',
  activities: 'crm_activities',
  members: 'crm_members',
} as const;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// --- Companies ---
export function getCompanies(): Company[] {
  return getItems<Company>(STORAGE_KEYS.companies);
}

export function getCompany(id: string): Company | undefined {
  return getCompanies().find((c) => c.id === id);
}

export function saveCompany(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Company {
  const companies = getCompanies();
  const now = new Date().toISOString();
  const company: Company = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  companies.push(company);
  setItems(STORAGE_KEYS.companies, companies);
  return company;
}

export function updateCompany(id: string, data: Partial<Company>): Company | undefined {
  const companies = getCompanies();
  const index = companies.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  companies[index] = { ...companies[index], ...data, updatedAt: new Date().toISOString() };
  setItems(STORAGE_KEYS.companies, companies);
  return companies[index];
}

export function deleteCompany(id: string): void {
  setItems(STORAGE_KEYS.companies, getCompanies().filter((c) => c.id !== id));
  // Also delete related projects and their activities
  const projects = getProjects().filter((p) => p.companyId === id);
  projects.forEach((p) => deleteProject(p.id));
}

// --- Projects ---
export function getProjects(): Project[] {
  return getItems<Project>(STORAGE_KEYS.projects);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

export function getProjectsByCompany(companyId: string): Project[] {
  return getProjects().filter((p) => p.companyId === companyId);
}

export function getProjectsByMember(memberName: string): Project[] {
  return getProjects().filter((p) => p.assignedTo === memberName);
}

export function saveProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
  const projects = getProjects();
  const now = new Date().toISOString();
  const project: Project = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  projects.push(project);
  setItems(STORAGE_KEYS.projects, projects);
  return project;
}

export function updateProject(id: string, data: Partial<Project>): Project | undefined {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  projects[index] = { ...projects[index], ...data, updatedAt: new Date().toISOString() };
  setItems(STORAGE_KEYS.projects, projects);
  return projects[index];
}

export function deleteProject(id: string): void {
  setItems(STORAGE_KEYS.projects, getProjects().filter((p) => p.id !== id));
  // Also delete related activities
  setItems(STORAGE_KEYS.activities, getActivities().filter((a) => a.projectId !== id));
}

// --- Activities ---
export function getActivities(): Activity[] {
  return getItems<Activity>(STORAGE_KEYS.activities);
}

export function getActivitiesByProject(projectId: string): Activity[] {
  return getActivities()
    .filter((a) => a.projectId === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveActivity(data: Omit<Activity, 'id' | 'createdAt'>): Activity {
  const activities = getActivities();
  const activity: Activity = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  activities.push(activity);
  setItems(STORAGE_KEYS.activities, activities);
  return activity;
}

export function deleteActivity(id: string): void {
  setItems(STORAGE_KEYS.activities, getActivities().filter((a) => a.id !== id));
}

// --- Members ---
export function getMembers(): Member[] {
  const members = getItems<Member>(STORAGE_KEYS.members);
  if (members.length === 0) {
    const defaults: Member[] = [
      { id: generateId(), name: '田中太郎', email: 'tanaka@example.com', role: 'マネージャー' },
      { id: generateId(), name: '佐藤花子', email: 'sato@example.com', role: 'コンサルタント' },
      { id: generateId(), name: '鈴木一郎', email: 'suzuki@example.com', role: 'コンサルタント' },
      { id: generateId(), name: '高橋美咲', email: 'takahashi@example.com', role: 'コンサルタント' },
      { id: generateId(), name: '伊藤健太', email: 'ito@example.com', role: 'アナリスト' },
    ];
    setItems(STORAGE_KEYS.members, defaults);
    return defaults;
  }
  return members;
}

export function getMember(id: string): Member | undefined {
  return getMembers().find((m) => m.id === id);
}

export function saveMember(data: Omit<Member, 'id'>): Member {
  const members = getMembers();
  const member: Member = { ...data, id: generateId() };
  members.push(member);
  setItems(STORAGE_KEYS.members, members);
  return member;
}

export function updateMember(id: string, data: Partial<Member>): Member | undefined {
  const members = getMembers();
  const index = members.findIndex((m) => m.id === id);
  if (index === -1) return undefined;
  members[index] = { ...members[index], ...data };
  setItems(STORAGE_KEYS.members, members);
  return members[index];
}

export function deleteMember(id: string): void {
  setItems(STORAGE_KEYS.members, getMembers().filter((m) => m.id !== id));
}

// --- Export ---
export function exportAllData(): string {
  return JSON.stringify(
    {
      companies: getCompanies(),
      projects: getProjects(),
      activities: getActivities(),
      members: getMembers(),
      exportedAt: new Date().toISOString(),
    },
    null,
    2
  );
}

export function exportCSV(): string {
  const projects = getProjects();
  const companies = getCompanies();
  const companyMap = new Map(companies.map((c) => [c.id, c]));

  const headers = ['案件名', '顧客企業', '業種', 'ステータス', '金額', '担当者', '開始日', '成約予定日', '説明'];
  const rows = projects.map((p) => {
    const company = companyMap.get(p.companyId);
    const statusLabels: Record<string, string> = {
      prospect: '見込',
      proposing: '提案中',
      negotiating: '交渉中',
      closed_won: '成約',
      closed_lost: '失注',
      deepening: '深耕中',
    };
    return [
      p.name,
      company?.name ?? '',
      company?.industry ?? '',
      statusLabels[p.status] ?? p.status,
      p.amount.toString(),
      p.assignedTo,
      p.startDate,
      p.expectedCloseDate,
      p.description,
    ]
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}
