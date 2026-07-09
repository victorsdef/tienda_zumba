package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden;

import lombok.Data;

@Data
public class CrearOrdenRequest {
    private Long direccionId;
    private String nombreEnvio;
    private String celularEnvio;
    private String provinciaEnvio;
    private String cantonEnvio;
    private String ciudadEnvio;
    private String calleEnvio;
    private String tipoEntrega;
    private boolean conEnvio;
}
