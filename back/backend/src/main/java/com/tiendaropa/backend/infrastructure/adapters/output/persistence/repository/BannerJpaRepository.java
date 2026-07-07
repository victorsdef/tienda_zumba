package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.BannerEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BannerJpaRepository extends JpaRepository<BannerEntity, Long> {
}
