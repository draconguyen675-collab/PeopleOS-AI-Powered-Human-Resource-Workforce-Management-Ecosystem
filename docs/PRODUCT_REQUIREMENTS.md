# MASTER PROMPT — BUILD PEOPLEOS ENTERPRISE HRM SAAS

## 1. YOUR ROLE

You are an elite software engineering team consisting of:

- Principal Software Architect
- Senior Java Spring Boot Engineer
- Senior React/TypeScript Engineer
- Senior UI/UX Product Designer
- PostgreSQL Database Architect
- Application Security Engineer
- DevOps Engineer
- QA Automation Engineer
- AI Engineer
- HR Domain Specialist
- Vietnamese Payroll and Labor Compliance Specialist

Your mission is to architect and implement a production-oriented, enterprise-grade, multi-tenant Human Resource Management SaaS platform named **PeopleOS**.

The product combines the capabilities of Workday HCM, Rippling, and MISA AMIS HRM, with additional AI-native features, advanced automation, workforce intelligence, skills intelligence, and employee experience.

This must be a real, functional full-stack application, not a static UI prototype.

**Mandatory requirements:**

1. Write clean, readable, maintainable, modular code.
2. Implement a real Java Spring Boot backend.
3. Implement a fully responsive React frontend.
4. Connect frontend features to real backend APIs.
5. Use PostgreSQL for persistent data.
6. Implement secure authentication and authorization.
7. Implement proper validation and error handling.
8. Provide realistic, deterministic demo seed data.
9. Support light and dark themes.
10. Implement automated tests.
11. Provide Docker-based local development.
12. Follow accessibility and security best practices.
13. Avoid incomplete features, broken imports, placeholder implementations, and fake functionality.
14. Maintain documentation throughout development.
15. Prioritize reliable, working vertical slices over generating large amounts of disconnected code.

Do not claim production readiness without the required security, compliance, testing, and operational verification.

---

# 2. PRODUCT VISION

Product Name: PeopleOS

Category: Enterprise HRM / HCM / People Operations / Workforce Management SaaS.

Target customers:

- Startups
- SMEs
- Medium-sized companies
- Large enterprises
- Multinational organizations
- Vietnamese companies
- International companies

Supported user types:

- Platform Super Admin
- Tenant Owner
- Company Administrator
- HR Administrator
- HR Specialist
- Payroll Specialist
- Recruiter
- Hiring Manager
- Department Manager
- Finance Manager
- IT Administrator
- Employee
- External Candidate
- Auditor
- Custom Roles

Core product principles:

- Employee-centric
- AI-native
- Automation-first
- Multi-tenant
- API-first
- Mobile-responsive
- Accessible
- Secure by design
- Explainable AI
- Localization-ready
- Enterprise-scalable

---

# 3. MANDATORY TECHNOLOGY STACK

## 3.1 Frontend

Use:

- React
- TypeScript with strict mode
- Vite
- React Router
- Tailwind CSS v4
- shadcn/ui
- Radix UI
- Lucide React
- TanStack Query
- TanStack Table
- React Hook Form
- Zod
- Zustand
- Axios or typed Fetch API
- Recharts
- Apache ECharts where advanced charts are needed
- React Flow / @xyflow/react
- React DnD or dnd-kit
- date-fns
- i18next
- Vitest
- React Testing Library
- Playwright

Use stable, mutually compatible versions.

Tailwind CSS v4 must use the CSS-first configuration approach.

Do not introduce a legacy Tailwind configuration unless a specific integration genuinely requires it.

## 3.2 Backend

Mandatory:

- Java 25 LTS, subject to verified framework compatibility
- Spring Boot, latest compatible stable version
- Maven
- Spring Web MVC
- Spring Security
- Spring Data JPA
- Hibernate
- Spring Validation
- Spring Actuator
- Spring OAuth2 Resource Server where applicable
- Spring Mail
- Spring Cache
- Spring Scheduling
- Spring WebSocket or SSE where justified
- Spring AI for supported AI integrations
- Flyway
- PostgreSQL JDBC
- JUnit 5
- Mockito
- AssertJ
- Testcontainers
- REST Assured
- springdoc-openapi compatible with the selected Spring Boot version

**Use application.properties, not application.yml.**

Do not mix incompatible framework or dependency versions.

## 3.3 Database and infrastructure

- PostgreSQL as the primary relational database
- Redis for caching and rate limiting where required
- S3-compatible object storage
- MinIO for local object-storage development
- PostgreSQL pgvector for approved AI retrieval use cases
- PostgreSQL full-text search initially
- OpenSearch only when justified by scale
- Temporal for durable long-running workflows when introduced
- Kafka only when event volume and architecture justify it

## 3.4 Authentication

Use Spring Security with secure, standards-based authentication.

Support:

- Email/password
- Secure password hashing
- Email verification
- Password reset
- MFA
- OIDC integration
- Google/Microsoft login through configured identity providers
- Enterprise SSO extension points
- RBAC
- Resource-level authorization
- Field-level permissions
- Tenant isolation
- Session management
- Refresh-token rotation if token-based sessions are used

Do not store sensitive tokens in localStorage.

## 3.5 DevOps

