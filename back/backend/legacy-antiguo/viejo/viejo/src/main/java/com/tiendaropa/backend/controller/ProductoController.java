package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.producto.ProductoDTO;
import com.tiendaropa.backend.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<Page<ProductoDTO>> listar(
        @RequestParam(required = false) Long categoriaId,
        @RequestParam(required = false) BigDecimal precioMin,
        @RequestParam(required = false) BigDecimal precioMax,
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String talla,
        @RequestParam(required = false) String color,
        @RequestParam(required = false) String genero,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        if (categoriaId != null || precioMin != null || precioMax != null
            || nombre != null || talla != null || color != null || genero != null) {
            return ResponseEntity.ok(productoService.filtrar(categoriaId, precioMin, precioMax, nombre, talla, color, genero, pageable));
        }
        return ResponseEntity.ok(productoService.listar(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtener(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ProductoDTO> obtenerPorSlug(@PathVariable String slug) {
        return ResponseEntity.ok(productoService.obtenerPorSlug(slug));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<ProductoDTO>> trending(
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(productoService.trending(limit));
    }
}
