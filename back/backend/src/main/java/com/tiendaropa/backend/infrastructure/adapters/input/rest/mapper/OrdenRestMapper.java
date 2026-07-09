package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.domain.model.OrdenItem;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.CrearOrdenRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.ItemOrdenDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.OrdenDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrdenRestMapper {

    @Mapping(target = "usuarioNombre", source = "nombreInvitado")
    OrdenDTO toDto(Orden orden);

    List<OrdenDTO> toDtoList(List<Orden> ordenes);

    @Mapping(target = "precio", source = "precioUnitario")
    ItemOrdenDTO toItemDto(OrdenItem item);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "codigoOrden", ignore = true)
    @Mapping(target = "usuarioId", ignore = true)
    @Mapping(target = "nombreInvitado", ignore = true)
    @Mapping(target = "emailInvitado", ignore = true)
    @Mapping(target = "items", ignore = true)
    @Mapping(target = "total", ignore = true)
    @Mapping(target = "estado", ignore = true)
    @Mapping(target = "costoEnvio", ignore = true)
    @Mapping(target = "payphoneTransactionId", ignore = true)
    @Mapping(target = "codigoAutorizacion", ignore = true)
    @Mapping(target = "marcaTarjeta", ignore = true)
    @Mapping(target = "numeroGuia", ignore = true)
    @Mapping(target = "guiaImagenUrl", ignore = true)
    @Mapping(target = "fechaCreacion", ignore = true)
    Orden toDomain(CrearOrdenRequest request);
}
