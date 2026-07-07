package com.tiendaropa.backend.domain.service;

import com.tiendaropa.backend.domain.model.Orden;

public class OrdenDomainService {

    public void confirmar(Orden orden) {
        if (orden == null) {
            throw new IllegalArgumentException("La orden no puede ser nula");
        }
        orden.setEstado("CONFIRMADA");
    }
}
