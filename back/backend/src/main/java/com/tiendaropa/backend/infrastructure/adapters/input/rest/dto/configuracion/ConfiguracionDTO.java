package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion;

import lombok.Data;

@Data
public class ConfiguracionDTO {
    private String clave;
    private String valor;
    private String descripcion;
}
