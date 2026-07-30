package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.BackupEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BackupJpaRepository extends JpaRepository<BackupEntity, Long> {
    List<BackupEntity> findAllByOrderByFechaProcesoDesc();
}
