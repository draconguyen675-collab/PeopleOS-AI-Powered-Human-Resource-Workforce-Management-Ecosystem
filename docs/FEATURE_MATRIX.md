# Feature matrix

All requested features are tracked below. Planned features are excluded from release navigation. Phase 0 foundation progress is tracked separately in IMPLEMENTATION_PLAN.md; a seeded read-only projection does not complete its business module.

States: Planned, In Progress, Implemented, Tested, Blocked, Deferred.

## Foundation vertical slice (2026-10-16)

These narrowly scoped capabilities are verified. They do not mark their entire business modules complete.

| Capability | Status | Evidence / limits |
| --- | --- | --- |
| Java 25 / Spring Boot build, Flyway and PostgreSQL | Tested | `clean verify`, real PostgreSQL 17.11 |
| Login/logout, CSRF and JDBC session lifecycle | Tested | API and browser security journeys |
| Self-service active session listing and revocation | Tested | Own-account/tenant scope, CSRF, expiry, in-flight save regression, two-browser invalidation, audit and accessible confirmation |
| Authentication OpenAPI contract | Tested | Cookie security, CSRF headers, form login/logout and session paths |
| Tenant-bound identities and tenant-scoped reads | Tested | NovaTech/Orbit isolation tests |
| Fixed owner/HR/viewer permission catalog | Tested | Allowed and forbidden API/UI actions |
| Versioned company name/timezone/currency update | Tested | Validation, conflicts, persistence and audit |
| Read-only directory and work-field search | Tested | Server pagination, search, department/status filters |
| Workforce overview from database records | Tested | Tenant aggregate tests and browser journeys |
| Audit of successful login, logout, session revocation and company changes | Tested | Database/API/browser verification |
| Light/dark/system responsive application shell | Tested | Six screens at eight widths; axe scans in both themes |
| Compose, container health checks and GitHub Actions definitions | Implemented | Docker execution and remote CI not yet verified |
| Frontend dependency scan | Tested | npm audit: zero findings at recorded scan |
| Backend dependency scan | Blocked | NVD update failed; CISA feed returned HTTP 403; no usable advisory data |

Release gate remains open until Docker/CI and the backend dependency scan pass. Registration, invitations, recovery, MFA/SSO, custom-role editing, tenant switching and later modules are not shipped.

## MODULE 01 — PLATFORM & AUTHENTICATION

| Feature | Status |
| --- | --- |
| Registration | Planned |
| Login | Tested |
| Logout | Tested |
| Password reset | Planned |
| Email verification | Planned |
| MFA | Planned |
| Account profile | Planned |
| Session management | Tested (self-service list/revoke; administrator controls planned) |
| Tenant creation | Planned |
| Tenant switching | Planned |
| Company configuration | In Progress |
| Custom roles | Planned |
| Permission management | In Progress |
| User invitations | Planned |
| Security settings | In Progress (session page shipped; MFA/password controls planned) |
| Login audit | In Progress |
| Subscription architecture | Planned |
| Feature entitlements | Planned |

## MODULE 02 — EMPLOYEE MANAGEMENT

| Feature | Status |
| --- | --- |
| Employee directory | Tested |
| Employee 360 profile | Planned |
| Personal information | Planned |
| Employment details | Planned |
| Employee identifiers | Planned |
| Department | Planned |
| Position | Planned |
| Manager | Planned |
| Location | Planned |
| Employment type | Planned |
| Employment status | Planned |
| Emergency contacts | Planned |
| Dependents | Planned |
| Qualifications | Planned |
| Certifications | Planned |
| Work history | Planned |
| Compensation history with restricted access | Planned |
| Documents | Planned |
| Skills | Planned |
| Goals | Planned |
| Performance history | Planned |
| Employee search | Tested |
| Advanced filtering | In Progress |
| Bulk import | Planned |
| Bulk export | Planned |
| Bulk updates | Planned |
| Employee status changes | Planned |
| Employee activity timeline | Planned |

## MODULE 03 — ORGANIZATION

