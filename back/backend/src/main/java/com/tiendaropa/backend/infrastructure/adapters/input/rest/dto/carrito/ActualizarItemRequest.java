package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActualizarItemRequest {
    @NotNull
    @Min(1)
    private Integer cantidad;
}
