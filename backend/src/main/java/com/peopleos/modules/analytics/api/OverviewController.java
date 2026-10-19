package com.peopleos.modules.analytics.api;

import com.peopleos.modules.analytics.application.OverviewService;
import com.peopleos.shared.security.PeoplePrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
public class OverviewController {
    private final OverviewService service;
    public OverviewController(OverviewService service) { this.service = service; }
    @GetMapping("/api/v1/overview") public OverviewService.Overview get(@AuthenticationPrincipal PeoplePrincipal actor) {
        return service.get(actor);
    }
}