| Feature | Status |
| --- | --- |
| Legal entities | Planned |
| Business units | Planned |
| Divisions | Planned |
| Departments | Planned |
| Teams | Planned |
| Locations | Planned |
| Cost centers | Planned |
| Positions | Planned |
| Job families | Planned |
| Job grades | Planned |
| Reporting relationships | Planned |
| Multiple reporting lines | Planned |
| Interactive organization chart | Planned |
| Vacant positions | Planned |
| Position history | Planned |
| Organization changes | Planned |
| Department budgets | Planned |
| Organization analytics | Planned |

## MODULE 04 — EMPLOYEE LIFECYCLE

| Feature | Status |
| --- | --- |
| Pre-hire | Planned |
| Onboarding | Planned |
| Probation | Planned |
| Active employment | Planned |
| Promotion | Planned |
| Transfer | Planned |
| Role changes | Planned |
| Salary changes | Planned |
| Long-term leave | Planned |
| Return to work | Planned |
| Offboarding | Planned |
| Exit interviews | Planned |
| Final settlement preparation | Planned |
| Alumni records | Planned |
| Lifecycle workflows | Planned |
| Approval requirements | Planned |

## MODULE 05 — DOCUMENT MANAGEMENT

| Feature | Status |
| --- | --- |
| Document library | Planned |
| Employee documents | Planned |
| Contract templates | Planned |
| Offer letters | Planned |
| Contract amendments | Planned |
| HR decisions | Planned |
| Company policies | Planned |
| File upload | Planned |
| File preview | Planned |
| Version history | Planned |
| Document permissions | Planned |
| Expiration alerts | Planned |
| Approval workflows | Planned |
| E-signature integration interfaces | Planned |
| OCR integration | Planned |
| AI document extraction | Planned |
| AI document summaries | Planned |

## MODULE 06 — ATTENDANCE

| Feature | Status |
| --- | --- |
| Web check-in | Planned |
| Mobile browser check-in | Planned |
| GPS-based attendance with explicit permissions | Planned |
| Geofencing | Planned |
| QR attendance | Planned |
| Wi-Fi validation where technically feasible | Planned |
| Face-verification integration extension | Planned |
| Attendance device integration | Planned |
| Clock-in | Planned |
| Clock-out | Planned |
| Break tracking | Planned |
| Late arrivals | Planned |
| Early departures | Planned |
| Missing attendance | Planned |
| Attendance adjustments | Planned |
| Approval workflow | Planned |
| Attendance reports | Planned |
| Attendance anomaly review | Planned |

## MODULE 07 — SHIFT & SCHEDULING

| Feature | Status |
| --- | --- |
| Fixed shifts | Planned |
| Flexible shifts | Planned |
| Rotating shifts | Planned |
| Overnight shifts | Planned |
| Split shifts | Planned |
| Shift templates | Planned |
| Shift calendar | Planned |
| Shift assignment | Planned |
| Shift swapping | Planned |
| Open shifts | Planned |
| Employee availability | Planned |
| Staffing requirements | Planned |
| Overtime planning | Planned |
| Schedule approvals | Planned |
| Schedule conflicts | Planned |
| AI-assisted schedule suggestions | Planned |

## MODULE 08 — LEAVE MANAGEMENT

| Feature | Status |
| --- | --- |
| Annual leave | Planned |
| Sick leave | Planned |
| Maternity leave | Planned |
| Paternity leave | Planned |
| Unpaid leave | Planned |
| Compensatory leave | Planned |
| Custom leave types | Planned |
| Leave balances | Planned |
| Accrual policies | Planned |
| Carry-over | Planned |
| Leave expiration | Planned |
| Leave requests | Planned |
| Multi-level approvals | Planned |
| Team leave calendar | Planned |
| Holiday calendars | Planned |
| Delegated approvals | Planned |
| Leave analytics | Planned |

## MODULE 09 — TIMESHEET

| Feature | Status |
| --- | --- |
| Project time tracking | Planned |
| Task time tracking | Planned |
| Manual entries | Planned |
| Timer | Planned |
| Billable hours | Planned |
| Non-billable hours | Planned |
| Overtime | Planned |
| Timesheet submission | Planned |
| Manager approval | Planned |
| Utilization reporting | Planned |
| Project labor costs | Planned |

## MODULE 10 — PAYROLL

