package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.ItemCarrito;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ItemCarritoEntity;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;

@Mapper(componentModel = "spring", uses = ProductoEntityMapper.class)
public interface ItemCarritoEntityMapper {

    @Mapping(target = "subtotal", ignore = true)
    ItemCarrito toDomain(ItemCarritoEntity entity);

    @Mapping(target = "carrito", ignore = true)
    ItemCarritoEntity toEntity(ItemCarrito domain);

    @AfterMapping
    default void calculateSubtotal(ItemCarritoEntity entity, @MappingTarget ItemCarrito domain) {
        if (entity.getPrecio() == null || entity.getCantidad() == null) {
            domain.setSubtotal(null);
            return;
        }
        domain.setSubtotal(entity.getPrecio().multiply(BigDecimal.valueOf(entity.getCantidad().longValue())));
    }
}
