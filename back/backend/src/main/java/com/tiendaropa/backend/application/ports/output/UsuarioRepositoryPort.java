package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepositoryPort {

    List<Usuario> findAll();

    Optional<Usuario> findById(Long id);

    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByTokenVerificacion(String token);

    Usuario save(Usuario usuario);

    void deleteById(Long id);
}
