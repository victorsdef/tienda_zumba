package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.banner.BannerDTO;
import com.tiendaropa.backend.dto.banner.BannerRequest;
import com.tiendaropa.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // Público — para el Home
    @GetMapping
    public ResponseEntity<List<BannerDTO>> listarActivos() {
        return ResponseEntity.ok(bannerService.listarActivos());
    }

    // Admin
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BannerDTO>> listarTodos() {
        return ResponseEntity.ok(bannerService.listarTodos());
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> crear(@RequestBody BannerRequest req) {
        return ResponseEntity.ok(bannerService.crear(req));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> actualizar(@PathVariable Long id, @RequestBody BannerRequest req) {
        return ResponseEntity.ok(bannerService.actualizar(id, req));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        bannerService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(bannerService.toggleActivo(id));
    }
}
