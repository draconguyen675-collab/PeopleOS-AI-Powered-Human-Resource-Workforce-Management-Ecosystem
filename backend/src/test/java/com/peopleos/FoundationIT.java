package com.peopleos;

import com.peopleos.shared.config.DemoSeed;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
    "peopleos.demo.enabled=true", "peopleos.demo.password=Test-only-passphrase-42",
    "server.servlet.session.cookie.secure=false", "logging.structured.format.console="
})
class FoundationIT {
    private static final String TEST_PASSWORD = "Test-only-passphrase-42";
    private static PostgreSQLContainer postgres;
    @LocalServerPort int port;
    @Autowired ObjectMapper json;
    @Autowired JdbcTemplate jdbc;
    @Autowired DemoSeed seed;
    @Autowired org.springframework.session.jdbc.JdbcIndexedSessionRepository sessionRepository;

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry properties) {
        String external = System.getenv("TEST_DATABASE_URL");
        if (external == null || external.isBlank()) {
            postgres = new PostgreSQLContainer("postgres:17.11-alpine");
            postgres.start();
            properties.add("spring.datasource.url", postgres::getJdbcUrl);
            properties.add("spring.datasource.username", postgres::getUsername);
            properties.add("spring.datasource.password", postgres::getPassword);
        } else {
            properties.add("spring.datasource.url", () -> external);
            properties.add("spring.datasource.username", () -> System.getenv("TEST_DATABASE_USER"));
            properties.add("spring.datasource.password", () -> System.getenv("TEST_DATABASE_PASSWORD"));
        }
    }

    class Session {
        final CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        final HttpClient http = HttpClient.newBuilder().cookieHandler(cookies).connectTimeout(Duration.ofSeconds(10)).build();
        String csrf;
        String csrfHeader;
        HttpResponse<String> request(String method, String path, String body, boolean withCsrf) throws Exception {
            var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + "/api/v1" + path))
                .timeout(Duration.ofSeconds(15));
            if (body != null) builder.header("Content-Type", path.equals("/auth/login") ? "application/x-www-form-urlencoded" : "application/json");
            if (withCsrf) builder.header(csrfHeader, csrf);
            return http.send(builder.method(method, body == null ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
        }
        void csrf() throws Exception {
            var response = request("GET", "/auth/csrf", null, false);
            assertThat(response.statusCode()).isEqualTo(200);
            var value = json.readTree(response.body());
            csrf = value.get("token").asText(); csrfHeader = value.get("headerName").asText();
        }
        JsonNode get(String path) throws Exception {
            var response = request("GET", path, null, false);
            assertThat(response.statusCode()).as(response.body()).isEqualTo(200);
            return json.readTree(response.body());
        }
    }
    Session login(String workspace, String email) throws Exception {
        var session = new Session(); session.csrf();
        var response = session.request("POST", "/auth/login", "username=" + URLEncoder.encode(workspace + ":" + email, StandardCharsets.UTF_8) + "&password=" + TEST_PASSWORD, true);
        assertThat(response.statusCode()).as(response.body()).isEqualTo(204);
        session.csrf(); return session;
    }
    String settings(JsonNode company, String name) {
        return json.writeValueAsString(Map.of("name", name, "timezone", "Asia/Ho_Chi_Minh", "currency", "VND", "version", company.get("version").asLong()));
    }

    @Test void unauthenticatedApisDenyAccess() throws Exception {
        var session = new Session();
        for (String path : new String[]{"/auth/me", "/auth/sessions", "/employees", "/company", "/overview", "/audit", "/roles", "/openapi"}) {
            assertThat(session.request("GET", path, null, false).statusCode()).as(path).isEqualTo(401);
        }
    }
    @Test void loginRequiresCsrfAndHidesInvalidAccountDetails() throws Exception {
        var session = new Session();
        assertThat(session.request("POST", "/auth/login", "username=novatech:owner@example.test&password=invalid", false).statusCode()).isEqualTo(403);
        session.csrf();
        var invalid = session.request("POST", "/auth/login", "username=novatech:nobody@example.test&password=invalid", true);
        assertThat(invalid.statusCode()).isEqualTo(401);
        assertThat(invalid.body()).contains("Workspace, email or password is incorrect").doesNotContain("nobody");
    }
    @Test void sessionIsHttpOnlyRotatesOnLoginAndLogoutInvalidatesIt() throws Exception {
        var session = new Session(); session.csrf();
        String before = session.cookies.getCookieStore().getCookies().getFirst().getValue();
        var response = session.request("POST", "/auth/login", "username=novatech:owner@example.test&password=" + TEST_PASSWORD, true);
        assertThat(response.statusCode()).isEqualTo(204);
        assertThat(response.headers().allValues("set-cookie").toString()).contains("HttpOnly", "SameSite=Lax");
        assertThat(session.cookies.getCookieStore().getCookies().getFirst().getValue()).isNotEqualTo(before);
        session.csrf();
        var me = session.get("/auth/me");
        assertThat(me.get("role").asText()).isEqualTo("OWNER");
        assertThat(me.toString()).doesNotContain("password");
        assertThat(jdbc.queryForObject("SELECT count(*) FROM spring_session WHERE principal_name = ?", Long.class, me.get("id").asText())).isGreaterThan(0);
        assertThat(session.request("POST", "/auth/logout", null, true).statusCode()).isEqualTo(204);
        assertThat(session.request("GET", "/auth/me", null, false).statusCode()).isEqualTo(401);
    }
    @Test void directoryAndAggregatesNeverCrossTenants() throws Exception {
        var nova = login("novatech", "owner@example.test");
        var orbit = login("orbit", "owner@example.test");
        assertThat(nova.get("/employees").get("total").asLong()).isEqualTo(120);
        assertThat(nova.get("/employees?tenantId=" + DemoSeed.id("orbit")).get("total").asLong()).isEqualTo(120);
        assertThat(orbit.get("/employees").get("total").asLong()).isEqualTo(8);
        assertThat(nova.get("/overview").get("employees").asLong()).isEqualTo(120);
        assertThat(orbit.get("/overview").get("employees").asLong()).isEqualTo(8);
        assertThat(orbit.get("/employees").toString()).doesNotContain("novatech.example.test");
        assertThat(nova.get("/employees?department=" + DemoSeed.id("orbitEngineering")).get("total").asLong()).isZero();
        assertThat(orbit.get("/company").get("slug").asText()).isEqualTo("orbit");
    }
    @Test void viewerCannotReadDirectoryRolesOrAuditAndCannotWriteCompany() throws Exception {
        var viewer = login("novatech", "viewer@example.test");
        for (String path : new String[]{"/employees", "/departments", "/roles", "/audit"}) {
            assertThat(viewer.request("GET", path, null, false).statusCode()).as(path).isEqualTo(403);
        }
        var company = viewer.get("/company");
        assertThat(viewer.request("PATCH", "/company", settings(company, "Forbidden"), true).statusCode()).isEqualTo(403);
        assertThat(viewer.get("/overview").get("employees").asLong()).isEqualTo(120);
    }
    @Test void hrCanReadDirectoryButCannotChangeCompany() throws Exception {
        var hr = login("novatech", "hr@example.test");
        assertThat(hr.get("/employees").get("total").asLong()).isEqualTo(120);
        assertThat(hr.request("PATCH", "/company", settings(hr.get("/company"), "Forbidden"), true).statusCode()).isEqualTo(403);
    }
    @Test void companyWriteRequiresCsrfDetectsStaleVersionsAndCreatesTenantAudit() throws Exception {
        var owner = login("novatech", "owner@example.test");
        var before = owner.get("/company");
        String change = settings(before, "NovaTech Vietnam verified");
        assertThat(owner.request("PATCH", "/company", change, false).statusCode()).isEqualTo(403);
        var saved = owner.request("PATCH", "/company", change, true);
        assertThat(saved.statusCode()).as(saved.body()).isEqualTo(200);
        assertThat(json.readTree(saved.body()).get("version").asLong()).isEqualTo(before.get("version").asLong() + 1);
        assertThat(owner.request("PATCH", "/company", change, true).statusCode()).isEqualTo(409);
        assertThat(owner.get("/audit").toString()).contains("COMPANY_UPDATED").doesNotContain(TEST_PASSWORD);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE tenant_id = ? AND action = 'COMPANY_UPDATED'", Long.class, DemoSeed.id("orbit"))).isZero();
        assertThat(owner.request("PATCH", "/company", settings(owner.get("/company"), before.get("name").asText()), true).statusCode()).isEqualTo(200);
    }
    @Test void invalidCompanyDoesNotWriteOrAudit() throws Exception {
        var owner = login("novatech", "owner@example.test");
        long before = jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE action = 'COMPANY_UPDATED'", Long.class);
        var invalid = owner.request("PATCH", "/company", "{\"name\":\"\",\"timezone\":\"UTC\",\"currency\":\"VND\",\"version\":0}", true);
        assertThat(invalid.statusCode()).isEqualTo(400);
        assertThat(invalid.body()).contains("errors", "name").doesNotContain("stackTrace");
        assertThat(owner.request("PATCH", "/company", "{\"name\":\"No revision\",\"timezone\":\"UTC\",\"currency\":\"VND\"}", true).statusCode()).isEqualTo(400);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE action = 'COMPANY_UPDATED'", Long.class)).isEqualTo(before);
    }
    @Test void paginationFilteringAndSqlInputAreBounded() throws Exception {
        var owner = login("novatech", "owner@example.test");
        var first = owner.get("/employees?size=5&page=0");
        var second = owner.get("/employees?size=5&page=1");
        assertThat(first.get("items").size()).isEqualTo(5);
        assertThat(first.get("items").get(0).get("id")).isNotEqualTo(second.get("items").get(0).get("id"));
        assertThat(owner.get("/employees?status=ONBOARDING").get("total").asInt()).isEqualTo(7);
        assertThat(owner.get("/employees?search=%25").get("total").asInt()).isZero();
        for (String query : new String[]{"size=101", "page=-1", "sort=password_hash", "direction=drop", "status=UNKNOWN"}) {
            assertThat(owner.request("GET", "/employees?" + query, null, false).statusCode()).as(query).isEqualTo(400);
        }
    }
    @Test void openApiDescribesImplementedOperations() throws Exception {
        var owner = login("novatech", "owner@example.test");
        var document = owner.get("/openapi");
        var paths = document.get("paths");
        assertThat(paths.has("/api/v1/company")).isTrue();
        assertThat(paths.has("/api/v1/employees")).isTrue();
        assertThat(paths.has("/api/v1/auth/sessions/{id}")).isTrue();
        assertThat(paths.get("/api/v1/auth/login").get("post").get("requestBody").get("content")
            .has("application/x-www-form-urlencoded")).isTrue();
        assertThat(paths.get("/api/v1/auth/login").get("post").get("security").isEmpty()).isTrue();
        assertThat(paths.get("/api/v1/auth/csrf").get("get").get("security").isEmpty()).isTrue();
        assertThat(paths.get("/api/v1/auth/logout").get("post").get("parameters").toString()).contains("X-CSRF-TOKEN");
        assertThat(document.get("components").get("securitySchemes").get("sessionCookie").get("in").asText()).isEqualTo("cookie");
    }
    JsonNode currentSession(Session session) throws Exception {
        for (JsonNode item : session.get("/auth/sessions?size=100").get("items")) {
            if (item.get("current").asBoolean()) return item;
        }
        throw new AssertionError("Current session missing");
    }
    private <S extends org.springframework.session.Session> Runnable pendingSessionSave(
            org.springframework.session.SessionRepository<S> repository, String bearerId) {
        S loaded = repository.findById(bearerId);
        assertThat(loaded).isNotNull();
        loaded.setLastAccessedTime(java.time.Instant.now());
        return () -> repository.save(loaded);
    }
    @Test void selfServiceRevocationRequiresOwnershipAndCsrfAndInvalidatesOtherSession() throws Exception {
        var first = login("novatech", "viewer@example.test");
        var second = login("novatech", "viewer@example.test");
        var otherAccount = login("novatech", "hr@example.test");
        var otherTenant = login("orbit", "viewer@example.test");
        String target = currentSession(second).get("id").asText();
        String own = currentSession(first).get("id").asText();
        String foreignAccount = currentSession(otherAccount).get("id").asText();
        String foreignTenant = currentSession(otherTenant).get("id").asText();
        var listing = first.get("/auth/sessions?size=100").toString();
        assertThat(listing).contains(target, own).doesNotContain(foreignAccount, foreignTenant, "sessionId", "password", "attribute_bytes");
        var bearerIds = jdbc.queryForList("SELECT session_id FROM spring_session", String.class);
        bearerIds.forEach(bearer -> assertThat(listing).doesNotContain(bearer));
        for (String forbidden : new String[]{foreignAccount, foreignTenant, java.util.UUID.randomUUID().toString()}) {
            var response = first.request("DELETE", "/auth/sessions/" + forbidden, null, true);
            assertThat(response.statusCode()).isEqualTo(404);
            assertThat(response.body()).contains("Session is no longer available.");
        }
        assertThat(first.request("DELETE", "/auth/sessions/" + own, null, true).statusCode()).isEqualTo(409);
        assertThat(first.request("DELETE", "/auth/sessions/" + target, null, false).statusCode()).isEqualTo(403);
        assertThat(second.get("/auth/me").get("role").asText()).isEqualTo("VIEWER");
        String targetBearer = jdbc.queryForObject("SELECT session_id FROM spring_session WHERE primary_id = ?", String.class, target);
        Runnable inFlightSave = pendingSessionSave(sessionRepository, targetBearer);
        assertThat(first.request("DELETE", "/auth/sessions/" + target, null, true).statusCode()).isEqualTo(204);
        // A request that loaded the session before revocation must not recreate it when saving later.
        inFlightSave.run();
        assertThat(sessionRepository.findById(targetBearer)).isNull();
        assertThat(second.request("GET", "/auth/me", null, false).statusCode()).isEqualTo(401);
        assertThat(first.get("/auth/me").get("role").asText()).isEqualTo("VIEWER");
        assertThat(otherAccount.get("/auth/me").get("role").asText()).isEqualTo("HR_ADMIN");
        assertThat(otherTenant.get("/auth/me").get("tenantId").asText()).isEqualTo(DemoSeed.id("orbit").toString());
        assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE action = 'SESSION_REVOKED' AND resource_id = ? AND tenant_id = ?", Long.class,
            java.util.UUID.fromString(target), DemoSeed.id("novatech"))).isEqualTo(1);
        assertThat(first.request("DELETE", "/auth/sessions/" + target, null, true).statusCode()).isEqualTo(404);
        assertThat(first.get("/auth/sessions?size=1").get("items").size()).isEqualTo(1);
        for (String query : new String[]{"size=101", "page=-1", "page=100001", "size=0"})
            assertThat(first.request("GET", "/auth/sessions?" + query, null, false).statusCode()).isEqualTo(400);
    }
    @Test void expiredSessionsAreHiddenAndCannotBeRevoked() throws Exception {
        var actor = login("novatech", "viewer@example.test");
        String expired = java.util.UUID.randomUUID().toString();
        String bearer = java.util.UUID.randomUUID().toString();
        long then = System.currentTimeMillis() - 120000;
        jdbc.update("""
            INSERT INTO spring_session(primary_id, session_id, creation_time, last_access_time,
                max_inactive_interval, expiry_time, principal_name) VALUES (?, ?, ?, ?, 30, ?, ?)
            """, expired, bearer, then, then, then + 30000, actor.get("/auth/me").get("id").asText());
        try {
            assertThat(actor.get("/auth/sessions?size=100").toString()).doesNotContain(expired);
            assertThat(actor.request("DELETE", "/auth/sessions/" + expired, null, true).statusCode()).isEqualTo(404);
        } finally {
            jdbc.update("DELETE FROM spring_session WHERE primary_id = ?", expired);
        }
    }
    @Test void seedingIsIdempotentAndPasswordsAreHashed() throws Exception {
        seed.run(null);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM employees", Long.class)).isEqualTo(128);
        var hashes = jdbc.queryForList("SELECT password_hash FROM users", String.class);
        assertThat(hashes).allSatisfy(hash -> assertThat(hash).startsWith("$2a$12$").doesNotContain(TEST_PASSWORD));
    }
}
