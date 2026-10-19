package com.peopleos.modules.employee.api;

import java.time.LocalDate;
import java.util.UUID;

/** Directory fields only. Compensation and personal contacts must use separately authorized endpoints. */
public record EmployeeDto(UUID id, String employeeNumber, String name, String workEmail,
                          String department, String position, String location, String status, LocalDate startedOn) { }
