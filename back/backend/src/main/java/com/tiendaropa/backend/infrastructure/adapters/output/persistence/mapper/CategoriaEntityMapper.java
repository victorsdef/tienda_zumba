package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CategoriaEntity;

import java.util.ArrayList;

public final class CategoriaEntityMapper {
    private CategoriaEntityMapper() {
    }

    public static Categoria toDomain(CategoriaEntity entity) {
        if (entity == null) return null;
        Categoria domain = new Categoria();
        domain.setId(entity.getId());
        domain.setNombre(entity.getNombre());
        domain.setDescripcion(entity.getDescripcion());
        domain.setImagen(entity.getImagen());
        domain.setGenero(entity.getGenero());
        domain.setTallasDisponibles(new ArrayList<>(entity.getTallasDisponibles()));
        domain.setActivo(entity.isActivo());
        return domain;
    }

    public static CategoriaEntity toEntity(Categoria domain) {
        if (domain == null) return null;
        CategoriaEntity entity = new CategoriaEntity();
        entity.setId(domain.getId());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setImagen(domain.getImagen());
        entity.setGenero(domain.getGenero());
        entity.setTallasDisponibles(new ArrayList<>(domain.getTallasDisponibles()));
        entity.setActivo(domain.isActivo());
        return entity;
    }
}
