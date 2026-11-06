package com.peopleos.modules.organization.domain;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "departments")
public class Department {
    @Id private UUID id;
    @Column(nullable = false) private UUID tenantId;
    @Column(nullable = false, length = 100) private String name;
    @Column(nullable = false, length = 300) private String description;
    private UUID parentId;
    @Version private long version;
    protected Department() { }
    public Department(UUID tenantId) { this.id = UUID.randomUUID(); this.tenantId = tenantId; }
    public void update(String name, String description, UUID parentId) {
        this.name = name; this.description = description; this.parentId = parentId;
    }
    public UUID id() { return id; }
    public long version() { return version; }
}
