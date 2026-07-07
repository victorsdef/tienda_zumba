package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Carrito;

import java.util.List;
import java.util.Optional;

public interface CarritoRepositoryPort {
    List<Carrito> findAll();
    Optional<Carrito> findById(Long id);
    Carrito save(Carrito carrito);
    void deleteById(Long id);
}
