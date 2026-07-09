package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CarritoEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ItemCarritoEntity;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = {UsuarioEntityMapper.class, ItemCarritoEntityMapper.class})
public interface CarritoEntityMapper {

    Carrito toDomain(CarritoEntity entity);

    @Mapping(target = "usuario", ignore = true)
    CarritoEntity toEntity(Carrito domain);

    @AfterMapping
    default void attachParent(@MappingTarget CarritoEntity entity) {
        if (entity.getItems() == null) {
            return;
        }
        for (ItemCarritoEntity item : entity.getItems()) {
            item.setCarrito(entity);
        }
    }
}
