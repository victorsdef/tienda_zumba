package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Direccion;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.direccion.DireccionDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.direccion.DireccionRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface DireccionRestMapper {

    DireccionDTO toDto(Direccion direccion);

    List<DireccionDTO> toDtoList(List<Direccion> direcciones);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    Direccion toDomain(DireccionRequest request);
}
