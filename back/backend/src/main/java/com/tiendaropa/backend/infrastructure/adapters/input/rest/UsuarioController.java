package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.UsuarioUseCase;
import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.UsuarioRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/usuarios", "/api/usuarios", "/api/usuario"})
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioUseCase usuarioUseCase;
    private final UsuarioRestMapper usuarioRestMapper;

    @GetMapping
    public List<UsuarioDTO> listar() {
        return usuarioRestMapper.toDtoList(usuarioUseCase.listarTodos());
    }

    @GetMapping("/{id}")
    public UsuarioDTO obtener(@PathVariable Long id) {
        return usuarioRestMapper.toDto(usuarioUseCase.obtenerPorId(id));
    }

    @PostMapping
    public UsuarioDTO crear(@RequestBody Usuario usuario) {
        return usuarioRestMapper.toDto(usuarioUseCase.crear(usuario));
    }

    @PutMapping("/{id}")
    public UsuarioDTO actualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioRestMapper.toDto(usuarioUseCase.actualizar(id, usuario));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        usuarioUseCase.eliminar(id);
    }
}
