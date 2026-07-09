package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.DireccionRepositoryPort;
import com.tiendaropa.backend.domain.model.Direccion;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.DireccionEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.UsuarioEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.DireccionEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.DireccionJpaRepository;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DireccionPersistenceAdapter implements DireccionRepositoryPort {

    private final DireccionJpaRepository repository;
    private final UsuarioJpaRepository usuarioRepository;
    private final DireccionEntityMapper mapper;

    @Override
    public List<Direccion> findAll() {
        return repository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Direccion> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Direccion save(Direccion direccion) {
        DireccionEntity entity = mapper.toEntity(direccion);
        if (direccion.getUsuario() != null && direccion.getUsuario().getId() != null) {
            UsuarioEntity usuario = usuarioRepository.findById(direccion.getUsuario().getId()).orElse(null);
            entity.setUsuario(usuario);
        }
        return mapper.toDomain(repository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
