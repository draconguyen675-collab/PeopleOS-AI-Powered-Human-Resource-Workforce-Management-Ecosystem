# Deployment and operations

The supplied Compose stack is for local development only. It runs PostgreSQL, a non-root Java process, and non-root nginx on a loopback port. The API and database are not published to the host. nginx serves hashed frontend assets and proxies the same-origin API; database health gates API startup and API health gates the UI.

For an actual deployment: disable the local profile and demo seed, supply database secrets through the platform secret manager, terminate TLS at an approved ingress, retain secure cookies, configure trusted proxies deliberately, use separate database roles for migrations and runtime, provision real accounts, and implement the remaining authentication flows. Keep OpenAPI authenticated. Add monitored metrics/traces and alerts after selecting the runtime platform.

Backup procedure: use PostgreSQL `pg_dump --format=custom` with a least-privilege backup identity, encrypt snapshots, store them off-host with retention and access auditing. Restore to a separate environment using `pg_restore`, run Flyway validation and tenant/security smoke tests, and verify representative record counts and permission boundaries. This procedure has not yet been exercised; RPO/RTO must come from measured restore drills, not assumptions.

Release procedure: pass `clean verify`, frontend checks, dependency scans, Playwright and Compose smoke; review migrations; capture tested image digests and lockfiles; take a verified backup; migrate once; deploy; check readiness and critical journeys. Database rollback requires a reviewed compensating migration or restore; never rewrite already-applied Flyway files in deployed environments.

Sessions persist in PostgreSQL and expire after 30 minutes of inactivity. Monitor session table cleanup, database connections, failed logins, 5xx responses and disk capacity. AI is absent/disabled in this phase; no provider credentials are necessary.
