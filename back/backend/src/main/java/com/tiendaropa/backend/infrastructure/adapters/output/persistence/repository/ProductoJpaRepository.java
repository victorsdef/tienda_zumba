package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ProductoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductoJpaRepository extends JpaRepository<ProductoEntity, Long> {
    Optional<ProductoEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsBySku(String sku);
}
