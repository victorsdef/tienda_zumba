package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.categoria;

import lombok.Data;

import java.util.List;

@Data
public class CategoriaDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private String imagen;
    private String genero;
    private List<String> tallasDisponibles;
    private boolean activo;
}
