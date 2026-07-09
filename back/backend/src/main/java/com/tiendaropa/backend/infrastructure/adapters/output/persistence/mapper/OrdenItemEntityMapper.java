package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.OrdenItem;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.OrdenItemEntity;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface OrdenItemEntityMapper {

    @Mapping(target = "precioUnitario", source = "precio")
    @Mapping(target = "subtotal", ignore = true)
    OrdenItem toDomain(OrdenItemEntity entity);

    @Mapping(target = "orden", ignore = true)
    @Mapping(target = "precio", expression = "java(domain.getPrecioUnitario() != null ? domain.getPrecioUnitario() : domain.getPrecio())")
    OrdenItemEntity toEntity(OrdenItem domain);

    @AfterMapping
    default void calculateSubtotal(OrdenItemEntity entity, @MappingTarget OrdenItem domain) {
        if (entity.getPrecio() == null || entity.getCantidad() == null) {
            domain.setSubtotal(null);
            return;
        }
        domain.setSubtotal(entity.getPrecio().multiply(BigDecimal.valueOf(entity.getCantidad().longValue())));
    }
}
