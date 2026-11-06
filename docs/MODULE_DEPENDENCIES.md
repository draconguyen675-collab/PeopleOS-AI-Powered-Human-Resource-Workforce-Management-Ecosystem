# Enterprise module dependency graph

The October 19 continuation request is preserved in ENTERPRISE_REQUIREMENTS.md. It directs implementation to proceed in coherent vertical slices while environmental release blockers remain explicit. The original Phase 0 gate remains a release gate, not a prohibition on further local development. FEATURE_MATRIX.md remains the feature-level inventory; a partial capability does not complete a module.

This adjacency table defines the dependency graph: each row points to prerequisite modules by ID. Dependencies describe the first operational release; later optional integrations can connect additional modules without blocking their initial domain workflows. All modules inherit authentication, tenant scope, RBAC and audit from 01. Existing scope is an audit of working code, not a claim of complete enterprise coverage.

| ID | Module | Prerequisites | Current scope / next gap |
| --- | --- | --- | --- |
| 01 | Authentication & SaaS | — | Partial: login/logout, sessions, fixed RBAC; provisioning, recovery, MFA/SSO remain |
| 02 | Employee management | 01, 03 | Work-profile CRUD/archive/restore tested; personal data, history, custom fields, import/export remain |
| 03 | Organization management | 01 | Department CRUD/hierarchy and position catalog/employee links tested; legal entities, teams, grades and org chart remain |
| 04 | Employee lifecycle | 02, 03 | Planned: lifecycle transitions and effective-dated employment changes |
| 05 | Documents | 01, 02 | Planned: private object storage, metadata, versions and authorized download |
| 06 | Attendance | 02, 03 | Planned: attendance records and adjustment approvals |
| 07 | Shift & scheduling | 02, 03 | Planned: templates, assignments and conflicts |
| 08 | Leave | 02, 03 | Planned: policies, ledgers and approval workflow |
| 09 | Timesheets | 02 | Planned: projects, time entries and approval |
| 10 | Payroll | 06, 07, 08, 09, 11, 12, 13 | Planned: validated payroll cycles, calculations, approvals and locks |
| 11 | Compensation | 02, 03 | Planned: restricted salary history, bands and reviews |
| 12 | Benefits | 02 | Planned: catalog, eligibility and enrollment |
| 13 | Vietnam compliance | 02, 11 | Planned: sourced, effective-dated rules and independently verified calculations |
| 14 | Recruitment / ATS | 03 | Planned: requisitions, candidates and human-reviewed hiring stages |
| 15 | AI recruiting | 14, 19, 38, 43 | Planned: provider-backed parsing/matching with human oversight |
| 16 | Onboarding | 04, 05 | Planned: templates, assignments, checklists and completion |
| 17 | Performance | 02, 03 | Planned: review cycles, assignments and restricted feedback |
| 18 | Goals / OKR / KPI | 02, 03 | Planned: aligned goals and check-ins |
| 19 | Skills intelligence | 02, 03 | Planned: taxonomy, proficiency and role requirements |
| 20 | Learning | 02, 19 | Planned: courses, enrollment and completion |
| 21 | Career GPS | 03, 19, 20 | Planned: target roles and development plans |
| 22 | Internal talent marketplace | 02, 03, 19 | Planned: gigs, applications and internal opportunities |
| 23 | Succession | 03, 17, 19 | Planned: critical roles, readiness and access restrictions |
| 24 | Workforce planning | 02, 03, 11 | Planned: headcount and cost plans |
| 25 | Organizational digital twin | 03, 19, 24 | Planned: versioned snapshots and proposed changes |
| 26 | Scenario simulator | 24, 25 | Planned: explicit assumptions, comparable results and versioned scenarios |
| 27 | Engagement | 02, 03 | Planned: surveys, anonymous collection and minimum cohort reporting |
| 28 | Recognition | 02 | Planned: kudos, values and moderated feed |
| 29 | HR helpdesk | 02, 05 | Planned: tickets, assignment, SLA and knowledge base |
| 30 | Employee self-service | 02, 06, 08, 10, 12, 20, 21 | Planned: identity-to-employee binding and own-resource authorization |
| 31 | Workflow automation | 01, 44 | Planned: versioned graphs, validation, executions, retries and idempotent actions |
| 32 | AI workflow builder | 31, 38, 43 | Planned: draft generation, validation, simulation and explicit approval |
| 33 | Policy-as-code | 01, 44 | Planned: safe rule vocabulary, versions, effective dates and tests |
| 34 | Workflow marketplace | 31 | Planned: templates, installation and version tracking |
| 35 | AI copilot | 05, 38, 43 | Planned: authorized retrieval, model integration and auditable tool proposals |
| 36 | AI agents | 31, 35, 38 | Planned: domain tools constrained by backend permissions |
| 37 | AI agent builder | 36, 38 | Planned: configuration, versioned tests and execution history |
| 38 | AI governance | 01, 43 | Planned: model controls, approval policies, costs and kill switch |
| 39 | Identity & access | 01, 02, 43 | Planned: provider-backed SSO/provisioning and access reviews |
| 40 | Device management | 02, 43 | Planned: inventory, assignments and explicitly labeled MDM adapters |
| 41 | Asset management | 02, 03 | Planned: inventory and audited assignment/return workflow |
| 42 | People analytics | 02, 03 | Partial: live workforce overview; add reports only as underlying modules exist |
| 43 | Integration platform | 01 | Planned: connections, secrets, webhooks, delivery history and retries |
| 44 | Platform administration | 01 | Partial: company settings, fixed role catalog and audit; configuration/branding/custom fields remain |

## Prioritized execution

1. Publish the verified core HR checkpoint and finish Netlify + Render + Neon deployment after account connection.
2. Retain tested employee/department/position workflows; continue organization gaps (legal entities, teams, grades and reporting).
3. Employee lifecycle/history and private document storage, followed by identity-to-employee binding.
4. Attendance, scheduling, leave ledgers/approvals, timesheets, compensation and benefits.
5. Sourced Vietnam compliance calculations and payroll controls; provider credentials and legal-rule verification are explicit prerequisites.
6. Talent workflows, employee experience, asset/device records and operational analytics.
7. Workflow/policy infrastructure, integrations and governance before any AI-assisted actions.
8. Planning/simulation, connected AI capabilities and integration-dependent workflows.

Each slice needs persistence, backend authorization, real UI, negative-path tests, responsive checks and documentation. Missing external credentials yield a clearly identified unconnected integration; no fabricated provider results or payroll/AI readiness claims. Retain the existing visual system and expose navigation only for working workflows.
