package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CarritoEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CarritoJpaRepository extends JpaRepository<CarritoEntity, Long> {
}