- Git
- GitHub Actions
- Docker
- Docker Compose
- Environment variables
- Health checks
- Structured logging
- OpenTelemetry
- Prometheus/Grafana where justified
- Sentry-compatible error monitoring
- Automated database migration
- CI testing
- Dependency vulnerability scanning

Do not require Kubernetes for local development.

---

# 4. SYSTEM ARCHITECTURE

Use a modular monolith initially.

Do not create dozens of microservices.

Backend structure:

```text
backend/
├── pom.xml
├── Dockerfile
├── src/
│   ├── main/
│   │   ├── java/com/peopleos/
│   │   │   ├── PeopleOsApplication.java
│   │   │   ├── shared/
│   │   │   │   ├── config/
│   │   │   │   ├── security/
│   │   │   │   ├── exception/
│   │   │   │   ├── audit/
│   │   │   │   ├── pagination/
│   │   │   │   └── events/
│   │   │   └── modules/
│   │   │       ├── identity/
│   │   │       ├── tenant/
│   │   │       ├── organization/
│   │   │       ├── employee/
│   │   │       ├── lifecycle/
│   │   │       ├── document/
│   │   │       ├── attendance/
│   │   │       ├── scheduling/
│   │   │       ├── leave/
│   │   │       ├── timesheet/
│   │   │       ├── payroll/
│   │   │       ├── compensation/
│   │   │       ├── benefits/
│   │   │       ├── compliance/
│   │   │       ├── recruitment/
│   │   │       ├── onboarding/
│   │   │       ├── performance/
│   │   │       ├── goals/
│   │   │       ├── skills/
│   │   │       ├── learning/
│   │   │       ├── career/
│   │   │       ├── succession/
│   │   │       ├── workforceplanning/
│   │   │       ├── engagement/
│   │   │       ├── recognition/
│   │   │       ├── helpdesk/
│   │   │       ├── workflow/
│   │   │       ├── policy/
│   │   │       ├── integration/
│   │   │       ├── identityaccess/
│   │   │       ├── devices/
│   │   │       ├── assets/
│   │   │       ├── analytics/
│   │   │       ├── ai/
│   │   │       ├── notification/
│   │   │       └── administration/
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/
│   └── test/
```

Every business module should use consistent layers:

```text
module/
├── api/
│   ├── Controller
│   ├── Request DTO
│   └── Response DTO
├── application/
│   ├── Service
│   ├── Command
│   └── Query
├── domain/
│   ├── Entity
│   ├── Value Object
│   ├── Repository Interface
│   └── Domain Rules
└── infrastructure/
    ├── Persistence
    ├── External Adapters
    └── Event Handlers
```

Keep module boundaries explicit.

Never expose JPA entities directly through REST APIs.

Use transactions carefully and avoid N+1 queries.

---

# 5. FRONTEND ARCHITECTURE

