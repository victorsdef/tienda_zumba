package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.UsuarioEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioEntityMapper {

    @Mapping(target = "direcciones", ignore = true)
    @Mapping(target = "carrito", ignore = true)
    Usuario toDomain(UsuarioEntity entity);

    @Mapping(target = "direcciones", ignore = true)
    @Mapping(target = "carrito", ignore = true)
    UsuarioEntity toEntity(Usuario domain);
}
