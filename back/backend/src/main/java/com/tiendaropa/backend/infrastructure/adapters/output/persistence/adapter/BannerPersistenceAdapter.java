package com.tiendaropa.backend.infrastructure.adapters.output.persistence.adapter;

import com.tiendaropa.backend.application.ports.output.BannerRepositoryPort;
import com.tiendaropa.backend.domain.model.Banner;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper.BannerEntityMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.BannerJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BannerPersistenceAdapter implements BannerRepositoryPort {

    private final BannerJpaRepository repository;

    @Override
    public Banner save(Banner banner) {
        return BannerEntityMapper.toDomain(repository.save(BannerEntityMapper.toEntity(banner)));
    }

    @Override
    public Optional<Banner> findById(Long id) {
        return repository.findById(id).map(BannerEntityMapper::toDomain);
    }

    @Override
    public List<Banner> findActivos() {
        LocalDateTime now = LocalDateTime.now();
        return repository.findAll().stream()
            .map(BannerEntityMapper::toDomain)
            .filter(Banner::isActivo)
            .filter(b -> (b.getFechaInicio() == null || !b.getFechaInicio().isAfter(now))
                && (b.getFechaFin() == null || !b.getFechaFin().isBefore(now)))
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
