package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.BannerRepositoryPort;
import com.tiendaropa.backend.domain.model.Banner;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.BannerEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.BannerJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BannerPersistenceAdapter implements BannerRepositoryPort {

    private final BannerJpaRepository repository;
    private final BannerEntityMapper mapper;

    @Override
    public Banner save(Banner banner) {
        return mapper.toDomain(repository.save(mapper.toEntity(banner)));
    }

    @Override
    public Optional<Banner> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Banner> findActivos() {
        return repository.findAll().stream()
            .map(mapper::toDomain)
            .filter(Banner::isActivo)
            .sorted(Comparator.comparing(b -> b.getOrden() != null ? b.getOrden() : 0))
            .toList();
    }

    @Override
    public List<Banner> findTodos() {
        return repository.findAll().stream()
            .map(mapper::toDomain)
            .sorted(Comparator.comparing(b -> b.getOrden() != null ? b.getOrden() : 0))
            .toList();
    }

    @Override
    public Banner update(Banner banner) {
        return save(banner);
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