| Feature | Status |
| --- | --- |
| Payroll periods | Planned |
| Payroll groups | Planned |
| Salary structures | Planned |
| Base salary | Planned |
| Allowances | Planned |
| Bonuses | Planned |
| Commissions | Planned |
| Overtime | Planned |
| Retroactive adjustments | Planned |
| Deductions | Planned |
| Unpaid leave adjustments | Planned |
| Insurance deductions | Planned |
| PIT calculations | Planned |
| Gross-to-net calculations | Planned |
| Payroll validation | Planned |
| Payroll previews | Planned |
| Payroll approvals | Planned |
| Payroll locking | Planned |
| Payslip generation | Planned |
| Payslip history | Planned |
| Bank export | Planned |
| Accounting export | Planned |
| Final settlements | Planned |
| Payroll audit trail | Planned |
| Payroll anomaly detection | Planned |
| Explainable payroll calculations | Planned |

## MODULE 11 — COMPENSATION

| Feature | Status |
| --- | --- |
| Salary bands | Planned |
| Job grades | Planned |
| Compensation structures | Planned |
| Salary review cycles | Planned |
| Merit increases | Planned |
| Promotion increases | Planned |
| Bonus planning | Planned |
| Variable compensation | Planned |
| Commission plans | Planned |
| Compensation budgets | Planned |
| Pay history | Planned |
| Total rewards statements | Planned |
| Approval workflows | Planned |

## MODULE 12 — BENEFITS

| Feature | Status |
| --- | --- |
| Benefit plans | Planned |
| Eligibility | Planned |
| Enrollment | Planned |
| Dependents | Planned |
| Allowances | Planned |
| Insurance plans | Planned |
| Flexible benefits | Planned |
| Benefit periods | Planned |
| Benefit costs | Planned |
| Benefit history | Planned |
| Benefit administration | Planned |

## MODULE 13 — VIETNAM COMPLIANCE

| Feature | Status |
| --- | --- |
| BHXH | Planned |
| BHYT | Planned |
| BHTN | Planned |
| PIT/TNCN | Planned |
| Dependent deductions | Planned |
| Insurance contribution rules | Planned |
| Labor contract tracking | Planned |
| Probation tracking | Planned |
| Overtime compliance checks | Planned |
| Leave compliance | Planned |
| Compliance calendar | Planned |
| Required document tracking | Planned |
| Regulatory rule versioning | Planned |
| Compliance reports | Planned |
| Electronic declaration integration interfaces | Planned |

## MODULE 14 — RECRUITMENT / ATS

| Feature | Status |
| --- | --- |
| Recruitment requests | Planned |
| Hiring approvals | Planned |
| Job requisitions | Planned |
| Job descriptions | Planned |
| Career website | Planned |
| Public job listings | Planned |
| Candidate applications | Planned |
| Candidate profiles | Planned |
| CV upload | Planned |
| Candidate pipeline | Planned |
| Kanban board | Planned |
| Interview scheduling | Planned |
| Interview feedback | Planned |
| Interview scorecards | Planned |
| Candidate communications | Planned |
| Offer management | Planned |
| Candidate talent pools | Planned |
| Employee referrals | Planned |
| Candidate deduplication | Planned |
| Hiring analytics | Planned |
| Candidate-to-employee conversion | Planned |

## MODULE 15 — AI RECRUITING

| Feature | Status |
| --- | --- |
| CV parsing | Planned |
| Skills extraction | Planned |
| Candidate summaries | Planned |
| Job description generation | Planned |
| Interview question generation | Planned |
| Requirement matching | Planned |
| Evidence-based matching explanations | Planned |
| Duplicate detection | Planned |
| Interview note summarization | Planned |

## MODULE 16 — ONBOARDING

| Feature | Status |
| --- | --- |
| Onboarding templates | Planned |
| Role-specific checklists | Planned |
| Department-specific checklists | Planned |
| Employee document collection | Planned |
| Contract tasks | Planned |
| Payroll setup tasks | Planned |
| Benefits setup tasks | Planned |
| IT account requests | Planned |
| Equipment requests | Planned |
| Welcome emails | Planned |
| Buddy assignment | Planned |
| Learning assignment | Planned |
| Probation goals | Planned |
| Onboarding progress | Planned |
| Task reminders | Planned |
| Manager approvals | Planned |

## MODULE 17 — PERFORMANCE

