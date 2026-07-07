package com.tiendaropa.backend.domain.model;

import java.util.ArrayList;
import java.util.List;

public class Categoria {

    private Long id;
    private String nombre;
    private String descripcion;
    private String imagen;
    private String genero;
    private List<String> tallasDisponibles = new ArrayList<>();
    private boolean activo = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }

    public String getGenero() { return genero; }
    public void setGenero(String genero) { this.genero = genero; }

    public List<String> getTallasDisponibles() { return tallasDisponibles; }
    public void setTallasDisponibles(List<String> tallasDisponibles) { this.tallasDisponibles = tallasDisponibles; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
}
