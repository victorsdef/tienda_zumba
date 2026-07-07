package com.tiendaropa.backend.application.usecases.usuario;

import com.tiendaropa.backend.application.ports.input.UsuarioUseCase;
import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioUseCaseImpl implements UsuarioUseCase {

    private final UsuarioRepositoryPort usuarioRepositoryPort;

    @Override
    public List<Usuario> listarTodos() {
        return usuarioRepositoryPort.findAll();
    }

    @Override
    public Usuario obtenerPorId(Long id) {
        return usuarioRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + id));
    }

    @Override
    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepositoryPort.findByEmail(email);
    }

    @Override
    public Usuario crear(Usuario usuario) {
        return usuarioRepositoryPort.save(usuario);
    }

    @Override
    public Usuario actualizar(Long id, Usuario usuario) {
        Usuario actual = obtenerPorId(id);
        actual.setNombre(usuario.getNombre());
        actual.setEmail(usuario.getEmail());
        actual.setPassword(usuario.getPassword());
        actual.setRol(usuario.getRol());
        actual.setActivo(usuario.isActivo());
        return usuarioRepositoryPort.save(actual);
    }

    @Override
    public void eliminar(Long id) {
        obtenerPorId(id);
        usuarioRepositoryPort.deleteById(id);
    }
}
