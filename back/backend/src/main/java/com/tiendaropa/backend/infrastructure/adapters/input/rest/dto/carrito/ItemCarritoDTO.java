package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemCarritoDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoImagen;
    private BigDecimal precio;
    private Integer cantidad;
    private String talla;
    private String color;
}
