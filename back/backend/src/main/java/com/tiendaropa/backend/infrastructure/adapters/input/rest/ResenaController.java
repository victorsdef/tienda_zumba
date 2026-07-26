package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ResenaEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.ResenaJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/resenas", "/api/resenas"})
@RequiredArgsConstructor
public class ResenaController {

    private final ResenaJpaRepository repo;

    // ── Público: ver reseñas aprobadas de un producto ───────────────

    @GetMapping("/producto/{productoId}")
    public List<ResenaEntity> porProducto(@PathVariable Long productoId) {
        return repo.findByProductoIdAndAprobadaTrue(productoId);
    }

    // ── Crear reseña (usuario autenticado) ──────────────────────────

    @PostMapping
    public ResponseEntity<ResenaEntity> crear(@RequestBody ResenaEntity resena) {
        if (resena.getProductoId() == null || resena.getUsuarioId() == null)
            return ResponseEntity.badRequest().build();
        if (resena.getCalificacion() < 1 || resena.getCalificacion() > 5)
            return ResponseEntity.badRequest().build();
        // Solo una reseña por usuario por producto
        if (repo.findByProductoIdAndUsuarioId(resena.getProductoId(), resena.getUsuarioId()).isPresent())
            return ResponseEntity.status(409).build();
        resena.setId(null);
        resena.setAprobada(false);
        return ResponseEntity.ok(repo.save(resena));
    }

    // ── Admin: ver todas ────────────────────────────────────────────

    @GetMapping("/admin")
    public List<ResenaEntity> todas() {
        return repo.findAllByOrderByFechaCreacionDesc();
    }

    @GetMapping("/admin/pendientes")
    public List<ResenaEntity> pendientes() {
        return repo.findByAprobadaFalse();
    }

    @PatchMapping("/admin/{id}/aprobar")
    public ResponseEntity<ResenaEntity> aprobar(@PathVariable Long id) {
        return repo.findById(id).map(r -> {
            r.setAprobada(true);
            return ResponseEntity.ok(repo.save(r));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/stats/{productoId}")
    public ResponseEntity<Map<String, Object>> stats(@PathVariable Long productoId) {
        List<ResenaEntity> lista = repo.findByProductoIdAndAprobadaTrue(productoId);
        if (lista.isEmpty()) return ResponseEntity.ok(Map.of("total", 0, "promedio", 0.0));
        double promedio = lista.stream().mapToInt(ResenaEntity::getCalificacion).average().orElse(0);
        return ResponseEntity.ok(Map.of("total", lista.size(), "promedio", Math.round(promedio * 10.0) / 10.0));
    }
}
