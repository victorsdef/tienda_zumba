package com.tiendaropa.backend.dto.admin;

import lombok.Data;

@Data
public class ExportarReporteRequest {
    private String nombreReporte;
    private boolean incluirResumen = true;
    private boolean incluirVentasPeriodo = true;
    private boolean incluirOrdenesEstado = true;
    private boolean incluirTopProductos = true;
    private boolean incluirStockBajo = true;
    private boolean incluirMetadatos = true;
    private Integer limiteTopProductos = 10;
    private Integer umbralStockBajo = 5;
}
