package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.Orden;
import com.tiendaropa.backend.entity.enums.EstadoOrden;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public interface OrdenRepository extends JpaRepository<Orden, Long> {

    Page<Orden> findByUsuarioId(Long usuarioId, Pageable pageable);

    Page<Orden> findByEstado(EstadoOrden estado, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Orden o WHERE o.fechaCreacion >= :desde AND o.estado <> 'CANCELADO'")
    BigDecimal sumVentasDesde(@Param("desde") LocalDateTime desde);

    @Query("SELECT COUNT(o) FROM Orden o WHERE o.fechaCreacion >= :desde")
    Long countOrdenesDesde(@Param("desde") LocalDateTime desde);

    @Query("SELECT COUNT(o) FROM Orden o WHERE o.estado = :estado")
    Long countByEstado(@Param("estado") EstadoOrden estado);
}
