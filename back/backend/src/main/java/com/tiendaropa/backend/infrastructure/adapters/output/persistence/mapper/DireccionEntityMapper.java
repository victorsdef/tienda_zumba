package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Direccion;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.DireccionEntity;

public final class DireccionEntityMapper {
    private DireccionEntityMapper() {
    }

    public static Direccion toDomain(DireccionEntity entity) {
        if (entity == null) return null;
        Direccion domain = new Direccion();
        domain.setId(entity.getId());
        domain.setNombreCompleto(entity.getNombreCompleto());
        domain.setCelular(entity.getCelular());
        domain.setCedula(entity.getCedula());
        domain.setProvincia(entity.getProvincia());
        domain.setCanton(entity.getCanton());
        domain.setCiudad(entity.getCiudad());
        domain.setDireccion(entity.getDireccion());
        domain.setPredeterminada(entity.isPredeterminada());
        domain.setUsuario(UsuarioEntityMapper.toDomain(entity.getUsuario()));
        return domain;
    }

    public static DireccionEntity toEntity(Direccion domain) {
        if (domain == null) return null;
        DireccionEntity entity = new DireccionEntity();
        entity.setId(domain.getId());
        entity.setNombreCompleto(domain.getNombreCompleto());
        entity.setCelular(domain.getCelular());
        entity.setCedula(domain.getCedula());
        entity.setProvincia(domain.getProvincia());
        entity.setCanton(domain.getCanton());
        entity.setCiudad(domain.getCiudad());
        entity.setDireccion(domain.getDireccion());
        entity.setPredeterminada(domain.isPredeterminada());
        return entity;
    }
}
