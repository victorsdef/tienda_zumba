package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import com.tiendaropa.backend.domain.model.Orden;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/orden", "/api/orden", "/api/ordenes"})
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenUseCase ordenUseCase;

    @PostMapping
    public ResponseEntity<Orden> crear(@RequestBody Orden orden) {
        Orden creado = ordenUseCase.crearOrden(orden);
        return ResponseEntity.ok(creado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Orden> obtener(@PathVariable Long id) {
        return ordenUseCase.obtenerPorId(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Orden>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(ordenUseCase.listarPorUsuarioId(usuarioId));
    }

    @PutMapping
    public ResponseEntity<Orden> actualizar(@RequestBody Orden orden) {
        return ResponseEntity.ok(ordenUseCase.actualizar(orden));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        ordenUseCase.actualizarEstado(id, estado);
        return ResponseEntity.ok().build();
    }
}

