package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.direccion.DireccionDTO;
import com.tiendaropa.backend.dto.direccion.DireccionRequest;
import com.tiendaropa.backend.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.dto.usuario.UsuarioUpdateRequest;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuario")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioDTO> perfil(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(usuarioService.obtenerPerfil(usuario.getId()));
    }

    @PutMapping("/perfil")
    public ResponseEntity<UsuarioDTO> actualizar(
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody UsuarioUpdateRequest req
    ) {
        return ResponseEntity.ok(usuarioService.actualizarPerfil(usuario.getId(), req));
    }

    @GetMapping("/direcciones")
    public ResponseEntity<List<DireccionDTO>> listarDirecciones(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(usuarioService.listarDirecciones(usuario.getId()));
    }

    @PostMapping("/direcciones")
    public ResponseEntity<DireccionDTO> agregarDireccion(
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody DireccionRequest req
    ) {
        return ResponseEntity.ok(usuarioService.agregarDireccion(usuario.getId(), req));
    }

    @PutMapping("/direcciones/{id}")
    public ResponseEntity<DireccionDTO> actualizarDireccion(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable Long id,
        @Valid @RequestBody DireccionRequest req
    ) {
        return ResponseEntity.ok(usuarioService.actualizarDireccion(usuario.getId(), id, req));
    }

    @DeleteMapping("/direcciones/{id}")
    public ResponseEntity<Void> eliminarDireccion(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable Long id
    ) {
        usuarioService.eliminarDireccion(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
