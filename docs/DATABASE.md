# Database

PostgreSQL is the only supported application database. Flyway `V1__foundation.sql` creates the current schema; JPA uses `ddl-auto=validate`. There is no H2 or in-memory application fallback.

| Table | Ownership / constraints |
| --- | --- |
| tenants | UUID primary key, unique slug, company name, IANA timezone, ISO currency, optimistic version |
| users | Tenant foreign key, normalized email unique within tenant, BCrypt hash, enabled flag, role reference |
| roles / permissions / role_permissions | Global fixed catalog, composite role-permission key |
| departments | Tenant foreign key, tenant/name uniqueness, tenant/id candidate key |
| employees | Tenant ownership, unique tenant/number and tenant/work-email, status check, composite tenant/department foreign key |
| audit_logs | Tenant and actor references, redacted action summary, timestamp; tenant/actor composite foreign key |
| spring_session / spring_session_attributes | Framework schema, opaque session ID and serialized security state; expiry indexed |

Self-service session management reuses this framework schema. `primary_id` is the management UUID exposed to its owner; `session_id` remains a secret bearer identifier. The principal index stores the account UUID. Queries join `users` to verify account and tenant scope and filter expiry. Revocation deletes the owned row under a row lock; attributes cascade and the audit insert shares the transaction. No new migration is required for this capability.

Directory and audit indexes lead with tenant ID. Directory search is escaped, case-insensitive substring matching across work name/email; it is sufficient for the small foundation fixture. Trigram/full-text indexing and measured performance tests belong to larger-directory work. Pagination has bounded page size and deterministic ID tie-breakers. Overview reads use a repeatable-read transaction to keep aggregate counts consistent.

Future tables and domain boundaries are specified in PRODUCT_REQUIREMENTS.md. They are not pre-created without a working feature. Composite foreign keys are required for every relationship between tenant-owned rows. Database access is server-only. Tenant-scoped SQL is currently the isolation boundary; RLS and separate migration/runtime database roles remain hardening work.

Demo IDs derive from stable names; employee dates and department assignments are fixed. The seed takes a PostgreSQL advisory transaction lock and does nothing when the workspace already exists. Two tenants, six accounts, eighteen departments and 128 employees are seeded. Actual authentication/audit timestamps and salted password hashes are intentionally not deterministic.
