package com.peopleos.modules.identity.application;

import com.peopleos.modules.identity.api.RoleController.RoleDto;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RoleService {
    private final JdbcTemplate jdbc;
    public RoleService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('roles:read')")
    public List<RoleDto> list() {
        var mappings = jdbc.queryForList("SELECT role_code, permission_code FROM role_permissions ORDER BY permission_code");
        return jdbc.query("SELECT code, name, description FROM roles ORDER BY code", (rs, row) -> {
            String code = rs.getString("code");
            return new RoleDto(code, rs.getString("name"), rs.getString("description"), mappings.stream()
                .filter(p -> p.get("role_code").equals(code)).map(p -> (String) p.get("permission_code")).toList());
        });
    }
}