```text
frontend/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   └── layouts/
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   ├── charts/
│   │   ├── tables/
│   │   ├── forms/
│   │   └── feedback/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── organization/
│   │   ├── attendance/
│   │   ├── scheduling/
│   │   ├── leave/
│   │   ├── timesheets/
│   │   ├── payroll/
│   │   ├── recruitment/
│   │   ├── onboarding/
│   │   ├── performance/
│   │   ├── skills/
│   │   ├── learning/
│   │   ├── workflows/
│   │   ├── analytics/
│   │   ├── ai/
│   │   └── settings/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── styles/
│   └── test/
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

Use feature-based organization.

Separate:

- Presentation
- API clients
- Query hooks
- Validation schemas
- Feature-specific types
- Business logic
- Reusable components

Avoid giant components.

Avoid excessive global state.

Use TanStack Query for server state and Zustand only for suitable client state.

Generate typed API clients from OpenAPI where practical.

---

# 6. DESIGN SYSTEM

Create a professional enterprise SaaS design system.

Visual direction:

- Modern
- Clean
- Minimal
- Premium
- Highly readable
- Data-dense but organized
- Inspired by contemporary enterprise SaaS interfaces
- Original visual identity
- No copying proprietary product interfaces

Use semantic design tokens.

Support:

- Light mode
- Dark mode
- System theme
- Responsive typography
- Accessible contrast
- Keyboard navigation
- Focus indicators
- Reduced motion

Components:

- Buttons
- Inputs
- Selects
- Comboboxes
- Date pickers
- Date range pickers
- Checkboxes
- Radios
- Switches
- Textareas
- File upload
- Avatar
- Badge
- Tooltip
- Popover
- Dropdown
- Dialog
- Drawer
- Tabs
- Accordion
- Breadcrumb
- Pagination
- Data table
- Advanced filters
- Column visibility
- Bulk action toolbar
- Status indicators
- Skeletons
- Empty states
- Error states
- Toast notifications
- Confirmations
- Charts
- Calendars
- Timeline
- Org chart nodes
- Workflow nodes
- AI chat interface
- AI suggestion cards
- Approval interface
- Audit timeline

Use consistent spacing, typography, radii, shadows and icon sizes.

---

# 7. RESPONSIVE REQUIREMENTS

Every frontend screen must support:

- 320px mobile viewport
- 375px mobile viewport
- 390px mobile viewport
- 768px tablet
- 1024px laptop/tablet
- 1280px desktop
- 1440px desktop
- 1920px large desktop

Responsive behavior:

### Desktop

- Persistent sidebar
- Global header
- Full data tables
- Multi-column layouts
- Detailed analytics
- Advanced filters

### Tablet

- Collapsible sidebar
- Adaptive grids
- Reduced table columns
- Compact navigation
- Touch-friendly controls

### Mobile

- Drawer navigation
- Single-column layouts
- Responsive cards
- Condensed dashboards
- Mobile-friendly forms
- Responsive dialogs
- Appropriately transformed data tables
- Touch-friendly date selection
- Sticky primary actions when appropriate

Never rely on horizontal page overflow.

Allow deliberate horizontal scrolling only inside suitable data tables or specialized canvases.

Org charts and workflow editors must provide mobile-friendly navigation, zoom, and a structured list alternative.

All features must remain usable on mobile, including approvals and employee management.

Test keyboard accessibility and touch interactions.

---

# 8. COMPLETE FEATURE SCOPE

Implement the following business domains.

Each domain must have:

- Database entities
- Backend services
- REST endpoints
- Request validation
- Authorization
- Audit logging where required
- Frontend routes
- Real API integration
- Loading states
- Empty states
- Error states
- Relevant automated tests

## MODULE 01 — PLATFORM & AUTHENTICATION

Features:

- Registration
- Login
- Logout
- Password reset
- Email verification
- MFA
- Account profile
- Session management
- Tenant creation
- Tenant switching
- Company configuration
- Custom roles
- Permission management
- User invitations
- Security settings
- Login audit
- Subscription architecture
- Feature entitlements

## MODULE 02 — EMPLOYEE MANAGEMENT

Features:

- Employee directory
- Employee 360 profile
- Personal information
- Employment details
- Employee identifiers
- Department
- Position
- Manager
- Location
- Employment type
- Employment status
- Emergency contacts
- Dependents
- Qualifications
- Certifications
- Work history
- Compensation history with restricted access
- Documents
- Skills
- Goals
- Performance history
- Employee search
- Advanced filtering
- Bulk import
- Bulk export
- Bulk updates
- Employee status changes
- Employee activity timeline

## MODULE 03 — ORGANIZATION

Features:

- Legal entities
- Business units
- Divisions
- Departments
- Teams
- Locations
- Cost centers
- Positions
- Job families
- Job grades
- Reporting relationships
- Multiple reporting lines
- Interactive organization chart
- Vacant positions
- Position history
- Organization changes
- Department budgets
- Organization analytics

## MODULE 04 — EMPLOYEE LIFECYCLE

Features:

- Pre-hire
- Onboarding
- Probation
- Active employment
- Promotion
- Transfer
- Role changes
- Salary changes
- Long-term leave
- Return to work
- Offboarding
- Exit interviews
- Final settlement preparation
- Alumni records
- Lifecycle workflows
- Approval requirements

## MODULE 05 — DOCUMENT MANAGEMENT

Features:

- Document library
- Employee documents
- Contract templates
- Offer letters
- Contract amendments
- HR decisions
- Company policies
- File upload
- File preview
- Version history
- Document permissions
- Expiration alerts
- Approval workflows
- E-signature integration interfaces
- OCR integration
- AI document extraction
- AI document summaries

## MODULE 06 — ATTENDANCE

Features:

- Web check-in
- Mobile browser check-in
- GPS-based attendance with explicit permissions
- Geofencing
- QR attendance
- Wi-Fi validation where technically feasible
- Face-verification integration extension
- Attendance device integration
- Clock-in
- Clock-out
- Break tracking
- Late arrivals
- Early departures
- Missing attendance
- Attendance adjustments
- Approval workflow
- Attendance reports
- Attendance anomaly review

Do not pretend a browser can securely perform native biometric or Wi-Fi hardware verification without an appropriate platform integration.

## MODULE 07 — SHIFT & SCHEDULING

Features:

- Fixed shifts
- Flexible shifts
- Rotating shifts
- Overnight shifts
- Split shifts
- Shift templates
- Shift calendar
- Shift assignment
- Shift swapping
- Open shifts
- Employee availability
- Staffing requirements
- Overtime planning
- Schedule approvals
- Schedule conflicts
- AI-assisted schedule suggestions

## MODULE 08 — LEAVE MANAGEMENT

Features:

- Annual leave
- Sick leave
- Maternity leave
- Paternity leave
- Unpaid leave
- Compensatory leave
- Custom leave types
- Leave balances
- Accrual policies
- Carry-over
- Leave expiration
- Leave requests
- Multi-level approvals
- Team leave calendar
- Holiday calendars
- Delegated approvals
- Leave analytics

## MODULE 09 — TIMESHEET

Features:

- Project time tracking
- Task time tracking
- Manual entries
- Timer
- Billable hours
- Non-billable hours
- Overtime
- Timesheet submission
- Manager approval
- Utilization reporting
- Project labor costs

## MODULE 10 — PAYROLL

Features:

- Payroll periods
- Payroll groups
- Salary structures
- Base salary
- Allowances
- Bonuses
- Commissions
- Overtime
- Retroactive adjustments
- Deductions
- Unpaid leave adjustments
- Insurance deductions
- PIT calculations
- Gross-to-net calculations
- Payroll validation
- Payroll previews
- Payroll approvals
- Payroll locking
- Payslip generation
- Payslip history
- Bank export
- Accounting export
- Final settlements
- Payroll audit trail
- Payroll anomaly detection
- Explainable payroll calculations

Use BigDecimal for monetary calculations.

Never use floating-point arithmetic for payroll.

Use configurable, effective-dated payroll rules.

Do not hardcode legal contribution rates or tax thresholds without verified source, jurisdiction, and effective dates.

## MODULE 11 — COMPENSATION

Features:

- Salary bands
- Job grades
- Compensation structures
- Salary review cycles
- Merit increases
- Promotion increases
- Bonus planning
- Variable compensation
- Commission plans
- Compensation budgets
- Pay history
- Total rewards statements
- Approval workflows

## MODULE 12 — BENEFITS

Features:

- Benefit plans
- Eligibility
- Enrollment
- Dependents
- Allowances
- Insurance plans
- Flexible benefits
- Benefit periods
- Benefit costs
- Benefit history
- Benefit administration

## MODULE 13 — VIETNAM COMPLIANCE

Features:

- BHXH
- BHYT
- BHTN
- PIT/TNCN
- Dependent deductions
- Insurance contribution rules
- Labor contract tracking
- Probation tracking
- Overtime compliance checks
- Leave compliance
- Compliance calendar
- Required document tracking
- Regulatory rule versioning
- Compliance reports
- Electronic declaration integration interfaces

Regulatory calculations must be tested against verified legal requirements before real-world use.

Do not fabricate government integrations.

If a government API is unavailable, implement an explicit export/manual-submission workflow rather than a fake connection.

## MODULE 14 — RECRUITMENT / ATS

Features:

- Recruitment requests
- Hiring approvals
- Job requisitions
- Job descriptions
- Career website
- Public job listings
- Candidate applications
- Candidate profiles
- CV upload
- Candidate pipeline
- Kanban board
- Interview scheduling
- Interview feedback
- Interview scorecards
- Candidate communications
- Offer management
- Candidate talent pools
- Employee referrals
- Candidate deduplication
- Hiring analytics
- Candidate-to-employee conversion

## MODULE 15 — AI RECRUITING

Features:

- CV parsing
- Skills extraction
- Candidate summaries
- Job description generation
- Interview question generation
- Requirement matching
- Evidence-based matching explanations
- Duplicate detection
- Interview note summarization

AI must not make final hiring or rejection decisions.

Do not infer protected characteristics.

Keep human review and explainability.

## MODULE 16 — ONBOARDING

Features:

- Onboarding templates
- Role-specific checklists
- Department-specific checklists
- Employee document collection
- Contract tasks
- Payroll setup tasks
- Benefits setup tasks
- IT account requests
- Equipment requests
- Welcome emails
- Buddy assignment
- Learning assignment
- Probation goals
- Onboarding progress
- Task reminders
- Manager approvals

## MODULE 17 — PERFORMANCE

Features:

- Performance cycles
- Self reviews
- Manager reviews
- Peer reviews
- 360-degree feedback
- Competency assessments
- Continuous feedback
- One-on-one meetings
- Review templates
- Review calibration
- Performance history
- Development plans
- Performance improvement plans

## MODULE 18 — GOALS / OKR / KPI

Features:

- Company goals
- Department goals
- Team goals
- Individual goals
- OKRs
- KPIs
- MBO
- BSC
- Goal alignment
- Goal ownership
- Progress updates
- Check-ins
- Goal scoring
- Goal dashboards
- Goal history

## MODULE 19 — SKILLS INTELLIGENCE

Features:

- Skills taxonomy
- Skill categories
- Skill relationships
- Role requirements
- Employee skill profiles
- Proficiency levels
- Evidence
- Verification
- Skill-gap analysis
- Skill search
- Skill graph
- Team capability mapping
- Skills analytics

## MODULE 20 — LEARNING MANAGEMENT

Features:

- Course catalog
- Learning paths
- Video lessons
- Documents
- Quizzes
- Assignments
- Enrollment
- Progress tracking
- Certificates
- Mandatory training
- Training deadlines
- Learning recommendations
- Skill-based learning paths

## MODULE 21 — CAREER GPS

Features:

- Career profiles
- Career aspirations
- Career paths
- Target roles
- Role requirements
- Skill-gap analysis
- Learning recommendations
- Mentorship
- Development milestones
- Internal opportunities
- Career progress tracking

## MODULE 22 — INTERNAL TALENT MARKETPLACE

Features:

- Internal job board
- Internal project opportunities
- Short-term gigs
- Internal applications
- Employee interests
- Verified skill matching
- Availability tracking
- Mentor discovery
- Internal mobility workflows

## MODULE 23 — SUCCESSION PLANNING

Features:

- Critical positions
- Successor pools
- Readiness assessments
- Development plans
- Talent reviews
- Nine-box matrices
- Succession scenarios
- Succession reporting

## MODULE 24 — WORKFORCE PLANNING

Features:

- Headcount planning
- Hiring forecasts
- Position budgets
- Salary budgets
- Department capacity
- Skill demand
- Location planning
- Workforce costs
- Scenario comparisons
- Planning approvals

## MODULE 25 — ORGANIZATIONAL DIGITAL TWIN

Features:

- Organization representation
- Position mapping
- Employee mapping
- Skills mapping
- Workforce capacity
- Cost allocation
- Historical structures
- Proposed organization changes
- Organizational insights

## MODULE 26 — SCENARIO SIMULATOR

Features:

- Hiring scenarios
- Contractor scenarios
- Internal upskilling scenarios
- Workforce cost projections
- Capacity projections
- Skill-gap projections
- Scenario comparison
- Assumption editing
- Scenario versioning
- Exportable reports

Do not represent uncertain forecasts as guaranteed outcomes.

## MODULE 27 — ENGAGEMENT

Features:

- Pulse surveys
- Employee surveys
- eNPS
- Anonymous feedback
- Survey templates
- Survey scheduling
- Participation reporting
- Engagement trends
- Improvement action plans

Apply privacy-preserving aggregation and minimum group-size thresholds.

## MODULE 28 — RECOGNITION

Features:

- Employee recognition
- Kudos
- Recognition badges
- Company values
- Team celebrations
- Recognition feed
- Optional reward points
- Recognition analytics

## MODULE 29 — HR HELPDESK

Features:

- HR requests
- Ticket categories
- Ticket priority
- SLA policies
- Assignment
- Internal comments
- Employee responses
- Attachments
- Knowledge base
- Ticket status
- Escalation
- Satisfaction surveys
- AI-assisted knowledge search

## MODULE 30 — EMPLOYEE SELF-SERVICE

Features:

- Employee dashboard
- Profile updates
- Attendance
- Leave
- Schedules
- Timesheets
- Payslips
- Benefits
- Goals
- Performance
- Learning
- Career
- Documents
- HR requests
- Notifications
- AI assistant

## MODULE 31 — WORKFLOW AUTOMATION

Features:

- Workflow list
- Workflow templates
- Visual workflow builder
- Trigger nodes
- Condition nodes
- Branch nodes
- Approval nodes
- Action nodes
- Delay nodes
- Notification nodes
- Webhook nodes
- Workflow execution history
- Retry handling
- Failure handling
- Versioning
- Workflow testing
- Publishing
- Rollback
- Workflow permissions

Use durable execution semantics for long-running workflows.

## MODULE 32 — AI WORKFLOW BUILDER

Features:

- Natural-language workflow input
- Structured workflow generation
- Node graph preview
- Validation
- Human review
- Simulation
- Publishing
- Version history

Never execute an AI-generated workflow automatically without required authorization and approval.

## MODULE 33 — POLICY-AS-CODE

Features:

- Policy documents
- Structured rules
- Rule editor
- AI rule suggestions
- Effective dates
- Test cases
- Simulation
- Approval
- Versioning
- Policy publishing
- Audit history

## MODULE 34 — WORKFLOW MARKETPLACE

Features:

- Workflow templates
- Template categories
- Template search
- Template preview
- Template installation
- Template customization
- Template versioning
- Template sharing

## MODULE 35 — AI COPILOT

Features:

- Global AI command interface
- Natural-language search
- HR knowledge Q&A
- Employee search subject to permissions
- Attendance insights
- Payroll explanations
- Document summaries
- Workflow suggestions
- Suggested actions
- AI response citations
- Conversation history
- AI feedback

## MODULE 36 — AI AGENTS

Create extensible agents:

- HR Agent
- Recruiting Agent
- Onboarding Agent
- Payroll Agent
- Compliance Agent
- Learning Agent
- Career Agent
- IT Agent
- Helpdesk Agent
- Analytics Agent

Each agent requires explicit tools, permissions, limits, and approval policies.

## MODULE 37 — AI AGENT BUILDER

Features:

- Agent creation
- Agent instructions
- Knowledge sources
- Tool selection
- Permission configuration
- Human approval rules
- Agent testing
- Execution logs
- Agent versions
- Agent publishing
- Agent disabling

## MODULE 38 — AI GOVERNANCE

Features:

- AI provider configuration
- Model selection
- Agent permissions
- Data-access policies
- Restricted data
- Human approval requirements
- AI audit logs
- Prompt versions
- Model usage
- Token usage
- Cost monitoring
- AI action logs
- Agent kill switch

## MODULE 39 — IDENTITY & ACCESS

Features:

- SSO
- OIDC
- SAML extension
- SCIM integration
- Application access
- User groups
- Access policies
- Provisioning
- Deprovisioning
- Access review
- Permission audit

## MODULE 40 — DEVICE MANAGEMENT

Features:

- Device registry
- Device assignment
- Device ownership
- Device compliance status
- MDM integration adapters
- Software inventory integration
- Device return
- Remote-management action requests

Do not implement fake remote wipe or device-lock capabilities.

## MODULE 41 — ASSET MANAGEMENT

Features:

- Asset categories
- Inventory
- Asset purchases
- Asset assignment
- Asset history
- Repairs
- Returns
- Reassignment
- Depreciation fields
- Asset retirement
- Asset reports

## MODULE 42 — PEOPLE ANALYTICS

Features:

- Headcount analytics
- Hiring analytics
- Turnover
- Retention
- Attendance
- Leave
- Payroll
- Compensation
- Performance
- Skills
- Learning
- Engagement
- Workforce costs
- Custom reports
- Export
- Scheduled reports
- Permission-aware dashboards

## MODULE 43 — INTEGRATION PLATFORM

Features:

- Integration catalog
- Integration configuration
- OAuth connection management
- API credentials
- Webhooks
- Webhook delivery logs
- Retry handling
- External adapters
- API documentation
- Developer sandbox
- Integration health monitoring

## MODULE 44 — PLATFORM ADMINISTRATION

Features:

- Company settings
- Legal entities
- Tenant branding
- Languages
- Currencies
- Time zones
- Roles
- Permissions
- Custom fields
- Custom forms
- Feature flags
- Module configuration
- Notification templates
- Email settings
- API settings
- Audit logs
- Data retention
- Backup administration
- Platform health

---

# 9. REQUIRED APPLICATION ROUTES

Build a complete route architecture.

Example:

```text
/auth/login
/auth/register
/auth/forgot-password

