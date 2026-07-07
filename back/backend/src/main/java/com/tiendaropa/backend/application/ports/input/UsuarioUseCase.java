package com.tiendaropa.backend.application.ports.input;

import com.tiendaropa.backend.domain.model.Usuario;

import java.util.List;
import java.util.Optional;

public interface UsuarioUseCase {
    List<Usuario> listarTodos();
    Usuario obtenerPorId(Long id);
    Optional<Usuario> findByEmail(String email);
    Usuario crear(Usuario usuario);
    Usuario actualizar(Long id, Usuario usuario);
    void eliminar(Long id);
}
