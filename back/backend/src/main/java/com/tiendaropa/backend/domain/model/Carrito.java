package com.tiendaropa.backend.domain.model;

import java.util.ArrayList;
import java.util.List;

public class Carrito {

    private Long id;

    private Usuario usuario;

    private List<ItemCarrito> items = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<ItemCarrito> getItems() { return items; }
    public void setItems(List<ItemCarrito> items) { this.items = items; }
}
