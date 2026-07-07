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

    // DOMICILIO, CUENCA o RETIRO
    private String tipoEntrega;

    // Compatibilidad con el flujo anterior
    private boolean conEnvio;
}
