# PEOPLEOS — COMPLETE ALL 44 ENTERPRISE MODULES

You are a Principal Software Architect, Senior React Engineer, Senior Java Spring Boot Engineer, Database Architect, Security Engineer, QA Lead, and Enterprise HRM Product Architect.

## MISSION

Complete the existing PeopleOS SaaS application with ALL 44 required modules.

The current application only visibly exposes Overview, People Directory, Company, Roles & Permissions, Activity & Audit, and Sign-in Sessions.

This is NOT the final scope.

Your objective is to implement the complete enterprise PeopleOS product with real frontend, backend, database, API integrations, authorization, responsive layouts, and automated tests.

Do not recreate the project from scratch.

Preserve the existing premium, minimal, light-green PeopleOS visual identity.

## 1. MANDATORY TECHNOLOGIES

FRONTEND:
- React
- Vite
- TypeScript strict
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Zustand
- React Flow
- Recharts / ECharts
- Lucide React
- React Router
- Vitest
- Playwright

BACKEND:
- Java
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Spring Validation
- Maven
- Spring Actuator
- Spring AI where appropriate
- OpenAPI
- JUnit 5
- Mockito
- Testcontainers

DATABASE:
- PostgreSQL
- Flyway
- Redis where justified
- MinIO / S3-compatible storage
- pgvector where needed

ARCHITECTURE:
- Modular Monolith
- Multi-tenant SaaS
- REST API
- Domain-oriented modules
- RBAC and resource-level authorization
- Clean Architecture principles
- SOLID
- Secure by design

Use application.properties for Spring Boot configuration.

## 2. IMPLEMENT ALL 44 MODULES

### PLATFORM & CORE HR

01. Authentication & SaaS
- Registration, login, logout, password reset, MFA, SSO integration, tenant management, sessions, roles, permissions.

02. Employee Management
- Employee 360 profile, employment information, personal data, history, custom fields, search, filters, CRUD, bulk operations, import/export.

03. Organization Management
- Companies, legal entities, branches, departments, teams, positions, job grades, cost centers, interactive org chart.

04. Employee Lifecycle
- Pre-hire, onboarding, probation, promotion, transfer, employment changes, offboarding, alumni.

05. Document Management
- Contracts, templates, file upload, secure storage, document versions, expiration alerts, approval, e-signature adapters, OCR integration.

### WORKFORCE

06. Attendance
- Check-in/out, GPS, QR, geofence, attendance adjustments, anomalies, reports, biometric device integration interfaces.

07. Shift & Scheduling
- Shift templates, fixed/rotating shifts, scheduling calendar, shift swaps, overtime, staffing requirements.

08. Leave Management
- Leave types, policies, balances, accrual, requests, approvals, holiday calendars, carry-over.

09. Timesheet
- Project/task tracking, time entries, timer, billable hours, approvals, reports.

### PAYROLL & BENEFITS

10. Payroll
- Payroll cycles, salary calculations, gross/net, OT, deductions, bonuses, payslips, payroll validation, approvals, locking, audit.

11. Compensation
- Salary bands, grades, increases, bonuses, compensation reviews, budgets, history.

12. Benefits
- Benefits catalog, eligibility, enrollment, allowances, insurance plans, employee benefits.

13. Vietnam Compliance
- PIT/TNCN, BHXH, BHYT, BHTN, labor compliance, effective-dated regulatory rules, reporting.

### TALENT

14. Recruitment / ATS
- Job requisitions, career portal, job postings, candidates, application pipeline, interviews, offers, talent pool.

15. AI Recruiting
- CV parsing, skill extraction, requirement matching, explainable recommendations, interview question suggestions.

16. Onboarding
- Onboarding templates, tasks, equipment, accounts, documents, training, probation plans.

17. Performance
- Performance cycles, self-review, manager review, peer review, 360 feedback, calibration, PIP.

18. Goals / OKR / KPI
- Company/team/employee goals, OKRs, KPIs, progress, check-ins, goal alignment.

19. Skills Intelligence
- Skills taxonomy, proficiency, verified skills, skills graph, gaps, role requirements.

20. Learning Management
- Courses, lessons, quizzes, enrollments, learning paths, certificates, progress.

21. Career GPS
- Career paths, target roles, skill gaps, development plans, milestones, mentorship.

22. Internal Talent Marketplace
- Internal jobs, internal gigs, projects, applications, skill-based discovery.

23. Succession Planning
- Critical positions, successor pools, readiness, nine-box, development plans.

### WORKFORCE INTELLIGENCE

24. Workforce Planning
- Headcount plans, hiring budgets, capacity, workforce costs, forecasts.

25. Organizational Digital Twin
- Organization representation, positions, skills, capacity, costs, proposed changes.

26. Scenario Simulator
- Hiring vs upskilling vs contractors, cost comparisons, assumptions, scenario versions.

### EMPLOYEE EXPERIENCE

27. Engagement
- Surveys, eNPS, pulse surveys, anonymous feedback, trends, action plans.

28. Recognition
- Kudos, badges, recognition feed, company values, rewards.

29. HR Helpdesk
- Tickets, categories, SLA, assignments, escalation, knowledge base, AI assistance.

30. Employee Self-Service
- Employee dashboard, profile, attendance, leave, payslips, benefits, learning, career, requests.

### AUTOMATION

31. Workflow Automation
- Visual builder, triggers, conditions, branches, approvals, actions, delays, executions, retries, versions.

32. AI Workflow Builder
- Natural-language workflow generation, graph preview, validation, simulation, human approval.

