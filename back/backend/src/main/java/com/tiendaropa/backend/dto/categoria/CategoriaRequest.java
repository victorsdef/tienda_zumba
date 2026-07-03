package com.tiendaropa.backend.dto.categoria;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CategoriaRequest {
    @NotBlank
    private String nombre;
    private String descripcion;
    private String imagen;
    private String genero;
    private List<String> tallasDisponibles;
}
