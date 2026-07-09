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
    private final OrdenEntityMapper mapper;

    @Override
    public Orden save(Orden orden) {
        return mapper.toDomain(repository.save(mapper.toEntity(orden)));
    }

    @Override
    public Optional<Orden> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Orden> findAll() {
        return repository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Orden> findByUsuarioId(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Orden update(Orden orden) {
        return save(orden);
    }
}


