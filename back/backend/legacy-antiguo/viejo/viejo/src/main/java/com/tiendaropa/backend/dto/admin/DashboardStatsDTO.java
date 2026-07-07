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
    private Long totalProductosActivos;
    private Long totalCategorias;
    private Long totalCategoriasActivas;
    private Long totalClientes;
    private Long totalClientesVerificados;
    private Long totalOrdenes;
    private Long totalOrdenesPendientes;
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

    // Banners
    private Long totalBanners;
    private Long totalBannersActivos;

    // Alertas
    private List<ProductoStockBajoDTO> productosStockBajo;

    // Top productos (más vendidos)
    private List<ProductoTopDTO> topProductos;
}
