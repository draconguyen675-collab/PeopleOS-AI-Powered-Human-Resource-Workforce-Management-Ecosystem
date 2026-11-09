# Implementation plan

## Current checkpoint: core HR and cloud deployment

The repository was empty on 2026-10-13. It now contains a modular monolith, real PostgreSQL and a same-origin React client. The October 19 request in ENTERPRISE_REQUIREMENTS.md directs continued implementation through coherent vertical slices. Continue local feature development while retaining outstanding verification gates as release blockers. See MODULE_DEPENDENCIES.md for all 44 modules and their implementation order.

### Phase 0 acceptance criteria

- Java 25, compatible stable Spring Boot, Maven wrapper, Flyway and PostgreSQL start reproducibly.
- Login establishes an HttpOnly, SameSite session; CSRF protects writes including login; logout invalidates it.
- Every account can list its own active sessions and revoke another session with confirmation and atomic audit; expired/foreign sessions stay inaccessible.
- OpenAPI documents filter-based login/logout, session-cookie authentication and write CSRF requirements alongside controller APIs.
- Every tenant-owned query derives its tenant from authenticated identity, never a client tenant header.
- Owner and HR permissions differ from viewer permissions; forbidden requests fail on the server.
- Workspace overview, seeded directory, role catalog, company settings and audit screens use real APIs.
- Company updates validate fields, detect stale revisions, and atomically record a redacted audit event.
- Fictional deterministic fixtures include two tenants and 120 employees in the primary tenant.
- Responsive shell works at 320, 375, 390, 768, 1024, 1280, 1440 and 1920 pixels with light/dark/system themes.
- Backend integration and security tests, frontend lint/types/unit/build, browser E2E and Docker smoke pass.
- No future-module navigation, fabricated AI responses, or production readiness claims.

### Execution order

1. Record architecture, all module/feature statuses and acceptance gates.
2. Implement schema, sessions, tenant-scoped APIs, validation and audit.
3. Connect React screens and accessible design primitives.
4. Run real PostgreSQL tests and browser journeys; fix failures.
5. Run Docker/CI verification; record environmental blockers precisely.
6. Continue coherent core HR slices while keeping release gates explicit; employee profiles, departments and positions are implemented. Lifecycle/documents follow hosted deployment.

Later phases follow PRODUCT_REQUIREMENTS.md sections 18 and 23 exactly. Phase 2 workforce; 3 verified Vietnam payroll; 4 talent; 5 experience; 6 automation; 7 AI; 8 intelligence; 9 integrations; 10 hardening. Each slice needs database, domain rules, API, authorization, UI, tests and documentation before release.

## Resume checkpoint — 2026-11-06

Implemented: tenant-bound sessions/CSRF/RBAC, company settings, audit, employee work-profile create/detail/edit/archive/restore with revision conflicts and history, department hierarchy with cycle/usage guards, position catalog and optional employee links. Navigation supports permission-aware groups, search, desktop collapse and mobile drawer. Sidebar scrollbars are hidden at rest and revealed on hover or keyboard focus without disabling scrolling.

Verified: backend passed 1 unit + 22 PostgreSQL integration tests on November 6; frontend lint, strict types/build and 7 unit tests passed on November 5. All 12 browser journeys passed, including 11 screens at eight widths (88 route/width combinations), light/dark axe checks, catalog dialogs and real employee workflows. A separate sidebar check confirmed hidden/hover styles, wheel scrolling and stable layout width.

Deployment: GitHub origin is configured under draconguyen675-collab. The hosted demo at https://peopleos-hrm-draco675.netlify.app now connects Netlify to Render Free Java and Neon Free PostgreSQL in Singapore. No expiring Render PostgreSQL resource was created. Health, CSRF/cookie security, login, persisted edits, viewer permissions and tenant isolation passed online. Free Java cold starts take roughly 2–3 minutes; deployments remain manual.

Remaining release gates: complete backend advisory scanning with reachable NVD/CISA feeds and track CI on new revisions. Docker remains unavailable locally, but prior remote CI passed Compose and browser checks. Authentication still lacks public provisioning/recovery/MFA/SSO, and the full 44-module scope is incomplete. Hosted demo verification does not establish production readiness.

Local runtime note: on November 5 the previous Temp database directory contained no data files. A fresh fictional demo database was created under LocalAppData/PeopleOS/postgres17, outside Temp. Previous local business changes were not recovered. Runtime paths, credentials, traces and generated reports remain ignored by Git.

November 9 update: CI run `42151697319` passed on `a7a31ee`. Neon project `dark-dust-08170704` is provisioned in Singapore with PostgreSQL 17 and linked locally. Official Neon skills and project-scoped MCP are installed and verified. Render service `srv-dboijabl550s739rs690` is live with Flyway migrations and fictional data; Netlify deployment `6af1675b3727a41e99b1480b` passed three hosted browser journeys. See DEPLOYMENT.md and VERIFICATION.md.

Exact next feature task: continue employee lifecycle and secure documents as coherent authorized vertical slices, retaining tenant isolation, role checks and audit. Preserve the working hosted demo and complete the remaining release gates.