| Feature | Status |
| --- | --- |
| Performance cycles | Planned |
| Self reviews | Planned |
| Manager reviews | Planned |
| Peer reviews | Planned |
| 360-degree feedback | Planned |
| Competency assessments | Planned |
| Continuous feedback | Planned |
| One-on-one meetings | Planned |
| Review templates | Planned |
| Review calibration | Planned |
| Performance history | Planned |
| Development plans | Planned |
| Performance improvement plans | Planned |

## MODULE 18 — GOALS / OKR / KPI

| Feature | Status |
| --- | --- |
| Company goals | Planned |
| Department goals | Planned |
| Team goals | Planned |
| Individual goals | Planned |
| OKRs | Planned |
| KPIs | Planned |
| MBO | Planned |
| BSC | Planned |
| Goal alignment | Planned |
| Goal ownership | Planned |
| Progress updates | Planned |
| Check-ins | Planned |
| Goal scoring | Planned |
| Goal dashboards | Planned |
| Goal history | Planned |

## MODULE 19 — SKILLS INTELLIGENCE

| Feature | Status |
| --- | --- |
| Skills taxonomy | Planned |
| Skill categories | Planned |
| Skill relationships | Planned |
| Role requirements | Planned |
| Employee skill profiles | Planned |
| Proficiency levels | Planned |
| Evidence | Planned |
| Verification | Planned |
| Skill-gap analysis | Planned |
| Skill search | Planned |
| Skill graph | Planned |
| Team capability mapping | Planned |
| Skills analytics | Planned |

## MODULE 20 — LEARNING MANAGEMENT

| Feature | Status |
| --- | --- |
| Course catalog | Planned |
| Learning paths | Planned |
| Video lessons | Planned |
| Documents | Planned |
| Quizzes | Planned |
| Assignments | Planned |
| Enrollment | Planned |
| Progress tracking | Planned |
| Certificates | Planned |
| Mandatory training | Planned |
| Training deadlines | Planned |
| Learning recommendations | Planned |
| Skill-based learning paths | Planned |

## MODULE 21 — CAREER GPS

| Feature | Status |
| --- | --- |
| Career profiles | Planned |
| Career aspirations | Planned |
| Career paths | Planned |
| Target roles | Planned |
| Role requirements | Planned |
| Skill-gap analysis | Planned |
| Learning recommendations | Planned |
| Mentorship | Planned |
| Development milestones | Planned |
| Internal opportunities | Planned |
| Career progress tracking | Planned |

## MODULE 22 — INTERNAL TALENT MARKETPLACE

| Feature | Status |
| --- | --- |
| Internal job board | Planned |
| Internal project opportunities | Planned |
| Short-term gigs | Planned |
| Internal applications | Planned |
| Employee interests | Planned |
| Verified skill matching | Planned |
| Availability tracking | Planned |
| Mentor discovery | Planned |
| Internal mobility workflows | Planned |

## MODULE 23 — SUCCESSION PLANNING

| Feature | Status |
| --- | --- |
| Critical positions | Planned |
| Successor pools | Planned |
| Readiness assessments | Planned |
| Development plans | Planned |
| Talent reviews | Planned |
| Nine-box matrices | Planned |
| Succession scenarios | Planned |
| Succession reporting | Planned |

## MODULE 24 — WORKFORCE PLANNING

| Feature | Status |
| --- | --- |
| Headcount planning | Planned |
| Hiring forecasts | Planned |
| Position budgets | Planned |
| Salary budgets | Planned |
| Department capacity | Planned |
| Skill demand | Planned |
| Location planning | Planned |
| Workforce costs | Planned |
| Scenario comparisons | Planned |
| Planning approvals | Planned |

## MODULE 25 — ORGANIZATIONAL DIGITAL TWIN

| Feature | Status |
| --- | --- |
| Organization representation | Planned |
| Position mapping | Planned |
| Employee mapping | Planned |
| Skills mapping | Planned |
| Workforce capacity | Planned |
| Cost allocation | Planned |
| Historical structures | Planned |
| Proposed organization changes | Planned |
| Organizational insights | Planned |

## MODULE 26 — SCENARIO SIMULATOR

| Feature | Status |
| --- | --- |
| Hiring scenarios | Planned |
| Contractor scenarios | Planned |
| Internal upskilling scenarios | Planned |
| Workforce cost projections | Planned |
| Capacity projections | Planned |
| Skill-gap projections | Planned |
| Scenario comparison | Planned |
| Assumption editing | Planned |
| Scenario versioning | Planned |
| Exportable reports | Planned |

