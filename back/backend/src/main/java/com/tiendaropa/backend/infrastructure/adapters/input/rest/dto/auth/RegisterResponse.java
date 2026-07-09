package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.auth;

public class RegisterResponse {

    private String mensaje;
    private Long id;
    private String nombre;
    private String email;
    private String rol;

    public RegisterResponse() {
    }

    public RegisterResponse(String mensaje, Long id, String nombre, String email, String rol) {
        this.mensaje = mensaje;
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}
