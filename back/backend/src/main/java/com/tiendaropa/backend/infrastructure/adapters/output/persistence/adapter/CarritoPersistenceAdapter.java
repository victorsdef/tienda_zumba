package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.CarritoRepositoryPort;
import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CarritoEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.UsuarioEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.CarritoEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.CarritoJpaRepository;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.UsuarioJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CarritoPersistenceAdapter implements CarritoRepositoryPort {

    private final CarritoJpaRepository repository;
    private final UsuarioJpaRepository usuarioRepository;
    private final CarritoEntityMapper mapper;

    @Override
    public List<Carrito> findAll() {
        return repository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Carrito> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public Carrito save(Carrito carrito) {
        CarritoEntity entity = mapper.toEntity(carrito);
        if (carrito.getUsuario() != null && carrito.getUsuario().getId() != null) {
            UsuarioEntity usuario = usuarioRepository.findById(carrito.getUsuario().getId()).orElse(null);
            entity.setUsuario(usuario);
        }
        return mapper.toDomain(repository.save(entity));
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
