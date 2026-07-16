package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.OrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrdenJpaRepository extends JpaRepository<OrdenEntity, Long> {
    List<OrdenEntity> findByUsuarioId(Long usuarioId);
    Optional<OrdenEntity> findByCodigoOrdenIgnoreCase(String codigoOrden);
    boolean existsByCodigoOrden(String codigoOrden);
}
