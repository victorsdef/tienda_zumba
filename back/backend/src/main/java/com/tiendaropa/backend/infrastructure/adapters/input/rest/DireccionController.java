package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.DireccionUseCase;
import com.tiendaropa.backend.domain.model.Direccion;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/direcciones", "/api/direcciones"})
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionUseCase direccionUseCase;

    @GetMapping
    public List<Direccion> listar() { return direccionUseCase.listarTodas(); }

    @GetMapping("/{id}")
    public Direccion obtener(@PathVariable Long id) { return direccionUseCase.obtenerPorId(id); }

    @PostMapping
    public Direccion crear(@RequestBody Direccion direccion) { return direccionUseCase.crear(direccion); }

    @PutMapping("/{id}")
    public Direccion actualizar(@PathVariable Long id, @RequestBody Direccion direccion) { return direccionUseCase.actualizar(id, direccion); }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) { direccionUseCase.eliminar(id); }
}
