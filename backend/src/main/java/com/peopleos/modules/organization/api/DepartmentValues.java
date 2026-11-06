package com.peopleos.modules.organization.api;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record DepartmentValues(@NotBlank @Size(max = 100) String name, @NotNull @Size(max = 300) String description, UUID parentId) {
    public DepartmentValues {
        name = name == null ? null : name.strip();
        description = description == null ? "" : description.strip();
    }
}
