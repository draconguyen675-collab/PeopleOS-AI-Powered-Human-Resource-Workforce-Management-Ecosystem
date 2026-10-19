package com.peopleos.modules.identity.application;

import com.peopleos.modules.identity.api.SessionDto;
import com.peopleos.shared.audit.AuditService;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SessionService {
    private final JdbcTemplate jdbc;
    private final AuditService audit;
    public SessionService(JdbcTemplate jdbc, AuditService audit) { this.jdbc = jdbc; this.audit = audit; }

    @Transactional(readOnly = true, isolation = Isolation.REPEATABLE_READ)
    public PageResponse<SessionDto> list(PeoplePrincipal actor, String currentId, int page, int size) {
        long now = System.currentTimeMillis();
        String scope = " FROM spring_session s JOIN users u ON s.principal_name = cast(u.id AS varchar) "
            + "WHERE u.id = ? AND u.tenant_id = ? AND s.expiry_time > ? ";
        long total = jdbc.queryForObject("SELECT count(*)" + scope, Long.class, actor.id(), actor.tenantId(), now);
        var rows = jdbc.query("SELECT s.*" + scope + "ORDER BY s.creation_time DESC, s.primary_id LIMIT ? OFFSET ?",
            (rs, row) -> new SessionDto(UUID.fromString(rs.getString("primary_id")),
                Instant.ofEpochMilli(rs.getLong("creation_time")), Instant.ofEpochMilli(rs.getLong("last_access_time")),
                Instant.ofEpochMilli(rs.getLong("expiry_time")), currentId.equals(rs.getString("session_id"))),
            actor.id(), actor.tenantId(), now, size, page * size);
        return new PageResponse<>(rows, total, page, size);
    }

    @Transactional
    public void revoke(PeoplePrincipal actor, String currentId, UUID id) {
        var matches = jdbc.queryForList("""
            SELECT s.session_id FROM spring_session s JOIN users u ON s.principal_name = cast(u.id AS varchar)
            WHERE s.primary_id = ? AND u.id = ? AND u.tenant_id = ? AND s.expiry_time > ? FOR UPDATE OF s
            """, String.class, id.toString(), actor.id(), actor.tenantId(), System.currentTimeMillis());
        if (matches.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Session is no longer available.");
        if (currentId.equals(matches.getFirst()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Use Sign out to end your current session.");
        jdbc.update("DELETE FROM spring_session WHERE primary_id = ?", id.toString());
        audit.record(actor, "SESSION_REVOKED", "SESSION", id, "Revoked another sign-in session");
    }
}