/app/dashboard

/app/people/employees
/app/people/employees/new
/app/people/employees/:id
/app/people/organization
/app/people/positions
/app/people/documents

/app/workforce/attendance
/app/workforce/scheduling
/app/workforce/leave
/app/workforce/timesheets

/app/money/payroll
/app/money/payroll/:id
/app/money/compensation
/app/money/benefits
/app/money/compliance

/app/talent/recruitment
/app/talent/candidates
/app/talent/onboarding
/app/talent/performance
/app/talent/goals
/app/talent/skills
/app/talent/learning
/app/talent/career
/app/talent/succession

/app/planning/headcount
/app/planning/organization
/app/planning/scenarios

/app/experience/engagement
/app/experience/recognition
/app/experience/helpdesk

/app/automation/workflows
/app/automation/workflows/new
/app/automation/workflows/:id
/app/automation/templates
/app/automation/policies

/app/ai/copilot
/app/ai/agents
/app/ai/agents/:id
/app/ai/governance

/app/it/identity
/app/it/devices
/app/it/assets

/app/analytics

/app/integrations

/app/settings/company
/app/settings/roles
/app/settings/security
/app/settings/notifications
/app/settings/audit

/employee/home
/employee/attendance
/employee/leave
/employee/payslips
/employee/learning
/employee/career

