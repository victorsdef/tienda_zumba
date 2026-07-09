package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CarritoDTO {
    private Long id;
    private List<ItemCarritoDTO> items;
    private BigDecimal total;
    private Integer cantidadItems;
}
