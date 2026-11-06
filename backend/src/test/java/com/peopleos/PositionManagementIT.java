package com.peopleos;

import com.peopleos.shared.config.DemoSeed;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;
import tools.jackson.databind.JsonNode;
import static org.assertj.core.api.Assertions.assertThat;

@TestPropertySource(properties = "peopleos.test.slice=position-management")
class PositionManagementIT extends ApiIntegrationSupport {
    private static final String BASE = "/organization/positions";
    Map<String, String> values(String code, String title) {
        return Map.of("code", code, "title", title, "description", "Position integration fixture");
    }
    JsonNode create(Session actor, String code) throws Exception {
        var response = actor.request("POST", BASE, json.writeValueAsString(values(code, "Engineer")), true);
        assertThat(response.statusCode()).as(response.body()).isEqualTo(201);
        return json.readTree(response.body());
    }
    Map<String, Object> employee(String suffix, String positionId) {
        var result = new LinkedHashMap<String, Object>();
        result.put("employeeNumber", "POS-" + suffix); result.put("name", "Position fixture");
        result.put("workEmail", "pos-" + suffix + "@example.test");
        result.put("departmentId", DemoSeed.id("novatechEngineering").toString());
        result.put("position", "Individual work title"); result.put("location", "Hanoi");
        result.put("status", "ACTIVE"); result.put("startedOn", "2026-01-01"); result.put("positionId", positionId);
        return result;
    }
    void cleanup(JsonNode position) { jdbc.update("DELETE FROM positions WHERE id = ?", UUID.fromString(position.get("id").asText())); }

    @Test void catalogAndEmployeeLinksPreserveTitlesAndGuardArchivedUsage() throws Exception {
        var hr = login("novatech", "hr@example.test");
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        var position = create(hr, "  qa-" + suffix + "  ");
        String positionId = position.get("id").asText(), path = BASE + "/" + positionId;
        String employeeId = null;
        try {
            assertThat(position.get("code").asText()).isEqualTo("QA-" + suffix.toUpperCase());
            var response = hr.request("POST", "/employees", json.writeValueAsString(employee(suffix, positionId)), true);
            assertThat(response.statusCode()).as(response.body()).isEqualTo(201);
            var profile = json.readTree(response.body()); employeeId = profile.get("id").asText();
            assertThat(profile.get("positionId").asText()).isEqualTo(positionId);
            assertThat(profile.get("positionName").asText()).contains("Engineer");
            assertThat(hr.get(path).get("employeeCount").asLong()).isEqualTo(1);
            String update = json.writeValueAsString(Map.of("version", 0, "details", values("QA-" + suffix, "Senior engineer")));
            assertThat(hr.request("PATCH", path, update, false).statusCode()).isEqualTo(403);
            assertThat(hr.request("PATCH", path, update, true).statusCode()).isEqualTo(200);
            assertThat(hr.request("PATCH", path, update, true).statusCode()).isEqualTo(409);
            var after = hr.get("/employees/" + employeeId);
            assertThat(after.get("positionName").asText()).contains("Senior engineer");
            assertThat(after.get("position").asText()).isEqualTo("Individual work title");
            assertThat(hr.request("DELETE", "/employees/" + employeeId + "?version=0", null, true).statusCode()).isEqualTo(200);
            assertThat(hr.request("DELETE", path + "?version=1", null, true).statusCode()).isEqualTo(409);
            assertThat(hr.request("POST", "/employees/" + employeeId + "/restore", "{\"version\":1}", true).statusCode()).isEqualTo(200);
            var unlinked = hr.request("PATCH", "/employees/" + employeeId, json.writeValueAsString(Map.of("version", 2, "details", employee(suffix, null))), true);
            assertThat(unlinked.statusCode()).as(unlinked.body()).isEqualTo(200);
            assertThat(json.readTree(unlinked.body()).get("positionId").isNull()).isTrue();
            assertThat(hr.request("DELETE", path + "?version=0", null, true).statusCode()).isEqualTo(409);
            assertThat(hr.request("DELETE", path + "?version=1", null, false).statusCode()).isEqualTo(403);
            assertThat(hr.request("DELETE", path + "?version=1", null, true).statusCode()).isEqualTo(204);
            assertThat(hr.request("GET", path, null, false).statusCode()).isEqualTo(404);
            assertThat(jdbc.queryForList("SELECT action FROM audit_logs WHERE resource_type = 'POSITION' AND resource_id = ? ORDER BY occurred_at",
                String.class, UUID.fromString(positionId))).containsExactly("POSITION_CREATED", "POSITION_UPDATED", "POSITION_DELETED");
        } finally {
            if (employeeId != null) jdbc.update("DELETE FROM employees WHERE id = ?", UUID.fromString(employeeId));
            cleanup(position);
        }
    }

