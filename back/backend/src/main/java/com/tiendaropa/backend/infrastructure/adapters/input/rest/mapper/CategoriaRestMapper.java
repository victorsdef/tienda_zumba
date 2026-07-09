package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.categoria.CategoriaDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.categoria.CategoriaRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoriaRestMapper {

    CategoriaDTO toDto(Categoria categoria);

    List<CategoriaDTO> toDtoList(List<Categoria> categorias);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "activo", ignore = true)
    Categoria toDomain(CategoriaRequest request);
}
