package com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper;

import com.tiendaropa.backend.domain.model.Configuracion;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion.ConfiguracionDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion.RetiroInfoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface ConfiguracionRestMapper {

    ConfiguracionDTO toDto(Configuracion configuracion);

    List<ConfiguracionDTO> toDtoList(List<Configuracion> configuraciones);

    @Mapping(target = "retiro_direccion", expression = "java(getOrDefault(valores, \"retiro_direccion\"))")
    @Mapping(target = "retiro_horario", expression = "java(getOrDefault(valores, \"retiro_horario\"))")
    @Mapping(target = "retiro_whatsapp", expression = "java(getOrDefault(valores, \"retiro_whatsapp\"))")
    @Mapping(target = "costo_envio", expression = "java(getOrDefault(valores, \"costo_envio\"))")
    @Mapping(target = "costo_envio_cuenca", expression = "java(getOrDefault(valores, \"costo_envio_cuenca\"))")
    RetiroInfoDTO toRetiroInfoDto(Map<String, String> valores);

    default String getOrDefault(Map<String, String> valores, String clave) {
        return valores != null ? valores.getOrDefault(clave, "") : "";
    }
}
