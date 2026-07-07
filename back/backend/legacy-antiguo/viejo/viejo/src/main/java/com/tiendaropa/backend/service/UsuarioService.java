package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.usuario.CrearUsuarioAdminRequest;
import com.tiendaropa.backend.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.dto.usuario.UsuarioUpdateRequest;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.entity.enums.Rol;
import com.tiendaropa.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioDTO obtenerPerfil(Long id) {
        return toDTO(findOrThrow(id));
    }

    @Transactional
    public UsuarioDTO actualizarPerfil(Long id, UsuarioUpdateRequest req) {
        Usuario u = findOrThrow(id);
        u.setNombre(req.getNombre());
        return toDTO(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioDTO crearDesdeAdmin(CrearUsuarioAdminRequest req) {
        if (usuarioRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario con ese email");
        }
        Usuario u = Usuario.builder()
            .nombre(req.getNombre())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .rol(req.getRol())
            .activo(true)
            .emailVerificado(true)
            .build();
        return toDTO(usuarioRepository.save(u));
    }

    // Admin
    public Page<UsuarioDTO> listarTodosPaginado(Pageable pageable) {
        return usuarioRepository.findAll(pageable).map(this::toDTO);
    }

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional
    public UsuarioDTO cambiarRol(Long id, Rol rol) {
        Usuario u = findOrThrow(id);
        u.setRol(rol);
        return toDTO(usuarioRepository.save(u));
    }

    @Transactional
    public UsuarioDTO toggleActivo(Long id) {
        Usuario u = findOrThrow(id);
        if (u.getRol() == Rol.ADMIN) throw new RuntimeException("No se puede desactivar un admin");
        u.setActivo(!u.isActivo());
        return toDTO(usuarioRepository.save(u));
    }

    public UsuarioDTO obtenerPorId(Long id) {
        return toDTO(findOrThrow(id));
    }

    private Usuario findOrThrow(Long id) {
        return usuarioRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    public UsuarioDTO toDTO(Usuario u) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(u.getId()); dto.setNombre(u.getNombre());
        dto.setEmail(u.getEmail()); dto.setRol(u.getRol().name());
        dto.setActivo(u.isActivo()); dto.setEmailVerificado(u.isEmailVerificado());
        return dto;
    }
}
