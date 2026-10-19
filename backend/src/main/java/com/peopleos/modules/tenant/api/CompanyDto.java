package com.peopleos.modules.tenant.api;

import com.peopleos.modules.tenant.domain.Tenant;
import java.util.UUID;

public record CompanyDto(UUID id, String slug, String name, String timezone, String currency, long version) {
    public static CompanyDto from(Tenant tenant) {
        return new CompanyDto(tenant.id(), tenant.slug(), tenant.name(), tenant.timezone(), tenant.currency(), tenant.version());
    }
}
