package com.peopleos.modules.organization.infrastructure;

import com.peopleos.modules.organization.domain.Department;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    Optional<Department> findByIdAndTenantId(UUID id, UUID tenantId);
}
