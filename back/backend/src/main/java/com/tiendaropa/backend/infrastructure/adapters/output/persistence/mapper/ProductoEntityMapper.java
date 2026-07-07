package com.tiendaropa.backend.infrastructure.adapters.output.persistence.mapper;

import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.entity.ProductoEntity;

import java.util.ArrayList;
import java.util.LinkedHashMap;

public final class ProductoEntityMapper {
    private ProductoEntityMapper() {
    }

    public static Producto toDomain(ProductoEntity entity) {
        if (entity == null) return null;
        Producto domain = new Producto();
        domain.setId(entity.getId());
        domain.setNombre(entity.getNombre());
        domain.setDescripcion(entity.getDescripcion());
        domain.setPrecio(entity.getPrecio());
        domain.setStock(entity.getStock());
        domain.setActivo(entity.isActivo());
        domain.setSku(entity.getSku());
        domain.setSlug(entity.getSlug());
        domain.setPrecioOriginal(entity.getPrecioOriginal());
        domain.setAplicaIva(entity.getAplicaIva());
        domain.setCategoria(CategoriaEntityMapper.toDomain(entity.getCategoria()));
        domain.setImagenes(new ArrayList<>(entity.getImagenes()));
        domain.setTallas(new ArrayList<>(entity.getTallas()));
        domain.setColores(new ArrayList<>(entity.getColores()));
        domain.setStockPorColor(new LinkedHashMap<>(entity.getStockPorColor()));
        domain.setStockPorColorTallaJson(entity.getStockPorColorTallaJson());
        domain.setCaracteristicaTitulo(entity.getCaracteristicaTitulo());
        domain.setCaracteristicaDescripcion(entity.getCaracteristicaDescripcion());
        return domain;
    }

    public static ProductoEntity toEntity(Producto domain) {
        if (domain == null) return null;
        ProductoEntity entity = new ProductoEntity();
        entity.setId(domain.getId());
        entity.setNombre(domain.getNombre());
        entity.setDescripcion(domain.getDescripcion());
        entity.setPrecio(domain.getPrecio());
        entity.setStock(domain.getStock());
        entity.setActivo(domain.isActivo());
        entity.setSku(domain.getSku());
        entity.setSlug(domain.getSlug());
        entity.setPrecioOriginal(domain.getPrecioOriginal());
        entity.setAplicaIva(domain.getAplicaIva());
        entity.setImagenes(new ArrayList<>(domain.getImagenes()));
        entity.setTallas(new ArrayList<>(domain.getTallas()));
        entity.setColores(new ArrayList<>(domain.getColores()));
        entity.setStockPorColor(new LinkedHashMap<>(domain.getStockPorColor()));
        entity.setStockPorColorTallaJson(domain.getStockPorColorTallaJson());
        entity.setCaracteristicaTitulo(domain.getCaracteristicaTitulo());
        entity.setCaracteristicaDescripcion(domain.getCaracteristicaDescripcion());
        return entity;
    }
}
