package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Banner;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.BannerEntity;

public final class BannerEntityMapper {
    private BannerEntityMapper() {
    }

    public static Banner toDomain(BannerEntity entity) {
        if (entity == null) return null;
        Banner domain = new Banner();
        domain.setId(entity.getId());
        domain.setTitulo(entity.getTitulo());
        domain.setImagenUrl(entity.getImagenUrl());
        domain.setEnlace(entity.getEnlace());
        domain.setOrden(entity.getOrden());
        domain.setActivo(entity.isActivo());
        domain.setFechaInicio(entity.getFechaInicio());
        domain.setFechaFin(entity.getFechaFin());
        return domain;
    }

    public static BannerEntity toEntity(Banner domain) {
        if (domain == null) return null;
        BannerEntity entity = new BannerEntity();
        entity.setId(domain.getId());
        entity.setTitulo(domain.getTitulo());
        entity.setImagenUrl(domain.getImagenUrl());
        entity.setEnlace(domain.getEnlace());
        entity.setOrden(domain.getOrden());
        entity.setActivo(domain.isActivo());
        entity.setFechaInicio(domain.getFechaInicio());
        entity.setFechaFin(domain.getFechaFin());
        return entity;
    }
}
