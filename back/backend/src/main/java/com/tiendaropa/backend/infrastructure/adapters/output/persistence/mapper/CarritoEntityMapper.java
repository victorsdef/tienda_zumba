package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.domain.model.ItemCarrito;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.CarritoEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ItemCarritoEntity;

import java.util.ArrayList;
import java.util.List;

public final class CarritoEntityMapper {
    private CarritoEntityMapper() {
    }

    public static Carrito toDomain(CarritoEntity entity) {
        if (entity == null) return null;
        Carrito domain = new Carrito();
        domain.setId(entity.getId());
        domain.setUsuario(UsuarioEntityMapper.toDomain(entity.getUsuario()));
        List<ItemCarrito> items = new ArrayList<>();
        for (ItemCarritoEntity ignored : entity.getItems()) {
            items.add(new ItemCarrito());
        }
        domain.setItems(items);
        return domain;
    }

    public static CarritoEntity toEntity(Carrito domain) {
        if (domain == null) return null;
        CarritoEntity entity = new CarritoEntity();
        entity.setId(domain.getId());
        List<ItemCarritoEntity> items = new ArrayList<>();
        if (domain.getItems() != null) {
            for (ItemCarrito ignored : domain.getItems()) {
                ItemCarritoEntity itemEntity = new ItemCarritoEntity();
                itemEntity.setCarrito(entity);
                items.add(itemEntity);
            }
        }
        entity.setItems(items);
        return entity;
    }
}
