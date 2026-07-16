package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.UsuarioUseCase;
import com.tiendaropa.backend.application.ports.output.DireccionRepositoryPort;
import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.direccion.DireccionDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.direccion.DireccionRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.DireccionRestMapper;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.UsuarioRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({
    "/api/nueva-arquitectura/usuarios",
    "/api/nueva-arquitectura/usuario",
    "/api/usuarios",
    "/api/usuario"
})
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioUseCase usuarioUseCase;
    private final UsuarioRestMapper usuarioRestMapper;
    private final DireccionRepositoryPort direccionRepositoryPort;
    private final DireccionRestMapper direccionRestMapper;

    @GetMapping
    public List<UsuarioDTO> listar() {
        return usuarioRestMapper.toDtoList(usuarioUseCase.listarTodos());
    }

    @GetMapping("/perfil")
    public UsuarioDTO obtenerPerfil(Authentication authentication) {
        return usuarioRestMapper.toDto(obtenerUsuarioActual(authentication));
    }

    @PutMapping("/perfil")
    public UsuarioDTO actualizarPerfil(Authentication authentication, @RequestBody UsuarioDTO request) {
        Usuario actual = obtenerUsuarioActual(authentication);
        if (request.getNombre() != null && !request.getNombre().isBlank()) {
            actual.setNombre(request.getNombre().trim());
        }
        return usuarioRestMapper.toDto(usuarioUseCase.actualizar(actual.getId(), actual));
    }

    @GetMapping("/direcciones")
    public List<DireccionDTO> listarDirecciones(Authentication authentication) {
        Usuario actual = obtenerUsuarioActual(authentication);
        return direccionRestMapper.toDtoList(direccionRepositoryPort.findByUsuarioId(actual.getId()));
    }

    @PostMapping("/direcciones")
    public DireccionDTO crearDireccion(Authentication authentication, @RequestBody DireccionRequest request) {
        Usuario actual = obtenerUsuarioActual(authentication);
        var direccion = direccionRestMapper.toDomain(request);
        direccion.setUsuario(actual);
        return direccionRestMapper.toDto(direccionRepositoryPort.save(direccion));
    }

    @PutMapping("/direcciones/{id}")
    public DireccionDTO actualizarDireccion(
        Authentication authentication,
        @PathVariable Long id,
        @RequestBody DireccionRequest request
    ) {
        Usuario actual = obtenerUsuarioActual(authentication);
        var direccion = direccionRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Direccion no encontrada: " + id));

        validarPropietarioDireccion(actual.getId(), direccion.getUsuario() != null ? direccion.getUsuario().getId() : null);

        direccion.setNombreCompleto(request.getNombreCompleto());
        direccion.setCelular(request.getCelular());
        direccion.setCedula(request.getCedula());
        direccion.setProvincia(request.getProvincia());
        direccion.setCanton(request.getCanton());
        direccion.setCiudad(request.getCiudad());
        direccion.setDireccion(request.getDireccion());
        direccion.setPredeterminada(request.isPredeterminada());
        direccion.setUsuario(actual);
        return direccionRestMapper.toDto(direccionRepositoryPort.save(direccion));
    }

    @PatchMapping("/direcciones/{id}/predeterminada")
    public DireccionDTO marcarDireccionPredeterminada(Authentication authentication, @PathVariable Long id) {
        Usuario actual = obtenerUsuarioActual(authentication);
        var direccion = direccionRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Direccion no encontrada: " + id));

        validarPropietarioDireccion(actual.getId(), direccion.getUsuario() != null ? direccion.getUsuario().getId() : null);

        for (var existente : direccionRepositoryPort.findByUsuarioId(actual.getId())) {
            boolean debeSerPredeterminada = existente.getId() != null && existente.getId().equals(id);
            if (existente.isPredeterminada() != debeSerPredeterminada) {
                existente.setPredeterminada(debeSerPredeterminada);
                direccionRepositoryPort.save(existente);
            }
            if (debeSerPredeterminada) {
                direccion = existente;
            }
        }

        return direccionRestMapper.toDto(direccion);
    }

    @DeleteMapping("/direcciones/{id}")
    public ResponseEntity<Void> eliminarDireccion(Authentication authentication, @PathVariable Long id) {
        Usuario actual = obtenerUsuarioActual(authentication);
        var direccion = direccionRepositoryPort.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Direccion no encontrada: " + id));

        validarPropietarioDireccion(actual.getId(), direccion.getUsuario() != null ? direccion.getUsuario().getId() : null);
        direccionRepositoryPort.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDTO obtener(@PathVariable Long id) {
        return usuarioRestMapper.toDto(usuarioUseCase.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDTO crear(@RequestBody Usuario usuario) {
        return usuarioRestMapper.toDto(usuarioUseCase.crear(usuario));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UsuarioDTO actualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        return usuarioRestMapper.toDto(usuarioUseCase.actualizar(id, usuario));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) {
        usuarioUseCase.eliminar(id);
    }

    private Usuario obtenerUsuarioActual(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new IllegalArgumentException("Usuario no autenticado");
        }

        return usuarioUseCase.findByEmail(authentication.getName())
            .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + authentication.getName()));
    }

    private void validarPropietarioDireccion(Long usuarioId, Long propietarioId) {
        if (propietarioId == null || !propietarioId.equals(usuarioId)) {
            throw new IllegalArgumentException("No tenés permiso para modificar esta dirección");
        }
    }
}
