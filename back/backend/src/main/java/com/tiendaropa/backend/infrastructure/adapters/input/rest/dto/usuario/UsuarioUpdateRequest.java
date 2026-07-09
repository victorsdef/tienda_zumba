package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioUpdateRequest {
    @NotBlank
    private String nombre;
}
