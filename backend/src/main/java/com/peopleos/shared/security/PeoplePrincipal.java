package com.peopleos.shared.security;

import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.CredentialsContainer;

public final class PeoplePrincipal implements UserDetails, CredentialsContainer {
    @Serial private static final long serialVersionUID = 1L;
    private final UUID id;
    private final UUID tenantId;
    private final String email;
    private final String displayName;
    private final String role;
    private final List<String> permissions;
    private String password;

    public PeoplePrincipal(UUID id, UUID tenantId, String email, String displayName, String role,
                           List<String> permissions, String password) {
        this.id = id; this.tenantId = tenantId; this.email = email; this.displayName = displayName;
        this.role = role; this.permissions = List.copyOf(permissions); this.password = password;
    }
    public UUID id() { return id; }
    public UUID tenantId() { return tenantId; }
    public String email() { return email; }
    public String displayName() { return displayName; }
    public String role() { return role; }
    public List<String> permissions() { return permissions; }
    @Override public String getUsername() { return id.toString(); }
    @Override public String getPassword() { return password; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return permissions.stream().map(SimpleGrantedAuthority::new).toList();
    }
    @Override public void eraseCredentials() { password = null; }
}
