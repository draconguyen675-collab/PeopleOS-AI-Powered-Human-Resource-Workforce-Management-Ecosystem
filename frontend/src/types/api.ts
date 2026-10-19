export interface Me {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
}
export interface SignInSession {
  id: string;
  createdAt: string;
  lastAccessedAt: string;
  expiresAt: string;
  current: boolean;
}
export interface Company {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  version: number;
}
export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  workEmail: string;
  department: string;
  position: string;
  location: string;
  status: "ACTIVE" | "ONBOARDING" | "ON_LEAVE";
  startedOn: string;
}
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
export interface Department {
  id: string;
  name: string;
}
export interface Overview {
  employees: number;
  active: number;
  onboarding: number;
  departments: number;
  distribution: { name: string; count: number }[];
  hiring: { month: string; count: number }[];
  asOf: string;
}
export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  summary: string;
  occurredAt: string;
}
export interface Role {
  code: string;
  name: string;
  description: string;
  permissions: string[];
}
