package com.peopleos.modules.organization.api;

import com.peopleos.modules.organization.application.DepartmentManagementService;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/organization/departments")
public class DepartmentManagementController {
    public record UpdateDepartment(@NotNull @Min(0) Long version, @NotNull @Valid DepartmentValues details) { }
    private final DepartmentManagementService service;
    public DepartmentManagementController(DepartmentManagementService service) { this.service = service; }
    @GetMapping
    public PageResponse<DepartmentDetail> list(@AuthenticationPrincipal PeoplePrincipal actor,
        @RequestParam(defaultValue = "") @Size(max = 100) String search, @RequestParam(required = false) UUID parentId,
        @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int page, @RequestParam(defaultValue = "12") @Min(1) @Max(100) int size) {
        return service.list(actor, search, parentId, page, size);
    }
    @GetMapping("/{id}") public DepartmentDetail get(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id) { return service.get(actor, id); }
    @PostMapping public ResponseEntity<DepartmentDetail> create(@AuthenticationPrincipal PeoplePrincipal actor, @RequestBody @Valid DepartmentValues values) {
        var created = service.create(actor, values);
        return ResponseEntity.created(URI.create("/api/v1/organization/departments/" + created.id())).body(created);
    }
    @PatchMapping("/{id}") public DepartmentDetail update(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id, @RequestBody @Valid UpdateDepartment values) {
        return service.update(actor, id, values.version(), values.details());
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id, @RequestParam @Min(0) long version) { service.delete(actor, id, version); }
}
