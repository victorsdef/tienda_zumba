package com.tiendaropa.backend.dto.direccion;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DireccionRequest {
    @NotBlank
    private String calle;
    @NotBlank
    private String ciudad;
    private String provincia;
    private String codigoPostal;
    private String referencias;
}
