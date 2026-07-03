package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.admin.*;
import com.tiendaropa.backend.entity.enums.EstadoOrden;
import com.tiendaropa.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final OrdenRepository ordenRepository;
    private final ItemOrdenRepository itemOrdenRepository;
    private final BannerRepository bannerRepository;

    public DashboardStatsDTO getDashboardStats() {
        return getDashboardStats(5, 5);
    }

    public DashboardStatsDTO getDashboardStats(int stockThreshold, int topLimit) {
        LocalDateTime inicioHoy    = LocalDate.now().atStartOfDay();
        LocalDateTime inicioSemana = LocalDate.now().minusDays(6).atStartOfDay();
        LocalDateTime inicioMes    = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        // Ventas por estado
        Map<String, Long> porEstado = new LinkedHashMap<>();
        Arrays.stream(EstadoOrden.values()).forEach(e ->
            porEstado.put(e.name(), ordenRepository.countByEstado(e))
        );

        // Stock bajo (umbral 5)
        List<ProductoStockBajoDTO> stockBajo = productoRepository.findByStockBajo(stockThreshold).stream()
            .map(p -> new ProductoStockBajoDTO(p.getId(), p.getNombre(), p.getStock()))
            .collect(Collectors.toList());

        // Top productos más vendidos
        List<ProductoTopDTO> topProductos = itemOrdenRepository
            .findTopProductos(PageRequest.of(0, topLimit))
            .stream()
            .map(row -> new ProductoTopDTO(
                ((Number) row[0]).longValue(),
                (String) row[1],
                ((Number) row[2]).longValue(),
                (BigDecimal) row[3]
            ))
            .collect(Collectors.toList());

        return DashboardStatsDTO.builder()
            .totalProductos(productoRepository.count())
            .totalProductosActivos(productoRepository.countByActivoTrue())
            .totalCategorias(categoriaRepository.count())
            .totalCategoriasActivas(categoriaRepository.countByActivoTrue())
            .totalClientes(usuarioRepository.count())
            .totalClientesVerificados(usuarioRepository.countByActivoTrue())
            .totalOrdenes(ordenRepository.count())
            .totalOrdenesPendientes(ordenRepository.countByEstado(EstadoOrden.PENDIENTE))
            .ventasTotales(safeSum(ordenRepository.sumVentasDesde(LocalDateTime.of(2000, 1, 1, 0, 0))))
            .ventasHoy(safeSum(ordenRepository.sumVentasDesde(inicioHoy)))
            .ventasSemana(safeSum(ordenRepository.sumVentasDesde(inicioSemana)))
            .ventasMes(safeSum(ordenRepository.sumVentasDesde(inicioMes)))
            .ordenesHoy(ordenRepository.countOrdenesDesde(inicioHoy))
            .ordenesSemana(ordenRepository.countOrdenesDesde(inicioSemana))
            .ordenesMes(ordenRepository.countOrdenesDesde(inicioMes))
            .ordenesPorEstado(porEstado)
            .productosStockBajo(stockBajo)
            .topProductos(topProductos)
            .totalBanners(bannerRepository.count())
            .totalBannersActivos(bannerRepository.countByActivoTrue())
            .build();
    }

    private BigDecimal safeSum(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
