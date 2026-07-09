package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ProductoEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = CategoriaEntityMapper.class)
public interface ProductoEntityMapper {

    Producto toDomain(ProductoEntity entity);

    @Mapping(target = "categoria", ignore = true)
    ProductoEntity toEntity(Producto domain);
}
