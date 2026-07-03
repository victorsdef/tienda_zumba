package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.admin.*;
import com.tiendaropa.backend.dto.orden.ActualizarGuiaOrdenRequest;
import com.tiendaropa.backend.dto.categoria.CategoriaDTO;
import com.tiendaropa.backend.dto.categoria.CategoriaRequest;
import com.tiendaropa.backend.dto.orden.CambiarEstadoRequest;
import com.tiendaropa.backend.dto.orden.OrdenDTO;
import com.tiendaropa.backend.dto.producto.ProductoDTO;
import com.tiendaropa.backend.dto.producto.ProductoRequest;
import com.tiendaropa.backend.dto.usuario.CrearUsuarioAdminRequest;
import com.tiendaropa.backend.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.entity.enums.EstadoOrden;
import com.tiendaropa.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ProductoService productoService;
    private final CategoriaService categoriaService;
    private final OrdenService ordenService;
    private final UsuarioService usuarioService;
    private final AdminService adminService;
    private final AdminReportExportService adminReportExportService;

    // ===================== DASHBOARD =====================

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR','BODEGUERO')")
    public ResponseEntity<DashboardStatsDTO> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @PostMapping("/reportes/exportar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportarReporte(@RequestBody ExportarReporteRequest req) {
        String nombre = (req.getNombreReporte() != null && !req.getNombreReporte().isBlank())
            ? req.getNombreReporte().trim().replaceAll("[^a-zA-Z0-9-_]+", "_")
            : "reporte_sofia_couture";
        byte[] archivo = adminReportExportService.exportarReporte(req);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + ".xlsx\"")
            .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
            .body(archivo);
    }

    // ===================== PRODUCTOS =====================

    @GetMapping("/productos")
    @PreAuthorize("hasAnyRole('ADMIN','BODEGUERO')")
    public ResponseEntity<Page<ProductoDTO>> listarProductos(Pageable pageable) {
        return ResponseEntity.ok(productoService.listarAdmin(pageable));
    }

    @PostMapping("/productos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> crearProducto(@Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.ok(productoService.crear(req));
    }

    @PutMapping("/productos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.ok(productoService.actualizar(id, req));
    }

    @PatchMapping("/productos/{id}/stock")
    @PreAuthorize("hasAnyRole('ADMIN','BODEGUERO')")
    public ResponseEntity<ProductoDTO> actualizarStock(
        @PathVariable Long id,
        @Valid @RequestBody ActualizarStockRequest req
    ) {
        return ResponseEntity.ok(productoService.actualizarStock(id, req.getStock()));
    }

    @PatchMapping("/productos/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> toggleActivo(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.toggleActivo(id));
    }

    @DeleteMapping("/productos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ===================== CATEGORIAS =====================

    @GetMapping("/categorias")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<CategoriaDTO>> listarCategorias() {
        return ResponseEntity.ok(categoriaService.listarTodas());
    }

    @PostMapping("/categorias")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaDTO> crearCategoria(@Valid @RequestBody CategoriaRequest req) {
        return ResponseEntity.ok(categoriaService.crear(req));
    }

    @PutMapping("/categorias/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaDTO> actualizarCategoria(@PathVariable Long id, @Valid @RequestBody CategoriaRequest req) {
        return ResponseEntity.ok(categoriaService.actualizar(id, req));
    }

    @PatchMapping("/categorias/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaDTO> toggleCategoria(@PathVariable Long id) {
        return ResponseEntity.ok(categoriaService.toggleActivo(id));
    }

    @DeleteMapping("/categorias/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ===================== ORDENES =====================

    @GetMapping("/ordenes")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<Page<OrdenDTO>> listarOrdenes(
        @RequestParam(required = false) EstadoOrden estado,
        Pageable pageable
    ) {
        return ResponseEntity.ok(estado != null
            ? ordenService.listarPorEstado(estado, pageable)
            : ordenService.listarTodas(pageable)
        );
    }

    @GetMapping("/ordenes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<OrdenDTO> obtenerOrden(@PathVariable Long id) {
        return ResponseEntity.ok(ordenService.obtener(id));
    }

    @PatchMapping("/ordenes/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<OrdenDTO> cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest req) {
        return ResponseEntity.ok(ordenService.cambiarEstado(id, req));
    }

    @PatchMapping("/ordenes/{id}/guia")
    @PreAuthorize("hasAnyRole('ADMIN','VENDEDOR')")
    public ResponseEntity<OrdenDTO> actualizarGuia(@PathVariable Long id, @RequestBody ActualizarGuiaOrdenRequest req) {
        return ResponseEntity.ok(ordenService.actualizarGuia(id, req));
    }

    // ===================== USUARIOS =====================

    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<UsuarioDTO>> listarUsuarios(Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listarTodosPaginado(pageable));
    }

    @GetMapping("/usuarios/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> obtenerUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PostMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> crearUsuario(@Valid @RequestBody CrearUsuarioAdminRequest req) {
        return ResponseEntity.ok(usuarioService.crearDesdeAdmin(req));
    }

    @PatchMapping("/usuarios/{id}/rol")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> cambiarRol(@PathVariable Long id, @Valid @RequestBody CambiarRolRequest req) {
        return ResponseEntity.ok(usuarioService.cambiarRol(id, req.getRol()));
    }

    @PatchMapping("/usuarios/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioDTO> toggleUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.toggleActivo(id));
    }
}
