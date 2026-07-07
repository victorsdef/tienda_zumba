package com.tiendaropa.backend.application.ports.input;

import java.time.LocalDate;

public interface AdminUseCase {
    byte[] generarReporteVentasCsv(LocalDate desde, LocalDate hasta);
}
