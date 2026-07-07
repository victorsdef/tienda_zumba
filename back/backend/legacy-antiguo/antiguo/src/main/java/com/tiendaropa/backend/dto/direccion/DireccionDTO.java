package com.tiendaropa.backend.dto.direccion;
import lombok.Data;
@Data
public class DireccionDTO {
    private Long id;
    private String nombreCompleto;
    private String celular;
    private String cedula;
    private String provincia;
    private String canton;
    private String ciudad;
    private String direccion;
    private boolean predeterminada;
}
