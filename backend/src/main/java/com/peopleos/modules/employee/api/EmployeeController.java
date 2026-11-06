package com.peopleos.modules.employee.api;

import com.peopleos.modules.employee.application.EmployeeService;
import com.peopleos.shared.audit.AuditController.AuditDto;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {
    public record UpdateEmployee(@NotNull @Min(0) Long version, @NotNull @Valid EmployeeValues details) { }
    public record Revision(@NotNull @Min(0) Long version) { }
    private final EmployeeService service;
    public EmployeeController(EmployeeService service) { this.service = service; }
    @GetMapping("/{id}")
    public EmployeeDetail get(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id) { return service.get(actor, id); }
    @PostMapping
    public ResponseEntity<EmployeeDetail> create(@AuthenticationPrincipal PeoplePrincipal actor, @Valid @RequestBody EmployeeValues values) {
        var created = service.create(actor, values);
        return ResponseEntity.created(URI.create("/api/v1/employees/" + created.id())).body(created);
    }
    @PatchMapping("/{id}")
    public EmployeeDetail update(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id, @Valid @RequestBody UpdateEmployee values) {
        return service.update(actor, id, values.version(), values.details());
    }
    @DeleteMapping("/{id}")
    public EmployeeDetail archive(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id, @RequestParam @Min(0) long version) {
        return service.setArchived(actor, id, version, true);
    }
    @PostMapping("/{id}/restore")
    public EmployeeDetail restore(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id, @Valid @RequestBody Revision revision) {
        return service.setArchived(actor, id, revision.version(), false);
    }
    @GetMapping("/{id}/history")
    public PageResponse<AuditDto> history(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id,
            @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) { return service.history(actor, id, page, size); }
}
