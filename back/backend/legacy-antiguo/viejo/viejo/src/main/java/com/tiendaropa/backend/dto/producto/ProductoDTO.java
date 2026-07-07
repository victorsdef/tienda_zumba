package com.tiendaropa.backend.dto.producto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class ProductoDTO {
    private Long id;
    private String sku;
    private String slug;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioOriginal;
    private Integer stock;
    private boolean activo;
    private boolean aplicaIva;
    private Long categoriaId;
    private String categoriaNombre;
    private List<String> imagenes;
    private List<String> tallas;
    private List<String> colores;
    private Map<String, Integer> stockPorColor;
    private Map<String, Map<String, Integer>> stockPorColorTalla;
    private String caracteristicaTitulo;
    private String caracteristicaDescripcion;

    public Integer getDescuentoPorcentaje() {
        if (precioOriginal == null || precioOriginal.compareTo(BigDecimal.ZERO) == 0) return null;
        return precioOriginal.subtract(precio)
            .multiply(BigDecimal.valueOf(100))
            .divide(precioOriginal, 0, java.math.RoundingMode.HALF_UP)
            .intValue();
    }
}
