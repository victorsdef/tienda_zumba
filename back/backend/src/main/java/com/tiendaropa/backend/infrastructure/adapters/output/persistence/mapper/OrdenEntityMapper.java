package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.domain.model.OrdenItem;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.OrdenEntity;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.OrdenItemEntity;

import java.util.ArrayList;
import java.util.List;

public final class OrdenEntityMapper {
    private OrdenEntityMapper() {
    }

    public static Orden toDomain(OrdenEntity entity) {
        if (entity == null) return null;
        Orden domain = new Orden();
        domain.setId(entity.getId());
        domain.setCodigoOrden(entity.getCodigoOrden());
        domain.setUsuarioId(entity.getUsuarioId());
        domain.setNombreInvitado(entity.getNombreInvitado());
        domain.setEmailInvitado(entity.getEmailInvitado());
        domain.setTotal(entity.getTotal());
        domain.setEstado(entity.getEstado());
        domain.setNombreEnvio(entity.getNombreEnvio());
        domain.setCelularEnvio(entity.getCelularEnvio());
        domain.setProvinciaEnvio(entity.getProvinciaEnvio());
        domain.setCantonEnvio(entity.getCantonEnvio());
        domain.setCiudadEnvio(entity.getCiudadEnvio());
        domain.setCalleEnvio(entity.getCalleEnvio());
        domain.setTipoEntrega(entity.getTipoEntrega());
        domain.setCostoEnvio(entity.getCostoEnvio());
        domain.setPayphoneTransactionId(entity.getPayphoneTransactionId());
        domain.setCodigoAutorizacion(entity.getCodigoAutorizacion());
        domain.setMarcaTarjeta(entity.getMarcaTarjeta());
        domain.setNumeroGuia(entity.getNumeroGuia());
        domain.setGuiaImagenUrl(entity.getGuiaImagenUrl());
        domain.setFechaCreacion(entity.getFechaCreacion());
        List<OrdenItem> items = new ArrayList<>();
        for (OrdenItemEntity itemEntity : entity.getItems()) {
            OrdenItem item = new OrdenItem();
            item.setId(itemEntity.getId());
            item.setProductoId(itemEntity.getProductoId());
            item.setNombreProducto(itemEntity.getNombreProducto());
            item.setCantidad(itemEntity.getCantidad());
            item.setPrecio(itemEntity.getPrecio());
            item.setTalla(itemEntity.getTalla());
            item.setColor(itemEntity.getColor());
            items.add(item);
        }
        domain.setItems(items);
        return domain;
    }

    public static OrdenEntity toEntity(Orden domain) {
        if (domain == null) return null;
        OrdenEntity entity = new OrdenEntity();
        entity.setId(domain.getId());
        entity.setCodigoOrden(domain.getCodigoOrden());
        entity.setUsuarioId(domain.getUsuarioId());
        entity.setNombreInvitado(domain.getNombreInvitado());
        entity.setEmailInvitado(domain.getEmailInvitado());
        entity.setTotal(domain.getTotal());
        entity.setEstado(domain.getEstado());
        entity.setNombreEnvio(domain.getNombreEnvio());
        entity.setCelularEnvio(domain.getCelularEnvio());
        entity.setProvinciaEnvio(domain.getProvinciaEnvio());
        entity.setCantonEnvio(domain.getCantonEnvio());
        entity.setCiudadEnvio(domain.getCiudadEnvio());
        entity.setCalleEnvio(domain.getCalleEnvio());
        entity.setTipoEntrega(domain.getTipoEntrega());
        entity.setCostoEnvio(domain.getCostoEnvio());
        entity.setPayphoneTransactionId(domain.getPayphoneTransactionId());
        entity.setCodigoAutorizacion(domain.getCodigoAutorizacion());
        entity.setMarcaTarjeta(domain.getMarcaTarjeta());
        entity.setNumeroGuia(domain.getNumeroGuia());
        entity.setGuiaImagenUrl(domain.getGuiaImagenUrl());
        entity.setFechaCreacion(domain.getFechaCreacion());
        List<OrdenItemEntity> itemEntities = new ArrayList<>();
        for (OrdenItem item : domain.getItems()) {
            OrdenItemEntity itemEntity = new OrdenItemEntity();
            itemEntity.setId(item.getId());
            itemEntity.setOrden(entity);
            itemEntity.setProductoId(item.getProductoId());
            itemEntity.setNombreProducto(item.getNombreProducto());
            itemEntity.setCantidad(item.getCantidad());
            itemEntity.setPrecio(item.getPrecio());
            itemEntity.setTalla(item.getTalla());
            itemEntity.setColor(item.getColor());
            itemEntities.add(itemEntity);
        }
        entity.setItems(itemEntities);
        return entity;
    }
}
