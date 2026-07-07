package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Banner;
import java.util.List;
import java.util.Optional;

public interface BannerRepositoryPort {
    Banner save(Banner banner);
    Optional<Banner> findById(Long id);
    List<Banner> findActivos();
    Banner update(Banner banner);
    void deleteById(Long id);
}
