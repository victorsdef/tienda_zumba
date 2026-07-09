package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.ProductoUseCase;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.ProductoRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/nueva-arquitectura/productos", "/api/productos"})
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoUseCase productoUseCase;
    private final ProductoRestMapper productoRestMapper;

    @GetMapping
    public List<ProductoDTO> listar() {
        return productoRestMapper.toDtoList(productoUseCase.listarTodos());
    }

    @GetMapping("/trending")
    public List<ProductoDTO> trending(@RequestParam(defaultValue = "10") int limit) {
        return productoUseCase.listarTodos().stream()
            .filter(Producto::isActivo)
            .limit(Math.max(limit, 0))
            .map(productoRestMapper::toDto)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ProductoDTO obtener(@PathVariable Long id) {
        return productoRestMapper.toDto(productoUseCase.obtenerPorId(id));
    }

    @PostMapping
    public ProductoDTO crear(@RequestBody ProductoRequest producto) {
        return productoRestMapper.toDto(productoUseCase.crear(productoRestMapper.toDomain(producto)));
    }

    @PutMapping("/{id}")
    public ProductoDTO actualizar(@PathVariable Long id, @RequestBody ProductoRequest producto) {
        return productoRestMapper.toDto(productoUseCase.actualizar(id, productoRestMapper.toDomain(producto)));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        productoUseCase.eliminar(id);
    }
}
