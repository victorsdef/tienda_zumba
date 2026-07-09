package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductoStockBajoDTO {
    private Long id;
    private String nombre;
    private Integer stock;
}
