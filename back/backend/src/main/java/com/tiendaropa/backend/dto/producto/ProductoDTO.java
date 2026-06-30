package com.tiendaropa.backend.dto.producto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioOriginal;
    private Integer stock;
    private boolean activo;
    private Long categoriaId;
    private String categoriaNombre;
    private List<String> imagenes;
    private List<String> tallas;
    private List<String> colores;

    public Integer getDescuentoPorcentaje() {
        if (precioOriginal == null || precioOriginal.compareTo(BigDecimal.ZERO) == 0) return null;
        return precioOriginal.subtract(precio)
            .multiply(BigDecimal.valueOf(100))
            .divide(precioOriginal, 0, java.math.RoundingMode.HALF_UP)
            .intValue();
    }
}
