# Implementation plan

## Current checkpoint: Phase 0 implemented slice verified; release gate still open

The repository was empty on 2026-10-13. Start with a modular monolith, real PostgreSQL, and a same-origin React client. Do not advance to Phase 1 until the Phase 0 verification gate passes.

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
6. Once Phase 0 passes, start Phase 1 employee CRUD/profile, departments and positions; then lifecycle/documents.

Later phases follow PRODUCT_REQUIREMENTS.md sections 18 and 23 exactly. Phase 2 workforce; 3 verified Vietnam payroll; 4 talent; 5 experience; 6 automation; 7 AI; 8 intelligence; 9 integrations; 10 hardening. Each slice needs database, domain rules, API, authorization, UI, tests and documentation before release.

## Resume checkpoint — 2026-10-16

Implemented: monorepo/Git initialization, Java 25 backend, React frontend, PostgreSQL/Flyway, persisted sessions, CSRF, three permission-backed roles, tenant isolation, deterministic fixtures, live overview, read-only employee directory, company settings with optimistic locking/audit, role catalog, audit log, responsive themes, Docker/CI definitions and documentation. Added self-service session listing/revocation with accessible confirmation and atomic audit, plus explicit login/logout and CSRF/cookie OpenAPI contracts.

Verified on October 16: 1 backend unit test + 13 real PostgreSQL integration/security tests; 5 frontend tests; lint/strict types/production build; 8 Playwright journeys including all six screens at eight viewport widths, light/dark axe checks and unsaved-change navigation. The session journey additionally passed a focused run for mobile confirmation accessibility, cancellation/focus and network-failure retry. Frontend dependency audit found zero vulnerabilities at the October 14 scan; dependencies have not changed in this slice.

Outstanding gates:

1. Run `docker compose up --build --wait` on a Docker-capable host, then run Playwright with `E2E_BASE_URL=http://127.0.0.1:3000`. Docker is unavailable on this machine.
2. Run backend `./mvnw verify -DskipTests -Psecurity-audit` where NVD/CISA feeds are reachable; configure `NVD_API_KEY` for reliable CI updates. The attempted local scan failed to obtain advisory data, including CISA HTTP 403. Do not treat it as a clean scan or disable the failing feeds to manufacture a pass.
3. Execute the checked-in CI workflow on the chosen Git remote. No remote or publication has been configured.
4. Review the foundation limitations in SECURITY.md and FEATURE_MATRIX.md before declaring the full Phase 0 milestone complete. Current basic auth does not include account provisioning/recovery, MFA or SSO.
5. After the Phase 0 gate passes, implement Phase 1 employee create/update/profile, departments and positions as the next vertical slice. The current employee directory is read-only.

All source is preserved locally. `.tools`, database/runtime files, browser traces and generated reports are ignored by Git. Use README.md for reproducible setup; no dependency on these local QA artifacts is required for Docker/CI.
