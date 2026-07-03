package com.tiendaropa.backend.repository;
import com.tiendaropa.backend.entity.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface DireccionRepository extends JpaRepository<Direccion, Long> {
    List<Direccion> findByUsuarioId(Long usuarioId);
    Optional<Direccion> findByUsuarioIdAndPredeterminadaTrue(Long usuarioId);
}
