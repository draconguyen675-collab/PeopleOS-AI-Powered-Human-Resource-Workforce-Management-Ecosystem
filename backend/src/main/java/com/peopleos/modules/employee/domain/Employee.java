package com.peopleos.modules.employee.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "employees")
public class Employee {
    @Id private UUID id;
    @Column(nullable = false) private UUID tenantId;
    @Column(nullable = false, length = 30) private String employeeNumber;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 254) private String workEmail;
    @Column(nullable = false) private UUID departmentId;
    private UUID positionId;
    @Column(nullable = false, length = 120) private String position;
    @Column(nullable = false, length = 120) private String location;
    @Column(nullable = false, length = 20) private String status;
    @Column(nullable = false) private LocalDate startedOn;
    @Version private long version;
    private Instant archivedAt;
    @Column(nullable = false) private Instant createdAt;
    @Column(nullable = false) private Instant updatedAt;

    protected Employee() { }
    public Employee(UUID tenantId) {
        id = UUID.randomUUID(); this.tenantId = tenantId; createdAt = Instant.now(); updatedAt = createdAt;
    }
    public void update(String employeeNumber, String name, String workEmail, UUID departmentId,
                       String position, String location, String status, LocalDate startedOn) {
        if (archivedAt != null) throw new IllegalStateException("Archived employees cannot be edited");
        this.employeeNumber = employeeNumber; this.name = name; this.workEmail = workEmail;
        this.departmentId = departmentId; this.position = position; this.location = location;
        this.status = status; this.startedOn = startedOn; updatedAt = Instant.now();
    }
    public void archive() { archivedAt = Instant.now(); updatedAt = archivedAt; }
    public void restore() { archivedAt = null; updatedAt = Instant.now(); }
    public UUID id() { return id; }
    public String employeeNumber() { return employeeNumber; }
    public String name() { return name; }
    public String workEmail() { return workEmail; }
    public UUID departmentId() { return departmentId; }
    public UUID positionId() { return positionId; }
    public void linkPosition(UUID positionId) { this.positionId = positionId; }
    public String position() { return position; }
    public String location() { return location; }
    public String status() { return status; }
    public LocalDate startedOn() { return startedOn; }
    public long version() { return version; }
    public Instant archivedAt() { return archivedAt; }
    public Instant createdAt() { return createdAt; }
    public Instant updatedAt() { return updatedAt; }
}
