package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.UsuarioEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UsuarioPersistenceAdapter implements UsuarioRepositoryPort {

    private final UsuarioJpaRepository repository;

    @Override
    public List<Usuario> findAll() {
        return repository.findAll().stream().map(UsuarioEntityMapper::toDomain).toList();
    }

    @Override
    public Optional<Usuario> findById(Long id) {
        return repository.findById(id).map(UsuarioEntityMapper::toDomain);
    }

    @Override
    public Optional<Usuario> findByEmail(String email) {
        return repository.findByEmailIgnoreCase(email).map(UsuarioEntityMapper::toDomain);
    }

    @Override
    public Usuario save(Usuario usuario) {
        return UsuarioEntityMapper.toDomain(repository.save(UsuarioEntityMapper.toEntity(usuario)));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
