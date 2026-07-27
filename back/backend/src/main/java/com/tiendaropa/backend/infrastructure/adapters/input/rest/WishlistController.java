package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ProductoEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.WishlistItemEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.ProductoJpaRepository;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.WishlistJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/nueva-arquitectura/wishlist", "/api/wishlist"})
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistJpaRepository repo;
    private final ProductoJpaRepository productoRepo;

    @GetMapping("/{usuarioId}")
    public List<Map<String, Object>> listar(@PathVariable Long usuarioId) {
        return repo.findByUsuarioId(usuarioId).stream().map(item -> {
            Map<String, Object> result = new HashMap<>();
            result.put("id", item.getId());
            result.put("usuarioId", item.getUsuarioId());
            result.put("productoId", item.getProductoId());
            result.put("fechaAgregado", item.getFechaAgregado());
            productoRepo.findById(item.getProductoId()).ifPresent(p -> {
                Map<String, Object> prod = new HashMap<>();
                prod.put("id", p.getId());
                prod.put("nombre", p.getNombre());
                prod.put("precio", p.getPrecio());
                prod.put("precioOriginal", p.getPrecioOriginal());
                prod.put("slug", p.getSlug());
                prod.put("imagenes", p.getImagenes());
                prod.put("imagenesPorColorJson", p.getImagenesPorColorJson());
                prod.put("precioPorColorTallaJson", p.getPrecioPorColorTallaJson());
                result.put("producto", prod);
            });
            return result;
        }).collect(Collectors.toList());
    }

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Object>> toggle(
            @RequestParam Long usuarioId,
            @RequestParam Long productoId) {
        return repo.findByUsuarioIdAndProductoId(usuarioId, productoId)
            .map(item -> {
                repo.delete(item);
                Map<String, Object> body = new HashMap<>();
                body.put("agregado", false);
                return ResponseEntity.ok(body);
            })
            .orElseGet(() -> {
                WishlistItemEntity item = new WishlistItemEntity();
                item.setUsuarioId(usuarioId);
                item.setProductoId(productoId);
                repo.save(item);
                Map<String, Object> body = new HashMap<>();
                body.put("agregado", true);
                return ResponseEntity.ok(body);
            });
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> check(
            @RequestParam Long usuarioId,
            @RequestParam Long productoId) {
        boolean existe = repo.findByUsuarioIdAndProductoId(usuarioId, productoId).isPresent();
        Map<String, Object> body = new HashMap<>();
        body.put("enWishlist", existe);
        return ResponseEntity.ok(body);
    }
}
