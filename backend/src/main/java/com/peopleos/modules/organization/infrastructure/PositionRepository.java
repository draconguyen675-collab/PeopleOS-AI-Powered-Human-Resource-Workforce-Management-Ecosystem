package com.peopleos.modules.organization.infrastructure;

import com.peopleos.modules.organization.domain.Position;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionRepository extends JpaRepository<Position, UUID> {
    Optional<Position> findByIdAndTenantId(UUID id, UUID tenantId);
}