## MODULE 27 — ENGAGEMENT

| Feature | Status |
| --- | --- |
| Pulse surveys | Planned |
| Employee surveys | Planned |
| eNPS | Planned |
| Anonymous feedback | Planned |
| Survey templates | Planned |
| Survey scheduling | Planned |
| Participation reporting | Planned |
| Engagement trends | Planned |
| Improvement action plans | Planned |

## MODULE 28 — RECOGNITION

| Feature | Status |
| --- | --- |
| Employee recognition | Planned |
| Kudos | Planned |
| Recognition badges | Planned |
| Company values | Planned |
| Team celebrations | Planned |
| Recognition feed | Planned |
| Optional reward points | Planned |
| Recognition analytics | Planned |

## MODULE 29 — HR HELPDESK

| Feature | Status |
| --- | --- |
| HR requests | Planned |
| Ticket categories | Planned |
| Ticket priority | Planned |
| SLA policies | Planned |
| Assignment | Planned |
| Internal comments | Planned |
| Employee responses | Planned |
| Attachments | Planned |
| Knowledge base | Planned |
| Ticket status | Planned |
| Escalation | Planned |
| Satisfaction surveys | Planned |
| AI-assisted knowledge search | Planned |

## MODULE 30 — EMPLOYEE SELF-SERVICE

| Feature | Status |
| --- | --- |
| Employee dashboard | Planned |
| Profile updates | Planned |
| Attendance | Planned |
| Leave | Planned |
| Schedules | Planned |
| Timesheets | Planned |
| Payslips | Planned |
| Benefits | Planned |
| Goals | Planned |
| Performance | Planned |
| Learning | Planned |
| Career | Planned |
| Documents | Planned |
| HR requests | Planned |
| Notifications | Planned |
| AI assistant | Planned |

## MODULE 31 — WORKFLOW AUTOMATION

| Feature | Status |
| --- | --- |
| Workflow list | Planned |
| Workflow templates | Planned |
| Visual workflow builder | Planned |
| Trigger nodes | Planned |
| Condition nodes | Planned |
| Branch nodes | Planned |
| Approval nodes | Planned |
| Action nodes | Planned |
| Delay nodes | Planned |
| Notification nodes | Planned |
| Webhook nodes | Planned |
| Workflow execution history | Planned |
| Retry handling | Planned |
| Failure handling | Planned |
| Versioning | Planned |
| Workflow testing | Planned |
| Publishing | Planned |
| Rollback | Planned |
| Workflow permissions | Planned |

## MODULE 32 — AI WORKFLOW BUILDER

| Feature | Status |
| --- | --- |
| Natural-language workflow input | Planned |
| Structured workflow generation | Planned |
| Node graph preview | Planned |
| Validation | Planned |
| Human review | Planned |
| Simulation | Planned |
| Publishing | Planned |
| Version history | Planned |

## MODULE 33 — POLICY-AS-CODE

| Feature | Status |
| --- | --- |
| Policy documents | Planned |
| Structured rules | Planned |
| Rule editor | Planned |
| AI rule suggestions | Planned |
| Effective dates | Planned |
| Test cases | Planned |
| Simulation | Planned |
| Approval | Planned |
| Versioning | Planned |
| Policy publishing | Planned |
| Audit history | Planned |

## MODULE 34 — WORKFLOW MARKETPLACE

| Feature | Status |
| --- | --- |
| Workflow templates | Planned |
| Template categories | Planned |
| Template search | Planned |
| Template preview | Planned |
| Template installation | Planned |
| Template customization | Planned |
| Template versioning | Planned |
| Template sharing | Planned |

## MODULE 35 — AI COPILOT

| Feature | Status |
| --- | --- |
| Global AI command interface | Planned |
| Natural-language search | Planned |
| HR knowledge Q&A | Planned |
| Employee search subject to permissions | Planned |
| Attendance insights | Planned |
| Payroll explanations | Planned |
| Document summaries | Planned |
| Workflow suggestions | Planned |
| Suggested actions | Planned |
| AI response citations | Planned |
| Conversation history | Planned |
| AI feedback | Planned |

