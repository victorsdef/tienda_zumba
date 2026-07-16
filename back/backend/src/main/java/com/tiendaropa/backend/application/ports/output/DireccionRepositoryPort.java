package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Direccion;

import java.util.List;
import java.util.Optional;

public interface DireccionRepositoryPort {
    List<Direccion> findAll();
    List<Direccion> findByUsuarioId(Long usuarioId);
    Optional<Direccion> findById(Long id);
    Direccion save(Direccion direccion);
    void deleteById(Long id);
}
