package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ColorPersonalizadoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ColorPersonalizadoJpaRepository extends JpaRepository<ColorPersonalizadoEntity, Long> {
    Optional<ColorPersonalizadoEntity> findByHexIgnoreCase(String hex);
    List<ColorPersonalizadoEntity> findAllByOrderByNombreAsc();
}
