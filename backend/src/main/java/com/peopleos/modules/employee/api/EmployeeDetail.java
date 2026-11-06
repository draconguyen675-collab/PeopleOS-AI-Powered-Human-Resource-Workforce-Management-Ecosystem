package com.peopleos.modules.employee.api;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeDetail(UUID id, String employeeNumber, String name, String workEmail, UUID departmentId,
    String department, String position, String location, String status, LocalDate startedOn, long version,
    Instant archivedAt, Instant createdAt, Instant updatedAt, UUID positionId, String positionName) { }
