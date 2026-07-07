package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.OrdenRepositoryPort;
import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.OrdenEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.OrdenJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OrdenPersistenceAdapter implements OrdenRepositoryPort {

    private final OrdenJpaRepository repository;

    @Override
    public Orden save(Orden orden) {
        return OrdenEntityMapper.toDomain(repository.save(OrdenEntityMapper.toEntity(orden)));
    }

    @Override
    public Optional<Orden> findById(Long id) {
        return repository.findById(id).map(OrdenEntityMapper::toDomain);
    }

    @Override
    public List<Orden> findAll() {
        return repository.findAll().stream().map(OrdenEntityMapper::toDomain).toList();
    }

    @Override
    public List<Orden> findByUsuarioId(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId).stream().map(OrdenEntityMapper::toDomain).toList();
    }

    @Override
    public Orden update(Orden orden) {
        return save(orden);
    }
}


