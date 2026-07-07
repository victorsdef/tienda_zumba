package com.tiendaropa.backend.application.ports.output;

import com.tiendaropa.backend.domain.model.Orden;

public interface PdfGeneratorPort {
    byte[] generarFactura(Orden orden);
}
