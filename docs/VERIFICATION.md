# Verification record

## 2026-11-09 — Connected hosted demo

- Render account authenticated; service `srv-dboijabl550s739rs690` created in Singapore on the Free Docker plan. Deployment `dep-dboijb3l550s739rs8l0` is live from application commit `20f97ba`. Auto-deploy is disabled. No Render database was created.
- Java connects to Neon through a pooled JDBC URL; Flyway uses a separate direct URL and credentials. Startup applies the existing migrations and fictional fixtures. The versioned Render blueprint now includes the separate Flyway variables and passed Render validation.
- Netlify production API origin was saved and read back. Frontend build passed and deployment `6af1675b3727a41e99b1480b` publishes the same-origin API proxy at https://peopleos-hrm-draco675.netlify.app.
- Backend health returned HTTP 200 with status `UP`. Netlify CSRF returned 200 with `no-store`; its session cookie is Secure, HttpOnly, SameSite=Lax and scoped to the Netlify host. SPA deep-route requests returned HTML with HTTP 200.
- Hosted Chromium smoke: **3 passed** (37 seconds), covering owner sign-in, employee search, a company edit persisted across reload and restored afterward, audit, logout, viewer API/UI restrictions and independent tenant records.
- Initial hosted attempts failed while the service was starting and with the suite's local 5-second assertion timeout. After health was confirmed, the same assertions passed with a 30-second timeout in an ignored hosted test configuration. Observed Java startup was 135.5 seconds (145.1 seconds process lifetime); Free service cold starts remain a user-visible limitation.
- Application source is unchanged. Build and targeted hosting checks were run; the full local backend suite was not repeated for deployment-only configuration changes. Private cloud credentials and browser artifacts remain Git-ignored.

## 2026-11-09 — Neon tooling and project setup

