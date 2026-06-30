package com.tiendaropa.backend.dto.producto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductoRequest {
    @NotBlank
    private String nombre;
    private String descripcion;
    @NotNull @DecimalMin("0.01")
    private BigDecimal precio;
    private BigDecimal precioOriginal;
    @NotNull @Min(0)
    private Integer stock;
    private Long categoriaId;
    private List<String> imagenes;
    private List<String> tallas;
    private List<String> colores;
}
