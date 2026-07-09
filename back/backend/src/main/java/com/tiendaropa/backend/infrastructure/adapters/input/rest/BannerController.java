package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.BannerUseCase;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.banner.BannerRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.BannerRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/banner", "/api/nueva-arquitectura/banners", "/api/banner", "/api/banners"})
@RequiredArgsConstructor
public class BannerController {

    private final BannerUseCase bannerUseCase;
    private final BannerRestMapper bannerRestMapper;

    @PostMapping
    public ResponseEntity<BannerDTO> crear(@RequestBody BannerRequest banner) {
        return ResponseEntity.ok(bannerRestMapper.toDto(bannerUseCase.crear(bannerRestMapper.toDomain(banner))));
    }

    @GetMapping
    public ResponseEntity<List<BannerDTO>> listarPublicos() {
        return ResponseEntity.ok(bannerRestMapper.toDtoList(bannerUseCase.listarActivos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BannerDTO> obtener(@PathVariable Long id) {
        return bannerUseCase.obtener(id).map(bannerRestMapper::toDto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<BannerDTO>> activos() {
        return ResponseEntity.ok(bannerRestMapper.toDtoList(bannerUseCase.listarActivos()));
    }

    @PutMapping
    public ResponseEntity<BannerDTO> actualizar(@RequestBody BannerRequest banner) {
        return ResponseEntity.ok(bannerRestMapper.toDto(bannerUseCase.actualizar(bannerRestMapper.toDomain(banner))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        bannerUseCase.eliminar(id);
        return ResponseEntity.ok().build();
    }
}
