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
| GET /employees/{id} | employees:read | Work profile, department ID/name, version and timestamps; archived profiles remain readable |
| POST /employees | employees:write + CSRF | Employee values below; 201 with Location and created profile |
| PATCH /employees/{id} | employees:write + CSRF | `{version,details:EmployeeValues}`; stale or archived profile returns 409 |
| DELETE /employees/{id}?version=N | employees:write + CSRF | Soft archive; 200 with profile and updated version |
| POST /employees/{id}/restore | employees:write + CSRF | `{version}`; 200 with restored profile |
| GET /employees/{id}/history | employees:read | Paged redacted employee events; does not expose unrelated audit events |
| GET /departments | employees:read | Ordered tenant department list `{id,name}[]` |
| GET /organization/departments | organization:read | Paged department details, `search`, optional `parentId`, `page`, `size` |
| GET /organization/departments/{id} | organization:read | `{id,name,description,parentId,parentName,employeeCount,childCount,version}` |
| POST /organization/departments | organization:write + CSRF | `{name,description,parentId}`; 201 with Location and detail |
| PATCH /organization/departments/{id} | organization:write + CSRF | `{version,details:{name,description,parentId}}`; 200 with detail |
| DELETE /organization/departments/{id}?version=N | organization:write + CSRF | 204; 409 if version is stale or employees/children still refer to the department |
| GET /positions | employees:read | Ordered tenant catalog options `{id,code,title}[]` |
| GET /organization/positions | organization:read | Paged catalog details; `search`, `page`, `size` |
| GET /organization/positions/{id} | organization:read | `{id,code,title,description,employeeCount,version}` |
| POST /organization/positions | organization:write + CSRF | `{code,title,description}`; 201 with Location and detail |
| PATCH /organization/positions/{id} | organization:write + CSRF | `{version,details:{code,title,description}}`; 200 with detail |
| DELETE /organization/positions/{id}?version=N | organization:write + CSRF | 204; 409 for stale revision or any linked employee |
| GET /overview | dashboard:read | Aggregate counts, department distribution, recorded hiring months, asOf |
| GET /roles | roles:read | Global fixed role catalog and permission lists |
| GET /audit | audit:read | Tenant events, newest first; `page` and `size` |
| GET /openapi | Session | Generated OpenAPI document |

Directory parameters: `search` (max 100), `department` (UUID), `status` (ACTIVE/ONBOARDING/ON_LEAVE), `archived` (default false; true selects archived profiles only), `page` (0–100000), `size` (1–100, default 12), `sort` (name/startedOn/department), `direction` (asc/desc). Unknown tenant department IDs return an empty result. SQL identifiers are allowlisted and values bound. Audit defaults to 15 rows; at most 100.

Employee values: `employeeNumber`, `name`, `workEmail`, `position`, `location`, `departmentId`, `status`, `startedOn`, optional nullable `positionId`. Employee numbers are trimmed and uppercased; work emails are trimmed and lowercased. Both are unique within the tenant, including archived profiles. Department and linked catalog position IDs must belong to the current tenant. `position` is the employee's individual title; `positionId` links to a standardized role without rewriting that title. Details additionally expose the current catalog label as `positionName`, or null. PATCH requires the full set of work values; a null/omitted `positionId` removes the link. Location remains free text. Archive/restore preserves employment status and excludes archived profiles from overview aggregates. It does not terminate employment, revoke a user account or run offboarding. Foreign/missing resource IDs return 404 without disclosing ownership.

Department names are trimmed and unique case-insensitively within a tenant (max 100 characters); descriptions are limited to 300 characters. `parentId` is a UUID or null for top level. Parent references must be in the same tenant and cannot create a cycle, including through simultaneous updates. Department listing uses `page` 0–100000, `size` 1–100 (default 12) and `search` max 100. Linked-profile counts and deletion guards include archived employees. Only an unused department can be permanently deleted; its audit events remain.

Position codes are trimmed, uppercased, max 30, match `[A-Z0-9][A-Z0-9._-]*`, and are unique case-insensitively within a tenant. Titles are required (max 120); descriptions are optional (max 1000). Search matches escaped title/code text (max 100); paging bounds/defaults match departments. Titles may repeat because codes distinguish catalog roles. Counts include archived employee links; unused positions can be deleted with retained audit events. Catalog updates do not mutate individual employee titles or create an employment transition.

Session listing defaults to 10 rows, with `size` 1–100 and `page` 0–100000, ordered by creation descending and management ID. Times are ISO instants; expiry moves with activity. All roles can manage their own sessions, including viewers. Account and tenant are derived from authentication. Expired sessions are excluded immediately, independently of scheduled database cleanup.

Clients must not automatically retry writes after an ambiguous network error. Company, employee, department and position revisions prevent stale overwrites. Refresh the security token after a 403 before a deliberate retry. No token is stored in browser persistent storage. Login/logout are Spring Security filter endpoints, explicitly included by the OpenAPI customizer alongside generated MVC paths. The document describes the SESSION cookie, login form, public CSRF bootstrap, and required CSRF header on writes.
