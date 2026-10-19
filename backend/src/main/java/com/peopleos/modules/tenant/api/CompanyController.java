package com.peopleos.modules.tenant.api;

import com.peopleos.modules.tenant.application.CompanyService;
import com.peopleos.shared.security.PeoplePrincipal;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/company")
public class CompanyController {
    private final CompanyService service;
    public CompanyController(CompanyService service) { this.service = service; }
    @GetMapping public CompanyDto get(@AuthenticationPrincipal PeoplePrincipal user) { return service.get(user); }
    @PatchMapping public CompanyDto update(@AuthenticationPrincipal PeoplePrincipal user, @Valid @RequestBody UpdateCompany request) {
        return service.update(user, request);
    }
}
