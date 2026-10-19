package com.peopleos.modules.tenant.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant {
    @Id private UUID id;
    @Column(nullable = false, length = 60) private String slug;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 60) private String timezone;
    @Column(nullable = false, length = 3) private String currency;
    @Version private long version;
    protected Tenant() { }
    public UUID id() { return id; }
    public String slug() { return slug; }
    public String name() { return name; }
    public String timezone() { return timezone; }
    public String currency() { return currency; }
    public long version() { return version; }
    public void update(String name, String timezone, String currency) {
        this.name = name.strip(); this.timezone = timezone; this.currency = currency;
    }
}
