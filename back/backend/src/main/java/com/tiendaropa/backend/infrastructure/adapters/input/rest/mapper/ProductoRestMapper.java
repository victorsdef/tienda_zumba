package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoRequest;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
public abstract class ProductoRestMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mapping(target = "categoriaId", source = "categoria.id")
    @Mapping(target = "categoriaNombre", source = "categoria.nombre")
    @Mapping(target = "stockPorColorTalla", ignore = true)
    @Mapping(target = "imagenesPorColor", ignore = true)
    @Mapping(target = "precioPorColorTalla", ignore = true)
    public abstract ProductoDTO toDto(Producto producto);

    public abstract List<ProductoDTO> toDtoList(List<Producto> productos);

    @AfterMapping
    protected void parseJsonFields(Producto producto, @MappingTarget ProductoDTO dto) {
        if (producto.getImagenesPorColorJson() != null && !producto.getImagenesPorColorJson().isBlank()) {
            try {
                dto.setImagenesPorColor(objectMapper.readValue(
                    producto.getImagenesPorColorJson(),
                    new TypeReference<Map<String, List<String>>>() {}
                ));
            } catch (Exception ignored) {}
        }
        if (producto.getStockPorColorTallaJson() != null && !producto.getStockPorColorTallaJson().isBlank()) {
            try {
                dto.setStockPorColorTalla(objectMapper.readValue(
                    producto.getStockPorColorTallaJson(),
                    new TypeReference<Map<String, Map<String, Integer>>>() {}
                ));
            } catch (Exception ignored) {}
        }
        if (producto.getPrecioPorColorTallaJson() != null && !producto.getPrecioPorColorTallaJson().isBlank()) {
            try {
                dto.setPrecioPorColorTalla(objectMapper.readValue(
                    producto.getPrecioPorColorTallaJson(),
                    new TypeReference<Map<String, Map<String, BigDecimal>>>() {}
                ));
            } catch (Exception ignored) {}
        }
    }

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sku", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "categoria", source = "categoriaId", qualifiedByName = "categoriaFromId")
    @Mapping(target = "stockPorColorTallaJson", ignore = true)
    @Mapping(target = "imagenesPorColorJson", ignore = true)
    public abstract Producto toDomain(ProductoRequest request);

    @Named("categoriaFromId")
    Categoria categoriaFromId(Long categoriaId) {
        if (categoriaId == null) {
            return null;
        }
        Categoria categoria = new Categoria();
        categoria.setId(categoriaId);
        return categoria;
    }
}
