package com.peopleos.modules.employee.api;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

public record EmployeeValues(
    @NotBlank @Size(max = 30) @Pattern(regexp = "[A-Z0-9][A-Z0-9._-]*") String employeeNumber,
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Email @Size(max = 254) String workEmail,
    @NotNull UUID departmentId,
    @NotBlank @Size(max = 120) String position,
    @NotBlank @Size(max = 120) String location,
    @NotNull @Pattern(regexp = "ACTIVE|ONBOARDING|ON_LEAVE") String status,
    @NotNull LocalDate startedOn,
    UUID positionId
) {
    public EmployeeValues {
        employeeNumber = employeeNumber == null ? null : employeeNumber.strip().toUpperCase(Locale.ROOT);
        name = name == null ? null : name.strip();
        workEmail = workEmail == null ? null : workEmail.strip().toLowerCase(Locale.ROOT);
        position = position == null ? null : position.strip();
        location = location == null ? null : location.strip();
    }
}
