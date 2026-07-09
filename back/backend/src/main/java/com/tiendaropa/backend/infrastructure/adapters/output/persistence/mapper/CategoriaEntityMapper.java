package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CategoriaEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoriaEntityMapper {

    Categoria toDomain(CategoriaEntity entity);

    CategoriaEntity toEntity(Categoria domain);
}
