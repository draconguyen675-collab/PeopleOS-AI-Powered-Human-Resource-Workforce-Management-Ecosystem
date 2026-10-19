package com.peopleos.shared.security;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public final class SecurityResponses {
    private SecurityResponses() { }
    // Only fixed server-owned messages are passed here.
    public static void error(HttpServletResponse response, int status, String detail) throws IOException {
        response.setStatus(status);
        response.setContentType("application/problem+json");
        response.getWriter().write("{\"status\":" + status + ",\"detail\":\"" + detail + "\"}");
    }
}