/manager/home
/manager/team
/manager/approvals
/manager/performance

/admin/tenants
/admin/subscriptions
/admin/platform
```

Every implemented route must have a functional screen.

Unimplemented future modules must be explicitly marked as planned and excluded from release navigation, not represented as completed.

---

# 10. UI/UX PAGE REQUIREMENTS

For every implemented page:

- Clear page title
- Breadcrumbs where appropriate
- Primary action
- Search
- Filters
- Pagination
- Sorting
- Empty state
- Loading state
- Error state
- Success feedback
- Permission-aware actions
- Responsive layout
- Accessible keyboard interaction

For forms:

- Field labels
- Required indicators
- Validation messages
- Server error mapping
- Cancel/save
- Unsaved-change protection where appropriate
- Confirmation for destructive actions

For tables:

- Search
- Sort
- Filter
- Column visibility
- Pagination
- Row actions
- Bulk selection
- Bulk actions
- Responsive behavior

For dashboards:

- KPI cards
- Trend charts
- Filters
- Date ranges
- Actionable insights
- Drill-down navigation
- Source data consistency

No fake buttons.

No hardcoded dashboards that disagree with backend data.

---

# 11. DATABASE REQUIREMENTS

Design a normalized relational schema.

Core entities include:

```text
tenants
tenant_settings
users
user_sessions
roles
permissions
user_roles
role_permissions

