package com.peopleos.modules.employee.application;

import com.peopleos.modules.employee.api.EmployeeDto;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DirectoryService {
    private final NamedParameterJdbcTemplate jdbc;
    public DirectoryService(NamedParameterJdbcTemplate jdbc) { this.jdbc = jdbc; }

    @PreAuthorize("hasAuthority('employees:read')")
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public PageResponse<EmployeeDto> list(PeoplePrincipal actor, String search, UUID department, String status,
                                          int page, int size, String sort, String direction) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("tenant", actor.tenantId());
        parameters.put("search", "%" + search.toLowerCase(java.util.Locale.ROOT).replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%");
        parameters.put("limit", size); parameters.put("offset", page * size);
        String where = " WHERE e.tenant_id = :tenant AND (lower(e.name) LIKE :search ESCAPE '!' OR lower(e.work_email) LIKE :search ESCAPE '!')";
        if (department != null) { where += " AND e.department_id = :department"; parameters.put("department", department); }
        if (!status.isBlank()) { where += " AND e.status = :status"; parameters.put("status", status); }
        String order = Map.of("name", "e.name", "startedOn", "e.started_on", "department", "d.name").get(sort);
        // SQL identifiers and ordering are selected exclusively from validated allowlists.
        if (order == null || !(direction.equals("asc") || direction.equals("desc"))) throw new IllegalArgumentException("Invalid sorting option");
        long total = jdbc.queryForObject("SELECT count(*) FROM employees e" + where, parameters, Long.class);
        var rows = jdbc.query("""
            SELECT e.*, d.name AS department FROM employees e
            JOIN departments d ON d.id = e.department_id AND d.tenant_id = e.tenant_id
            """ + where + " ORDER BY " + order + " " + direction + ", e.id LIMIT :limit OFFSET :offset", parameters,
            (rs, row) -> new EmployeeDto(rs.getObject("id", UUID.class), rs.getString("employee_number"),
                rs.getString("name"), rs.getString("work_email"), rs.getString("department"), rs.getString("position"),
                rs.getString("location"), rs.getString("status"), rs.getDate("started_on").toLocalDate()));
        return new PageResponse<>(rows, total, page, size);
    }
}
