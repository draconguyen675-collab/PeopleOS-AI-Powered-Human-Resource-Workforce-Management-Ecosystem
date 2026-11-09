# Deployment and operations

The supplied Compose stack is for local development only. It runs PostgreSQL, a non-root Java process, and non-root nginx on a loopback port. The API and database are not published to the host. nginx serves hashed frontend assets and proxies the same-origin API; database health gates API startup and API health gates the UI.

For an actual deployment: disable the local profile and demo seed, supply database secrets through the platform secret manager, terminate TLS at an approved ingress, retain secure cookies, configure trusted proxies deliberately, use separate database roles for migrations and runtime, provision real accounts, and implement the remaining authentication flows. Keep OpenAPI authenticated. Add monitored metrics/traces and alerts after selecting the runtime platform.

Backup procedure: use PostgreSQL `pg_dump --format=custom` with a least-privilege backup identity, encrypt snapshots, store them off-host with retention and access auditing. Restore to a separate environment using `pg_restore`, run Flyway validation and tenant/security smoke tests, and verify representative record counts and permission boundaries. This procedure has not yet been exercised; RPO/RTO must come from measured restore drills, not assumptions.

Release procedure: pass `clean verify`, frontend checks, dependency scans, Playwright and Compose smoke; review migrations; capture tested image digests and lockfiles; take a verified backup; migrate once; deploy; check readiness and critical journeys. Database rollback requires a reviewed compensating migration or restore; never rewrite already-applied Flyway files in deployed environments.

Sessions persist in PostgreSQL and expire after 30 minutes of inactivity. Monitor session table cleanup, database connections, failed logins, 5xx responses and disk capacity. AI is absent/disabled in this phase; no provider credentials are necessary.

## Netlify frontend and hosted demo API

Status on November 9, 2026: frontend published at https://peopleos-hrm-draco675.netlify.app, Netlify site ID `103e6f6d-22f4-476f-a285-b631f58b20d0`. The `/auth/login` route and SPA reload were verified to return 200; unconnected API routes return uncached 503. Netlify account is on Free with automatic credit top-ups disabled and no payment method. Neon PostgreSQL 17 has been provisioned in Singapore; Render authentication and Java deployment remain pending. This is not yet a working hosted HRM stack. Deployments are currently made with the CLI; automatic GitHub-to-Netlify deployment has not been configured.

`netlify.toml` builds `frontend` with `npm run build:netlify` and publishes `dist`. SPA rewrites allow direct navigation and refresh on React routes. API requests are routed before the SPA fallback and never cached. Set `PEOPLEOS_API_ORIGIN` to the deployed Java server's HTTPS origin (no path or credentials), then rebuild. Netlify proxies `/api/*` to the same path on that origin, keeping browser requests and secure session cookies same-origin. Without this setting the frontend is publishable, but API requests explicitly return 503 and online sign-in is unavailable. It does not run the Java backend inside a Netlify Function.

`render.yaml` prepares a Docker Java service on Render Free, using a separately provisioned Neon Free PostgreSQL database. It does not create Render's expiring free database. Supply `DATABASE_URL` as a JDBC connection URL such as `jdbc:postgresql://<neon-host>/<database>?sslmode=require`, plus separate `DATABASE_USER` and `DATABASE_PASSWORD` secrets. The `demo` Spring profile enables fictional fixtures, honors the platform port, limits its connection pool and retains secure cookies. Render generates `DEMO_PASSWORD`; retrieve it privately from the service environment to sign in as `novatech` / `owner@example.test`. It is not committed and is independent of local passwords. Do not put real HR data into this preview deployment.

Neon currently offers a free plan without a fixed expiry, subject to storage/compute quotas. Render Free sleeps after 15 minutes without inbound traffic; waking up may take about a minute and an initial Netlify proxy request may time out. Do not configure artificial keep-alive traffic or upgrade to paid plans automatically. Free availability is subject to provider terms, not an unlimited or perpetual guarantee. See [Neon pricing](https://neon.com/pricing), [Render free-instance limits](https://render.com/docs/free) and [Netlify API proxy rules](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/). The hosted Java API remains undeployed. Verify health, CSRF, login, session persistence and catalog APIs through the final Netlify URL after deployment.

## Neon setup — November 9, 2026

- Created `PeopleOS` (`dark-dust-08170704`) in the existing Free organization `org-fancy-band-22419789`, region `aws-ap-southeast-1`, PostgreSQL 17, fixed compute 0.25 CU. [Neon Console](https://console.neon.tech/app/projects/dark-dust-08170704/).
- Linked the workspace using `.neon` and added that file to `.gitignore`. Existing application settings and local PostgreSQL configuration were preserved. No application schema or demo data has been deployed to Neon yet.
- Installed official project skills `neon` and `neon-postgres` under `.agents/skills/`, with upstream hashes in `skills-lock.json`. Both passed `neon skills status` as up to date.
- Reused Neon CLI 8.23.3. Added checksum-verified portable Node 22.23.4 under ignored `.tools/` because skill installation requires Node 22.20 or later; the system Node installation was unchanged.
- Added `Neon` to the user-level Codex MCP configuration, pinned to this project and authenticated with a project-scoped API key. The key is outside the repository. Backed up the previous file as `~/.codex/config.toml.peopleos-neon-20261109.bak`; parsed TOML comparison confirmed every prior setting was preserved. The installer reformatted existing TOML tables.
- Verified MCP initialization and listing of 129 tools. Restart Codex to load the newly configured server into a chat session.
- Saved private connection exports only under ignored `.tools/`: `neon.env` (default CLI export) and `neon-postgres.env` (PostgreSQL-only export for deployment). Do not publish their contents. Supply pooled JDBC settings for runtime and a direct connection for Flyway migrations when wiring the backend.

Next: authenticate Render, deploy the Java service on Free, set Netlify `PEOPLEOS_API_ORIGIN`, then verify login and persistence through the public frontend.
