package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.usuario;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private String rol;
    private boolean activo;
    private boolean emailVerificado;
}
