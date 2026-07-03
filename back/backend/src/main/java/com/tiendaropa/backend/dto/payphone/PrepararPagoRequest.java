package com.tiendaropa.backend.dto.payphone;

import lombok.Data;

@Data
public class PrepararPagoRequest {
    private Long ordenId;
    private String email;
    private String celular;
}
