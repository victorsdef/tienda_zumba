package com.tiendaropa.backend.application.ports.input;

public interface OrdenPdfUseCase {
    byte[] generarFacturaPdf(Long ordenId);
}