companies
legal_entities
business_units
departments
teams
locations
cost_centers
positions
job_grades
job_families

employees
employee_contacts
employee_dependents
employee_employment
employee_job_history
employee_status_history
employee_documents

contracts
document_templates
document_versions

attendance_records
attendance_adjustments
shift_templates
shift_assignments
leave_types
leave_policies
leave_balances
leave_requests
timesheet_entries

payroll_periods
payroll_runs
payroll_items
payroll_adjustments
payslips
salary_structures
compensation_history
benefit_plans
benefit_enrollments
tax_rules
insurance_rules

job_requisitions
job_postings
candidates
applications
interviews
interview_feedback
offers

onboarding_plans
onboarding_tasks

performance_cycles
performance_reviews
goals
key_results
competencies

skills
skill_relationships
employee_skills
role_skills

courses
lessons
enrollments
learning_progress
certificates

career_paths
development_plans
mentorships
internal_opportunities

succession_plans
workforce_plans
workforce_scenarios

surveys
survey_responses
recognitions
helpdesk_tickets

workflow_definitions
workflow_versions
workflow_executions
workflow_tasks
workflow_approvals

policy_definitions
policy_versions
policy_rules

ai_agents
ai_agent_versions
ai_executions
ai_approvals
ai_usage_logs

integrations
integration_connections
webhook_subscriptions
webhook_deliveries

devices
assets
asset_assignments

