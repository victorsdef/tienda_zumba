package com.tiendaropa.backend.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UsuarioUpdateRequest {
    @NotBlank
    private String nombre;
}
