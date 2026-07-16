package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.ConfiguracionUseCase;
import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import com.tiendaropa.backend.application.ports.input.OrdenPdfUseCase;
import com.tiendaropa.backend.application.ports.output.CarritoRepositoryPort;
import com.tiendaropa.backend.application.ports.output.DireccionRepositoryPort;
import com.tiendaropa.backend.application.ports.output.OrdenRepositoryPort;
import com.tiendaropa.backend.application.ports.output.ProductoRepositoryPort;
import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.domain.model.Direccion;
import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.domain.model.OrdenItem;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.common.PageResponse;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.ActualizarGuiaOrdenRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.CambiarEstadoRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.CrearOrdenRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.OrdenInvitadoRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.OrdenDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.OrdenRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping({"/api/nueva-arquitectura/orden", "/api/nueva-arquitectura/ordenes", "/api/orden", "/api/ordenes"})
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenUseCase ordenUseCase;
    private final OrdenPdfUseCase ordenPdfUseCase;
    private final OrdenRepositoryPort ordenRepositoryPort;
    private final CarritoRepositoryPort carritoRepositoryPort;
    private final UsuarioRepositoryPort usuarioRepositoryPort;
    private final ProductoRepositoryPort productoRepositoryPort;
    private final DireccionRepositoryPort direccionRepositoryPort;
    private final ConfiguracionUseCase configuracionUseCase;
    private final EmailUseCase emailUseCase;
    private final ObjectMapper objectMapper;
    private final OrdenRestMapper ordenRestMapper;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrdenDTO> crear(@RequestBody CrearOrdenRequest orden) {
        Usuario usuario = getUsuarioActual();
        Carrito carrito = carritoRepositoryPort.findByUsuarioId(usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Carrito no encontrado"));
        if (carrito.getItems() == null || carrito.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito esta vacio");
        }

        String tipoEntrega = normalizarTipoEntrega(orden.getTipoEntrega(), orden.isConEnvio());
        Direccion direccion = orden.getDireccionId() != null
            ? direccionRepositoryPort.findById(orden.getDireccionId()).orElse(null)
            : null;

        String nombreEnvio = direccion != null ? direccion.getNombreCompleto() : orden.getNombreEnvio();
        String celularEnvio = direccion != null ? direccion.getCelular() : orden.getCelularEnvio();
        String provinciaEnvio = direccion != null ? direccion.getProvincia() : orden.getProvinciaEnvio();
        String cantonEnvio = direccion != null ? direccion.getCanton() : orden.getCantonEnvio();
        String ciudadEnvio = direccion != null ? direccion.getCiudad() : orden.getCiudadEnvio();
        String calleEnvio = direccion != null ? direccion.getDireccion() : orden.getCalleEnvio();

        validarDireccionSegunEntrega(tipoEntrega, ciudadEnvio);

        Orden nueva = new Orden();
        nueva.setCodigoOrden(generarCodigoOrden());
        nueva.setUsuarioId(usuario.getId());
        nueva.setEstado("PENDIENTE");
        nueva.setNombreEnvio("RETIRO".equals(tipoEntrega) ? null : nombreEnvio);
        nueva.setCelularEnvio("RETIRO".equals(tipoEntrega) ? null : celularEnvio);
        nueva.setProvinciaEnvio("RETIRO".equals(tipoEntrega) ? null : provinciaEnvio);
        nueva.setCantonEnvio("RETIRO".equals(tipoEntrega) ? null : cantonEnvio);
        nueva.setCiudadEnvio("RETIRO".equals(tipoEntrega) ? null : ciudadEnvio);
        nueva.setCalleEnvio("RETIRO".equals(tipoEntrega) ? null : calleEnvio);
        nueva.setTipoEntrega(tipoEntrega);
        nueva.setCostoEnvio(resolverCostoEnvio(tipoEntrega));
        nueva.setItems(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;
        for (var itemCarrito : carrito.getItems()) {
            Producto producto = itemCarrito.getProducto();
            BigDecimal precio = resolverPrecio(producto, itemCarrito.getColor(), itemCarrito.getTalla());
            int cantidad = itemCarrito.getCantidad() != null ? itemCarrito.getCantidad() : 0;
            if (cantidad <= 0) continue;
            validarStock(producto, itemCarrito.getColor(), itemCarrito.getTalla(), cantidad);

            OrdenItem item = new OrdenItem();
            item.setProductoId(producto.getId());
            item.setNombreProducto(producto.getNombre());
            item.setProductoImagen(resolverImagen(producto, itemCarrito.getColor()));
            item.setCantidad(cantidad);
            item.setPrecioUnitario(precio);
            item.setSubtotal(precio.multiply(BigDecimal.valueOf(cantidad)));
            item.setTalla(itemCarrito.getTalla());
            item.setColor(itemCarrito.getColor());
            nueva.getItems().add(item);
            total = total.add(item.getSubtotal());
        }
        total = total.add(nueva.getCostoEnvio() != null ? nueva.getCostoEnvio() : BigDecimal.ZERO);
        nueva.setTotal(total);

        Orden creada = ordenUseCase.crearOrden(nueva);
        carrito.getItems().clear();
        carritoRepositoryPort.save(carrito);
        emailUseCase.enviarConfirmacionOrden(usuario.getEmail(), usuario.getNombre(), creada.getCodigoOrden(), creada.getTotal().toPlainString());
        return ResponseEntity.ok(toDto(creada));
    }

    @PostMapping("/invitado")
    public ResponseEntity<OrdenDTO> crearInvitado(@RequestBody OrdenInvitadoRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito no puede estar vacio");
        }

        String tipoEntrega = normalizarTipoEntrega(request.getTipoEntrega(), request.isConEnvio());
        validarDireccionSegunEntrega(tipoEntrega, request.getCiudad());

        Orden nueva = new Orden();
        nueva.setCodigoOrden(generarCodigoOrden());
        nueva.setEstado("PENDIENTE");
        nueva.setNombreInvitado(request.getNombre());
        nueva.setEmailInvitado(request.getEmail());
        nueva.setNombreEnvio("RETIRO".equals(tipoEntrega) ? null : request.getNombreCompleto());
        nueva.setCelularEnvio("RETIRO".equals(tipoEntrega) ? null : request.getCelular());
        nueva.setProvinciaEnvio("RETIRO".equals(tipoEntrega) ? null : request.getProvincia());
        nueva.setCantonEnvio("RETIRO".equals(tipoEntrega) ? null : request.getCanton());
        nueva.setCiudadEnvio("RETIRO".equals(tipoEntrega) ? null : request.getCiudad());
        nueva.setCalleEnvio("RETIRO".equals(tipoEntrega) ? null : request.getDireccion());
        nueva.setTipoEntrega(tipoEntrega);
        nueva.setCostoEnvio(resolverCostoEnvio(tipoEntrega));
        nueva.setItems(new ArrayList<>());

        BigDecimal total = BigDecimal.ZERO;
        for (OrdenInvitadoRequest.ItemInvitadoRequest reqItem : request.getItems()) {
            Producto producto = productoRepositoryPort.findById(reqItem.getProductoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado: " + reqItem.getProductoId()));
            int cantidad = reqItem.getCantidad() == null || reqItem.getCantidad() <= 0 ? 1 : reqItem.getCantidad();
            validarStock(producto, reqItem.getColor(), reqItem.getTalla(), cantidad);

            OrdenItem item = new OrdenItem();
            item.setProductoId(producto.getId());
            item.setNombreProducto(producto.getNombre());
            item.setProductoImagen(resolverImagen(producto, reqItem.getColor()));
            item.setCantidad(cantidad);
            BigDecimal precio = resolverPrecio(producto, reqItem.getColor(), reqItem.getTalla());
            item.setPrecioUnitario(precio);
            item.setSubtotal(precio.multiply(BigDecimal.valueOf(cantidad)));
            item.setTalla(reqItem.getTalla());
            item.setColor(reqItem.getColor());
            nueva.getItems().add(item);
            total = total.add(item.getSubtotal());
        }
        total = total.add(nueva.getCostoEnvio() != null ? nueva.getCostoEnvio() : BigDecimal.ZERO);
        nueva.setTotal(total);

        Orden creada = ordenUseCase.crearOrden(nueva);
        emailUseCase.enviarConfirmacionOrden(request.getEmail(), request.getNombre(), creada.getCodigoOrden(), creada.getTotal().toPlainString());
        return ResponseEntity.ok(toDto(creada));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<OrdenDTO>> listarMisOrdenes(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Usuario usuario = getUsuarioActual();
        List<OrdenDTO> ordenes = ordenUseCase.listarPorUsuarioId(usuario.getId()).stream()
            .sorted((a, b) -> {
                if (b.getFechaCreacion() == null) return -1;
                if (a.getFechaCreacion() == null) return 1;
                return b.getFechaCreacion().compareTo(a.getFechaCreacion());
            })
            .map(this::toDto)
            .toList();
        return ResponseEntity.ok(paginar(ordenes, page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrdenDTO> obtener(@PathVariable Long id) {
        Usuario usuario = getUsuarioActual();
        Orden orden = ordenUseCase.obtenerPorId(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));
        validarOrdenPropiaOAdmin(usuario, orden);
        return ResponseEntity.ok(toDto(orden));
    }

    @GetMapping("/codigo/{codigoOrden}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrdenDTO> obtenerPorCodigo(@PathVariable String codigoOrden) {
        Usuario usuario = getUsuarioActual();
        Orden orden = ordenRepositoryPort.findByCodigoOrden(codigoOrden.trim().toUpperCase(Locale.ROOT))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));
        validarOrdenPropiaOAdmin(usuario, orden);
        return ResponseEntity.ok(toDto(orden));
    }

    @GetMapping("/codigo/{codigoOrden}/pdf")
    public ResponseEntity<byte[]> descargarPedidoPdf(
        @PathVariable String codigoOrden,
        org.springframework.security.core.Authentication authentication
    ) {
        Orden orden = ordenRepositoryPort.findByCodigoOrden(codigoOrden.trim().toUpperCase(Locale.ROOT))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));

        // Si hay usuario autenticado, validar que sea su orden o admin
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getName())) {
            Usuario usuario = usuarioRepositoryPort.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
            validarOrdenPropiaOAdmin(usuario, orden);
        }
        // Invitados: solo con el código ya tienen acceso (el código actúa como token)

        byte[] pdf = ordenPdfUseCase.generarFacturaPdf(orden.getId());
        String nombre = orden.getCodigoOrden() != null && !orden.getCodigoOrden().isBlank()
            ? orden.getCodigoOrden().trim()
            : "pedido-" + orden.getId();

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + nombre + ".pdf\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<OrdenDTO> cancelar(@PathVariable Long id) {
        Usuario usuario = getUsuarioActual();
        Orden orden = ordenUseCase.obtenerPorId(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));
        validarOrdenPropiaOAdmin(usuario, orden);
        if (!"PENDIENTE".equalsIgnoreCase(orden.getEstado())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se pueden cancelar ordenes pendientes");
        }
        orden.setEstado("CANCELADO");
        Orden actualizada = ordenUseCase.actualizar(orden);
        emailUseCase.enviarPagoCancelado(usuario.getEmail(), usuario.getNombre(), actualizada.getCodigoOrden());
        return ResponseEntity.ok(toDto(actualizada));
    }

    private Usuario getUsuarioActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesion");
        }
        return usuarioRepositoryPort.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    private void validarOrdenPropiaOAdmin(Usuario usuario, Orden orden) {
        boolean esAdmin = usuario.getRol() != null && "ADMIN".equalsIgnoreCase(usuario.getRol().name());
        boolean esPropia = orden.getUsuarioId() != null && Objects.equals(orden.getUsuarioId(), usuario.getId());
        if (!esAdmin && !esPropia) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }
    }

    private BigDecimal resolverCostoEnvio(String tipoEntrega) {
        return switch (tipoEntrega) {
            case "DOMICILIO" -> configuracionUseCase.getDecimal("costo_envio", new BigDecimal("6.00"));
            case "CUENCA" -> configuracionUseCase.getDecimal("costo_envio_cuenca", new BigDecimal("3.00"));
            default -> BigDecimal.ZERO;
        };
    }

    private String normalizarTipoEntrega(String tipoEntrega, boolean conEnvio) {
        if (tipoEntrega == null || tipoEntrega.isBlank()) {
            return conEnvio ? "DOMICILIO" : "RETIRO";
        }
        String normalizado = tipoEntrega.trim().toUpperCase(Locale.ROOT);
        return switch (normalizado) {
            case "DOMICILIO", "CUENCA", "RETIRO" -> normalizado;
            default -> conEnvio ? "DOMICILIO" : "RETIRO";
        };
    }

    private void validarDireccionSegunEntrega(String tipoEntrega, String ciudadEnvio) {
        if ("RETIRO".equals(tipoEntrega)) {
            return;
        }
        if (ciudadEnvio == null || ciudadEnvio.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar una ciudad de entrega");
        }
        if ("CUENCA".equals(tipoEntrega) && !"CUENCA".equalsIgnoreCase(ciudadEnvio.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El envio dentro de Cuenca solo aplica para direcciones en Cuenca");
        }
    }

    private String generarCodigoOrden() {
        String fecha = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        for (int intentos = 0; intentos < 50; intentos++) {
            String codigo = "ORD-" + fecha + "-" + randomAlfanumerico(4);
            if (!ordenRepositoryPort.existsByCodigoOrden(codigo)) {
                return codigo;
            }
        }
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo generar un codigo de orden unico");
    }

    private String randomAlfanumerico(int longitud) {
        final String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder(longitud);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < longitud; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String resolverImagen(Producto producto, String color) {
        if (color != null && producto.getImagenesPorColorJson() != null && !producto.getImagenesPorColorJson().isBlank()) {
            try {
                Map<String, java.util.List<String>> mapa = objectMapper.readValue(
                    producto.getImagenesPorColorJson(),
                    new TypeReference<Map<String, java.util.List<String>>>() {}
                );
                java.util.List<String> imgs = mapa.get(color);
                if (imgs != null && !imgs.isEmpty()) return imgs.get(0);
            } catch (Exception ignored) {}
        }
        return producto.getImagenes() != null && !producto.getImagenes().isEmpty() ? producto.getImagenes().get(0) : null;
    }

    private void validarStock(Producto producto, String color, String talla, int cantidad) {
        int disponible;
        if (color != null && talla != null && producto.getStockPorColorTallaJson() != null && !producto.getStockPorColorTallaJson().isBlank()) {
            try {
                Map<String, Map<String, Integer>> mapa = objectMapper.readValue(
                    producto.getStockPorColorTallaJson(),
                    new TypeReference<Map<String, Map<String, Integer>>>() {}
                );
                disponible = mapa.getOrDefault(color, Map.of()).getOrDefault(talla, 0);
            } catch (Exception e) {
                disponible = producto.getStock();
            }
        } else {
            disponible = producto.getStock();
        }
        if (disponible < cantidad) {
            String variante = (color != null && talla != null) ? " (" + color + " / " + talla + ")" : "";
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Sin stock suficiente para \"" + producto.getNombre() + "\"" + variante +
                ". Disponible: " + disponible + ", solicitado: " + cantidad);
        }
    }

    private BigDecimal resolverPrecio(Producto producto, String color, String talla) {
        if (color != null && talla != null && producto.getPrecioPorColorTallaJson() != null) {
            try {
                Map<String, Map<String, BigDecimal>> precios = objectMapper.readValue(
                    producto.getPrecioPorColorTallaJson(),
                    new TypeReference<Map<String, Map<String, BigDecimal>>>() {}
                );
                Map<String, BigDecimal> porTalla = precios.get(color);
                if (porTalla != null) {
                    BigDecimal precio = porTalla.get(talla);
                    if (precio != null) return precio;
                }
            } catch (Exception ignored) {}
        }
        return producto.getPrecio();
    }

    private OrdenDTO toDto(Orden orden) {
        OrdenDTO dto = ordenRestMapper.toDto(orden);
        if (orden.getUsuarioId() != null && (dto.getUsuarioNombre() == null || dto.getUsuarioNombre().isBlank())) {
            usuarioRepositoryPort.findById(orden.getUsuarioId()).ifPresent(usuario -> dto.setUsuarioNombre(usuario.getNombre()));
        }
        return dto;
    }

    private <T> PageResponse<T> paginar(List<T> source, int page, int size) {
        int safeSize = Math.max(size, 1);
        int safePage = Math.max(page, 0);
        int fromIndex = Math.min(safePage * safeSize, source.size());
        int toIndex = Math.min(fromIndex + safeSize, source.size());
        int totalPages = source.isEmpty() ? 0 : (int) Math.ceil((double) source.size() / safeSize);
        return new PageResponse<>(source.subList(fromIndex, toIndex), totalPages, source.size(), safePage, safeSize);
    }
}

