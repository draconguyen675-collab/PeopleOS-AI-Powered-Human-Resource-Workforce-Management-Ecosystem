package com.peopleos.modules.identity.api;

import java.util.List;
import com.peopleos.modules.identity.application.RoleService;
import org.springframework.web.bind.annotation.*;

@RestController
public class RoleController {
    public record RoleDto(String code, String name, String description, List<String> permissions) { }
    private final RoleService service;
    public RoleController(RoleService service) { this.service = service; }
    @GetMapping("/api/v1/roles")
    public List<RoleDto> list() {
        return service.list();
    }
}
