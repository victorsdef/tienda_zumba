package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.CategoriaUseCase;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.categoria.CategoriaDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.categoria.CategoriaRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.CategoriaRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaUseCase categoriaUseCase;
    private final CategoriaRestMapper categoriaRestMapper;

    /** Endpoint público — solo categorías activas, siempre */
    @GetMapping({"/api/categorias", "/api/nueva-arquitectura/categorias"})
    public List<CategoriaDTO> listar() {
        return categoriaRestMapper.toDtoList(categoriaUseCase.listarTodas())
            .stream().filter(CategoriaDTO::isActivo).toList();
    }

    /** Endpoint admin — todas las categorías */
    @GetMapping({"/api/admin/categorias", "/api/nueva-arquitectura/admin/categorias"})
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR','BODEGUERO')")
    public List<CategoriaDTO> listarAdmin() {
        return categoriaRestMapper.toDtoList(categoriaUseCase.listarTodas());
    }

    @GetMapping("/{id}")
    public CategoriaDTO obtener(@PathVariable Long id) {
        return categoriaRestMapper.toDto(categoriaUseCase.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public CategoriaDTO crear(@RequestBody CategoriaRequest categoria) {
        return categoriaRestMapper.toDto(categoriaUseCase.crear(categoriaRestMapper.toDomain(categoria)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public CategoriaDTO actualizar(@PathVariable Long id, @RequestBody CategoriaRequest categoria) {
        return categoriaRestMapper.toDto(categoriaUseCase.actualizar(id, categoriaRestMapper.toDomain(categoria)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void eliminar(@PathVariable Long id) {
        categoriaUseCase.eliminar(id);
    }
}
