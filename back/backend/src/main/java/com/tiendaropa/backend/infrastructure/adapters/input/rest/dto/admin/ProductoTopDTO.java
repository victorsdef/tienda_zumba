package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ProductoTopDTO {
    private Long id;
    private String nombre;
    private Long unidadesVendidas;
    private BigDecimal ingresos;
}
