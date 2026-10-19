package com.peopleos.modules.tenant.infrastructure;

import com.peopleos.modules.tenant.domain.Tenant;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantRepository extends JpaRepository<Tenant, UUID> { }
