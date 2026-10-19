package com.peopleos.modules.organization.application;

import com.peopleos.modules.organization.api.DepartmentController.DepartmentDto;
import com.peopleos.shared.security.PeoplePrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartmentService {
    private final JdbcTemplate jdbc;
    public DepartmentService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('employees:read')")
    public List<DepartmentDto> list(PeoplePrincipal actor) {
        return jdbc.query("SELECT id, name FROM departments WHERE tenant_id = ? ORDER BY name",
            (rs, row) -> new DepartmentDto(rs.getObject("id", UUID.class), rs.getString("name")), actor.tenantId());
    }
}