notifications
audit_logs
outbox_events
```

Use UUID primary keys where appropriate.

Use tenant_id for tenant-owned entities.

Enforce tenant isolation in services and queries.

Use foreign keys, indexes, unique constraints, and migration scripts.

Use Flyway migrations.

Never use Hibernate automatic schema updates in production.

---

# 12. API REQUIREMENTS

Use REST APIs under:

`/api/v1`

Example:

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/employees
POST   /api/v1/employees
GET    /api/v1/employees/{id}
PATCH  /api/v1/employees/{id}

GET    /api/v1/departments
POST   /api/v1/departments

GET    /api/v1/attendance
POST   /api/v1/attendance/check-in
POST   /api/v1/attendance/check-out

GET    /api/v1/leave/requests
POST   /api/v1/leave/requests
POST   /api/v1/leave/requests/{id}/approve

GET    /api/v1/payroll/runs
POST   /api/v1/payroll/runs
POST   /api/v1/payroll/runs/{id}/validate

GET    /api/v1/recruitment/jobs
POST   /api/v1/recruitment/jobs

GET    /api/v1/workflows
POST   /api/v1/workflows

POST   /api/v1/ai/chat
```

All APIs must have:

- Consistent response structures
- Correct HTTP status codes
- Input validation
- Authorization
- Pagination
- Filtering
- Error responses
- OpenAPI documentation
- Tests

Use idempotency keys for sensitive or retryable operations where appropriate.

---

# 13. SECURITY REQUIREMENTS

Implement:

- Tenant isolation
- RBAC
- Resource ownership checks
- Field-level permissions
- Secure password hashing
- CSRF protection when applicable
- CORS allowlists
- Input validation
- Output encoding
- SQL injection protection
- Rate limiting
- Sensitive data masking
- Encryption in transit
- Secure file access
- Signed download URLs
- Audit logging
- Secret management
- Secure cookie settings
- Backup and recovery procedures

Sensitive information includes:

- Salary
- Bank details
- Identity documents
- Health-related leave data
- Tax information
- Personal contact details
- Performance evaluations

Never expose restricted information through analytics, exports, search, or AI tools.

---

# 14. AI ARCHITECTURE

Use:

```text
Frontend
   ↓
Spring Boot API
   ↓
AI Orchestrator
   ↓
Permission & Policy Layer
   ↓
AI Provider Gateway
   ↓
Model Provider
   ↓
Structured Response
   ↓
Human Approval if needed
   ↓
Domain Application Service
   ↓
Audit
```

Support:

- OpenAI
- Gemini
- Anthropic

Only through configured providers and valid credentials.

Provide an AI-disabled mode so the application can run without paid AI keys.

Do not generate fabricated AI responses and present them as live model results.

AI tools must enforce the same permissions as ordinary APIs.

---

# 15. SEED DATA

Provide a realistic demo tenant.

Example:

Company: NovaTech Vietnam

Departments:

- Human Resources
- Engineering
- Product
- Design
- Finance
- Sales
- Marketing
- Operations
- Customer Support

Seed:

- 100–200 fictional employees
- Multiple departments
- Managers
- Positions
- Locations
- Attendance history
- Leave requests
- Payroll sample data
- Candidates
- Job openings
- Performance reviews
- Goals
- Skills
- Learning courses
- Workflows
- Notifications
- Analytics datasets

All seed data must be fictional.

Use deterministic seeds and reproducible fixtures.

Do not use real personal information.

---

# 16. TESTING

Backend:

- Unit tests
- Service tests
- Repository tests
- Controller tests
- Security tests
- Tenant-isolation tests
- Integration tests
- Payroll calculation tests
- Workflow tests
- API contract tests

Frontend:

- Component tests
- Form validation tests
- Route tests
- API integration tests
- Accessibility tests
- Responsive tests

End-to-end:

- Login
- Create employee
- Update employee
- Create department
- Request leave
- Approve leave
- Check attendance
- Create payroll run
- Validate payroll
- Create job
- Move candidate
- Create workflow
- Run approved workflow

Use Playwright for browser E2E.

Test at desktop, tablet, and mobile viewports.

---

# 17. PERFORMANCE

Requirements:

- Server-side pagination
- Efficient SQL queries
- Appropriate indexes
- Avoid N+1 queries
- Lazy-load frontend routes
- Virtualize very large tables
- Optimize chart rendering
- Cache only suitable data
- Prevent duplicate requests
- Handle large imports asynchronously
- Use background processing for heavy reports

Measure performance rather than claiming arbitrary guarantees.

---

# 18. DEVELOPMENT PHASES

Build the project in the following order.

## PHASE 0 — Foundation

Implement:

- Monorepo structure
- Frontend setup
- Backend setup
- PostgreSQL
- Flyway
- Docker Compose
- CI
- Design system
- Responsive app shell
- Authentication
- Multi-tenant foundation
- Roles and permissions
- Audit logging
- Error handling
- Seed data
- OpenAPI

## PHASE 1 — Core HR

Implement:

- Employee management
- Employee 360
- Organization
- Departments
- Positions
- Employee lifecycle
- Documents

## PHASE 2 — Workforce

Implement:

- Attendance
- Leave
- Scheduling
- Timesheets
- Approvals

## PHASE 3 — Payroll Vietnam

Implement:

- Payroll engine
- Compensation
- Benefits
- Effective-dated rules
- PIT
- Insurance calculations
- Payslips
- Payroll validation
- Payroll audit

Require verified legal test fixtures before production use.

## PHASE 4 — Talent

Implement:

- Recruitment
- Candidate pipeline
- Onboarding
- Performance
- OKR/KPI
- Learning
- Skills

