package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AgregarItemRequest {
    @NotNull
    private Long productoId;
    @NotNull
    @Min(1)
    private Integer cantidad;
    private String talla;
    private String color;
}
