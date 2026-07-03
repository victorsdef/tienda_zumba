package com.tiendaropa.backend.dto.producto;

import jakarta.validation.constraints.*;
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
    @NotNull @Min(0)
    private Integer stock;
    private boolean activo = true;
    private Long categoriaId;
    private List<String> imagenes;
    private List<String> tallas;
    private List<String> colores;
    private Map<String, Integer> stockPorColor;
    private String caracteristicaTitulo;
    private String caracteristicaDescripcion;
}
