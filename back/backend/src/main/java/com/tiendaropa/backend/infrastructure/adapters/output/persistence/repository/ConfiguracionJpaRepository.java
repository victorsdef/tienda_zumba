package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ConfiguracionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionJpaRepository extends JpaRepository<ConfiguracionEntity, String> {
}
