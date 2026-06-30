package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.admin.*;
import com.tiendaropa.backend.dto.categoria.CategoriaDTO;
import com.tiendaropa.backend.dto.categoria.CategoriaRequest;
import com.tiendaropa.backend.dto.orden.CambiarEstadoRequest;
import com.tiendaropa.backend.dto.orden.OrdenDTO;
import com.tiendaropa.backend.dto.producto.ProductoDTO;
import com.tiendaropa.backend.dto.producto.ProductoRequest;
import com.tiendaropa.backend.dto.usuario.UsuarioDTO;
import com.tiendaropa.backend.entity.enums.EstadoOrden;
import com.tiendaropa.backend.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductoService productoService;
    private final CategoriaService categoriaService;
    private final OrdenService ordenService;
    private final UsuarioService usuarioService;
    private final AdminService adminService;

    // ===================== DASHBOARD =====================

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ===================== PRODUCTOS =====================

    @GetMapping("/productos")
    public ResponseEntity<Page<ProductoDTO>> listarProductos(Pageable pageable) {
        return ResponseEntity.ok(productoService.listarAdmin(pageable));
    }

    @PostMapping("/productos")
    public ResponseEntity<ProductoDTO> crearProducto(@Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.ok(productoService.crear(req));
    }

    @PutMapping("/productos/{id}")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id, @Valid @RequestBody ProductoRequest req) {
        return ResponseEntity.ok(productoService.actualizar(id, req));
    }

    @PatchMapping("/productos/{id}/stock")
    public ResponseEntity<ProductoDTO> actualizarStock(
        @PathVariable Long id,
        @Valid @RequestBody ActualizarStockRequest req
    ) {
        return ResponseEntity.ok(productoService.actualizarStock(id, req.getStock()));
    }

    @PatchMapping("/productos/{id}/toggle")
    public ResponseEntity<ProductoDTO> toggleActivo(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.toggleActivo(id));
    }

    @DeleteMapping("/productos/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ===================== CATEGORIAS =====================

    @PostMapping("/categorias")
    public ResponseEntity<CategoriaDTO> crearCategoria(@Valid @RequestBody CategoriaRequest req) {
        return ResponseEntity.ok(categoriaService.crear(req));
    }

    @PutMapping("/categorias/{id}")
    public ResponseEntity<CategoriaDTO> actualizarCategoria(@PathVariable Long id, @Valid @RequestBody CategoriaRequest req) {
        return ResponseEntity.ok(categoriaService.actualizar(id, req));
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ===================== ORDENES =====================

    @GetMapping("/ordenes")
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
    public ResponseEntity<OrdenDTO> obtenerOrden(@PathVariable Long id) {
        return ResponseEntity.ok(ordenService.obtener(id));
    }

    @PatchMapping("/ordenes/{id}/estado")
    public ResponseEntity<OrdenDTO> cambiarEstado(@PathVariable Long id, @Valid @RequestBody CambiarEstadoRequest req) {
        return ResponseEntity.ok(ordenService.cambiarEstado(id, req));
    }

    // ===================== USUARIOS =====================

    @GetMapping("/usuarios")
    public ResponseEntity<Page<UsuarioDTO>> listarUsuarios(Pageable pageable) {
        return ResponseEntity.ok(usuarioService.listarTodosPaginado(pageable));
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioDTO> obtenerUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    @PatchMapping("/usuarios/{id}/rol")
    public ResponseEntity<UsuarioDTO> cambiarRol(@PathVariable Long id, @Valid @RequestBody CambiarRolRequest req) {
        return ResponseEntity.ok(usuarioService.cambiarRol(id, req.getRol()));
    }
}
