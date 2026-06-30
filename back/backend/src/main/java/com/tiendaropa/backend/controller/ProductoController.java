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
        @PageableDefault(size = 20) Pageable pageable
    ) {
        if (categoriaId != null || precioMin != null || precioMax != null
            || nombre != null || talla != null || color != null) {
            return ResponseEntity.ok(productoService.filtrar(categoriaId, precioMin, precioMax, nombre, talla, color, pageable));
        }
        return ResponseEntity.ok(productoService.listar(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtener(id));
    }
}
