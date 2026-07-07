package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.DireccionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DireccionJpaRepository extends JpaRepository<DireccionEntity, Long> {
}
