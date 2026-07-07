package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Configuracion;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ConfiguracionEntity;

public final class ConfiguracionEntityMapper {
    private ConfiguracionEntityMapper() {
    }

    public static Configuracion toDomain(ConfiguracionEntity entity) {
        if (entity == null) return null;
        Configuracion domain = new Configuracion();
        domain.setClave(entity.getClave());
        domain.setValor(entity.getValor());
        domain.setDescripcion(entity.getDescripcion());
        return domain;
    }

    public static ConfiguracionEntity toEntity(Configuracion domain) {
        if (domain == null) return null;
        ConfiguracionEntity entity = new ConfiguracionEntity();
        entity.setClave(domain.getClave());
        entity.setValor(domain.getValor());
        entity.setDescripcion(domain.getDescripcion());
        return entity;
    }
}
