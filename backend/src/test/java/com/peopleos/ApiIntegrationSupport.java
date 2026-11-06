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
abstract class ApiIntegrationSupport {
    protected static final String TEST_PASSWORD = "Test-only-passphrase-42";
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
            if (postgres == null) { postgres = new PostgreSQLContainer("postgres:17.11-alpine"); postgres.start(); }
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
}
