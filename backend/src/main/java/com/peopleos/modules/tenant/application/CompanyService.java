package com.peopleos.modules.tenant.application;

import com.peopleos.modules.tenant.api.CompanyDto;
import com.peopleos.modules.tenant.api.UpdateCompany;
import com.peopleos.modules.tenant.infrastructure.TenantRepository;
import com.peopleos.shared.audit.AuditService;
import com.peopleos.shared.security.PeoplePrincipal;
import java.time.DateTimeException;
import java.time.ZoneId;
import java.util.Currency;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CompanyService {
    private final TenantRepository tenants;
    private final AuditService audit;
    public CompanyService(TenantRepository tenants, AuditService audit) { this.tenants = tenants; this.audit = audit; }

    @Transactional(readOnly = true)
    @PreAuthorize("hasAuthority('company:read')")
    public CompanyDto get(PeoplePrincipal user) {
        return CompanyDto.from(tenants.findById(user.tenantId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)));
    }

    @Transactional
    @PreAuthorize("hasAuthority('company:write')")
    public CompanyDto update(PeoplePrincipal user, UpdateCompany request) {
        try { ZoneId.of(request.timezone()); Currency.getInstance(request.currency()); }
        catch (DateTimeException | IllegalArgumentException invalid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a valid IANA timezone and ISO currency.");
        }
        var tenant = tenants.findById(user.tenantId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (tenant.version() != request.version()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Company settings changed. Reload before saving.");
        }
        tenant.update(request.name(), request.timezone(), request.currency());
        tenants.flush();
        audit.record(user, "COMPANY_UPDATED", "COMPANY", tenant.id(), "Updated company name, timezone or currency");
        return CompanyDto.from(tenant);
    }
}
