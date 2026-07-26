package com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.WishlistItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WishlistJpaRepository extends JpaRepository<WishlistItemEntity, Long> {
    List<WishlistItemEntity> findByUsuarioId(Long usuarioId);
    Optional<WishlistItemEntity> findByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
    void deleteByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
}
