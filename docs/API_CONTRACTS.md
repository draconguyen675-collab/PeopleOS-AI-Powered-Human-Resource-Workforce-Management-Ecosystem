# API contracts

Base path `/api/v1`. Same-origin session cookie, JSON DTOs, ISO dates, UUID identifiers. No JPA entity serialization. Success returns a typed object, array, or `{items,total,page,size}`; errors use `application/problem+json` with `status`, `detail`, and optional `errors` keyed by field. Authentication succeeds/logout completes with 204; invalid fields 400, missing session 401, forbidden/CSRF 403, stale revision 409, login throttle 429.

| Method / path | Authorization | Contract |
| --- | --- | --- |
| GET /auth/csrf | Public | `{token,headerName}`; acquire before login, refresh after login |
| POST /auth/login | Public + CSRF | Form-urlencoded `username=workspace:email&password=…`; rotates session |
| GET /auth/me | Session | `{id,tenantId,email,displayName,role,permissions}` |
| POST /auth/logout | Session + CSRF | Invalidates session, writes audit |
| GET /auth/sessions | Session, own account | Paged active sessions `{id,createdAt,lastAccessedAt,expiresAt,current}`; `id` is a management UUID, never a bearer session ID |
| DELETE /auth/sessions/{id} | Session, own account + CSRF | 204 and atomic audit on revocation; 404 for missing/expired/foreign session; 409 for current session (use logout) |
| GET /company | company:read | `{id,slug,name,timezone,currency,version}` |
| PATCH /company | company:write + CSRF | `{name,timezone,currency,version}`; updates only authenticated tenant |
| GET /employees | employees:read | Paged directory projection; excludes private/compensation data |
| GET /departments | employees:read | Ordered tenant department list `{id,name}[]` |
| GET /overview | dashboard:read | Aggregate counts, department distribution, recorded hiring months, asOf |
| GET /roles | roles:read | Global fixed role catalog and permission lists |
| GET /audit | audit:read | Tenant events, newest first; `page` and `size` |
| GET /openapi | Session | Generated OpenAPI document |

Directory parameters: `search` (max 100), `department` (UUID), `status` (ACTIVE/ONBOARDING/ON_LEAVE), `page` (0–100000), `size` (1–100, default 12), `sort` (name/startedOn/department), `direction` (asc/desc). Unknown tenant department IDs return an empty result. SQL identifiers are allowlisted and values bound. Audit defaults to 15 rows; at most 100.

Session listing defaults to 10 rows, with `size` 1–100 and `page` 0–100000, ordered by creation descending and management ID. Times are ISO instants; expiry moves with activity. All roles can manage their own sessions, including viewers. Account and tenant are derived from authentication. Expired sessions are excluded immediately, independently of scheduled database cleanup.

Clients must not automatically retry writes after an ambiguous network error. A company revision prevents stale overwrites. Refresh the security token after a 403 before a deliberate retry. No token is stored in browser persistent storage. Login/logout are Spring Security filter endpoints, explicitly included by the OpenAPI customizer alongside generated MVC paths. The document describes the SESSION cookie, login form, public CSRF bootstrap, and required CSRF header on writes.
