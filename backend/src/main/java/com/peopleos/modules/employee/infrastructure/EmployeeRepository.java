package com.peopleos.modules.employee.infrastructure;

import com.peopleos.modules.employee.domain.Employee;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findByIdAndTenantId(UUID id, UUID tenantId);
}
