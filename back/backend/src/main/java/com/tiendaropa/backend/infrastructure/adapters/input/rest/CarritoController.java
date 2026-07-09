package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.CarritoUseCase;
import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito.CarritoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.CarritoRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/carritos", "/api/carritos", "/api/carrito"})
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoUseCase carritoUseCase;
    private final CarritoRestMapper carritoRestMapper;

    @GetMapping
    public List<CarritoDTO> listar() {
        return carritoRestMapper.toDtoList(carritoUseCase.listarTodos());
    }

    @GetMapping("/{id}")
    public CarritoDTO obtener(@PathVariable Long id) {
        return carritoRestMapper.toDto(carritoUseCase.obtenerPorId(id));
    }

    @PostMapping
    public CarritoDTO crear(@RequestBody Carrito carrito) {
        return carritoRestMapper.toDto(carritoUseCase.crear(carrito));
    }

    @PutMapping("/{id}")
    public CarritoDTO actualizar(@PathVariable Long id, @RequestBody Carrito carrito) {
        return carritoRestMapper.toDto(carritoUseCase.actualizar(id, carrito));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        carritoUseCase.eliminar(id);
    }
}
