package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambiarEstadoRequest {
    @NotNull
    private String estado;
    private String numeroGuia;
}
