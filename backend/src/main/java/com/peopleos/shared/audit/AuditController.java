package com.peopleos.shared.audit;

import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuditController {
    public record AuditDto(UUID id, String actor, String action, String summary, OffsetDateTime occurredAt) { }
    private final AuditQueryService service;
    public AuditController(AuditQueryService service) { this.service = service; }
    @GetMapping("/api/v1/audit")
    public PageResponse<AuditDto> list(@AuthenticationPrincipal PeoplePrincipal user,
        @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int page,
        @RequestParam(defaultValue = "15") @Min(1) @Max(100) int size) {
        return service.list(user, page, size);
    }
}
