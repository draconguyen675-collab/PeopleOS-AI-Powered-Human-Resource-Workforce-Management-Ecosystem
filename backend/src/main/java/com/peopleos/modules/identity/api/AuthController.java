package com.peopleos.modules.identity.api;

import com.peopleos.shared.security.PeoplePrincipal;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    public record CsrfResponse(String token, String headerName) { }
    public record Me(UUID id, UUID tenantId, String email, String displayName, String role, List<String> permissions) { }
    @GetMapping("/csrf") public CsrfResponse csrf(CsrfToken token) {
        return new CsrfResponse(token.getToken(), token.getHeaderName());
    }
    @GetMapping("/me") public Me me(@AuthenticationPrincipal PeoplePrincipal user) {
        return new Me(user.id(), user.tenantId(), user.email(), user.displayName(), user.role(), user.permissions());
    }
}
