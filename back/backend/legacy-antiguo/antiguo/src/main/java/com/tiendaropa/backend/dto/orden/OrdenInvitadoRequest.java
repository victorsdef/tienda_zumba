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

    // Dirección — opcional cuando la entrega es retiro en tienda
    private String nombreCompleto;
    private String celular;
    private String cedula;
    private String provincia;
    private String canton;
    private String ciudad;
    private String direccion;

    private String tipoEntrega;
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
