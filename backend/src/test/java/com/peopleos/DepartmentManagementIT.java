package com.peopleos;

import com.peopleos.shared.config.DemoSeed;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;
import tools.jackson.databind.JsonNode;
import static org.assertj.core.api.Assertions.assertThat;

@TestPropertySource(properties = "peopleos.test.slice=department-management")
class DepartmentManagementIT extends ApiIntegrationSupport {
    private static final String BASE = "/organization/departments";
    Map<String, Object> details(String name, String parent) {
        var values = new LinkedHashMap<String, Object>();
        values.put("name", name); values.put("description", "Department integration fixture"); values.put("parentId", parent);
        return values;
    }
    JsonNode create(Session actor, String name, String parent) throws Exception {
        var response = actor.request("POST", BASE, json.writeValueAsString(details(name, parent)), true);
        assertThat(response.statusCode()).as(response.body()).isEqualTo(201);
        return json.readTree(response.body());
    }
    String patch(JsonNode item, String name, String parent) {
        return json.writeValueAsString(Map.of("version", item.get("version").asLong(), "details", details(name, parent)));
    }
    void cleanup(JsonNode item) { jdbc.update("DELETE FROM departments WHERE id = ?", UUID.fromString(item.get("id").asText())); }
    @Test void departmentsSupportHierarchyValidationVersionsUsageAndAudit() throws Exception {
        var hr = login("novatech", "hr@example.test");
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        var parent = create(hr, "IT Parent " + suffix, null);
        var child = create(hr, "IT Child " + suffix, parent.get("id").asText());
        String parentPath = BASE + "/" + parent.get("id").asText();
        String childPath = BASE + "/" + child.get("id").asText();
        try {
            assertThat(hr.get(parentPath).get("childCount").asLong()).isEqualTo(1);
            assertThat(hr.get(BASE + "?parentId=" + parent.get("id").asText()).get("items").get(0).get("id")).isEqualTo(child.get("id"));
            assertThat(hr.request("PATCH", parentPath, patch(parent, "Cycle", child.get("id").asText()), true).statusCode()).isEqualTo(400);
            assertThat(hr.request("PATCH", childPath, patch(child, "Self cycle", child.get("id").asText()), true).statusCode()).isEqualTo(400);
            assertThat(hr.request("DELETE", parentPath + "?version=0", null, true).statusCode()).isEqualTo(409);
            var change = patch(child, "IT Updated " + suffix, parent.get("id").asText());
            assertThat(hr.request("PATCH", childPath, change, false).statusCode()).isEqualTo(403);
            assertThat(hr.request("PATCH", childPath, change, true).statusCode()).isEqualTo(200);
            assertThat(hr.request("PATCH", childPath, change, true).statusCode()).isEqualTo(409);
            assertThat(hr.request("DELETE", childPath + "?version=0", null, true).statusCode()).isEqualTo(409);
            UUID employee = UUID.randomUUID();
            jdbc.update("""
                INSERT INTO employees(id, tenant_id, employee_number, name, work_email, department_id, position, location, status, started_on, archived_at)
                VALUES (?, ?, ?, 'Archived fixture', ?, ?, 'Engineer', 'Hanoi', 'ACTIVE', current_date, now())
                """, employee, DemoSeed.id("novatech"), "IT-" + suffix, "it-" + suffix + "@example.test", UUID.fromString(child.get("id").asText()));
            try {
                assertThat(hr.get(childPath).get("employeeCount").asLong()).isEqualTo(1);
                assertThat(hr.request("DELETE", childPath + "?version=1", null, true).statusCode()).isEqualTo(409);
            } finally { jdbc.update("DELETE FROM employees WHERE id = ?", employee); }
            assertThat(hr.request("DELETE", childPath + "?version=1", null, true).statusCode()).isEqualTo(204);
            assertThat(hr.request("GET", childPath, null, false).statusCode()).isEqualTo(404);
            assertThat(hr.request("DELETE", parentPath + "?version=0", null, true).statusCode()).isEqualTo(204);
            assertThat(jdbc.queryForList("SELECT action FROM audit_logs WHERE resource_type = 'DEPARTMENT' AND resource_id = ? ORDER BY occurred_at", String.class,
                UUID.fromString(child.get("id").asText()))).containsExactly("DEPARTMENT_CREATED", "DEPARTMENT_UPDATED", "DEPARTMENT_DELETED");
        } finally { cleanup(child); cleanup(parent); }
    }
    @Test void departmentApisEnforceScopeAndNormalizeDuplicates() throws Exception {
        var owner = login("novatech", "owner@example.test");
        var otherTenant = login("orbit", "owner@example.test");
        var viewer = login("novatech", "viewer@example.test");
        String name = "IT " + UUID.randomUUID();
        var department = create(owner, "  " + name + "  ", null);
        String path = BASE + "/" + department.get("id").asText();
        try {
            assertThat(department.get("name").asText()).isEqualTo(name);
            assertThat(owner.request("POST", BASE, json.writeValueAsString(details(name.toLowerCase(), null)), true).statusCode()).isEqualTo(409);
            for (var actor : new Session[]{otherTenant, viewer}) {
                int denied = actor == otherTenant ? 404 : 403;
                assertThat(actor.request("GET", path, null, false).statusCode()).isEqualTo(denied);
                assertThat(actor.request("PATCH", path, patch(department, name, null), true).statusCode()).isEqualTo(denied);
                assertThat(actor.request("DELETE", path + "?version=0", null, true).statusCode()).isEqualTo(denied);
            }
            assertThat(viewer.request("GET", BASE, null, false).statusCode()).isEqualTo(403);
            assertThat(viewer.request("POST", BASE, json.writeValueAsString(details(name, null)), true).statusCode()).isEqualTo(403);
            assertThat(owner.request("POST", BASE, json.writeValueAsString(details("Foreign parent", DemoSeed.id("orbitEngineering").toString())), true).statusCode()).isEqualTo(400);
            assertThat(owner.request("POST", BASE, "{\"name\":\" \"}", true).statusCode()).isEqualTo(400);
            assertThat(owner.request("POST", BASE, json.writeValueAsString(details(name, null)), false).statusCode()).isEqualTo(403);
            assertThat(owner.request("DELETE", path, null, true).statusCode()).isEqualTo(400);
            assertThat(owner.get(BASE + "?search=%25").get("total").asLong()).isZero();
            assertThat(owner.get(BASE + "?size=1").get("items").size()).isEqualTo(1);
            for (String invalid : new String[]{"page=-1", "page=100001", "size=0", "size=101"})
                assertThat(owner.request("GET", BASE + "?" + invalid, null, false).statusCode()).isEqualTo(400);
            assertThat(owner.get(path).get("version").asLong()).isZero();
        } finally { cleanup(department); }
    }
    @Test void concurrentReparentingCannotCreateCycle() throws Exception {
        var owner = login("novatech", "owner@example.test");
        String suffix = UUID.randomUUID().toString();
        var a = create(owner, "IT A " + suffix, null);
        var b = create(owner, "IT B " + suffix, null);
        try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            var start = new java.util.concurrent.CountDownLatch(1);
            var one = executor.submit(() -> { start.await(); return owner.request("PATCH", BASE + "/" + a.get("id").asText(), patch(a, a.get("name").asText(), b.get("id").asText()), true).statusCode(); });
            var two = executor.submit(() -> { start.await(); return owner.request("PATCH", BASE + "/" + b.get("id").asText(), patch(b, b.get("name").asText(), a.get("id").asText()), true).statusCode(); });
            start.countDown();
            assertThat(java.util.List.of(one.get(), two.get())).containsExactlyInAnyOrder(200, 400);
        } finally {
            jdbc.update("UPDATE departments SET parent_id = NULL WHERE id IN (?, ?)", UUID.fromString(a.get("id").asText()), UUID.fromString(b.get("id").asText()));
            cleanup(a); cleanup(b);
        }
    }
}
