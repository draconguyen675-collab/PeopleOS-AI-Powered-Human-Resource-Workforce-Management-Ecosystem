package com.peopleos.modules.organization.api;

import jakarta.validation.constraints.*;
import java.util.Locale;

public record PositionValues(
    @NotBlank @Size(max = 30) @Pattern(regexp = "[A-Z0-9][A-Z0-9._-]*") String code,
    @NotBlank @Size(max = 120) String title,
    @NotNull @Size(max = 1000) String description
) {
    public PositionValues {
        code = code == null ? null : code.strip().toUpperCase(Locale.ROOT);
        title = title == null ? null : title.strip();
        description = description == null ? "" : description.strip();
    }
}
