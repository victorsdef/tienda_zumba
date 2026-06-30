package com.tiendaropa.backend.dto.orden;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearOrdenRequest {
    @NotBlank
    private String calleEnvio;
    @NotBlank
    private String ciudadEnvio;
    private String provinciaEnvio;
    private String codigoPostalEnvio;
}