    @Test void catalogEnforcesTenantScopeValidationAndPermissions() throws Exception {
        var owner = login("novatech", "owner@example.test");
        var foreign = login("orbit", "owner@example.test");
        var viewer = login("novatech", "viewer@example.test");
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        var position = create(owner, "QA-" + suffix);
        String id = position.get("id").asText(), path = BASE + "/" + id;
        try {
            assertThat(owner.request("POST", BASE, json.writeValueAsString(values(" qa-" + suffix + " ", "Duplicate")), true).statusCode()).isEqualTo(409);
            for (var actor : new Session[]{foreign, viewer}) {
                int status = actor == foreign ? 404 : 403;
                assertThat(actor.request("GET", path, null, false).statusCode()).isEqualTo(status);
                assertThat(actor.request("PATCH", path, json.writeValueAsString(Map.of("version", 0, "details", values("QA-" + suffix, "Hidden"))), true).statusCode()).isEqualTo(status);
                assertThat(actor.request("DELETE", path + "?version=0", null, true).statusCode()).isEqualTo(status);
            }
            assertThat(viewer.request("GET", BASE, null, false).statusCode()).isEqualTo(403);
            assertThat(viewer.request("GET", "/positions", null, false).statusCode()).isEqualTo(403);
            assertThat(viewer.request("POST", BASE, json.writeValueAsString(values("NEW", "Denied")), true).statusCode()).isEqualTo(403);
            assertThat(owner.request("POST", BASE, "{\"code\":\"!!!\",\"title\":\" \"}", true).statusCode()).isEqualTo(400);
            assertThat(owner.request("POST", BASE, json.writeValueAsString(values("NEW", "No CSRF")), false).statusCode()).isEqualTo(403);
            assertThat(owner.request("DELETE", path, null, true).statusCode()).isEqualTo(400);
            assertThat(owner.get(BASE + "?search=" + suffix).get("total").asLong()).isEqualTo(1);
            assertThat(owner.get(BASE + "?search=%25").get("total").asLong()).isZero();
            for (String invalid : List.of("size=0", "size=101", "page=-1", "page=100001"))
                assertThat(owner.request("GET", BASE + "?" + invalid, null, false).statusCode()).isEqualTo(400);
            assertThat(foreign.get("/positions").toString()).doesNotContain(id);
            var details = employee(suffix, id);
            details.put("departmentId", DemoSeed.id("orbitEngineering").toString());
            assertThat(foreign.request("POST", "/employees", json.writeValueAsString(details), true).statusCode()).isEqualTo(400);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM employees WHERE employee_number = ?", Long.class, "POS-" + suffix.toUpperCase())).isZero();
        } finally { cleanup(position); }
    }

    @Test void simultaneousAssignmentAndDeletionNeverLeaveBrokenLink() throws Exception {
        var hr = login("novatech", "hr@example.test");
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        var position = create(hr, "RACE-" + suffix);
        String id = position.get("id").asText();
        try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            var start = new java.util.concurrent.CountDownLatch(1);
            var assignment = executor.submit(() -> { start.await(); return hr.request("POST", "/employees", json.writeValueAsString(employee(suffix, id)), true); });
            var deletion = executor.submit(() -> { start.await(); return hr.request("DELETE", BASE + "/" + id + "?version=0", null, true); });
            start.countDown();
            var assigned = assignment.get(); var deleted = deletion.get();
            if (assigned.statusCode() == 201) {
                assertThat(deleted.statusCode()).as(deleted.body()).isEqualTo(409);
                assertThat(hr.get(BASE + "/" + id).get("employeeCount").asLong()).isEqualTo(1);
            } else {
                assertThat(assigned.statusCode()).as(assigned.body()).isIn(400, 409);
                assertThat(deleted.statusCode()).as(deleted.body()).isEqualTo(204);
                assertThat(jdbc.queryForObject("SELECT count(*) FROM employees WHERE position_id = ?", Long.class, UUID.fromString(id))).isZero();
            }
        } finally {
            jdbc.update("DELETE FROM employees WHERE employee_number = ?", "POS-" + suffix.toUpperCase());
            cleanup(position);
        }
    }
}
