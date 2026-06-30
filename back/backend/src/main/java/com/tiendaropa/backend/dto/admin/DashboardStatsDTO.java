package com.tiendaropa.backend.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardStatsDTO {

    // Generales
    private Long totalProductos;
    private Long totalCategorias;
    private Long totalClientes;
    private Long totalOrdenes;
    private BigDecimal ventasTotales;

    // Órdenes por estado
    private Map<String, Long> ordenesPorEstado;

    // Ventas por período
    private BigDecimal ventasHoy;
    private BigDecimal ventasSemana;
    private BigDecimal ventasMes;
    private Long ordenesHoy;
    private Long ordenesSemana;
    private Long ordenesMes;

    // Alertas
    private List<ProductoStockBajoDTO> productosStockBajo;

    // Top productos (más vendidos)
    private List<ProductoTopDTO> topProductos;
}
