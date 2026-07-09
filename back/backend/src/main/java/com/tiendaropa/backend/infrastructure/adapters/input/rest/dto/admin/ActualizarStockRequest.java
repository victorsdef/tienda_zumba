package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActualizarStockRequest {
    @NotNull
    @Min(0)
    private Integer stock;
}
