package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.orden.CrearOrdenRequest;
import com.tiendaropa.backend.dto.orden.OrdenDTO;
import com.tiendaropa.backend.dto.orden.OrdenInvitadoRequest;
import com.tiendaropa.backend.entity.Usuario;
import com.tiendaropa.backend.service.OrdenPdfService;
import com.tiendaropa.backend.service.OrdenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;
    private final OrdenPdfService ordenPdfService;

    @PostMapping("/invitado")
    public ResponseEntity<OrdenDTO> crearInvitado(@Valid @RequestBody OrdenInvitadoRequest req) {
        return ResponseEntity.ok(ordenService.crearInvitado(req));
    }

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
        boolean esAdmin = usuario.getRol().name().equals("ADMIN");
        boolean esPropia = orden.getUsuarioId() != null && orden.getUsuarioId().equals(usuario.getId());
        if (!esAdmin && !esPropia) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(orden);
    }

    @GetMapping("/codigo/{codigoOrden}")
    public ResponseEntity<OrdenDTO> obtenerPorCodigo(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable String codigoOrden
    ) {
        OrdenDTO orden = ordenService.obtenerPorCodigo(codigoOrden.trim().toUpperCase());
        boolean esAdmin = usuario.getRol().name().equals("ADMIN");
        boolean esPropia = orden.getUsuarioId() != null && orden.getUsuarioId().equals(usuario.getId());
        if (!esAdmin && !esPropia) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(orden);
    }

    @GetMapping("/codigo/{codigoOrden}/pdf")
    public ResponseEntity<byte[]> descargarPdfPedido(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable String codigoOrden
    ) {
        OrdenDTO orden = ordenService.obtenerPorCodigo(codigoOrden.trim().toUpperCase());
        boolean esAdmin = usuario.getRol().name().equals("ADMIN");
        boolean esPropia = orden.getUsuarioId() != null && orden.getUsuarioId().equals(usuario.getId());
        if (!esAdmin && !esPropia) return ResponseEntity.status(403).build();

        byte[] archivo = ordenPdfService.generarPdfPedido(orden);
        String nombre = (orden.getCodigoOrden() != null && !orden.getCodigoOrden().isBlank())
            ? orden.getCodigoOrden().trim()
            : "pedido-" + orden.getId();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(archivo);
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<OrdenDTO> cancelar(
        @AuthenticationPrincipal Usuario usuario,
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(ordenService.cancelarPorUsuario(id, usuario.getId()));
    }
}
