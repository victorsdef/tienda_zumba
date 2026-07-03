package com.tiendaropa.backend.dto.direccion;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class DireccionRequest {
    @NotBlank private String nombreCompleto;
    @NotBlank private String celular;
    @NotBlank private String cedula;
    @NotBlank private String provincia;
    @NotBlank private String canton;
    @NotBlank private String ciudad;
    @NotBlank private String direccion;
    private boolean predeterminada;
}
