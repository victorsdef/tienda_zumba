package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.CategoriaRepositoryPort;
import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.CategoriaEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.CategoriaJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CategoriaPersistenceAdapter implements CategoriaRepositoryPort {

    private final CategoriaJpaRepository repository;

    @Override
    public List<Categoria> findAll() {
        return repository.findAll().stream().map(CategoriaEntityMapper::toDomain).toList();
    }

    @Override
    public Optional<Categoria> findById(Long id) {
        return repository.findById(id).map(CategoriaEntityMapper::toDomain);
    }

    @Override
    public Categoria save(Categoria categoria) {
        return CategoriaEntityMapper.toDomain(repository.save(CategoriaEntityMapper.toEntity(categoria)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
