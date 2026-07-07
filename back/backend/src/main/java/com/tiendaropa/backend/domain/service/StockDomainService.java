package com.tiendaropa.backend.domain.service;

import com.tiendaropa.backend.domain.model.Producto;

public class StockDomainService {

    public void reservarStock(Producto producto, int cantidad) {
        if (producto == null) {
            throw new IllegalArgumentException("Producto no puede ser nulo");
        }
        if (cantidad < 0) {
            throw new IllegalArgumentException("La cantidad no puede ser negativa");
        }
        if (producto.getStock() < cantidad) {
            throw new IllegalStateException("Stock insuficiente");
        }
        producto.setStock(producto.getStock() - cantidad);
    }
}
