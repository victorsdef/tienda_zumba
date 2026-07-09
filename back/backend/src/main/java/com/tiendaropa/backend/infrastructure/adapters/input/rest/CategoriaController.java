package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.CategoriaUseCase;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.categoria.CategoriaDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.categoria.CategoriaRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.CategoriaRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/nueva-arquitectura/categorias", "/api/categorias"})
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaUseCase categoriaUseCase;
    private final CategoriaRestMapper categoriaRestMapper;

    @GetMapping
    public List<CategoriaDTO> listar() {
        return categoriaRestMapper.toDtoList(categoriaUseCase.listarTodas());
    }

    @GetMapping("/{id}")
    public CategoriaDTO obtener(@PathVariable Long id) {
        return categoriaRestMapper.toDto(categoriaUseCase.obtenerPorId(id));
    }

    @PostMapping
    public CategoriaDTO crear(@RequestBody CategoriaRequest categoria) {
        return categoriaRestMapper.toDto(categoriaUseCase.crear(categoriaRestMapper.toDomain(categoria)));
    }

    @PutMapping("/{id}")
    public CategoriaDTO actualizar(@PathVariable Long id, @RequestBody CategoriaRequest categoria) {
        return categoriaRestMapper.toDto(categoriaUseCase.actualizar(id, categoriaRestMapper.toDomain(categoria)));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        categoriaUseCase.eliminar(id);
    }
}
