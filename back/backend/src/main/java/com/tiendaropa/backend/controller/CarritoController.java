package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.carrito.*;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.service.CarritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public ResponseEntity<CarritoDTO> ver(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.obtener(usuario.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CarritoDTO> agregar(
        @AuthenticationPrincipal Usuario usuario,
        @Valid @RequestBody AgregarItemRequest req
    ) {
        return ResponseEntity.ok(carritoService.agregar(usuario.getId(), req));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CarritoDTO> actualizar(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable Long itemId,
        @Valid @RequestBody ActualizarItemRequest req
    ) {
        return ResponseEntity.ok(carritoService.actualizar(usuario.getId(), itemId, req));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CarritoDTO> eliminar(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(carritoService.eliminarItem(usuario.getId(), itemId));
    }
}
