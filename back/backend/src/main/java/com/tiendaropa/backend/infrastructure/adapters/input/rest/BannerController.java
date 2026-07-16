package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.BannerUseCase;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.BannerRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/banner", "/api/nueva-arquitectura/banners", "/api/banner", "/api/banners"})
@RequiredArgsConstructor
public class BannerController {

    private final BannerUseCase bannerUseCase;
    private final BannerRestMapper bannerRestMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> crear(@RequestBody BannerRequest banner) {
        return ResponseEntity.ok(bannerRestMapper.toDto(bannerUseCase.crear(bannerRestMapper.toDomain(banner))));
    }

    @GetMapping
    public ResponseEntity<List<BannerDTO>> listarPublicos() {
        return ResponseEntity.ok(bannerRestMapper.toDtoList(bannerUseCase.listarActivos()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> obtener(@PathVariable Long id) {
        return bannerUseCase.obtener(id).map(bannerRestMapper::toDto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<BannerDTO>> activos() {
        return ResponseEntity.ok(bannerRestMapper.toDtoList(bannerUseCase.listarActivos()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> actualizar(@RequestBody BannerRequest banner) {
        return ResponseEntity.ok(bannerRestMapper.toDto(bannerUseCase.actualizar(bannerRestMapper.toDomain(banner))));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        bannerUseCase.eliminar(id);
        return ResponseEntity.ok().build();
    }

    // ── Endpoints /admin usados por el panel de administración ──────────

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<List<BannerDTO>> listarAdmin() {
        return ResponseEntity.ok(bannerRestMapper.toDtoList(bannerUseCase.listarTodos()));
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> crearAdmin(@RequestBody BannerRequest banner) {
        return ResponseEntity.ok(bannerRestMapper.toDto(bannerUseCase.crear(bannerRestMapper.toDomain(banner))));
    }

    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> actualizarAdmin(@PathVariable Long id, @RequestBody BannerRequest banner) {
        com.tiendaropa.backend.domain.model.Banner domain = bannerRestMapper.toDomain(banner);
        domain.setId(id);
        return ResponseEntity.ok(bannerRestMapper.toDto(bannerUseCase.actualizar(domain)));
    }

    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarAdmin(@PathVariable Long id) {
        bannerUseCase.eliminar(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/admin/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BannerDTO> toggleAdmin(@PathVariable Long id) {
        return bannerUseCase.obtener(id).map(b -> {
            b.setActivo(!b.isActivo());
            return ResponseEntity.ok(bannerRestMapper.toDto(bannerUseCase.actualizar(b)));
        }).orElse(ResponseEntity.notFound().build());
    }
}
