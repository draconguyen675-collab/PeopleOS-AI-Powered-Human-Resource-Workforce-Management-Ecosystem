# Test strategy

`mvnw clean verify` runs unit tests through Surefire and PostgreSQL integration tests through Failsafe. Integration tests never silently skip when Docker is unavailable: provide a dedicated external database or report the blocker. A schema migration failure fails application startup and the suite.

Backend coverage: unauthenticated API rejection; missing CSRF; invalid credentials without account disclosure; session rotation and invalidation; session persistence; viewer/HR authorization; two-tenant directory/aggregate isolation; filtering and bounded pagination; invalid sort/status rejection; company validation; stale revision conflict; atomic mutation audit; generated OpenAPI; idempotent seed; BCrypt hashing; rate limiting.

Frontend: strict TypeScript, ESLint with zero warnings, Vitest/Testing Library for accessible login errors/password visibility, API CSRF lifecycle and error mapping, company schema validation, production bundle build. No fake API data is used in normal application code.

Playwright talks to the real backend: owner directory search/pagination, company update/reload/audit/logout, viewer permissions, second-tenant separation, all application screens at eight viewport widths, theme persistence, drawer Escape/focus restoration, mobile login failure, unsaved-edit navigation and automated axe checks for WCAG A/AA in light and dark themes. A single worker prevents company-edit races and avoids needless login bursts.

Session coverage includes same-account multi-session listing, account/tenant isolation, non-disclosure of bearer IDs, CSRF, rejecting current-session revocation, expired-session exclusion, bounded pagination, audit, and invalidation on the next request. A JDBC session loaded before revocation cannot be recreated by a later save. Browser coverage uses independent contexts, confirmation/cancel/focus, simulated network failure with deliberate retry, mobile confirmation accessibility, and revoked-session redirects.

GitHub Actions supplies Java 25, Node 22, Testcontainers, Chromium and the Compose smoke test. CI definitions are not evidence that remote CI ran. Record actual local results and any unexecuted checks in VERIFICATION.md.

Core HR coverage uses three additional PostgreSQL integration suites:

- Employee management: create/detail/edit/archive/restore, normalized uniqueness, own/foreign-tenant references, viewer denial, missing CSRF/version, atomic audit, stale revisions and simultaneous conflicting updates.
- Departments: parent-child relationships, self/descendant cycle rejection, concurrent reciprocal reparenting, normalized names, paging/search, linked archived-employee retention, child usage guards, scope and version checks.
- Positions: normalized catalog codes, revision conflicts, own-tenant links, preserving individual employee titles, archive/unlink/delete behavior, audit, and simultaneous employee assignment versus deletion without dangling references.

Browser tests cover each workflow against real APIs, including preserving a stale form draft, deliberately reloading/reopening an editor, confirmation/cancel and keyboard focus. Employee schema tests cover input normalization and malformed work values. Navigation search, collapsible groups, compact desktop sidebar and mobile drawer have their own journey. All working routes participate in the viewport and automated light/dark axe sweeps; new catalog dialogs are also checked at 320px.

Browser QA employee records are archived rather than hard-deleted. Tests clean up only their own uniquely named department/position fixtures, unlinking their own employee test records first. Integration suites use a dedicated disposable database and remove their own fixtures. No application test bypasses server authorization or disables the login limiter.