## MODULE 36 — AI AGENTS

| Feature | Status |
| --- | --- |
| HR Agent | Planned |
| Recruiting Agent | Planned |
| Onboarding Agent | Planned |
| Payroll Agent | Planned |
| Compliance Agent | Planned |
| Learning Agent | Planned |
| Career Agent | Planned |
| IT Agent | Planned |
| Helpdesk Agent | Planned |
| Analytics Agent | Planned |

## MODULE 37 — AI AGENT BUILDER

| Feature | Status |
| --- | --- |
| Agent creation | Planned |
| Agent instructions | Planned |
| Knowledge sources | Planned |
| Tool selection | Planned |
| Permission configuration | Planned |
| Human approval rules | Planned |
| Agent testing | Planned |
| Execution logs | Planned |
| Agent versions | Planned |
| Agent publishing | Planned |
| Agent disabling | Planned |

## MODULE 38 — AI GOVERNANCE

| Feature | Status |
| --- | --- |
| AI provider configuration | Planned |
| Model selection | Planned |
| Agent permissions | Planned |
| Data-access policies | Planned |
| Restricted data | Planned |
| Human approval requirements | Planned |
| AI audit logs | Planned |
| Prompt versions | Planned |
| Model usage | Planned |
| Token usage | Planned |
| Cost monitoring | Planned |
| AI action logs | Planned |
| Agent kill switch | Planned |

## MODULE 39 — IDENTITY & ACCESS

| Feature | Status |
| --- | --- |
| SSO | Planned |
| OIDC | Planned |
| SAML extension | Planned |
| SCIM integration | Planned |
| Application access | Planned |
| User groups | Planned |
| Access policies | Planned |
| Provisioning | Planned |
| Deprovisioning | Planned |
| Access review | Planned |
| Permission audit | Planned |

## MODULE 40 — DEVICE MANAGEMENT

| Feature | Status |
| --- | --- |
| Device registry | Planned |
| Device assignment | Planned |
| Device ownership | Planned |
| Device compliance status | Planned |
| MDM integration adapters | Planned |
| Software inventory integration | Planned |
| Device return | Planned |
| Remote-management action requests | Planned |

## MODULE 41 — ASSET MANAGEMENT

| Feature | Status |
| --- | --- |
| Asset categories | Planned |
| Inventory | Planned |
| Asset purchases | Planned |
| Asset assignment | Planned |
| Asset history | Planned |
| Repairs | Planned |
| Returns | Planned |
| Reassignment | Planned |
| Depreciation fields | Planned |
| Asset retirement | Planned |
| Asset reports | Planned |

## MODULE 42 — PEOPLE ANALYTICS

| Feature | Status |
| --- | --- |
| Headcount analytics | Planned |
| Hiring analytics | Planned |
| Turnover | Planned |
| Retention | Planned |
| Attendance | Planned |
| Leave | Planned |
| Payroll | Planned |
| Compensation | Planned |
| Performance | Planned |
| Skills | Planned |
| Learning | Planned |
| Engagement | Planned |
| Workforce costs | Planned |
| Custom reports | Planned |
| Export | Planned |
| Scheduled reports | Planned |
| Permission-aware dashboards | Planned |

## MODULE 43 — INTEGRATION PLATFORM

| Feature | Status |
| --- | --- |
| Integration catalog | Planned |
| Integration configuration | Planned |
| OAuth connection management | Planned |
| API credentials | Planned |
| Webhooks | Planned |
| Webhook delivery logs | Planned |
| Retry handling | Planned |
| External adapters | Planned |
| API documentation | Planned |
| Developer sandbox | Planned |
| Integration health monitoring | Planned |

## MODULE 44 — PLATFORM ADMINISTRATION

| Feature | Status |
| --- | --- |
| Company settings | Planned |
| Legal entities | Planned |
| Tenant branding | Planned |
| Languages | Planned |
| Currencies | Planned |
| Time zones | Planned |
| Roles | Planned |
| Permissions | Planned |
| Custom fields | Planned |
| Custom forms | Planned |
| Feature flags | Planned |
| Module configuration | Planned |
| Notification templates | Planned |
| Email settings | Planned |
| API settings | Planned |
| Audit logs | Planned |
| Data retention | Planned |
| Backup administration | Planned |
| Platform health | Planned |
