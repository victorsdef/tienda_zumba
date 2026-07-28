package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CuponEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.Optional;

public interface CuponJpaRepository extends JpaRepository<CuponEntity, Long> {
    Optional<CuponEntity> findByCodigoIgnoreCase(String codigo);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CuponEntity c where lower(c.codigo) = lower(:codigo)")
    Optional<CuponEntity> findByCodigoForUpdate(@Param("codigo") String codigo);
}
