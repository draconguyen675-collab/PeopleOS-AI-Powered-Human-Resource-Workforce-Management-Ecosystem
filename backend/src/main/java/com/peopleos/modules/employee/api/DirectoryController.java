package com.peopleos.modules.employee.api;

import com.peopleos.modules.employee.application.DirectoryService;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import jakarta.validation.constraints.*;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/employees")
public class DirectoryController {
    private final DirectoryService service;
    public DirectoryController(DirectoryService service) { this.service = service; }
    @GetMapping public PageResponse<EmployeeDto> list(@AuthenticationPrincipal PeoplePrincipal user,
        @RequestParam(defaultValue = "") @Size(max = 100) String search,
        @RequestParam(required = false) UUID department,
        @RequestParam(defaultValue = "") @Pattern(regexp = "|ACTIVE|ONBOARDING|ON_LEAVE") String status,
        @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int page,
        @RequestParam(defaultValue = "12") @Min(1) @Max(100) int size,
        @RequestParam(defaultValue = "name") @Pattern(regexp = "name|startedOn|department") String sort,
        @RequestParam(defaultValue = "asc") @Pattern(regexp = "asc|desc") String direction) {
        return service.list(user, search, department, status, page, size, sort, direction);
    }
}
