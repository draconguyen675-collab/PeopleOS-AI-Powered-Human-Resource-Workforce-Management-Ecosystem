package com.peopleos.shared.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.web.filter.OncePerRequestFilter;

/** Single-instance limiter. Before horizontal scaling, move counters to Redis. */
public class LoginRateLimitFilter extends OncePerRequestFilter {
    private final Cache<String, AtomicInteger> attempts = Caffeine.newBuilder()
        .maximumSize(10_000).expireAfterWrite(Duration.ofMinutes(15)).build();

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                              FilterChain chain) throws ServletException, IOException {
        if (request.getMethod().equals("POST") && request.getServletPath().equals("/api/v1/auth/login")) {
            int count = attempts.get(request.getRemoteAddr(), ignored -> new AtomicInteger()).incrementAndGet();
            if (count > 20) {
                response.setHeader("Retry-After", "900");
                SecurityResponses.error(response, 429, "Too many sign-in attempts. Try again in 15 minutes.");
                return;
            }
        }
        chain.doFilter(request, response);
    }
}
