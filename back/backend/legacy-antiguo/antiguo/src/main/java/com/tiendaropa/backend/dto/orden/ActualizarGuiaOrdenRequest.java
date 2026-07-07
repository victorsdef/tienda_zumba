package com.tiendaropa.backend.dto.orden;

import lombok.Data;

@Data
public class ActualizarGuiaOrdenRequest {
    private String numeroGuia;
    private String guiaImagenUrl;
}
