package com.peopleos.shared.security;

import com.peopleos.shared.audit.AuditService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }

    @Bean SecurityFilterChain security(HttpSecurity http, AuditService audit) throws Exception {
        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/csrf", "/api/v1/auth/login", "/actuator/health", "/error").permitAll()
                .anyRequest().authenticated())
            .requestCache(cache -> cache.disable())
            .addFilterBefore(new LoginRateLimitFilter(), UsernamePasswordAuthenticationFilter.class)
            .formLogin(login -> login.loginProcessingUrl("/api/v1/auth/login")
                .successHandler((request, response, authentication) -> {
                    audit.record((PeoplePrincipal) authentication.getPrincipal(), "LOGIN", "SESSION", null, "Signed in successfully");
                    response.setStatus(204);
                })
                .failureHandler((request, response, exception) -> SecurityResponses.error(response, 401, "Workspace, email or password is incorrect.")))
            .logout(logout -> logout.logoutUrl("/api/v1/auth/logout")
                .addLogoutHandler((request, response, authentication) -> {
                    if (authentication != null && authentication.getPrincipal() instanceof PeoplePrincipal actor) {
                        audit.record(actor, "LOGOUT", "SESSION", null, "Signed out");
                    }
                })
                .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
            .exceptionHandling(errors -> errors
                .authenticationEntryPoint((request, response, ex) -> SecurityResponses.error(response, 401, "Please sign in to continue."))
                .accessDeniedHandler((request, response, ex) -> SecurityResponses.error(response, 403, "You do not have permission, or your security token has expired.")))
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'none'; frame-ancestors 'none'"))
                .frameOptions(frame -> frame.deny()));
        return http.build();
    }
}
