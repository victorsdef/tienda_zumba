package com.tiendaropa.backend.domain.service;

import com.tiendaropa.backend.domain.model.Pago;

public class PagoDomainService {

    public void aprobar(Pago pago) {
        if (pago == null) {
            throw new IllegalArgumentException("El pago no puede ser nulo");
        }
        pago.setEstado("APROBADO");
    }
}
