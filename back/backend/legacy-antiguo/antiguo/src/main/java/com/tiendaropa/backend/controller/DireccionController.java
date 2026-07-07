package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.direccion.DireccionDTO;
import com.tiendaropa.backend.dto.direccion.DireccionRequest;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.service.DireccionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionService direccionService;

    @GetMapping
    public List<DireccionDTO> listar(@AuthenticationPrincipal Usuario usuario) {
        return direccionService.listar(usuario.getId());
    }

    @PostMapping
    public ResponseEntity<DireccionDTO> crear(@Valid @RequestBody DireccionRequest req,
                                               @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(direccionService.crear(usuario.getId(), req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DireccionDTO> actualizar(@PathVariable Long id,
                                                    @Valid @RequestBody DireccionRequest req,
                                                    @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(direccionService.actualizar(usuario.getId(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        direccionService.eliminar(usuario.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/predeterminada")
    public ResponseEntity<DireccionDTO> setPredeterminada(@PathVariable Long id,
                                                           @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(direccionService.setPredeterminada(usuario.getId(), id));
    }
}
