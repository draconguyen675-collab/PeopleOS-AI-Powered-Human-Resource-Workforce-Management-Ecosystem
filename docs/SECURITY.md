# Security model and remaining work

## Implemented boundary

Authentication uses Spring Security with BCrypt cost 12 and tenant-slug/email lookup. Identical emails in different tenants do not share identity. Spring Session JDBC stores server sessions; cookies are HttpOnly and SameSite=Lax. Secure cookies default to true; the local profile overrides this only for loopback HTTP development. CSRF remains enabled for login and every write. Tokens stay in memory. Login rotates the session ID; logout invalidates it.

Authorities come from database role-permission mappings. Method security enforces access beyond UI navigation. All tenant-owned reads derive scope from the authenticated principal, and company writes can address only that tenant. Employee DTOs contain work fields only; salary, identity, bank and health data are absent from schema and responses. Composite database foreign keys prevent cross-tenant department and audit-actor relationships.

Company writes use validation, optimistic versioning, and a transaction that includes the audit insert. Audit summaries omit sensitive values and credentials. Unexpected failures return a generic message and correlation reference; server logs retain diagnostic exceptions. Form values are rendered using React output escaping. Bound SQL values and allowlisted ordering prevent SQL injection.

Login attempts are limited to 20 per 15 minutes per direct peer address, in a bounded in-memory cache. The application does not trust arbitrary forwarded headers. Behind the local nginx proxy, clients share the same peer address; deploy a trusted ingress limiter and shared Redis counters before internet exposure or multiple API replicas. Current successful and failed attempts both consume the limit.

Self-service session management is available to every authenticated account. Listing and revocation join the session principal to both account UUID and tenant UUID. Only active sessions are returned. Responses expose the database management UUID and timestamps, never the bearer session ID or serialized security attributes. Revocation locks and deletes the owned session and writes a redacted audit event in the same transaction. A missing, expired or foreign session returns the same 404 response. The current session requires normal logout. A regression test verifies that saving an already loaded JDBC session after revocation does not recreate it. Requests already authorized before revocation may still finish; future authenticated requests are denied.

## Explicit limitations

- No public registration, invitation, email verification, password reset, MFA, OIDC/SSO or administrator management of other accounts' sessions yet. Session management is self-service only; device/IP metadata is not collected or inferred.
- Role changes are not an exposed operation; authorities in existing sessions are snapshots. A future role editor must revoke/refresh sessions.
- Login successes, logout, session revocation and company mutations are audited. Tenant-scoped failed-login auditing and security alerting are still planned.
- Current runtime database role also owns migrations. Separate least-privilege credentials and tamper-resistant audit retention are required before production.
- No database RLS, external penetration test, formal accessibility audit, backup recovery drill, or production load test has been completed.
- Dependency scan results are time-specific; CI must repeat them. OWASP Dependency-Check is configured under Maven profile `security-audit`; the local run failed to retrieve NVD/CISA advisory data, so backend dependencies have no verified clean result. See VERIFICATION.md.

The local seed must never be enabled in production. Real deployments require TLS, secret manager injection, secure cookies, an account provisioning process and operational review. Do not expose the local Compose demo publicly.
