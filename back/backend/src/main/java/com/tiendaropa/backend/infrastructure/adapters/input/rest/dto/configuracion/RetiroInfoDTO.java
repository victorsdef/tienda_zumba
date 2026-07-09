package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion;

import lombok.Data;

@Data
public class RetiroInfoDTO {
    private String retiro_direccion;
    private String retiro_horario;
    private String retiro_whatsapp;
    private String costo_envio;
    private String costo_envio_cuenca;
}