- GitHub CI run [42151697319](https://github.com/draconguyen675-collab/PeopleOS-AI-Powered-Human-Resource-Workforce-Management-Ecosystem/actions/runs/42151697319) succeeded on `a7a31ee`, including backend/frontend checks, dependency audit, Docker Compose startup and Playwright.
- Created and linked Neon project `dark-dust-08170704` (PostgreSQL 17, Singapore) in the requested organization. No cloud application migrations or login verification were performed yet.
- Installed the official `neon` and `neon-postgres` skills; both report up to date.
- Configured project-scoped Neon MCP in the user-level Codex config. Parsed comparison against the backup confirmed all existing settings were preserved. MCP initialization succeeded with protocol `2025-06-18`; tools/list returned 129 tools.
- No application source changed in this setup. Existing local database settings were preserved. Connection exports, MCP credentials, backup and portable runtime were not added to Git.
- At this tooling checkpoint, Render authentication and Java deployment were pending; the later hosted-demo checkpoint above supersedes that status.

## 2026-11-06 — Core HR checkpoint and deployment preparation

- GitHub main published as `76494aa`. CI run `42151187332` passed backend tests and frontend lint/types/tests/build, then failed the dependency audit on newly disclosed GHSA-g3hv-75wg-m249. A scoped minimatch override for typescript-estree upgrades to 11.0.5; the subsequent local audit found zero vulnerabilities, and lint, 7 unit tests and Netlify build passed again. Remote CI must be rechecked on the fix commit.
- Netlify frontend published at https://peopleos-hrm-draco675.netlify.app. Browser verification passed for `/auth/login`, SPA refresh and explicit uncached 503 responses from the unconnected API. Render/Neon connections are not yet confirmed; no cloud Java/PostgreSQL deployment is claimed.

- Backend Maven verify passed: 1 unit and 22 PostgreSQL integration tests, zero failures/errors/skips. Includes employee conflicts, department cycles under simultaneous moves, position links and concurrent assignment/deletion.
- Frontend lint, strict types/build and 7 Vitest tests passed November 5. Netlify build also passed, producing SPA/API routing rules. Two existing non-fatal Zod annotation warnings remain.
- All 12 Playwright journeys passed November 5: 11 working routes across eight viewport widths (88 combinations), both-theme axe scans, employee CRUD/archive/restore, department/position dialogs, revision errors, session revocation and navigation behavior.
- Separate sidebar browser check passed: scrollbar transparent at rest, visible on hover, wheel scrolling preserved and width unchanged. Idle/hover screenshots were inspected.
- Prepared Netlify deployment and a Render Free Java service using an external Neon Free database. No Render database with a 30-day expiry is provisioned. Hosted API/database are not yet verified; account connections are required. Frontend-only deployments return explicit API-unavailable responses.
- Local runtime data previously stored under Temp was absent on November 5; a fresh fictional database was created under LocalAppData/PeopleOS/postgres17. Prior local business changes were not recovered.
- Local credential values were checked against publishable files and were absent. Runtime credentials, databases, traces and tools remain Git-ignored.
- Remote CI and actual hosting results must be recorded after publication. Backend advisory scanning still lacks a verified clean result; no all-module or production-readiness claim.

## 2026-10-16 — Self-service sign-in sessions

- Added active-session listing and revocation for the signed-in account, with explicit tenant scope, CSRF, current-session protection and atomic audit. Management UUIDs are separate from bearer IDs; no device/IP metadata is invented.
- Added the Sign-in sessions screen with paginated real data, confirmation/cancel, loading/error/success states, and deliberate retry after network failure.
- OpenAPI now documents filter login/logout, form encoding, cookie authentication, public CSRF bootstrap and write headers.
- Backend `mvnw verify`: **passed**, 1 unit + 13 PostgreSQL integration tests, zero failures/errors/skips. New assertions cover foreign-account/tenant denial, expired sessions, current-session protection, bearer-ID non-disclosure, revocation/audit, and saving a session loaded before revocation without resurrecting it.
- Frontend ESLint, strict TypeScript and production build: **passed**; 5 Vitest tests passed. Initial sandboxed Vitest startup hit an ancestor-directory access restriction; rerunning with approved tool access passed. The same two harmless Zod annotation warnings remain.
- Full Playwright suite: **8 passed**. Six application screens at eight widths (48 combinations), plus login and all existing workflows. Automated axe checks passed for login and six screens in light/dark modes.
- Focused session journey after expanding coverage: **passed**, including mobile confirmation axe checks, cancellation and restored focus, simulated network failure without revocation, retry, independent-browser invalidation and audit. Screenshots are generated under ignored Playwright test results.
- Desktop session-list and mobile confirmation screenshots were visually reviewed. Local QA frontend/backend/database processes were stopped after verification; source and persisted local data remain available.
- No dependency versions or database migrations changed. Docker/remote CI and the backend advisory-data scan remain outstanding as recorded below. Phase 1 has not started.

## 2026-10-14 — Phase 0 vertical slice

- Java 25.0.4.1 toolchain installed locally and Spring Boot 4.1.1 compilation passed.
- Frontend lint and strict typecheck passed; five Vitest tests passed; Vite production build passed.
- Vitest upgraded to 5.0.4 after dependency audit identified vulnerable test tooling; subsequent npm audit reported zero vulnerabilities.
- Docker is not installed on this machine. Docker build/start and Testcontainers path remain unverified locally.
- Docker Registry manifest checks returned HTTP 200 for `postgres:17.11-alpine`, `eclipse-temurin:25-jre`, and `nginxinc/nginx-unprivileged:1.28-alpine`. This confirms tag availability, not container execution.
- Portable PostgreSQL 17.11 installed for real database verification; use an ASCII temporary runtime path because PostgreSQL initdb rejected the em dash in the Windows project path.
- Final `mvnw clean verify`: **passed** on Java 25.0.4.1 and PostgreSQL 17.11. Surefire: 1 test; Failsafe: 11 tests; no failures/errors/skips. Covers authentication, CSRF, role enforcement, tenant separation, pagination/filter validation, optimistic updates, audit and seed idempotency.
- Final frontend lint, typecheck, five Vitest tests and production build: **passed**. The bundler emits two non-fatal annotation warnings from the installed Zod package; generated application chunks build successfully.
- Playwright: **7 passed** against the real Java/PostgreSQL backend in Chromium. Tests include 40 viewport/route combinations, login and logout, persistent company edits, directory search/pagination, tenant separation, viewer restrictions, theme persistence, mobile drawer keyboard focus and unsaved-change protection including browser Back.
- Automated axe WCAG A/AA checks: **passed** on login plus five application screens in light and dark modes. This is automated coverage, not a complete manual accessibility audit.
- Backend OWASP Dependency-Check 13.0.0: **blocked/failed to scan**. NVD update requests failed and CISA known-exploited-vulnerabilities feed returned HTTP 403; the tool ended with `NoDataException`. No clean backend security result is claimed. Scheduled CI scan and Dependabot definitions are included.
- Visual inspection: desktop 1440px and mobile 390px screenshots reviewed; actual values came from seeded PostgreSQL records.
- Git initialized. No commit, remote push, deployment, or remote CI run was performed.

The first resumed backend run failed because the disposable database process had stopped. After PostgreSQL restart, the full suite passed. Earlier low-contrast text findings were corrected and the complete accessibility suite then passed.

No production readiness claim. Later business phases remain planned until the Phase 0 gate passes.
