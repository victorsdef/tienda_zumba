package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.AdminUseCase;
import com.tiendaropa.backend.application.ports.input.BannerUseCase;
import com.tiendaropa.backend.application.ports.input.CategoriaUseCase;
import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import com.tiendaropa.backend.application.ports.input.ProductoUseCase;
import com.tiendaropa.backend.application.ports.input.UsuarioUseCase;
import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.enums.Rol;
import com.tiendaropa.backend.domain.model.Banner;
import com.tiendaropa.backend.domain.model.Categoria;
import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.domain.model.OrdenItem;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.UsuarioRestMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin.ActualizarStockRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin.DashboardStatsDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin.ProductoStockBajoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.admin.ProductoTopDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.common.PageResponse;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.ActualizarGuiaOrdenRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.CambiarEstadoRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.OrdenDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.producto.ProductoRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.OrdenRestMapper;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.ProductoRestMapper;
import com.tiendaropa.backend.infrastructure.adapters.output.persistence.repository.BannerJpaRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/nueva-arquitectura/admin", "/api/admin"})
@RequiredArgsConstructor
public class AdminController {

    private final AdminUseCase adminUseCase;
    private final ProductoUseCase productoUseCase;
    private final CategoriaUseCase categoriaUseCase;
    private final BannerUseCase bannerUseCase;
    private final OrdenUseCase ordenUseCase;
    private final UsuarioUseCase usuarioUseCase;
    private final ProductoRestMapper productoRestMapper;
    private final OrdenRestMapper ordenRestMapper;
    private final UsuarioRestMapper usuarioRestMapper;
    private final UsuarioRepositoryPort usuarioRepositoryPort;
    private final PasswordEncoder passwordEncoder;
    private final BannerJpaRepository bannerJpaRepository;
    private final EmailUseCase emailUseCase;
    private final ObjectMapper objectMapper;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR','BODEGUERO')")
    public ResponseEntity<DashboardStatsDTO> dashboard() {
        List<Producto> productos = productoUseCase.listarTodos();
        List<Categoria> categorias = categoriaUseCase.listarTodas();
        List<Usuario> usuarios = usuarioRepositoryPort.findAll();
        List<Orden> ordenes = ordenUseCase.listarTodas();
        List<Banner> bannersActivos = bannerUseCase.listarActivos();

        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime inicioSemana = LocalDate.now().with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        Map<String, Long> ordenesPorEstado = new LinkedHashMap<>();
        List<String> estadosBase = Arrays.asList("PENDIENTE", "PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO");
        for (String estado : estadosBase) {
            ordenesPorEstado.put(estado, 0L);
        }
        for (Orden orden : ordenes) {
            String estado = orden.getEstado() == null || orden.getEstado().isBlank()
                ? "PENDIENTE"
                : orden.getEstado().trim().toUpperCase(Locale.ROOT);
            ordenesPorEstado.put(estado, ordenesPorEstado.getOrDefault(estado, 0L) + 1);
        }

        List<ProductoStockBajoDTO> stockBajo = productos.stream()
            .filter(producto -> producto.getStock() <= 5)
            .sorted(Comparator.comparingInt(Producto::getStock))
            .limit(5)
            .map(producto -> new ProductoStockBajoDTO(producto.getId(), producto.getNombre(), producto.getStock()))
            .toList();

        Map<Long, ProductoTopAccumulator> topProductosMap = new LinkedHashMap<>();
        for (Orden orden : ordenes) {
            for (OrdenItem item : orden.getItems() == null ? new ArrayList<OrdenItem>() : orden.getItems()) {
                if (item == null) {
                    continue;
                }
                Long key = item.getProductoId() != null ? item.getProductoId() : -1L;
                ProductoTopAccumulator acc = topProductosMap.computeIfAbsent(
                    key,
                    ignored -> new ProductoTopAccumulator(
                        item.getProductoId(),
                        item.getNombreProducto() != null ? item.getNombreProducto() : "Producto"
                    )
                );
                acc.unidadesVendidas += item.getCantidad() != null ? item.getCantidad() : 0;
                BigDecimal subtotal = item.getSubtotal();
                if (subtotal == null && item.getPrecio() != null && item.getCantidad() != null) {
                    subtotal = item.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
                }
                acc.ingresos = acc.ingresos.add(subtotal != null ? subtotal : BigDecimal.ZERO);
            }
        }

        List<ProductoTopDTO> topProductos = topProductosMap.values().stream()
            .sorted(Comparator.comparing(ProductoTopAccumulator::getUnidadesVendidas).reversed())
            .limit(5)
            .map(acc -> new ProductoTopDTO(acc.id, acc.nombre, acc.unidadesVendidas, acc.ingresos))
            .toList();

        DashboardStatsDTO stats = DashboardStatsDTO.builder()
            .totalProductos((long) productos.size())
            .totalProductosActivos(productos.stream().filter(Producto::isActivo).count())
            .totalCategorias((long) categorias.size())
            .totalCategoriasActivas(categorias.stream().filter(Categoria::isActivo).count())
            .totalClientes((long) usuarios.size())
            .totalClientesVerificados(usuarios.stream().filter(Usuario::isActivo).count())
            .totalOrdenes((long) ordenes.size())
            .totalOrdenesPendientes(ordenes.stream().filter(orden -> "PENDIENTE".equalsIgnoreCase(orden.getEstado())).count())
            .ventasTotales(sumVentasTotales(ordenes))
            .ventasHoy(sumVentasDesde(ordenes, inicioHoy))
            .ventasSemana(sumVentasDesde(ordenes, inicioSemana))
            .ventasMes(sumVentasDesde(ordenes, inicioMes))
            .ordenesHoy(countOrdenesDesde(ordenes, inicioHoy))
            .ordenesSemana(countOrdenesDesde(ordenes, inicioSemana))
            .ordenesMes(countOrdenesDesde(ordenes, inicioMes))
            .ordenesPorEstado(ordenesPorEstado)
            .productosStockBajo(stockBajo)
            .topProductos(topProductos)
            .totalBanners(bannerJpaRepository.count())
            .totalBannersActivos((long) bannersActivos.size())
            .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/report/ventas")
    public ResponseEntity<byte[]> exportVentas(@RequestParam(required = false) String desde,
                                               @RequestParam(required = false) String hasta) {
        LocalDate d = desde != null ? LocalDate.parse(desde) : null;
        LocalDate h = hasta != null ? LocalDate.parse(hasta) : null;
        byte[] csv = adminUseCase.generarReporteVentasCsv(d, h);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDisposition(ContentDisposition.attachment().filename("ventas.csv").build());
        return new ResponseEntity<>(csv, headers, HttpStatus.OK);
    }

    @GetMapping("/productos")
    @PreAuthorize("hasAnyRole('ADMIN','BODEGUERO')")
    public ResponseEntity<PageResponse<ProductoDTO>> listarProductos(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        List<ProductoDTO> productos = productoUseCase.listarTodos().stream()
            .map(this::toProductoDto)
            .toList();
        return ResponseEntity.ok(paginar(productos, page, size));
    }

    @PostMapping("/productos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> crearProducto(@RequestBody ProductoRequest request) {
        Producto producto = productoRestMapper.toDomain(request);
        producto.setStockPorColorTallaJson(writeStockPorColorTalla(request.getStockPorColorTalla()));
        producto.setImagenesPorColorJson(writeImagenesPorColor(request.getImagenesPorColor()));
        producto.setPrecioPorColorTallaJson(writePrecioPorColorTalla(request.getPrecioPorColorTalla()));
        return ResponseEntity.ok(toProductoDto(productoUseCase.crear(producto)));
    }

    @PutMapping("/productos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @RequestBody ProductoRequest request) {
        Producto producto = productoRestMapper.toDomain(request);
        producto.setStockPorColorTallaJson(writeStockPorColorTalla(request.getStockPorColorTalla()));
        producto.setImagenesPorColorJson(writeImagenesPorColor(request.getImagenesPorColor()));
        producto.setPrecioPorColorTallaJson(writePrecioPorColorTalla(request.getPrecioPorColorTalla()));
        return ResponseEntity.ok(toProductoDto(productoUseCase.actualizar(id, producto)));
    }

    @PatchMapping("/productos/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> toggleActivo(@PathVariable Long id) {
        Producto producto = productoUseCase.obtenerPorId(id);
        producto.setActivo(!producto.isActivo());
        return ResponseEntity.ok(toProductoDto(productoUseCase.actualizar(id, producto)));
    }

    @PatchMapping("/productos/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN','BODEGUERO')")
    public ResponseEntity<ProductoDTO> actualizarStock(@PathVariable Long id, @RequestBody ActualizarStockRequest request) {
        Producto producto = productoUseCase.obtenerPorId(id);
        producto.setStock(request.getStock());
        return ResponseEntity.ok(toProductoDto(productoUseCase.actualizar(id, producto)));
    }

    @DeleteMapping("/productos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoUseCase.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/ordenes")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<PageResponse<OrdenDTO>> listarOrdenes(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String estado
    ) {
        List<OrdenDTO> ordenes = ordenUseCase.listarTodas().stream()
            .filter(orden -> estado == null || estado.isBlank()
                || (orden.getEstado() != null && orden.getEstado().equalsIgnoreCase(estado)))
            .sorted((a, b) -> {
                if (b.getFechaCreacion() == null) return -1;
                if (a.getFechaCreacion() == null) return 1;
                return b.getFechaCreacion().compareTo(a.getFechaCreacion());
            })
            .map(this::toOrdenDto)
            .toList();
        return ResponseEntity.ok(paginar(ordenes, page, size));
    }

    @PatchMapping("/ordenes/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<OrdenDTO> cambiarEstado(@PathVariable Long id, @RequestBody CambiarEstadoRequest request) {
        Orden orden = ordenUseCase.obtenerPorId(id).orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        String nuevoEstado = request.getEstado() == null ? orden.getEstado() : request.getEstado().trim().toUpperCase(Locale.ROOT);
        orden.setEstado(nuevoEstado);
        if (request.getNumeroGuia() != null && !request.getNumeroGuia().isBlank()) {
            orden.setNumeroGuia(request.getNumeroGuia().trim());
        }
        Orden actualizada = ordenUseCase.actualizar(orden);
        notificarCambioEstado(actualizada, nuevoEstado);
        return ResponseEntity.ok(toOrdenDto(actualizada));
    }

    private void notificarCambioEstado(Orden orden, String estado) {
        String email  = resolverEmailCliente(orden);
        String nombre = resolverNombreCliente(orden);
        if (email == null || email.isBlank()) return;
        String codigo = orden.getCodigoOrden() != null ? orden.getCodigoOrden() : "#" + orden.getId();
        switch (estado) {
            case "EN_PREPARACION" -> emailUseCase.enviarEnPreparacion(email, nombre, codigo);
            case "ENVIADO"        -> emailUseCase.enviarEnviado(email, nombre, codigo, orden.getNumeroGuia());
            case "ENTREGADO"      -> emailUseCase.enviarEntregado(email, nombre, codigo);
            case "CANCELADO"      -> emailUseCase.enviarPagoCancelado(email, nombre, codigo);
        }
    }

    private String resolverEmailCliente(Orden orden) {
        if (orden.getEmailInvitado() != null && !orden.getEmailInvitado().isBlank())
            return orden.getEmailInvitado();
        if (orden.getUsuarioId() != null)
            return usuarioRepositoryPort.findById(orden.getUsuarioId()).map(u -> u.getEmail()).orElse(null);
        return null;
    }

    private String resolverNombreCliente(Orden orden) {
        if (orden.getNombreInvitado() != null && !orden.getNombreInvitado().isBlank())
            return orden.getNombreInvitado();
        if (orden.getUsuarioId() != null)
            return usuarioRepositoryPort.findById(orden.getUsuarioId()).map(u -> u.getNombre()).orElse("Cliente");
        return "Cliente";
    }

    @PatchMapping("/ordenes/{id}/guia")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<OrdenDTO> actualizarGuia(@PathVariable Long id, @RequestBody ActualizarGuiaOrdenRequest request) {
        Orden orden = ordenUseCase.obtenerPorId(id).orElseThrow(() -> new RuntimeException("Orden no encontrada"));
        if (request.getNumeroGuia() != null && !request.getNumeroGuia().isBlank()) {
            orden.setNumeroGuia(request.getNumeroGuia().trim());
        }
        if (request.getGuiaImagenUrl() != null && !request.getGuiaImagenUrl().isBlank()) {
            orden.setGuiaImagenUrl(request.getGuiaImagenUrl().trim());
        }
        return ResponseEntity.ok(toOrdenDto(ordenUseCase.actualizar(orden)));
    }

    private OrdenDTO toOrdenDto(Orden orden) {
        OrdenDTO dto = ordenRestMapper.toDto(orden);
        if (orden.getUsuarioId() != null && (dto.getUsuarioNombre() == null || dto.getUsuarioNombre().isBlank())) {
            usuarioRepositoryPort.findById(orden.getUsuarioId()).ifPresent(usuario -> dto.setUsuarioNombre(usuario.getNombre()));
        }
        return dto;
    }

    private ProductoDTO toProductoDto(Producto producto) {
        ProductoDTO dto = productoRestMapper.toDto(producto);
        dto.setStockPorColorTalla(parseStockPorColorTalla(producto.getStockPorColorTallaJson()));
        dto.setImagenesPorColor(parseImagenesPorColor(producto.getImagenesPorColorJson()));
        dto.setPrecioPorColorTalla(parsePrecioPorColorTalla(producto.getPrecioPorColorTallaJson()));
        if (producto.getCategoria() != null) {
            Categoria categoria = producto.getCategoria();
            dto.setCategoriaId(categoria.getId());
            dto.setCategoriaNombre(categoria.getNombre());
        }
        return dto;
    }

    private Map<String, Map<String, Integer>> parseStockPorColorTalla(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<Map<String, Map<String, Integer>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private String writeStockPorColorTalla(Map<String, Map<String, Integer>> stockPorColorTalla) {
        if (stockPorColorTalla == null || stockPorColorTalla.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(stockPorColorTalla);
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudo procesar el stock por color y talla", ex);
        }
    }

    private Map<String, List<String>> parseImagenesPorColor(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<Map<String, List<String>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private String writeImagenesPorColor(Map<String, List<String>> imagenesPorColor) {
        if (imagenesPorColor == null || imagenesPorColor.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(imagenesPorColor);
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudieron procesar las imágenes por color", ex);
        }
    }

    private Map<String, Map<String, BigDecimal>> parsePrecioPorColorTalla(String raw) {
        if (raw == null || raw.isBlank()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(raw, new TypeReference<Map<String, Map<String, BigDecimal>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private String writePrecioPorColorTalla(Map<String, Map<String, BigDecimal>> precioPorColorTalla) {
        if (precioPorColorTalla == null || precioPorColorTalla.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(precioPorColorTalla);
        } catch (Exception ex) {
            throw new IllegalArgumentException("No se pudo procesar el precio por color y talla", ex);
        }
    }

    private <T> PageResponse<T> paginar(List<T> source, int page, int size) {
        int safeSize = Math.max(size, 1);
        int safePage = Math.max(page, 0);
        int fromIndex = Math.min(safePage * safeSize, source.size());
        int toIndex = Math.min(fromIndex + safeSize, source.size());
        int totalPages = source.isEmpty() ? 0 : (int) Math.ceil((double) source.size() / safeSize);
        return new PageResponse<>(source.subList(fromIndex, toIndex), totalPages, source.size(), safePage, safeSize);
    }

    private static final java.util.Set<String> ESTADOS_CONFIRMADOS =
        java.util.Set.of("PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO");

    private boolean esConfirmada(Orden orden) {
        return orden.getEstado() != null
            && ESTADOS_CONFIRMADOS.contains(orden.getEstado().trim().toUpperCase(Locale.ROOT));
    }

    /** Suma ventas de órdenes confirmadas con fecha dentro del período. */
    private BigDecimal sumVentasDesde(List<Orden> ordenes, LocalDateTime desde) {
        return ordenes.stream()
            .filter(this::esConfirmada)
            .filter(orden -> orden.getFechaCreacion() != null && !orden.getFechaCreacion().isBefore(desde))
            .map(Orden::getTotal)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Suma ventas históricas de órdenes confirmadas (sin importar fecha). */
    private BigDecimal sumVentasTotales(List<Orden> ordenes) {
        return ordenes.stream()
            .filter(this::esConfirmada)
            .map(Orden::getTotal)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private long countOrdenesDesde(List<Orden> ordenes, LocalDateTime desde) {
        return ordenes.stream()
            .filter(this::esConfirmada)
            .filter(orden -> orden.getFechaCreacion() != null && !orden.getFechaCreacion().isBefore(desde))
            .count();
    }

    private long countOrdenesTotales(List<Orden> ordenes) {
        return ordenes.stream().filter(this::esConfirmada).count();
    }

    // ── REPORTES EXCEL ──────────────────────────────────────────────

    @PostMapping("/reportes/exportar")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<byte[]> exportarExcel(@RequestBody ExportarReporteRequest req) {
        List<Producto> productos = productoUseCase.listarTodos();
        List<Orden> ordenes = ordenUseCase.listarTodas();

        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime inicioSemana = LocalDate.now().with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        int limite = req.getLimiteTopProductos() != null ? req.getLimiteTopProductos() : 10;
        int umbral = req.getUmbralStockBajo() != null ? req.getUmbralStockBajo() : 5;

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            CellStyle header = wb.createCellStyle();
            Font hf = wb.createFont(); hf.setBold(true); header.setFont(hf);
            header.setFillForegroundColor(IndexedColors.LIGHT_YELLOW.getIndex());
            header.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            if (Boolean.TRUE.equals(req.getIncluirResumen())) {
                Sheet s = wb.createSheet("Resumen");
                int r = 0;
                r = excelFila(s, r, header, "Métrica", "Valor");
                r = excelFila(s, r, null, "Total órdenes", String.valueOf(ordenes.size()));
                r = excelFila(s, r, null, "Ventas totales (confirmadas)", "$" + sumVentasTotales(ordenes).setScale(2, java.math.RoundingMode.HALF_UP));
                r = excelFila(s, r, null, "Ventas hoy", "$" + sumVentasDesde(ordenes, inicioHoy).setScale(2, java.math.RoundingMode.HALF_UP));
                r = excelFila(s, r, null, "Ventas semana", "$" + sumVentasDesde(ordenes, inicioSemana).setScale(2, java.math.RoundingMode.HALF_UP));
                r = excelFila(s, r, null, "Ventas mes", "$" + sumVentasDesde(ordenes, inicioMes).setScale(2, java.math.RoundingMode.HALF_UP));
                r = excelFila(s, r, null, "Órdenes hoy", String.valueOf(countOrdenesDesde(ordenes, inicioHoy)));
                r = excelFila(s, r, null, "Órdenes semana", String.valueOf(countOrdenesDesde(ordenes, inicioSemana)));
                excelFila(s, r, null, "Órdenes mes", String.valueOf(countOrdenesDesde(ordenes, inicioMes)));
                s.autoSizeColumn(0); s.autoSizeColumn(1);
            }

            if (Boolean.TRUE.equals(req.getIncluirVentasPeriodo())) {
                Sheet s = wb.createSheet("Ventas por periodo");
                excelFila(s, 0, header, "Periodo", "Órdenes", "Total ventas");
                excelFila(s, 1, null, "Hoy", String.valueOf(countOrdenesDesde(ordenes, inicioHoy)), "$" + sumVentasDesde(ordenes, inicioHoy).setScale(2, java.math.RoundingMode.HALF_UP));
                excelFila(s, 2, null, "Últimos 7 días", String.valueOf(countOrdenesDesde(ordenes, inicioSemana)), "$" + sumVentasDesde(ordenes, inicioSemana).setScale(2, java.math.RoundingMode.HALF_UP));
                excelFila(s, 3, null, "Mes actual", String.valueOf(countOrdenesDesde(ordenes, inicioMes)), "$" + sumVentasDesde(ordenes, inicioMes).setScale(2, java.math.RoundingMode.HALF_UP));
                excelFila(s, 4, null, "Histórico (confirmadas)", String.valueOf(countOrdenesTotales(ordenes)), "$" + sumVentasTotales(ordenes).setScale(2, java.math.RoundingMode.HALF_UP));
                for (int c = 0; c < 3; c++) s.autoSizeColumn(c);
            }

            if (Boolean.TRUE.equals(req.getIncluirOrdenesEstado())) {
                Sheet s = wb.createSheet("Órdenes");
                int r = 0;
                r = excelFila(s, r, header, "Código", "Estado", "Total", "Cliente", "Tipo entrega", "Fecha");
                for (Orden o : ordenes) {
                    excelFila(s, r++, null,
                        o.getCodigoOrden() != null ? o.getCodigoOrden() : "#" + o.getId(),
                        o.getEstado() != null ? o.getEstado() : "—",
                        o.getTotal() != null ? "$" + o.getTotal().setScale(2, java.math.RoundingMode.HALF_UP) : "$0.00",
                        o.getNombreEnvio() != null ? o.getNombreEnvio() : (o.getNombreInvitado() != null ? o.getNombreInvitado() : "—"),
                        o.getTipoEntrega() != null ? o.getTipoEntrega() : "—",
                        o.getFechaCreacion() != null ? o.getFechaCreacion().format(fmt) : "—");
                }
                for (int c = 0; c < 6; c++) s.autoSizeColumn(c);
            }

            if (Boolean.TRUE.equals(req.getIncluirTopProductos())) {
                Map<Long, ProductoTopAccumulator> map = new LinkedHashMap<>();
                for (Orden o : ordenes) {
                    for (OrdenItem item : o.getItems() == null ? new ArrayList<OrdenItem>() : o.getItems()) {
                        if (item == null) continue;
                        Long key = item.getProductoId() != null ? item.getProductoId() : -1L;
                        ProductoTopAccumulator acc = map.computeIfAbsent(key, ign -> new ProductoTopAccumulator(item.getProductoId(), item.getNombreProducto() != null ? item.getNombreProducto() : "Producto"));
                        acc.unidadesVendidas += item.getCantidad() != null ? item.getCantidad() : 0;
                        BigDecimal sub = item.getSubtotal();
                        if (sub == null && item.getPrecio() != null && item.getCantidad() != null) sub = item.getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
                        acc.ingresos = acc.ingresos.add(sub != null ? sub : BigDecimal.ZERO);
                    }
                }
                Sheet s = wb.createSheet("Top productos");
                int r = 0;
                r = excelFila(s, r, header, "#", "Producto", "Unidades vendidas", "Ingresos");
                int rank = 1;
                for (ProductoTopAccumulator acc : map.values().stream().sorted(Comparator.comparing(ProductoTopAccumulator::getUnidadesVendidas).reversed()).limit(limite).toList()) {
                    excelFila(s, r++, null, String.valueOf(rank++), acc.nombre, String.valueOf(acc.unidadesVendidas), "$" + acc.ingresos.setScale(2, java.math.RoundingMode.HALF_UP));
                }
                for (int c = 0; c < 4; c++) s.autoSizeColumn(c);
            }

            if (Boolean.TRUE.equals(req.getIncluirStockBajo())) {
                Sheet s = wb.createSheet("Stock bajo");
                int r = 0;
                r = excelFila(s, r, header, "Producto", "SKU", "Stock");
                for (Producto p : productos.stream().filter(p -> p.getStock() <= umbral).sorted(Comparator.comparingInt(Producto::getStock)).toList()) {
                    excelFila(s, r++, null, p.getNombre(), p.getSku() != null ? p.getSku() : "—", String.valueOf(p.getStock()));
                }
                for (int c = 0; c < 3; c++) s.autoSizeColumn(c);
            }

            if (Boolean.TRUE.equals(req.getIncluirMetadatos())) {
                Sheet s = wb.createSheet("Metadatos");
                excelFila(s, 0, header, "Campo", "Valor");
                excelFila(s, 1, null, "Generado el", LocalDateTime.now().format(fmt));
                excelFila(s, 2, null, "Tienda", "Sofia Couture EC");
                excelFila(s, 3, null, "Total productos", String.valueOf(productos.size()));
                excelFila(s, 4, null, "Total órdenes", String.valueOf(ordenes.size()));
                s.autoSizeColumn(0); s.autoSizeColumn(1);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            wb.write(out);
            String nombre = (req.getNombreReporte() != null && !req.getNombreReporte().isBlank()
                ? req.getNombreReporte().replace(" ", "_") : "reporte") + ".xlsx";
            return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + nombre + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Error generando Excel: " + e.getMessage(), e);
        }
    }

    private int excelFila(Sheet sheet, int rowIdx, CellStyle style, String... values) {
        Row row = sheet.createRow(rowIdx);
        for (int i = 0; i < values.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(values[i] != null ? values[i] : "");
            if (style != null) cell.setCellStyle(style);
        }
        return rowIdx + 1;
    }

    public static class ExportarReporteRequest {
        private String nombreReporte;
        private Boolean incluirResumen;
        private Boolean incluirVentasPeriodo;
        private Boolean incluirOrdenesEstado;
        private Boolean incluirTopProductos;
        private Boolean incluirStockBajo;
        private Boolean incluirMetadatos;
        private Integer limiteTopProductos;
        private Integer umbralStockBajo;

        public String getNombreReporte() { return nombreReporte; }
        public void setNombreReporte(String v) { this.nombreReporte = v; }
        public Boolean getIncluirResumen() { return incluirResumen; }
        public void setIncluirResumen(Boolean v) { this.incluirResumen = v; }
        public Boolean getIncluirVentasPeriodo() { return incluirVentasPeriodo; }
        public void setIncluirVentasPeriodo(Boolean v) { this.incluirVentasPeriodo = v; }
        public Boolean getIncluirOrdenesEstado() { return incluirOrdenesEstado; }
        public void setIncluirOrdenesEstado(Boolean v) { this.incluirOrdenesEstado = v; }
        public Boolean getIncluirTopProductos() { return incluirTopProductos; }
        public void setIncluirTopProductos(Boolean v) { this.incluirTopProductos = v; }
        public Boolean getIncluirStockBajo() { return incluirStockBajo; }
        public void setIncluirStockBajo(Boolean v) { this.incluirStockBajo = v; }
        public Boolean getIncluirMetadatos() { return incluirMetadatos; }
        public void setIncluirMetadatos(Boolean v) { this.incluirMetadatos = v; }
        public Integer getLimiteTopProductos() { return limiteTopProductos; }
        public void setLimiteTopProductos(Integer v) { this.limiteTopProductos = v; }
        public Integer getUmbralStockBajo() { return umbralStockBajo; }
        public void setUmbralStockBajo(Integer v) { this.umbralStockBajo = v; }
    }

    // ── USUARIOS ────────────────────────────────────────────────────

    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<UsuarioDTO>> listarUsuarios(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        List<UsuarioDTO> lista = usuarioRepositoryPort.findAll().stream()
            .map(usuarioRestMapper::toDto)
            .toList();
        return ResponseEntity.ok(paginar(lista, page, size));
    }

    @PostMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> crearUsuario(@RequestBody java.util.Map<String, String> body) {
        Usuario u = new Usuario();
        u.setNombre(body.get("nombre"));
        u.setEmail(body.get("email"));
        u.setPassword(passwordEncoder.encode(body.get("password")));
        u.setRol(body.get("rol") != null ? Rol.valueOf(body.get("rol")) : Rol.CLIENTE);
        u.setActivo(true);
        u.setEmailVerificado(true);
        return ResponseEntity.ok(usuarioRestMapper.toDto(usuarioUseCase.crear(u)));
    }

    @PatchMapping("/usuarios/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> cambiarRol(@PathVariable Long id, @RequestBody java.util.Map<String, String> body) {
        Usuario u = usuarioRepositoryPort.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        u.setRol(Rol.valueOf(body.get("rol")));
        return ResponseEntity.ok(usuarioRestMapper.toDto(usuarioRepositoryPort.save(u)));
    }

    @PatchMapping("/usuarios/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> toggleUsuario(@PathVariable Long id) {
        Usuario u = usuarioRepositoryPort.findById(id)
            .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        u.setActivo(!u.isActivo());
        return ResponseEntity.ok(usuarioRestMapper.toDto(usuarioRepositoryPort.save(u)));
    }

    private static final class ProductoTopAccumulator {
        private final Long id;
        private final String nombre;
        private long unidadesVendidas;
        private BigDecimal ingresos = BigDecimal.ZERO;

        private ProductoTopAccumulator(Long id, String nombre) {
            this.id = id;
            this.nombre = nombre;
        }

        private long getUnidadesVendidas() {
            return unidadesVendidas;
        }
    }
}
