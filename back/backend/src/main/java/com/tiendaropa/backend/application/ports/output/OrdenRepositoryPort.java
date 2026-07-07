package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Orden;
import java.util.List;
import java.util.Optional;

public interface OrdenRepositoryPort {
    Orden save(Orden orden);
    Optional<Orden> findById(Long id);
    List<Orden> findAll();
    List<Orden> findByUsuarioId(Long usuarioId);
    Orden update(Orden orden);
}

