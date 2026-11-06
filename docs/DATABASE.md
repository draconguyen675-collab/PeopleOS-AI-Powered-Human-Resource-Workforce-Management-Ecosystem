# Database

PostgreSQL is the only supported application database. Flyway owns migrations V1–V4; JPA uses `ddl-auto=validate`. There is no H2 or in-memory application fallback.

| Table | Ownership / constraints |
| --- | --- |
| tenants | UUID primary key, unique slug, company name, IANA timezone, ISO currency, optimistic version |
| users | Tenant foreign key, normalized email unique within tenant, BCrypt hash, enabled flag, role reference |
| roles / permissions / role_permissions | Global fixed catalog, composite role-permission key |
| departments | Tenant foreign key, normalized tenant/name uniqueness, tenant/id candidate key, nullable composite tenant/parent foreign key, description and optimistic version |
| positions | Tenant foreign key, normalized unique tenant/code, title/description, tenant/id candidate key, optimistic version |
| employees | Tenant ownership, normalized unique tenant/number and tenant/work-email, status check, composite tenant/department and optional tenant/position foreign keys, optimistic version, archive/create/update timestamps |
| audit_logs | Tenant and actor references, redacted action summary, timestamp; tenant/actor composite foreign key |
| spring_session / spring_session_attributes | Framework schema, opaque session ID and serialized security state; expiry indexed |

Self-service session management reuses this framework schema. `primary_id` is the management UUID exposed to its owner; `session_id` remains a secret bearer identifier. The principal index stores the account UUID. Queries join `users` to verify account and tenant scope and filter expiry. Revocation deletes the owned row under a row lock; attributes cascade and the audit insert shares the transaction. No new migration is required for this capability.

Directory, catalog and audit indexes lead with tenant ID. Directory search is escaped, case-insensitive substring matching across work name/email; it is sufficient for the small foundation fixture. Trigram/full-text indexing and measured performance tests belong to larger-directory work. Pagination has bounded page size and deterministic ID tie-breakers. Overview reads use a repeatable-read transaction to keep aggregate counts consistent.

V2 adds employee revision/archive timestamps, normalized uniqueness, history indexes and `employees:write`. Archived employee numbers/emails remain reserved. V3 adds department description, parent/revision, normalized uniqueness and `organization:read/write`. These permissions are granted to owner/HR; V2/V3 remove existing serialized owner/HR sessions so the next sign-in loads new authorities. Viewer permissions remain unchanged.

V4 adds the position catalog and nullable employee `position_id` with a composite tenant foreign key. No existing free-text title is changed or automatically assigned to a catalog role. Position deletion is guarded by all linked profiles, including archived ones, and by the foreign key during concurrent writes. Department ancestors are validated in the service while holding a per-tenant advisory transaction lock; the database also rejects a department being its own parent. Deletion of an unused catalog row preserves its audit events.

Future tables and domain boundaries are specified in PRODUCT_REQUIREMENTS.md. They are not pre-created without a working feature. Composite foreign keys are required for every relationship between tenant-owned rows. Database access is server-only. Tenant-scoped SQL is currently the isolation boundary; RLS and separate migration/runtime database roles remain hardening work.

Demo IDs derive from stable names; employee dates and department assignments are fixed. The seed takes a PostgreSQL advisory transaction lock and does nothing when the workspace already exists. Two tenants, six accounts, eighteen departments and 128 employees are seeded. Actual authentication/audit timestamps and salted password hashes are intentionally not deterministic.
