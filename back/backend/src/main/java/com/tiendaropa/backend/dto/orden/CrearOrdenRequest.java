package com.tiendaropa.backend.dto.orden;

import lombok.Data;

@Data
public class CrearOrdenRequest {
    // Dirección guardada (opcional — si se envía, se usan sus datos)
    private Long direccionId;

    // O dirección inline
    private String nombreEnvio;
    private String celularEnvio;
    private String provinciaEnvio;
    private String cantonEnvio;
    private String ciudadEnvio;
    private String calleEnvio;

    // Envío a domicilio ($6) o retiro en tienda ($0)
    private boolean conEnvio;
}
