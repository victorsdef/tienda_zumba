package com.tiendaropa.backend.dto.usuario;

import com.tiendaropa.backend.entity.enums.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CrearUsuarioAdminRequest {
    @NotBlank private String nombre;
    @NotBlank @Email private String email;
    @NotBlank @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
    @NotNull private Rol rol;
}
