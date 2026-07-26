package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CuponEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.CuponJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
//hola
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

        Optional<CuponEntity> opt = repo.findByCodigoIgnoreCase(codigo.trim());
        if (opt.isEmpty()) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Cupón no encontrado");
            return ResponseEntity.badRequest().body(err);
        }
        CuponEntity c = opt.get();
        if (!c.isActivo()) {
            Map<String, Object> err = new HashMap<>(); err.put("error", "El cupón no está activo");
            return ResponseEntity.badRequest().body(err);
        }
        if (c.getFechaExpiracion() != null && c.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            Map<String, Object> err = new HashMap<>(); err.put("error", "El cupón ha expirado");
            return ResponseEntity.badRequest().body(err);
        }
        if (c.getMaxUsos() != null && c.getUsos() >= c.getMaxUsos()) {
            Map<String, Object> err = new HashMap<>(); err.put("error", "El cupón ha alcanzado su límite de usos");
            return ResponseEntity.badRequest().body(err);
        }
        if (c.getMontoMinimo() != null && subtotal.compareTo(c.getMontoMinimo()) < 0) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "El pedido mínimo para este cupón es $" + c.getMontoMinimo().toPlainString());
            return ResponseEntity.badRequest().body(err);
        }
        BigDecimal descuento = "PORCENTAJE".equals(c.getTipo())
            ? subtotal.multiply(c.getValor()).divide(BigDecimal.valueOf(100))
            : c.getValor();
        if (descuento.compareTo(subtotal) > 0) descuento = subtotal;

        Map<String, Object> body = new HashMap<>();
        body.put("id", c.getId());
        body.put("codigo", c.getCodigo());
        body.put("tipo", c.getTipo());
        body.put("valor", c.getValor());
        body.put("descuento", descuento.setScale(2, java.math.RoundingMode.HALF_UP));
        return ResponseEntity.ok(body);
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
