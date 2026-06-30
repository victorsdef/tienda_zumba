package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.categoria.CategoriaDTO;
import com.tiendaropa.backend.dto.categoria.CategoriaRequest;
import com.tiendaropa.backend.entity.Categoria;
import com.tiendaropa.backend.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public List<CategoriaDTO> listar() {
        return categoriaRepository.findAll().stream().map(this::toDTO).toList();
    }

    public CategoriaDTO obtener(Long id) {
        return toDTO(findOrThrow(id));
    }

    public CategoriaDTO crear(CategoriaRequest req) {
        if (categoriaRepository.existsByNombre(req.getNombre())) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }
        return toDTO(categoriaRepository.save(toEntity(req, new Categoria())));
    }

    public CategoriaDTO actualizar(Long id, CategoriaRequest req) {
        return toDTO(categoriaRepository.save(toEntity(req, findOrThrow(id))));
    }

    public void eliminar(Long id) {
        categoriaRepository.deleteById(id);
    }

    private Categoria findOrThrow(Long id) {
        return categoriaRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Categoría no encontrada: " + id));
    }

    private Categoria toEntity(CategoriaRequest req, Categoria c) {
        c.setNombre(req.getNombre());
        c.setDescripcion(req.getDescripcion());
        c.setImagen(req.getImagen());
        return c;
    }

    public CategoriaDTO toDTO(Categoria c) {
        CategoriaDTO dto = new CategoriaDTO();
        dto.setId(c.getId());
        dto.setNombre(c.getNombre());
        dto.setDescripcion(c.getDescripcion());
        dto.setImagen(c.getImagen());
        return dto;
    }
}
