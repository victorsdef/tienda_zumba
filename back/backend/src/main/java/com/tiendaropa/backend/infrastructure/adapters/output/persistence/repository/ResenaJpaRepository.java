package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ResenaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ResenaJpaRepository extends JpaRepository<ResenaEntity, Long> {
    List<ResenaEntity> findByProductoIdAndAprobadaTrue(Long productoId);
    List<ResenaEntity> findByAprobadaFalse();
    List<ResenaEntity> findAllByOrderByFechaCreacionDesc();
    Optional<ResenaEntity> findByProductoIdAndUsuarioId(Long productoId, Long usuarioId);
}
