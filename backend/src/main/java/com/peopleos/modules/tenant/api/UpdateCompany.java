package com.peopleos.modules.tenant.api;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCompany(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 60) String timezone,
    @Pattern(regexp = "[A-Z]{3}") @NotBlank String currency,
    @NotNull @Min(0) Long version
) { }
