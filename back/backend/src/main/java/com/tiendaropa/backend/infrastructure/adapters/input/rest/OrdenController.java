package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.CrearOrdenRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.OrdenDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.OrdenRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/orden", "/api/orden", "/api/ordenes"})
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenUseCase ordenUseCase;
    private final OrdenRestMapper ordenRestMapper;

    @PostMapping
    public ResponseEntity<OrdenDTO> crear(@RequestBody CrearOrdenRequest orden) {
        Orden creado = ordenUseCase.crearOrden(ordenRestMapper.toDomain(orden));
        return ResponseEntity.ok(ordenRestMapper.toDto(creado));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenDTO> obtener(@PathVariable Long id) {
        return ordenUseCase.obtenerPorId(id).map(ordenRestMapper::toDto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<OrdenDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(ordenRestMapper.toDtoList(ordenUseCase.listarPorUsuarioId(usuarioId)));
    }

    @PutMapping
    public ResponseEntity<OrdenDTO> actualizar(@RequestBody Orden orden) {
        return ResponseEntity.ok(ordenRestMapper.toDto(ordenUseCase.actualizar(orden)));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Void> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        ordenUseCase.actualizarEstado(id, estado);
        return ResponseEntity.ok().build();
    }
}

