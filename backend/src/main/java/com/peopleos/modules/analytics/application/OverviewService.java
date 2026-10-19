package com.peopleos.modules.analytics.application;

import com.peopleos.shared.security.PeoplePrincipal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OverviewService {
    public record DepartmentCount(String name, long count) { }
    public record HiringMonth(String month, long count) { }
    public record Overview(long employees, long active, long onboarding, long departments,
                           List<DepartmentCount> distribution, List<HiringMonth> hiring, LocalDate asOf) { }
    private final JdbcTemplate jdbc;
    public OverviewService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @PreAuthorize("hasAuthority('dashboard:read')")
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public Overview get(PeoplePrincipal actor) {
        var counts = jdbc.queryForMap("""
            SELECT count(*) AS employees, count(*) FILTER (WHERE status = 'ACTIVE') AS active,
            count(*) FILTER (WHERE status = 'ONBOARDING') AS onboarding FROM employees WHERE tenant_id = ?
            """, actor.tenantId());
        var distribution = jdbc.query("""
            SELECT d.name, count(e.id) AS total FROM departments d
            LEFT JOIN employees e ON e.department_id = d.id AND e.tenant_id = d.tenant_id
            WHERE d.tenant_id = ? GROUP BY d.id, d.name ORDER BY total DESC, d.name
            """, (rs, row) -> new DepartmentCount(rs.getString("name"), rs.getLong("total")), actor.tenantId());
        var hiring = jdbc.query("""
            SELECT to_char(date_trunc('month', started_on), 'YYYY-MM') AS month, count(*) AS total
            FROM employees WHERE tenant_id = ? GROUP BY month ORDER BY month
            """, (rs, row) -> new HiringMonth(rs.getString("month"), rs.getLong("total")), actor.tenantId());
        return new Overview(((Number) counts.get("employees")).longValue(), ((Number) counts.get("active")).longValue(),
            ((Number) counts.get("onboarding")).longValue(), distribution.size(), distribution, hiring, LocalDate.now(java.time.ZoneOffset.UTC));
    }
}
