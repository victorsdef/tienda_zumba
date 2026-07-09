package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductoRestMapper {

    @Mapping(target = "categoriaId", source = "categoria.id")
    @Mapping(target = "categoriaNombre", source = "categoria.nombre")
    @Mapping(target = "stockPorColorTalla", ignore = true)
    ProductoDTO toDto(Producto producto);

    List<ProductoDTO> toDtoList(List<Producto> productos);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sku", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "categoria", source = "categoriaId", qualifiedByName = "categoriaFromId")
    @Mapping(target = "stockPorColorTallaJson", ignore = true)
    Producto toDomain(ProductoRequest request);

    @Named("categoriaFromId")
    default Categoria categoriaFromId(Long categoriaId) {
        if (categoriaId == null) {
            return null;
        }
        Categoria categoria = new Categoria();
        categoria.setId(categoriaId);
        return categoria;
    }
}
