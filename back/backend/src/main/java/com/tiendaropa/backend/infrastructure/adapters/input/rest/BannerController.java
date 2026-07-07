package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.BannerUseCase;
import com.tiendaropa.backend.domain.model.Banner;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/banner", "/api/nueva-arquitectura/banners", "/api/banner", "/api/banners"})
@RequiredArgsConstructor
public class BannerController {

    private final BannerUseCase bannerUseCase;

    @PostMapping
    public ResponseEntity<Banner> crear(@RequestBody Banner banner) {
        return ResponseEntity.ok(bannerUseCase.crear(banner));
    }

    @GetMapping
    public ResponseEntity<List<Banner>> listarPublicos() {
        return ResponseEntity.ok(bannerUseCase.listarActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> obtener(@PathVariable Long id) {
        return bannerUseCase.obtener(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Banner>> activos() {
        return ResponseEntity.ok(bannerUseCase.listarActivos());
    }

    @PutMapping
    public ResponseEntity<Banner> actualizar(@RequestBody Banner banner) {
        return ResponseEntity.ok(bannerUseCase.actualizar(banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        bannerUseCase.eliminar(id);
        return ResponseEntity.ok().build();
    }
}
