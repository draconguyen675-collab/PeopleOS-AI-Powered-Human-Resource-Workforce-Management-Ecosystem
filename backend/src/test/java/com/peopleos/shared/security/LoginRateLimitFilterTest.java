package com.peopleos.shared.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.assertj.core.api.Assertions.assertThat;

class LoginRateLimitFilterTest {
    @Test void throttlesLoginAttemptsButDoesNotBlockOtherRoutes() throws Exception {
        var filter = new LoginRateLimitFilter();
        for (int attempt = 1; attempt <= 21; attempt++) {
            var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            request.setServletPath("/api/v1/auth/login");
            var response = new MockHttpServletResponse();
            filter.doFilter(request, response, (req, res) -> ((MockHttpServletResponse) res).setStatus(204));
            assertThat(response.getStatus()).isEqualTo(attempt <= 20 ? 204 : 429);
            if (attempt == 21) assertThat(response.getHeader("Retry-After")).isEqualTo("900");
        }
        var response = new MockHttpServletResponse();
        filter.doFilter(new MockHttpServletRequest("GET", "/api/v1/auth/csrf"), response,
            (req, res) -> ((MockHttpServletResponse) res).setStatus(204));
        assertThat(response.getStatus()).isEqualTo(204);
    }
}
