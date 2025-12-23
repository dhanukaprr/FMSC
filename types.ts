
export type UserRole = 'ADMIN' | 'DEPT_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Goal {
  id: string;
  code: string;
  title: string;
}

export interface Objective {
  id: string;
  goalId: string;
  code: string;
  title: string;
}

export interface SubObjective {
  id: string;
  objectiveId: string;
  goalId: string;
  code: string;
  title: string;
}

export type ReportStatus = 'DRAFT' | 'SUBMITTED' | 'REVISION_REQUESTED';

export type EntryStatus = 'Not started' | 'In progress' | 'Completed' | 'Delayed';

export interface ReportEntry {
  id: string;
  reportId: string;
  subObjectiveId: string;
  status: EntryStatus;
  narrative: string;
  metrics?: string;
  challenges?: string;
  supportNeeded?: string;
  evidenceUrl?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  departmentId: string;
  period: string; // YYYY-MM
  status: ReportStatus;
  createdBy: string;
  submittedAt?: string;
  selectedGoals: string[]; // Goal IDs
  entries: ReportEntry[];
}
