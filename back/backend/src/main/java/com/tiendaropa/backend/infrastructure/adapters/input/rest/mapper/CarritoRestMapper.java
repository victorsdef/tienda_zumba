package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.domain.model.ItemCarrito;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito.CarritoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito.ItemCarritoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface CarritoRestMapper {

    @Mapping(target = "total", source = "items", qualifiedByName = "calculateTotal")
    @Mapping(target = "cantidadItems", source = "items", qualifiedByName = "calculateItems")
    CarritoDTO toDto(Carrito carrito);

    List<CarritoDTO> toDtoList(List<Carrito> carritos);

    @Mapping(target = "productoId", source = "producto.id")
    @Mapping(target = "productoNombre", source = "producto.nombre")
    @Mapping(target = "productoImagen", expression = "java(resolverImagen(item))")
    ItemCarritoDTO toItemDto(ItemCarrito item);

    @Named("calculateTotal")
    default BigDecimal calculateTotal(List<ItemCarrito> items) {
        if (items == null || items.isEmpty()) return BigDecimal.ZERO;
        return items.stream()
            .map(item -> item.getSubtotal() != null ? item.getSubtotal() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Named("calculateItems")
    default Integer calculateItems(List<ItemCarrito> items) {
        if (items == null || items.isEmpty()) return 0;
        return items.stream()
            .map(item -> item.getCantidad() != null ? item.getCantidad() : 0)
            .reduce(0, Integer::sum);
    }

    default String resolverImagen(ItemCarrito item) {
        if (item.getProducto() == null) return null;
        // Si hay imagen por color, usarla
        String color = item.getColor();
        String imagenesPorColorJson = item.getProducto().getImagenesPorColorJson();
        if (color != null && imagenesPorColorJson != null && !imagenesPorColorJson.isBlank()) {
            try {
                Map<String, List<String>> mapa = new ObjectMapper().readValue(
                    imagenesPorColorJson, new TypeReference<Map<String, List<String>>>() {});
                List<String> imgs = mapa.get(color);
                if (imgs != null && !imgs.isEmpty()) return imgs.get(0);
            } catch (Exception ignored) {}
        }
        // Fallback: primera imagen del producto
        List<String> imagenes = item.getProducto().getImagenes();
        return imagenes != null && !imagenes.isEmpty() ? imagenes.get(0) : null;
    }
}
