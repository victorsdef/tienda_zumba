package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.CarritoUseCase;
import com.tiendaropa.backend.domain.model.Carrito;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/carritos", "/api/carritos", "/api/carrito"})
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoUseCase carritoUseCase;

    @GetMapping
    public List<Carrito> listar() {
        return carritoUseCase.listarTodos();
    }

    @GetMapping("/{id}")
    public Carrito obtener(@PathVariable Long id) {
        return carritoUseCase.obtenerPorId(id);
    }

    @PostMapping
    public Carrito crear(@RequestBody Carrito carrito) {
        return carritoUseCase.crear(carrito);
    }

    @PutMapping("/{id}")
    public Carrito actualizar(@PathVariable Long id, @RequestBody Carrito carrito) {
        return carritoUseCase.actualizar(id, carrito);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        carritoUseCase.eliminar(id);
    }
}
