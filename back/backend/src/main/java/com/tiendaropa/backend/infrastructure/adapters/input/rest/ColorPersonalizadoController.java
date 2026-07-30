package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ColorPersonalizadoEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.ColorPersonalizadoJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/admin/colores-personalizados", "/api/admin/colores-personalizados"})
@RequiredArgsConstructor
public class ColorPersonalizadoController {

    private final ColorPersonalizadoJpaRepository repo;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR','BODEGUERO')")
    public List<ColorPersonalizadoEntity> listar() {
        return repo.findAllByOrderByNombreAsc();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColorPersonalizadoEntity> crear(@RequestBody Map<String, String> body) {
        String nombre = body.getOrDefault("nombre", "").trim();
        String hex = body.getOrDefault("hex", "").trim();
        if (nombre.isBlank() || !hex.matches("^#[0-9a-fA-F]{6}$")) {
            return ResponseEntity.badRequest().build();
        }
        hex = hex.toUpperCase();

        // Si ya existe ese hex, actualiza el nombre
        var existente = repo.findByHexIgnoreCase(hex);
        ColorPersonalizadoEntity c = existente.orElseGet(ColorPersonalizadoEntity::new);
        c.setNombre(nombre);
        c.setHex(hex);
        if (c.getFechaCreacion() == null) c.setFechaCreacion(LocalDateTime.now());
        return ResponseEntity.ok(repo.save(c));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColorPersonalizadoEntity> actualizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return repo.findById(id).map(c -> {
            if (body.containsKey("nombre")) c.setNombre(body.get("nombre").trim());
            return ResponseEntity.ok(repo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
