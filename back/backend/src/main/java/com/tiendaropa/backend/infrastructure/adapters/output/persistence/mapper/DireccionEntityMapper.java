package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Direccion;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.DireccionEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = UsuarioEntityMapper.class)
public interface DireccionEntityMapper {

    Direccion toDomain(DireccionEntity entity);

    @Mapping(target = "usuario", ignore = true)
    DireccionEntity toEntity(Direccion domain);
}
