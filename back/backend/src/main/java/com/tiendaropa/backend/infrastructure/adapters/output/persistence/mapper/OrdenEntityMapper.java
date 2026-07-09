package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.OrdenEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.OrdenItemEntity;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring", uses = OrdenItemEntityMapper.class)
public interface OrdenEntityMapper {

    Orden toDomain(OrdenEntity entity);

    OrdenEntity toEntity(Orden domain);

    @AfterMapping
    default void attachParent(@MappingTarget OrdenEntity entity) {
        if (entity.getItems() == null) {
            return;
        }
        for (OrdenItemEntity item : entity.getItems()) {
            item.setOrden(entity);
        }
    }
}
