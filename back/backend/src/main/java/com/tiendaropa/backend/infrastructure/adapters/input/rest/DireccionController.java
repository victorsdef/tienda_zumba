package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.DireccionUseCase;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.direccion.DireccionDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.direccion.DireccionRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.DireccionRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/direcciones", "/api/direcciones"})
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionUseCase direccionUseCase;
    private final DireccionRestMapper direccionRestMapper;

    @GetMapping
    public List<DireccionDTO> listar() { return direccionRestMapper.toDtoList(direccionUseCase.listarTodas()); }

    @GetMapping("/{id}")
    public DireccionDTO obtener(@PathVariable Long id) { return direccionRestMapper.toDto(direccionUseCase.obtenerPorId(id)); }

    @PostMapping
    public DireccionDTO crear(@RequestBody DireccionRequest direccion) { return direccionRestMapper.toDto(direccionUseCase.crear(direccionRestMapper.toDomain(direccion))); }

    @PutMapping("/{id}")
    public DireccionDTO actualizar(@PathVariable Long id, @RequestBody DireccionRequest direccion) { return direccionRestMapper.toDto(direccionUseCase.actualizar(id, direccionRestMapper.toDomain(direccion))); }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) { direccionUseCase.eliminar(id); }
}
