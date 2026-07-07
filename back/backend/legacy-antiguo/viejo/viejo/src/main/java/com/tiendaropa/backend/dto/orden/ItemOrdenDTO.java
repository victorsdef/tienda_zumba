package com.tiendaropa.backend.dto.orden;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ItemOrdenDTO {
    private Long id;
    private Long productoId;
    private String nombreProducto;
    private String productoImagen;
    private Integer cantidad;
    private BigDecimal precio;
    private String talla;
    private String color;
}
