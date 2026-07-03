package com.tiendaropa.backend.dto.orden;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class OrdenInvitadoRequest {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    @NotBlank(message = "El email es requerido")
    @Email(message = "Email inválido")
    private String email;

    // Dirección — mismos campos que DireccionRequest
    @NotBlank private String nombreCompleto;
    @NotBlank private String celular;
    @NotBlank private String cedula;
    @NotBlank private String provincia;
    @NotBlank private String canton;
    @NotBlank private String ciudad;
    @NotBlank private String direccion;

    private boolean conEnvio = true;

    @NotEmpty(message = "El carrito no puede estar vacío")
    private List<ItemInvitadoRequest> items;

    @Data
    public static class ItemInvitadoRequest {
        private Long productoId;
        private Integer cantidad;
        private String talla;
        private String color;
    }
}
