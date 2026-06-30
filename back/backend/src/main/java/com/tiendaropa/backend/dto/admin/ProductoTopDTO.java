package com.tiendaropa.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data @AllArgsConstructor
public class ProductoTopDTO {
    private Long id;
    private String nombre;
    private Long unidadesVendidas;
    private BigDecimal ingresos;
}
