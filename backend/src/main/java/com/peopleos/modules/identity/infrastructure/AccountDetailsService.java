package com.peopleos.modules.identity.infrastructure;

import com.peopleos.shared.security.PeoplePrincipal;
import java.util.Locale;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AccountDetailsService implements UserDetailsService {
    private final JdbcTemplate jdbc;
    public AccountDetailsService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override public UserDetails loadUserByUsername(String username) {
        String[] parts = username.toLowerCase(Locale.ROOT).split(":", 2);
        if (parts.length != 2 || username.length() > 315) throw new UsernameNotFoundException("Invalid credentials");
        var accounts = jdbc.query("""
            SELECT u.* FROM users u JOIN tenants t ON t.id = u.tenant_id
            WHERE t.slug = ? AND u.email = ? AND u.enabled = true
            """, (rs, row) -> {
                var permissions = jdbc.queryForList(
                    "SELECT permission_code FROM role_permissions WHERE role_code = ? ORDER BY permission_code",
                    String.class, rs.getString("role_code"));
                return new PeoplePrincipal(rs.getObject("id", UUID.class), rs.getObject("tenant_id", UUID.class),
                    rs.getString("email"), rs.getString("display_name"), rs.getString("role_code"), permissions,
                    rs.getString("password_hash"));
            }, parts[0].trim(), parts[1].trim());
        if (accounts.isEmpty()) throw new UsernameNotFoundException("Invalid credentials");
        return accounts.getFirst();
    }
}
