package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Orden;
import java.util.List;
import java.util.Optional;

public interface OrdenRepositoryPort {
    Orden save(Orden orden);
    Optional<Orden> findById(Long id);
    Optional<Orden> findByCodigoOrden(String codigoOrden);
    List<Orden> findAll();
    List<Orden> findByUsuarioId(Long usuarioId);
    boolean existsByCodigoOrden(String codigoOrden);
    Orden update(Orden orden);
}

