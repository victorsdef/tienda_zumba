package com.tiendaropa.backend.dto.usuario;

import lombok.Data;

@Data
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private String rol;
}
