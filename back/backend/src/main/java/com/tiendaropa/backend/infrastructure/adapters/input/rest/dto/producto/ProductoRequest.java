package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ProductoRequest {
    @NotBlank
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioOriginal;
    @NotNull
    @Min(0)
    private Integer stock;
    private boolean activo = true;
    private boolean aplicaIva = true;
    private Long categoriaId;
    private List<String> imagenes;
    private List<String> tallas;
    private List<String> colores;
    private Map<String, Integer> stockPorColor;
    private Map<String, Map<String, Integer>> stockPorColorTalla;
    private String caracteristicaTitulo;
    private String caracteristicaDescripcion;
}
