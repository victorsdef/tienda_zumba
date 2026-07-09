package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden;

import lombok.Data;

@Data
public class ActualizarGuiaOrdenRequest {
    private String numeroGuia;
    private String guiaImagenUrl;
}
