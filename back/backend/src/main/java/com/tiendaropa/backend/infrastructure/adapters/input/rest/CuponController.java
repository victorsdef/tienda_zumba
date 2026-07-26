package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CuponEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.CuponJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/cupones", "/api/cupones"})
@RequiredArgsConstructor
public class CuponController {

    private final CuponJpaRepository repo;

    // ── Admin CRUD ──────────────────────────────────────────────────

    @GetMapping("/admin")
    public List<CuponEntity> listar() {
        return repo.findAll();
    }

    @PostMapping("/admin")
    public ResponseEntity<CuponEntity> crear(@RequestBody CuponEntity cupon) {
        cupon.setId(null);
        cupon.setCodigo(cupon.getCodigo().toUpperCase().trim());
        return ResponseEntity.ok(repo.save(cupon));
    }

    @PutMapping("/admin/{id}")
    public ResponseEntity<CuponEntity> actualizar(@PathVariable Long id, @RequestBody CuponEntity body) {
        return repo.findById(id).map(c -> {
            c.setCodigo(body.getCodigo().toUpperCase().trim());
            c.setTipo(body.getTipo());
            c.setValor(body.getValor());
            c.setMontoMinimo(body.getMontoMinimo());
            c.setMaxUsos(body.getMaxUsos());
            c.setActivo(body.isActivo());
            c.setFechaExpiracion(body.getFechaExpiracion());
            return ResponseEntity.ok(repo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/admin/{id}/toggle")
    public ResponseEntity<CuponEntity> toggle(@PathVariable Long id) {
        return repo.findById(id).map(c -> {
            c.setActivo(!c.isActivo());
            return ResponseEntity.ok(repo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── Validación pública ──────────────────────────────────────────

    @GetMapping("/validar")
    public ResponseEntity<Map<String, Object>> validar(
            @RequestParam String codigo,
            @RequestParam(required = false, defaultValue = "0") BigDecimal subtotal) {

        return repo.findByCodigoIgnoreCase(codigo.trim())
            .map(c -> {
                if (!c.isActivo())
                    return ResponseEntity.badRequest().<Map<String, Object>>body(Map.of("error", "El cupón no está activo"));
                if (c.getFechaExpiracion() != null && c.getFechaExpiracion().isBefore(LocalDateTime.now()))
                    return ResponseEntity.badRequest().<Map<String, Object>>body(Map.of("error", "El cupón ha expirado"));
                if (c.getMaxUsos() != null && c.getUsos() >= c.getMaxUsos())
                    return ResponseEntity.badRequest().<Map<String, Object>>body(Map.of("error", "El cupón ha alcanzado su límite de usos"));
                if (c.getMontoMinimo() != null && subtotal.compareTo(c.getMontoMinimo()) < 0)
                    return ResponseEntity.badRequest().<Map<String, Object>>body(Map.of(
                        "error", "El pedido mínimo para este cupón es $" + c.getMontoMinimo().toPlainString()));

                BigDecimal descuento = "PORCENTAJE".equals(c.getTipo())
                    ? subtotal.multiply(c.getValor()).divide(BigDecimal.valueOf(100))
                    : c.getValor();
                if (descuento.compareTo(subtotal) > 0) descuento = subtotal;

                return ResponseEntity.ok(Map.of(
                    "id",       c.getId(),
                    "codigo",   c.getCodigo(),
                    "tipo",     c.getTipo(),
                    "valor",    c.getValor(),
                    "descuento", descuento.setScale(2, java.math.RoundingMode.HALF_UP)
                ));
            })
            .orElse(ResponseEntity.badRequest().body(Map.of("error", "Cupón no encontrado")));
    }

    // ── Aplicar uso (llamado internamente al crear orden) ───────────

    @PostMapping("/usar/{codigo}")
    public ResponseEntity<Void> registrarUso(@PathVariable String codigo) {
        repo.findByCodigoIgnoreCase(codigo).ifPresent(c -> {
            c.setUsos(c.getUsos() + 1);
            repo.save(c);
        });
        return ResponseEntity.ok().build();
    }
}
