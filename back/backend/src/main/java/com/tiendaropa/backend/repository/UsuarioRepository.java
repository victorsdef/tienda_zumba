package com.tiendaropa.backend.repository;

import com.tiendaropa.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByTokenVerificacion(String token);
    boolean existsByEmail(String email);
    long countByEmailVerificadoTrue();
    long countByActivoTrue();
}
