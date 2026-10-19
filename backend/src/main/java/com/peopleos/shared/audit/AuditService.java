package com.peopleos.shared.audit;

import com.peopleos.shared.security.PeoplePrincipal;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    private final JdbcTemplate jdbc;
    public AuditService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Transactional
    public void record(PeoplePrincipal actor, String action, String resource, UUID id, String summary) {
        jdbc.update("""
            INSERT INTO audit_logs(id, tenant_id, actor_id, action, resource_type, resource_id, summary)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, UUID.randomUUID(), actor.tenantId(), actor.id(), action, resource, id, summary);
    }
}