33. Policy-as-Code
- HR policies, structured rules, rule editor, test cases, versions, effective dates, approvals.

34. Workflow Marketplace
- Workflow templates, categories, installation, customization, sharing, versioning.

### AI WORKFORCE

35. AI Copilot
- Global command interface, natural-language queries, RAG, HR knowledge search, permission-aware insights, suggested actions.

36. AI Agents
- HR, Recruiting, Payroll, Onboarding, Compliance, Learning, Career, IT, Helpdesk and Analytics agents.

37. AI Agent Builder
- Agent configuration, instructions, knowledge, tools, permissions, tests, versions, execution history.

38. AI Governance
- Model management, permissions, audit, AI costs, approval policies, restricted data, agent kill switch.

### IT MANAGEMENT

39. Identity & Access
- SSO, OIDC, SAML/SCIM integration, provisioning, deprovisioning, application access, access reviews.

40. Device Management
- Device inventory, assignments, compliance, MDM integration adapters, return requests.

41. Asset Management
- Inventory, purchases, assignment, maintenance, returns, reassignment, retirement.

### ANALYTICS & ADMINISTRATION

42. People Analytics
- Headcount, turnover, retention, hiring, payroll, attendance, performance, learning, skills, custom reports.

43. Integration Platform
- REST API, OAuth connections, webhooks, integration catalog, logs, retries, developer documentation.

44. Platform Administration
- Company settings, tenant settings, branding, custom fields, permissions, notifications, audit, security, feature configuration.

## 3. FRONTEND REQUIREMENTS

Implement all operational screens and routes for the 44 modules.

Create a scalable sidebar grouped by:

- Workspace
- People
- Workforce
- Payroll & Benefits
- Talent
- Planning
- Employee Experience
- Automation
- AI Workforce
- IT Management
- Analytics
- Administration

The sidebar must support:

- Expand/collapse groups
- Active state
- Permission-aware visibility
- Mobile drawer
- Tablet navigation
- Desktop collapse
- Searchable navigation

For every module, implement appropriate:

- Overview
- List
- Detail
- Create
- Edit
- Search
- Filter
- Pagination
- Bulk actions
- Approval
- Reports
- Settings

Only create screens relevant to that module's actual workflows.

Do not create meaningless generic CRUD pages.

## 4. RESPONSIVE REQUIREMENTS

Support 320px, 375px, 390px, 768px, 1024px, 1280px, 1440px, and 1920px.

Desktop:
- Full sidebar
- Multi-column layouts
- Advanced tables
- Detailed charts

Tablet:
- Collapsible sidebar
- Adaptive grids
- Compact tables

Mobile:
- Navigation drawer
- Single-column layouts
- Responsive forms
- Mobile-friendly cards
- Accessible dialogs
- Touch-friendly interactions

All 44 modules must have usable responsive web interfaces.

## 5. BACKEND REQUIREMENTS

For every module implement:

- Domain models
- Entities
- Repository interfaces
- Application services
- REST controllers
- DTOs
- Validation
- Authorization
- Exception handling
- Audit logging where applicable
- Database migrations
- Unit tests
- Integration tests

Never implement business rules solely in frontend code.

Use BigDecimal for monetary calculations.

Use transactions and idempotency for critical financial and approval operations.

## 6. SECURITY REQUIREMENTS

- Tenant isolation
- RBAC
- Resource-level permissions
- Sensitive field restrictions
- Secure sessions
- Password hashing
- Input validation
- Audit logs
- Secure document access
- Data retention
- API rate limiting

AI must never bypass backend authorization.

Hiring and employment-impacting decisions must retain human oversight.

## 7. COMPLETION CRITERIA

A module is complete only when:

1. Frontend screens exist.
2. Backend services exist.
3. Database persistence works.
4. Real APIs connect frontend and backend.
5. Core business workflows work end-to-end.
6. Authorization is enforced.
7. Validation and error handling work.
8. Responsive behavior is verified.
9. Relevant tests pass.
10. Documentation is updated.

A sidebar link alone does not count as implementation.

A static dashboard alone does not count as implementation.

A fake API response does not count as implementation.

An integration adapter without a connected provider must be identified as an adapter, not a functioning external integration.

## 8. EXECUTION STRATEGY

First inspect the existing repository.

Preserve all functioning code.

Create a full 44-module feature matrix and dependency graph.

Implement the missing modules through coherent vertical slices.

Continue automatically through the prioritized implementation backlog within the available execution session.

Do not stop after updating the sidebar.

Do not stop after creating documentation.

Do not declare the project complete until all 44 modules satisfy the defined acceptance criteria.

At each checkpoint:

- Save working code.
- Run available tests.
- Fix build errors.
- Update implementation status.
- Record blockers.
- Record the exact next task.

If execution limits prevent completing all modules, preserve progress and resume in the next session without pretending that the remaining work is complete.

## 9. FINAL EXPECTATION

Deliver a complete, scalable PeopleOS Enterprise HRM SaaS with:

- All 44 functional modules
- Clean React frontend
- Fully responsive web UI
- Real Java Spring Boot backend
- PostgreSQL database
- Multi-tenant architecture
- Secure authentication and authorization
- Real API integrations
- AI and automation capabilities
- Automated tests
- Docker local development
- Clear documentation

Start by auditing the current project, then immediately continue implementing the missing functionality.

Do not rebuild the existing PeopleOS UI unnecessarily.

Build real functionality, not merely visual completeness.