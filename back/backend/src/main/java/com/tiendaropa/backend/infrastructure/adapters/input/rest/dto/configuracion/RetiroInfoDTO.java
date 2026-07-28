package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.configuracion;

import lombok.Data;

@Data
public class RetiroInfoDTO {
    private String retiro_direccion;
    private String retiro_horario;
    private String retiro_whatsapp;
    private String costo_envio;
    private String costo_envio_cuenca;
    private String social_instagram;
    private String social_tiktok;
    private String social_facebook;
    private String social_pinterest;
}
