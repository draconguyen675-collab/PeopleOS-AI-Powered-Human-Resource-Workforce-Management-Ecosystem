# Architecture

PeopleOS is a modular monolith. React/Vite is served by nginx, which proxies `/api` to Spring MVC. PostgreSQL owns durable business records and Spring Session records. The browser has no credentials in localStorage and no direct database access.

Modules: identity (authentication and roles), tenant (company configuration), organization (department hierarchy and position catalog), employee (directory and work-profile management), analytics (aggregate workforce overview). Shared infrastructure supplies security, audit, pagination and errors. APIs return explicit DTO records, never JPA entities. Mutations belong in application services and transactions.

JDBC supplies scoped read projections; JPA supplies versioned company, employee, department and position writes. Flyway exclusively owns DDL; Hibernate validates the schema. Sessions survive API restarts through PostgreSQL. Same-origin hosting avoids a permissive CORS policy. No trust is placed in client-provided tenant IDs.

Department hierarchy changes acquire a tenant-specific PostgreSQL transaction advisory lock before validating ancestors. This serializes simultaneous moves that could otherwise jointly create a cycle. Composite foreign keys protect all department/position links, including concurrent employee assignment versus catalog deletion. Employee archiving preserves its work data and references; unused departments and catalog positions may be deleted with audit retention.

An employee's individual position title is separate from its optional standardized position-catalog link. Existing titles are preserved without guessing catalog membership. Catalog edits update the linked label on subsequent reads; they do not silently rewrite employee work information. Position grades, headcount planning and effective-dated employment transitions remain separate backlog items.

Future modules are specified in the feature matrix. Redis, MinIO, Temporal, pgvector, Spring AI and provider adapters are introduced with their first working consumer, not as idle dependencies. AI is disabled and absent from navigation until Phase 7. There is no mock API fallback.

Local Docker is the delivery target. Sites Workers cannot execute a Java Spring Boot process or host PostgreSQL; this repository therefore uses the local workflow rather than publishing a disconnected static frontend.
