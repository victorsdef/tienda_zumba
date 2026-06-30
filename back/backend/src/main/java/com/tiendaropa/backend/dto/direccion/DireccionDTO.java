package com.tiendaropa.backend.dto.direccion;

import lombok.Data;

@Data
public class DireccionDTO {
    private Long id;
    private String calle;
    private String ciudad;
    private String provincia;
    private String codigoPostal;
    private String referencias;
}
