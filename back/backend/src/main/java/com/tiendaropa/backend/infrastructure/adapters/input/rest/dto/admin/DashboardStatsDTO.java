package com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private Long totalProductos;
    private Long totalProductosActivos;
    private Long totalCategorias;
    private Long totalCategoriasActivas;
    private Long totalClientes;
    private Long totalClientesVerificados;
    private Long totalOrdenes;
    private Long totalOrdenesPendientes;
    private BigDecimal ventasTotales;
    private Map<String, Long> ordenesPorEstado;
    private BigDecimal ventasHoy;
    private BigDecimal ventasSemana;
    private BigDecimal ventasMes;
    private Long ordenesHoy;
    private Long ordenesSemana;
    private Long ordenesMes;
    private Long totalBanners;
    private Long totalBannersActivos;
    private List<ProductoStockBajoDTO> productosStockBajo;
    private List<ProductoTopDTO> topProductos;
}
