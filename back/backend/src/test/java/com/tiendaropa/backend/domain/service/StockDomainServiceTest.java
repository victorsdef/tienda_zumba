package com.tiendaropa.backend.domain.service;

import com.tiendaropa.backend.domain.model.Producto;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class StockDomainServiceTest {

    @Test
    void debeReducirElStockDisponibleCuandoSeReservaUnaCantidad() {
        Producto producto = new Producto();
        producto.setStock(10);

        StockDomainService service = new StockDomainService();
        service.reservarStock(producto, 3);

        assertEquals(7, producto.getStock());
    }
}
