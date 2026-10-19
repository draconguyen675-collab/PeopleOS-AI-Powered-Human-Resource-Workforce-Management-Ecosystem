package com.peopleos.modules.organization.api;

import com.peopleos.shared.security.PeoplePrincipal;
import java.util.List;
import java.util.UUID;
import com.peopleos.modules.organization.application.DepartmentService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {
    public record DepartmentDto(UUID id, String name) { }
    private final DepartmentService service;
    public DepartmentController(DepartmentService service) { this.service = service; }
    @GetMapping
    public List<DepartmentDto> list(@AuthenticationPrincipal PeoplePrincipal actor) {
        return service.list(actor);
    }
}
