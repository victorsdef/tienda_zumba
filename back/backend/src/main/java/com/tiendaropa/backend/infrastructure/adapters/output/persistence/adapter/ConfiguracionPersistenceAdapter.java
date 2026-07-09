package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.ConfiguracionRepositoryPort;
import com.tiendaropa.backend.domain.model.Configuracion;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.ConfiguracionEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.ConfiguracionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ConfiguracionPersistenceAdapter implements ConfiguracionRepositoryPort {

    private final ConfiguracionJpaRepository repository;
    private final ConfiguracionEntityMapper mapper;

    @Override
    public List<Configuracion> findAll() {
        return repository.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<Configuracion> findById(String clave) {
        return repository.findById(clave).map(mapper::toDomain);
    }

    @Override
    public Configuracion save(Configuracion configuracion) {
        return mapper.toDomain(repository.save(mapper.toEntity(configuracion)));
    }

    @Override
    public void deleteById(String clave) {
        repository.deleteById(clave);
    }

    @Override
    public boolean existsById(String clave) {
        return repository.existsById(clave);
    }
}
