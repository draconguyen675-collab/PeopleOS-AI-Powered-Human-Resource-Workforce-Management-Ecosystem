# Architecture

PeopleOS is a modular monolith. React/Vite is served by nginx, which proxies `/api` to Spring MVC. PostgreSQL owns durable business records and Spring Session records. The browser has no credentials in localStorage and no direct database access.

Modules: identity (authentication and roles), tenant (company configuration), organization (department projections), employee (seeded directory projection), analytics (aggregate workforce overview). Shared infrastructure supplies security, audit, pagination and errors. APIs return explicit DTO records, never JPA entities. Mutations belong in application services and transactions.

Phase 0 uses JDBC for scoped read projections and JPA for versioned company writes. Flyway exclusively owns DDL; Hibernate validates the schema. Sessions survive API restarts through PostgreSQL. Same-origin hosting avoids a permissive CORS policy. No trust is placed in client-provided tenant IDs.

Future modules are specified in the feature matrix. Redis, MinIO, Temporal, pgvector, Spring AI and provider adapters are introduced with their first working consumer, not as idle dependencies. AI is disabled and absent from navigation until Phase 7. There is no mock API fallback.

Local Docker is the delivery target. Sites Workers cannot execute a Java Spring Boot process or host PostgreSQL; this repository therefore uses the local workflow rather than publishing a disconnected static frontend.
