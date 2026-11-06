package com.peopleos.modules.employee.application;

import com.peopleos.modules.employee.api.EmployeeDetail;
import com.peopleos.modules.employee.api.EmployeeValues;
import com.peopleos.modules.employee.domain.Employee;
import com.peopleos.modules.employee.infrastructure.EmployeeRepository;
import com.peopleos.shared.audit.AuditService;
import com.peopleos.shared.audit.AuditController.AuditDto;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmployeeService {
    private final EmployeeRepository employees;
    private final JdbcTemplate jdbc;
    private final AuditService audit;
    public EmployeeService(EmployeeRepository employees, JdbcTemplate jdbc, AuditService audit) {
        this.employees = employees; this.jdbc = jdbc; this.audit = audit;
    }
    private Employee find(PeoplePrincipal actor, UUID id) {
        return employees.findByIdAndTenantId(id, actor.tenantId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));
    }
    private String department(PeoplePrincipal actor, UUID id) {
        var names = jdbc.queryForList("SELECT name FROM departments WHERE tenant_id = ? AND id = ?", String.class, actor.tenantId(), id);
        if (names.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a department in your workspace.");
        return names.getFirst();
    }
    private EmployeeDetail detail(PeoplePrincipal actor, Employee e) {
        return new EmployeeDetail(e.id(), e.employeeNumber(), e.name(), e.workEmail(), e.departmentId(),
            department(actor, e.departmentId()), e.position(), e.location(), e.status(), e.startedOn(), e.version(),
            e.archivedAt(), e.createdAt(), e.updatedAt(), e.positionId(), position(actor, e.positionId()));
    }
    private String position(PeoplePrincipal actor, UUID id) {
        if (id == null) return null;
        var names = jdbc.queryForList("SELECT code || ' · ' || title FROM positions WHERE tenant_id = ? AND id = ?",
            String.class, actor.tenantId(), id);
        if (names.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a position in your workspace.");
        return names.getFirst();
    }
    private void revision(Employee employee, long expected) {
        if (employee.version() != expected)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This employee changed. Reload the profile before trying again.");
    }
    private void apply(PeoplePrincipal actor, Employee employee, EmployeeValues values) {
        department(actor, values.departmentId());
        position(actor, values.positionId());
        employee.update(values.employeeNumber(), values.name(), values.workEmail(), values.departmentId(),
            values.position(), values.location(), values.status(), values.startedOn());
        employee.linkPosition(values.positionId());
    }
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('employees:read')")
    public EmployeeDetail get(PeoplePrincipal actor, UUID id) { return detail(actor, find(actor, id)); }

    @Transactional
    @PreAuthorize("hasAuthority('employees:write')")
    public EmployeeDetail create(PeoplePrincipal actor, EmployeeValues values) {
        var employee = new Employee(actor.tenantId());
        apply(actor, employee, values);
        employee = employees.saveAndFlush(employee);
        audit.record(actor, "EMPLOYEE_CREATED", "EMPLOYEE", employee.id(), "Created employee work profile");
        return detail(actor, employee);
    }
    @Transactional
    @PreAuthorize("hasAuthority('employees:write')")
    public EmployeeDetail update(PeoplePrincipal actor, UUID id, long version, EmployeeValues values) {
        var employee = find(actor, id); revision(employee, version);
        if (employee.archivedAt() != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Restore this employee before editing their profile.");
        apply(actor, employee, values); employees.flush();
        audit.record(actor, "EMPLOYEE_UPDATED", "EMPLOYEE", id, "Updated employee work profile");
        return detail(actor, employee);
    }
    @Transactional
    @PreAuthorize("hasAuthority('employees:write')")
    public EmployeeDetail setArchived(PeoplePrincipal actor, UUID id, long version, boolean archived) {
        var employee = find(actor, id); revision(employee, version);
        if ((employee.archivedAt() != null) == archived)
            throw new ResponseStatusException(HttpStatus.CONFLICT, archived ? "Employee is already archived." : "Employee is already current.");
        if (archived) employee.archive(); else employee.restore();
        employees.flush();
        audit.record(actor, archived ? "EMPLOYEE_ARCHIVED" : "EMPLOYEE_RESTORED", "EMPLOYEE", id,
            archived ? "Archived employee work profile" : "Restored employee work profile");
        return detail(actor, employee);
    }
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    @PreAuthorize("hasAuthority('employees:read')")
    public PageResponse<AuditDto> history(PeoplePrincipal actor, UUID id, int page, int size) {
        find(actor, id);
        long count = jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE tenant_id = ? AND resource_type = 'EMPLOYEE' AND resource_id = ?",
            Long.class, actor.tenantId(), id);
        var rows = jdbc.query("""
            SELECT a.id, coalesce(u.display_name, 'System') actor, a.action, a.summary, a.occurred_at
            FROM audit_logs a LEFT JOIN users u ON a.actor_id = u.id AND a.tenant_id = u.tenant_id
            WHERE a.tenant_id = ? AND a.resource_type = 'EMPLOYEE' AND a.resource_id = ?
            ORDER BY a.occurred_at DESC, a.id LIMIT ? OFFSET ?
            """, (rs, row) -> new AuditDto(rs.getObject("id", UUID.class), rs.getString("actor"), rs.getString("action"),
                rs.getString("summary"), rs.getObject("occurred_at", OffsetDateTime.class)), actor.tenantId(), id, size, page * size);
        return new PageResponse<>(rows, count, page, size);
    }
}
