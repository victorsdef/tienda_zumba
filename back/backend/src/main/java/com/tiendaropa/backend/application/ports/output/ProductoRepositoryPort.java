package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Producto;

import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface ProductoRepositoryPort {
    List<Producto> findAll();
    Optional<Producto> findById(Long id);
    Producto save(Producto producto);
    void deleteById(Long id);
    Optional<Producto> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);
}
