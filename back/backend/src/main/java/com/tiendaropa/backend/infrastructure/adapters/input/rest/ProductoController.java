package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.ProductoUseCase;
import com.tiendaropa.backend.domain.model.Producto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/nueva-arquitectura/productos", "/api/productos"})
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoUseCase productoUseCase;

    @GetMapping
    public List<Producto> listar() {
        return productoUseCase.listarTodos();
    }

    @GetMapping("/trending")
    public List<Producto> trending(@RequestParam(defaultValue = "10") int limit) {
        return productoUseCase.listarTodos().stream()
            .filter(Producto::isActivo)
            .limit(Math.max(limit, 0))
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Producto obtener(@PathVariable Long id) {
        return productoUseCase.obtenerPorId(id);
    }

    @PostMapping
    public Producto crear(@RequestBody Producto producto) {
        return productoUseCase.crear(producto);
    }

    @PutMapping("/{id}")
    public Producto actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return productoUseCase.actualizar(id, producto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoUseCase.eliminar(id);
    }
}
