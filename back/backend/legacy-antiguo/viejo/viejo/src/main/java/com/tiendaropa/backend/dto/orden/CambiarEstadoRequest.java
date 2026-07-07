package com.tiendaropa.backend.dto.orden;

import com.tiendaropa.backend.entity.enums.EstadoOrden;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambiarEstadoRequest {
    @NotNull
    private EstadoOrden estado;
    private String numeroGuia;
}
