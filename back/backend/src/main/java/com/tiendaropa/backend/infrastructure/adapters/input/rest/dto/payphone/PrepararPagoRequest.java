package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.payphone;

import lombok.Data;

@Data
public class PrepararPagoRequest {
    private Long ordenId;
    private String email;
    private String celular;
}
