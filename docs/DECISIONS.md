# Architecture decisions

1. **2026-10-13 — Java 25 / Spring Boot 4.1.1 / springdoc 3.1.1.** Official Maven metadata and [Spring system requirements](https://docs.spring.io/spring-boot/system-requirements.html) verified; [springdoc](https://springdoc.org/) provides the Boot 4 compatible line. No milestone versions. Boot 4 manages JUnit 6 (Jupiter), so use its compatible test BOM rather than forcing the requested JUnit 5 dependency over it; record this explicit compatibility deviation.
2. **Server sessions, not browser JWT storage.** Spring Session JDBC, HttpOnly cookies, CSRF, session fixation rotation and logout invalidation. Secure cookies default on; local profile explicitly permits HTTP loopback.
3. **Tenant-bound accounts for the first slice.** Sign in with workspace slug and email. Same email can exist in different workspaces. Tenant switching and multi-membership require a separate reviewed slice. No tenant selector that only changes client state.
4. **Fixed permission catalog initially.** Owner, HR administrator and viewer are backed by database role/permission mappings. Custom role editing and invitations are planned, not advertised.
5. **Incremental dependencies.** Add graph editors, drag-and-drop, advanced charts and AI libraries when their module ships. Keep the foundation small and verify lockfiles.
6. **No legal calculation guesses.** Payroll requires effective-dated, legally verified fixtures in Phase 3.
