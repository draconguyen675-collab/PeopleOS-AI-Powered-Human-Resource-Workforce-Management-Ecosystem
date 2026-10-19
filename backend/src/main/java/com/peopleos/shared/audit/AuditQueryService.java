package com.peopleos.shared.audit;

import com.peopleos.shared.audit.AuditController.AuditDto;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditQueryService {
    private final JdbcTemplate jdbc;
    public AuditQueryService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    @PreAuthorize("hasAuthority('audit:read')")
    public PageResponse<AuditDto> list(PeoplePrincipal user, int page, int size) {
        long total = jdbc.queryForObject("SELECT count(*) FROM audit_logs WHERE tenant_id = ?", Long.class, user.tenantId());
        var rows = jdbc.query("""
            SELECT a.id, coalesce(u.display_name, 'System') AS actor, a.action, a.summary, a.occurred_at
            FROM audit_logs a LEFT JOIN users u ON a.actor_id = u.id AND a.tenant_id = u.tenant_id
            WHERE a.tenant_id = ? ORDER BY a.occurred_at DESC, a.id LIMIT ? OFFSET ?
            """, (rs, row) -> new AuditDto(rs.getObject("id", UUID.class), rs.getString("actor"),
                rs.getString("action"), rs.getString("summary"), rs.getObject("occurred_at", OffsetDateTime.class)),
            user.tenantId(), size, page * size);
        return new PageResponse<>(rows, total, page, size);
    }
}
