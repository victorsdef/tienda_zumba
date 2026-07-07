package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.ProductoRepositoryPort;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CategoriaEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ProductoEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.ProductoEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.CategoriaJpaRepository;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.ProductoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProductoPersistenceAdapter implements ProductoRepositoryPort {

    private final ProductoJpaRepository repository;
    private final CategoriaJpaRepository categoriaRepository;

    @Override
    public List<Producto> findAll() {
        return repository.findAll().stream().map(ProductoEntityMapper::toDomain).toList();
    }

    @Override
    public Optional<Producto> findById(Long id) {
        return repository.findById(id).map(ProductoEntityMapper::toDomain);
    }

    @Override
    public Producto save(Producto producto) {
        ProductoEntity entity = ProductoEntityMapper.toEntity(producto);
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            CategoriaEntity categoria = categoriaRepository.findById(producto.getCategoria().getId()).orElse(null);
            entity.setCategoria(categoria);
        }
        return ProductoEntityMapper.toDomain(repository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Optional<Producto> findBySlug(String slug) {
        return repository.findBySlug(slug).map(ProductoEntityMapper::toDomain);
    }

    @Override
    public boolean existsBySlug(String slug) {
        return repository.existsBySlug(slug);
    }

    @Override
    public boolean existsBySku(String sku) {
        return repository.existsBySku(sku);
    }
}
