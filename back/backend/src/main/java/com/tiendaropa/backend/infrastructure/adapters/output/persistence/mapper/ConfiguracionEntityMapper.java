package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Configuracion;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ConfiguracionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ConfiguracionEntityMapper {

    Configuracion toDomain(ConfiguracionEntity entity);

    ConfiguracionEntity toEntity(Configuracion domain);
}
