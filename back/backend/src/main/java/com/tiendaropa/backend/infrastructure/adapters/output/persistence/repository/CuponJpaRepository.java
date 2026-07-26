package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CuponEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CuponJpaRepository extends JpaRepository<CuponEntity, Long> {
    Optional<CuponEntity> findByCodigoIgnoreCase(String codigo);
}
