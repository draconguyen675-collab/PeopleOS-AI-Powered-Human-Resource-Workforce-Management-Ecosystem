package com.peopleos.modules.organization.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "positions")
public class Position {
    @Id private UUID id;
    @Column(nullable = false) private UUID tenantId;
    @Column(nullable = false, length = 30) private String code;
    @Column(nullable = false, length = 120) private String title;
    @Column(nullable = false, length = 1000) private String description;
    @Version private long version;
    protected Position() { }
    public Position(UUID tenantId) { id = UUID.randomUUID(); this.tenantId = tenantId; }
    public void update(String code, String title, String description) {
        this.code = code; this.title = title; this.description = description;
    }
    public UUID id() { return id; }
    public long version() { return version; }
}
