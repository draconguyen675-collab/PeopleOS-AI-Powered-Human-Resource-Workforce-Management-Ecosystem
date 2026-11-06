import {
  Building2,
  BriefcaseBusiness,
  History,
  LayoutDashboard,
  Monitor,
  ShieldCheck,
  Users,
} from "lucide-react";

// Module groups are stable; only routes backed by working workflows are registered.
export const navigationGroups = [
  "Workspace",
  "People",
  "Workforce",
  "Payroll & Benefits",
  "Talent",
  "Planning",
  "Employee Experience",
  "Automation",
  "AI Workforce",
  "IT Management",
  "Analytics",
  "Administration",
  "Your account",
] as const;
type NavigationGroup = (typeof navigationGroups)[number];
export const links: {
  path: string;
  label: string;
  icon: typeof Users;
  permission: string;
  group: NavigationGroup;
}[] = [
  {
    path: "/app/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    permission: "dashboard:read",
    group: "Workspace",
  },
  {
    path: "/app/people/employees",
    label: "People directory",
    icon: Users,
    permission: "employees:read",
    group: "People",
  },
  {
    path: "/app/people/departments",
    label: "Departments",
    icon: Building2,
    permission: "organization:read",
    group: "People",
  },
  {
    path: "/app/people/positions",
    label: "Positions",
    icon: BriefcaseBusiness,
    permission: "organization:read",
    group: "People",
  },
  {
    path: "/app/settings/company",
    label: "Company",
    icon: Building2,
    permission: "company:read",
    group: "Administration",
  },
  {
    path: "/app/settings/roles",
    label: "Roles & permissions",
    icon: ShieldCheck,
    permission: "roles:read",
    group: "Administration",
  },
  {
    path: "/app/settings/audit",
    label: "Activity & audit",
    icon: History,
    permission: "audit:read",
    group: "Administration",
  },
  {
    path: "/app/settings/security",
    label: "Sign-in sessions",
    icon: Monitor,
    permission: "",
    group: "Your account",
  },
];
