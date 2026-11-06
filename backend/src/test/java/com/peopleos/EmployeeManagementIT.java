package com.peopleos;

import com.peopleos.shared.config.DemoSeed;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;
import tools.jackson.databind.JsonNode;
import static org.assertj.core.api.Assertions.assertThat;

// Separate application context gives this security suite its own real limiter, without disabling it.
@TestPropertySource(properties = "peopleos.test.slice=employee-management")
class EmployeeManagementIT extends ApiIntegrationSupport {
    Map<String, Object> values(String number) {
        return new LinkedHashMap<>(Map.of("employeeNumber", number, "name", "  Test Employee  ",
            "workEmail", number.toLowerCase() + "@example.test", "departmentId", DemoSeed.id("novatechEngineering").toString(),
            "position", "Engineer", "location", "Hanoi", "status", "ONBOARDING", "startedOn", "2026-10-19"));
    }
    JsonNode create(Session actor, Map<String, Object> values) throws Exception {
        var response = actor.request("POST", "/employees", json.writeValueAsString(values), true);
        assertThat(response.statusCode()).as(response.body()).isEqualTo(201);
        var created = json.readTree(response.body());
        assertThat(response.headers().firstValue("location")).contains("/api/v1/employees/" + created.get("id").asText());
        return created;
    }
    void cleanup(JsonNode employee) {
        jdbc.update("DELETE FROM employees WHERE id = ?", UUID.fromString(employee.get("id").asText()));
    }
    @Test void hrCanCreateEditArchiveAndRestoreWithVersionedAudit() throws Exception {
        var hr = login("novatech", "hr@example.test");
        var details = values("IT-" + UUID.randomUUID().toString().substring(0, 8));
        long initial = hr.get("/employees").get("total").asLong();
        var employee = create(hr, details);
        String path = "/employees/" + employee.get("id").asText();
        try {
            assertThat(employee.get("name").asText()).isEqualTo("Test Employee");
            assertThat(hr.get(path).get("employeeNumber")).isEqualTo(employee.get("employeeNumber"));
            assertThat(hr.get("/employees").get("total").asLong()).isEqualTo(initial + 1);
            details.put("position", "Senior Engineer");
            var patch = json.writeValueAsString(Map.of("version", 0, "details", details));
            assertThat(hr.request("PATCH", path, patch, false).statusCode()).isEqualTo(403);
            try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
                var start = new java.util.concurrent.CountDownLatch(1);
                java.util.concurrent.Callable<Integer> write = () -> { start.await(); return hr.request("PATCH", path, patch, true).statusCode(); };
                var first = executor.submit(write); var second = executor.submit(write); start.countDown();
                assertThat(java.util.List.of(first.get(), second.get())).containsExactlyInAnyOrder(200, 409);
            }
            assertThat(hr.get(path).get("version").asLong()).isEqualTo(1);
            assertThat(hr.request("PATCH", path, patch, true).statusCode()).isEqualTo(409);
            assertThat(hr.request("DELETE", path + "?version=0", null, true).statusCode()).isEqualTo(409);
            assertThat(hr.request("DELETE", path + "?version=1", null, false).statusCode()).isEqualTo(403);
            assertThat(hr.request("DELETE", path + "?version=1", null, true).statusCode()).isEqualTo(200);
            assertThat(hr.get(path).get("archivedAt").isNull()).isFalse();
            assertThat(hr.get("/employees").get("total").asLong()).isEqualTo(initial);
            assertThat(hr.get("/overview").get("employees").asLong()).isEqualTo(initial);
            assertThat(hr.get("/employees?archived=true&search=" + employee.get("workEmail").asText()).get("total").asLong()).isEqualTo(1);
            assertThat(hr.request("PATCH", path, json.writeValueAsString(Map.of("version", 2, "details", details)), true).statusCode()).isEqualTo(409);
            assertThat(hr.request("POST", path + "/restore", "{\"version\":1}", true).statusCode()).isEqualTo(409);
            assertThat(hr.request("POST", path + "/restore", "{\"version\":2}", true).statusCode()).isEqualTo(200);
            assertThat(hr.get(path).get("version").asLong()).isEqualTo(3);
            assertThat(hr.get(path).get("archivedAt").isNull()).isTrue();
            assertThat(hr.get("/overview").get("employees").asLong()).isEqualTo(initial + 1);
            var history = hr.get(path + "/history");
            assertThat(history.get("total").asLong()).isEqualTo(4);
            assertThat(history.toString()).contains("EMPLOYEE_CREATED", "EMPLOYEE_UPDATED", "EMPLOYEE_ARCHIVED", "EMPLOYEE_RESTORED")
                .doesNotContain(employee.get("workEmail").asText(), "Senior Engineer");
            assertThat(hr.get(path + "/history?size=1").get("items").size()).isEqualTo(1);
            assertThat(hr.request("GET", path + "/history?size=101", null, false).statusCode()).isEqualTo(400);
        } finally { cleanup(employee); }
    }
    @Test void employeeOperationsRejectOtherTenantAndViewer() throws Exception {
        var owner = login("novatech", "owner@example.test");
        var orbit = login("orbit", "owner@example.test");
        var viewer = login("novatech", "viewer@example.test");
        var details = values("IT-" + UUID.randomUUID().toString().substring(0, 8));
        var employee = create(owner, details);
        String path = "/employees/" + employee.get("id").asText();
        try {
            for (var actor : new Session[]{orbit, viewer}) {
                int forbidden = actor == orbit ? 404 : 403;
                assertThat(actor.request("GET", path, null, false).statusCode()).isEqualTo(forbidden);
                assertThat(actor.request("GET", path + "/history", null, false).statusCode()).isEqualTo(forbidden);
                assertThat(actor.request("PATCH", path, json.writeValueAsString(Map.of("version", 0, "details", details)), true).statusCode()).isEqualTo(forbidden);
                assertThat(actor.request("DELETE", path + "?version=0", null, true).statusCode()).isEqualTo(forbidden);
                assertThat(actor.request("POST", path + "/restore", "{\"version\":0}", true).statusCode()).isEqualTo(forbidden);
            }
            assertThat(viewer.request("POST", "/employees", json.writeValueAsString(details), true).statusCode()).isEqualTo(403);
            assertThat(orbit.get("/employees?search=" + employee.get("workEmail").asText()).get("total").asLong()).isZero();
            details.put("departmentId", DemoSeed.id("orbitEngineering").toString());
            assertThat(owner.request("POST", "/employees", json.writeValueAsString(details), true).statusCode()).isEqualTo(400);
            assertThat(owner.request("PATCH", path, json.writeValueAsString(Map.of("version", 0, "details", details)), true).statusCode()).isEqualTo(400);
            assertThat(owner.get(path).get("version").asLong()).isZero();
            assertThat(owner.get(path + "/history").get("total").asLong()).isEqualTo(1);
        } finally { cleanup(employee); }
    }
    @Test void invalidAndDuplicateEmployeeWritesDoNotPersistOrAudit() throws Exception {
        var owner = login("novatech", "owner@example.test");
        var details = values("IT-" + UUID.randomUUID().toString().substring(0, 8));
        assertThat(owner.request("POST", "/employees", json.writeValueAsString(details), false).statusCode()).isEqualTo(403);
        var employee = create(owner, details);
        String path = "/employees/" + employee.get("id").asText();
        try {
            long audits = jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE resource_type = 'EMPLOYEE'", Long.class);
            details.put("employeeNumber", details.get("employeeNumber").toString().toLowerCase());
            details.put("workEmail", details.get("workEmail").toString().toUpperCase());
            assertThat(owner.request("POST", "/employees", json.writeValueAsString(details), true).statusCode()).isEqualTo(409);
            details.put("name", "   "); details.put("status", "FIRED"); details.put("workEmail", "not-an-email");
            var invalid = owner.request("PATCH", path, json.writeValueAsString(Map.of("version", 0, "details", details)), true);
            assertThat(invalid.statusCode()).isEqualTo(400);
            assertThat(invalid.body()).contains("details.name", "details.status", "details.workEmail");
            assertThat(owner.request("PATCH", path, json.writeValueAsString(Map.of("details", values("VALID"))), true).statusCode()).isEqualTo(400);
            assertThat(owner.request("DELETE", path, null, true).statusCode()).isEqualTo(400);
            assertThat(owner.get(path).get("version").asLong()).isZero();
            assertThat(jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE resource_type = 'EMPLOYEE'", Long.class)).isEqualTo(audits);
        } finally { cleanup(employee); }
    }
}
