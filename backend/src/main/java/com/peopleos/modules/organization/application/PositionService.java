package com.peopleos.modules.organization.application;

import com.peopleos.modules.organization.api.PositionDetail;
import com.peopleos.modules.organization.api.PositionValues;
import com.peopleos.modules.organization.domain.Position;
import com.peopleos.modules.organization.infrastructure.PositionRepository;
import com.peopleos.shared.audit.AuditService;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import java.util.HashMap;
import java.util.List;
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
public class PositionService {
    public record Option(UUID id, String code, String title) { }
    private final PositionRepository positions;
    private final NamedParameterJdbcTemplate jdbc;
    private final AuditService audit;
    private static final String PROJECTION = """
        SELECT p.*, (SELECT count(*) FROM employees e WHERE e.tenant_id = p.tenant_id AND e.position_id = p.id) employee_count
        FROM positions p
        """;
    private static final RowMapper<PositionDetail> MAPPER = (rs, row) -> new PositionDetail(
        rs.getObject("id", UUID.class), rs.getString("code"), rs.getString("title"), rs.getString("description"),
        rs.getLong("employee_count"), rs.getLong("version"));
    public PositionService(PositionRepository positions, NamedParameterJdbcTemplate jdbc, AuditService audit) {
        this.positions = positions; this.jdbc = jdbc; this.audit = audit;
    }
    private Position find(PeoplePrincipal actor, UUID id) {
        return positions.findByIdAndTenantId(id, actor.tenantId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Position not found."));
    }
    private PositionDetail detail(PeoplePrincipal actor, UUID id) {
        var result = jdbc.query(PROJECTION + " WHERE p.tenant_id = :tenant AND p.id = :id",
            Map.of("tenant", actor.tenantId(), "id", id), MAPPER);
        if (result.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Position not found.");
        return result.getFirst();
    }
    private void revision(Position position, long expected) {
        if (position.version() != expected)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This position changed. Reload before trying again.");
    }
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    @PreAuthorize("hasAuthority('organization:read')")
    public PageResponse<PositionDetail> list(PeoplePrincipal actor, String search, int page, int size) {
        var params = new HashMap<String, Object>();
        params.put("tenant", actor.tenantId()); params.put("limit", size); params.put("offset", page * size);
        params.put("search", "%" + search.toLowerCase(java.util.Locale.ROOT).replace("!", "!!").replace("%", "!%").replace("_", "!_") + "%");
        String where = " WHERE p.tenant_id = :tenant AND (lower(p.title) LIKE :search ESCAPE '!' OR lower(p.code) LIKE :search ESCAPE '!')";
        long total = jdbc.queryForObject("SELECT count(*) FROM positions p" + where, params, Long.class);
        return new PageResponse<>(jdbc.query(PROJECTION + where + " ORDER BY p.title, p.id LIMIT :limit OFFSET :offset", params, MAPPER), total, page, size);
    }
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('employees:read')")
    public List<Option> options(PeoplePrincipal actor) {
        return jdbc.query("SELECT id, code, title FROM positions WHERE tenant_id = :tenant ORDER BY title, id",
            Map.of("tenant", actor.tenantId()), (rs, row) -> new Option(rs.getObject("id", UUID.class), rs.getString("code"), rs.getString("title")));
    }
    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('organization:read')")
    public PositionDetail get(PeoplePrincipal actor, UUID id) { return detail(actor, id); }
    @Transactional
    @PreAuthorize("hasAuthority('organization:write')")
    public PositionDetail create(PeoplePrincipal actor, PositionValues values) {
        var position = new Position(actor.tenantId());
        position.update(values.code(), values.title(), values.description());
        position = positions.saveAndFlush(position);
        audit.record(actor, "POSITION_CREATED", "POSITION", position.id(), "Created position catalog entry");
        return detail(actor, position.id());
    }
    @Transactional
    @PreAuthorize("hasAuthority('organization:write')")
    public PositionDetail update(PeoplePrincipal actor, UUID id, long version, PositionValues values) {
        var position = find(actor, id); revision(position, version);
        position.update(values.code(), values.title(), values.description()); positions.flush();
        audit.record(actor, "POSITION_UPDATED", "POSITION", id, "Updated position catalog entry");
        return detail(actor, id);
    }
    @Transactional
    @PreAuthorize("hasAuthority('organization:write')")
    public void delete(PeoplePrincipal actor, UUID id, long version) {
        var position = find(actor, id); revision(position, version);
        if (detail(actor, id).employeeCount() > 0)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Unlink employee profiles before deleting this position. Archived profiles also retain their link.");
        // The composite FK also protects an employee link created concurrently with this deletion.
        positions.delete(position); positions.flush();
        audit.record(actor, "POSITION_DELETED", "POSITION", id, "Deleted unused position catalog entry");
    }
}
