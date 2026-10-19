package com.peopleos.modules.identity.api;

import com.peopleos.modules.identity.application.SessionService;
import com.peopleos.shared.pagination.PageResponse;
import com.peopleos.shared.security.PeoplePrincipal;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/sessions")
public class SessionController {
    private final SessionService sessions;
    public SessionController(SessionService sessions) { this.sessions = sessions; }

    @GetMapping
    public PageResponse<SessionDto> list(@AuthenticationPrincipal PeoplePrincipal actor, HttpSession current,
            @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        return sessions.list(actor, current.getId(), page, size);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revoke(@AuthenticationPrincipal PeoplePrincipal actor, HttpSession current, @PathVariable UUID id) {
        sessions.revoke(actor, current.getId(), id);
    }
}
