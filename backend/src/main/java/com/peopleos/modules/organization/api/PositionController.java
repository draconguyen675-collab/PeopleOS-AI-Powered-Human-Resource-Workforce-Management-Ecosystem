package com.peopleos.modules.organization.api;

import com.peopleos.modules.organization.application.PositionService;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class PositionController {
    public record UpdatePosition(@NotNull @Min(0) Long version, @NotNull @Valid PositionValues details) { }
    private final PositionService service;
    public PositionController(PositionService service) { this.service = service; }
    @GetMapping("/positions")
    public List<PositionService.Option> options(@AuthenticationPrincipal PeoplePrincipal actor) { return service.options(actor); }
    @GetMapping("/organization/positions")
    public PageResponse<PositionDetail> list(@AuthenticationPrincipal PeoplePrincipal actor,
        @RequestParam(defaultValue = "") @Size(max = 100) String search,
        @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int page,
        @RequestParam(defaultValue = "12") @Min(1) @Max(100) int size) { return service.list(actor, search, page, size); }
    @GetMapping("/organization/positions/{id}")
    public PositionDetail get(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id) { return service.get(actor, id); }
    @PostMapping("/organization/positions")
    public ResponseEntity<PositionDetail> create(@AuthenticationPrincipal PeoplePrincipal actor, @RequestBody @Valid PositionValues values) {
        var created = service.create(actor, values);
        return ResponseEntity.created(URI.create("/api/v1/organization/positions/" + created.id())).body(created);
    }
    @PatchMapping("/organization/positions/{id}")
    public PositionDetail update(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id, @RequestBody @Valid UpdatePosition values) {
        return service.update(actor, id, values.version(), values.details());
    }
    @DeleteMapping("/organization/positions/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal PeoplePrincipal actor, @PathVariable UUID id, @RequestParam @Min(0) long version) {
        service.delete(actor, id, version);
    }
}
