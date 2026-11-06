package com.peopleos.modules.organization.application;

import com.peopleos.modules.organization.api.DepartmentDetail;
import com.peopleos.modules.organization.api.DepartmentValues;
import com.peopleos.modules.organization.domain.Department;
import com.peopleos.modules.organization.infrastructure.DepartmentRepository;
import com.peopleos.shared.audit.AuditService;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DepartmentManagementService {
    private final DepartmentRepository departments;
    private final NamedParameterJdbcTemplate jdbc;
    private final AuditService audit;
    private static final String PROJECTION = """
        SELECT d.*, p.name parent_name,
            (SELECT count(*) FROM employees e WHERE e.tenant_id = d.tenant_id AND e.department_id = d.id) employee_count,
            (SELECT count(*) FROM departments c WHERE c.tenant_id = d.tenant_id AND c.parent_id = d.id) child_count
        FROM departments d LEFT JOIN departments p ON p.tenant_id = d.tenant_id AND p.id = d.parent_id
        """;
    private static final RowMapper<DepartmentDetail> MAPPER = (rs, row) -> new DepartmentDetail(rs.getObject("id", UUID.class),
        rs.getString("name"), rs.getString("description"), rs.getObject("parent_id", UUID.class), rs.getString("parent_name"),
        rs.getLong("employee_count"), rs.getLong("child_count"), rs.getLong("version"));
    public DepartmentManagementService(DepartmentRepository departments, NamedParameterJdbcTemplate jdbc, AuditService audit) {
        this.departments = departments; this.jdbc = jdbc; this.audit = audit;
    }
    private Department find(PeoplePrincipal actor, UUID id) {
        return departments.findByIdAndTenantId(id, actor.tenantId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found."));
    }
    private DepartmentDetail detail(PeoplePrincipal actor, UUID id) {
        var rows = jdbc.query(PROJECTION + " WHERE d.tenant_id = :tenant AND d.id = :id", Map.of("tenant", actor.tenantId(), "id", id), MAPPER);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found.");
        return rows.getFirst();
    }
    private void lockHierarchy(PeoplePrincipal actor) {
        // Serialize hierarchy mutations within a tenant, including concurrent moves that could jointly introduce a cycle.
        jdbc.getJdbcTemplate().execute((org.springframework.jdbc.core.ConnectionCallback<Void>) connection -> {
            try (var statement = connection.prepareStatement("SELECT pg_advisory_xact_lock(hashtextextended(?, 0))")) {
                statement.setString(1, "departments:" + actor.tenantId()); statement.execute();
            }
            return null;
        });
    }
    private void parent(PeoplePrincipal actor, UUID id, UUID parentId) {
        if (parentId == null) return;
        if (departments.findByIdAndTenantId(parentId, actor.tenantId()).isEmpty())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a parent department in your workspace.");
        Boolean cycle = jdbc.queryForObject("""
            WITH RECURSIVE ancestors AS (
                SELECT id, parent_id FROM departments WHERE tenant_id = :tenant AND id = :parent
                UNION SELECT d.id, d.parent_id FROM departments d JOIN ancestors a ON d.id = a.parent_id WHERE d.tenant_id = :tenant
            ) SELECT EXISTS (SELECT 1 FROM ancestors WHERE id = :id)
            """, Map.of("tenant", actor.tenantId(), "parent", parentId, "id", id), Boolean.class);
        if (Boolean.TRUE.equals(cycle)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A department cannot report to itself or its descendants.");
    }
    private void revision(Department department, long expected) {
        if (department.version() != expected)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This department changed. Reload before trying again.");
    }
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    @PreAuthorize("hasAuthority('organization:read')")
    public PageResponse<DepartmentDetail> list(PeoplePrincipal actor, String search, UUID parentId, int page, int size) {
        Map<String, Object> params = new HashMap<>(); params.put("tenant", actor.tenantId());
        params.put("search", "%" + search.toLowerCase(java.util.Locale.ROOT).replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%");
        String where = " WHERE d.tenant_id = :tenant AND lower(d.name) LIKE :search ESCAPE '!'";
        if (parentId != null) { where += " AND d.parent_id = :parent"; params.put("parent", parentId); }
        long total = jdbc.queryForObject("SELECT count(*) FROM departments d" + where, params, Long.class);
        params.put("limit", size); params.put("offset", page * size);
        return new PageResponse<>(jdbc.query(PROJECTION + where + " ORDER BY d.name, d.id LIMIT :limit OFFSET :offset", params, MAPPER), total, page, size);
    }
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('organization:read')")
    public DepartmentDetail get(PeoplePrincipal actor, UUID id) { return detail(actor, id); }

    @Transactional
    @PreAuthorize("hasAuthority('organization:write')")
    public DepartmentDetail create(PeoplePrincipal actor, DepartmentValues values) {
        lockHierarchy(actor); var department = new Department(actor.tenantId()); parent(actor, department.id(), values.parentId());
        department.update(values.name(), values.description(), values.parentId()); department = departments.saveAndFlush(department);
        audit.record(actor, "DEPARTMENT_CREATED", "DEPARTMENT", department.id(), "Created department");
        return detail(actor, department.id());
    }
    @Transactional
    @PreAuthorize("hasAuthority('organization:write')")
    public DepartmentDetail update(PeoplePrincipal actor, UUID id, long version, DepartmentValues values) {
        lockHierarchy(actor); var department = find(actor, id); revision(department, version); parent(actor, id, values.parentId());
        department.update(values.name(), values.description(), values.parentId()); departments.flush();
        audit.record(actor, "DEPARTMENT_UPDATED", "DEPARTMENT", id, "Updated department details or parent");
        return detail(actor, id);
    }
    @Transactional
    @PreAuthorize("hasAuthority('organization:write')")
    public void delete(PeoplePrincipal actor, UUID id, long version) {
        lockHierarchy(actor); var department = find(actor, id); revision(department, version);
        var usage = detail(actor, id);
        if (usage.employeeCount() > 0 || usage.childCount() > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Move linked employee profiles and child departments before deleting this department. Archived employees also retain their department link.");
        departments.delete(department); departments.flush();
        audit.record(actor, "DEPARTMENT_DELETED", "DEPARTMENT", id, "Deleted unused department");
    }
}
