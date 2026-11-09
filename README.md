# PeopleOS

A Java 25 / Spring Boot / React / PostgreSQL application for the PeopleOS HRM platform. The current scope includes the foundation, employee work profiles, departments and a position catalog. The complete 44-module product remains in development. See [implementation status](docs/IMPLEMENTATION_PLAN.md), the [feature matrix](docs/FEATURE_MATRIX.md) and [module dependencies](docs/MODULE_DEPENDENCIES.md).

Hosted demo: [peopleos-hrm-draco675.netlify.app](https://peopleos-hrm-draco675.netlify.app/auth/login). Netlify serves the frontend and proxies its API to Java on Render Free, backed by Neon Free PostgreSQL. Login, persistent edits, permissions and tenant isolation were verified online. Use workspace `novatech`, email `owner@example.test`, and the private cloud demo password supplied during deployment. After inactivity, the Free Java service can take roughly 2–3 minutes to wake; retry sign-in after startup. See [deployment status and limitations](docs/DEPLOYMENT.md).

## Run with Docker

Install Docker Engine/Desktop with Compose v2. Copy `.env.example` to `.env`, then set `DATABASE_PASSWORD` and `DEMO_PASSWORD` to distinct strong local passwords. The demo password must be 12–72 ASCII characters. Never commit `.env`.

```sh
docker compose up --build --wait
```

Open **http://localhost:3000**. Sign in with workspace `novatech` and `owner@example.test`, using your configured `DEMO_PASSWORD`.

Additional fictional accounts: `hr@example.test` (employee and department management, directory and audit access) and `viewer@example.test` (aggregate overview and read-only company settings). Workspace `orbit` has an independent eight-person fixture; `novatech` has 120 people. Seed accounts use the configured demo password. Seeding is development-only and idempotent; changing the environment does not reset existing accounts.

```sh
docker compose logs -f backend
docker compose down
```

Data remains in the named PostgreSQL volume. The default Compose stack binds only to loopback and uses HTTP development cookies. It is not a production deployment.

## Run source locally

Prerequisites: Java 25, Node.js 22.12+ and PostgreSQL 17. Maven is downloaded by the included wrapper. Create a `peopleos` database and set `DATABASE_URL` (JDBC URL), `DATABASE_USER`, `DATABASE_PASSWORD`, `SPRING_PROFILES_ACTIVE=local` and `DEMO_PASSWORD` in the backend process environment.

```sh
cd backend
./mvnw spring-boot:run
```

In a second terminal:

```sh
cd frontend
npm ci
npm run dev
```

Open **http://127.0.0.1:5173**. Vite proxies `/api` to port 8080. On Windows use `mvnw.cmd` and `npm.cmd`; npm scripts invoke Node directly to support the ampersand in this repository path.

## Verify

```sh
cd backend
./mvnw clean verify
```

Integration tests start real PostgreSQL using Testcontainers and require Docker. Alternatively, supply `TEST_DATABASE_URL`, `TEST_DATABASE_USER`, and `TEST_DATABASE_PASSWORD` for a **dedicated disposable PostgreSQL database**. Tests migrate, seed and mutate that database. Never point tests at production or shared data.

```sh
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
npm audit
node node_modules/@playwright/test/cli.js install chromium
```

With the real stack running and `DEMO_PASSWORD` set, run `npm run test:e2e`. If the local NovaTech owner password has been reset, set `OWNER_PASSWORD` separately; otherwise it defaults to `DEMO_PASSWORD`. Keep credentials outside source control. Set `E2E_BASE_URL=http://localhost:3000` for Docker; the default is the Vite server on port 5173. Browser tests update and restore the fictional company name, create and archive uniquely named QA employee profiles, and create then delete their own unused department/position fixtures. Use a disposable demo stack.

## Included

- Session sign-in/out, CSRF protection, three database-backed roles, tenant-scoped queries.
- Sign-in sessions page for every account: review active sessions and revoke another session with confirmation and audit.
- Live workforce overview and directory with pagination, filters, sorting and archived-profile visibility.
- Employee work-profile creation, detail/edit screens, archive/restore, revision conflicts and an activity timeline.
- Department creation/editing, parent-child relationships, cycle prevention and deletion restrictions for linked profiles or child departments.
- Position catalog with unique codes, revision checks, optional employee links and deletion restrictions for current/archived profiles.
- Versioned company settings and an audit trail for sign-in/out and changes.
- Light/dark/system themes, grouped searchable navigation, compact sidebar and mobile directory cards.
- Flyway schema, deterministic fixtures, API documentation at authenticated `/api/v1/openapi`.
- Unit/component tests, real PostgreSQL integration tests, Playwright journeys, Docker and CI definitions.

Registration, invitations, password recovery, verification, MFA, SSO, custom roles, full employee 360 profiles, position grades/headcount planning, lifecycle workflows, payroll and AI remain planned. Archiving a work profile is not an offboarding workflow. AI requires no credentials and no model calls occur in this phase. No production readiness claim is made.

See [architecture](docs/ARCHITECTURE.md), [security](docs/SECURITY.md), [API contracts](docs/API_CONTRACTS.md), [deployment](docs/DEPLOYMENT.md), and [verification record](docs/VERIFICATION.md).