## PHASE 5 — Employee Experience

Implement:

- Employee portal
- Manager portal
- Helpdesk
- Engagement
- Recognition
- Notifications

## PHASE 6 — Automation

Implement:

- Workflow engine
- Visual workflow builder
- Workflow templates
- Approval engine
- Policy-as-Code
- Workflow execution history

## PHASE 7 — AI

Implement:

- AI gateway
- AI Copilot
- RAG
- Recruiting assistance
- Payroll explanation
- AI workflow suggestions
- AI Agent Builder
- AI Governance

## PHASE 8 — Enterprise Intelligence

Implement:

- Skills Graph
- Career GPS
- Internal Talent Marketplace
- Succession
- Workforce planning
- Digital Twin
- Scenario Simulator

## PHASE 9 — IT & Integrations

Implement:

- Identity integrations
- App provisioning
- Device integration adapters
- Asset management
- Integration marketplace
- Webhooks

## PHASE 10 — Production Hardening

Implement:

- Security review
- Performance tests
- Accessibility audit
- Dependency review
- Backup/restore testing
- Disaster recovery documentation
- Monitoring
- Release procedures
- Production deployment documentation

---

# 19. CODE QUALITY RULES

Mandatory:

- SOLID principles where appropriate
- DRY without excessive abstraction
- KISS
- Clear module boundaries
- Meaningful names
- Small focused functions
- Type-safe code
- Consistent error handling
- Centralized validation patterns
- No business logic inside React components
- No business logic inside Spring controllers
- No direct entity exposure
- No unnecessary dependencies
- No unexplained magic values
- No hardcoded secrets
- No disabled security for convenience
- No blanket exception swallowing
- No excessive use of `any`
- No `@ts-ignore` to hide errors
- No unfinished TODOs in release scope
- No fake API integrations

Use comments to explain non-obvious business rules, not obvious code.

---

# 20. IMPLEMENTATION RULES FOR CODEX

You must work directly in the repository.

Before changing code:

1. Inspect the repository.
2. Identify existing architecture and dependencies.
3. Read project instructions.
4. Check what has already been implemented.
5. Identify missing features and failing tests.
6. Create or update the implementation plan.

Create and maintain:

```text
docs/
├── PRODUCT_REQUIREMENTS.md
├── FEATURE_MATRIX.md
├── ARCHITECTURE.md
├── DATABASE.md
├── API_CONTRACTS.md
├── DESIGN_SYSTEM.md
├── RESPONSIVE_GUIDELINES.md
├── SECURITY.md
├── TEST_STRATEGY.md
├── IMPLEMENTATION_PLAN.md
└── DECISIONS.md
```

Maintain a feature matrix with these states:

- Planned
- In Progress
- Implemented
- Tested
- Blocked
- Deferred

For every feature:

1. Define acceptance criteria.
2. Define database changes.
3. Implement backend domain logic.
4. Implement APIs.
5. Add backend tests.
6. Implement frontend.
7. Connect real APIs.
8. Add frontend tests.
9. Test responsive behavior.
10. Run end-to-end tests where appropriate.
11. Update documentation.
12. Mark complete only after verification.

Never mark a feature as completed merely because its UI exists.

---

# 21. BUILD AND VERIFICATION

At the end of each phase run:

Backend:

```bash
./mvnw clean verify
```

Frontend:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

End-to-end:

```bash
npx playwright test
```

Docker:

```bash
docker compose up --build
```

If a command fails:

- Read the error.
- Identify the root cause.
- Fix the implementation.
- Rerun the relevant command.

Do not hide failures.

If a test cannot run because of an unavailable dependency, explicitly report it as unverified.

---

# 22. FINAL DELIVERABLES

The project must eventually contain:

1. Functional React frontend.
2. Responsive desktop/tablet/mobile layouts.
3. Functional Java Spring Boot backend.
4. PostgreSQL database.
5. Flyway migrations.
6. Secure authentication.
7. Multi-tenant authorization.
8. Real CRUD and domain workflows.
9. Typed API integration.
10. Employee/Manager/Admin portals.
11. AI integration architecture.
12. Workflow automation.
13. Automated tests.
14. Docker Compose.
15. Seed data.
16. OpenAPI documentation.
17. Environment configuration examples.
18. Setup documentation.
19. Architecture documentation.
20. Deployment guide.
21. Feature implementation status report.

---

# 23. EXECUTION INSTRUCTIONS

Start by implementing PHASE 0.

Do not attempt to implement all 44 modules in a single unverified code generation pass.

First create the complete architecture and feature matrix.

Then implement Phase 0 as a functional vertical slice.

After Phase 0 passes its acceptance criteria, continue sequentially through the phases, using the feature matrix and existing codebase as the source of truth.

When context, tool limits, or execution time prevent further work:

- Preserve all completed code.
- Update the implementation plan.
- Record current test results.
- Identify the exact next task.
- Do not falsely claim completion.
- Resume from the recorded checkpoint on the next execution.

Always prioritize:

**Correctness → Security → Functional completeness → Clean architecture → Responsive UX → Performance → Extensibility.**

The final objective is a maintainable, production-oriented PeopleOS platform that can evolve from a functional HRM MVP into a comprehensive enterprise People Operating System.