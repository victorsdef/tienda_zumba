package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.orden.CrearOrdenRequest;
import com.tiendaropa.backend.dto.orden.OrdenDTO;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.service.OrdenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @PostMapping
    public ResponseEntity<OrdenDTO> crear(
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody CrearOrdenRequest req
    ) {
        return ResponseEntity.ok(ordenService.crear(usuario.getId(), req));
    }

    @GetMapping
    public ResponseEntity<Page<OrdenDTO>> misOrdenes(
        @AuthenticationPrincipal Usuario usuario,
        Pageable pageable
    ) {
        return ResponseEntity.ok(ordenService.misOrdenes(usuario.getId(), pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenDTO> obtener(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable Long id
    ) {
        OrdenDTO orden = ordenService.obtener(id);
        if (!orden.getUsuarioId().equals(usuario.getId())
            && !usuario.getRol().name().equals("ADMIN")) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(orden);
    }
}
