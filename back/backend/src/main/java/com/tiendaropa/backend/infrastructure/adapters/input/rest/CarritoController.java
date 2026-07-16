package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendaropa.backend.application.ports.output.CarritoRepositoryPort;
import com.tiendaropa.backend.application.ports.output.ProductoRepositoryPort;
import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.model.Carrito;
import com.tiendaropa.backend.domain.model.ItemCarrito;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.domain.model.Usuario;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito.ActualizarItemRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito.AgregarItemRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.carrito.CarritoDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.CarritoRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping({"/api/nueva-arquitectura/carrito", "/api/nueva-arquitectura/carritos", "/api/carritos", "/api/carrito"})
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class CarritoController {

    private final CarritoRepositoryPort carritoRepositoryPort;
    private final UsuarioRepositoryPort usuarioRepositoryPort;
    private final ProductoRepositoryPort productoRepositoryPort;
    private final CarritoRestMapper carritoRestMapper;
    private final ObjectMapper objectMapper;

    @GetMapping
    public CarritoDTO obtenerActual() {
        return carritoRestMapper.toDto(getOrCreateCarritoActual());
    }

    @PostMapping("/items")
    public CarritoDTO agregar(@RequestBody AgregarItemRequest request) {
        if (request.getProductoId() == null || request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debes indicar producto y cantidad validos");
        }

        Carrito carrito = getOrCreateCarritoActual();
        Producto producto = productoRepositoryPort.findById(request.getProductoId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        ItemCarrito existente = carrito.getItems().stream()
            .filter(item -> Objects.equals(item.getProducto().getId(), request.getProductoId())
                && Objects.equals(item.getTalla(), request.getTalla())
                && Objects.equals(item.getColor(), request.getColor()))
            .findFirst()
            .orElse(null);

        int cantidadFinal = request.getCantidad() + (existente != null && existente.getCantidad() != null ? existente.getCantidad() : 0);
        validarStock(producto, request.getColor(), request.getTalla(), cantidadFinal);

        BigDecimal precio = resolverPrecio(producto, request.getColor(), request.getTalla());

        if (existente != null) {
            existente.setCantidad(cantidadFinal);
            existente.setPrecio(precio);
            existente.setSubtotal(precio.multiply(BigDecimal.valueOf(cantidadFinal)));
        } else {
            ItemCarrito item = new ItemCarrito();
            item.setProducto(producto);
            item.setCantidad(request.getCantidad());
            item.setTalla(request.getTalla());
            item.setColor(request.getColor());
            item.setPrecio(precio);
            item.setSubtotal(precio.multiply(BigDecimal.valueOf(request.getCantidad())));
            carrito.getItems().add(item);
        }

        return carritoRestMapper.toDto(carritoRepositoryPort.save(carrito));
    }

    @PutMapping("/items/{itemId}")
    public CarritoDTO actualizar(@PathVariable Long itemId, @RequestBody ActualizarItemRequest request) {
        Carrito carrito = getOrCreateCarritoActual();
        ItemCarrito item = carrito.getItems().stream()
            .filter(current -> Objects.equals(current.getId(), itemId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item no encontrado"));

        if (request.getCantidad() == null || request.getCantidad() <= 0) {
            carrito.getItems().removeIf(current -> Objects.equals(current.getId(), itemId));
            return carritoRestMapper.toDto(carritoRepositoryPort.save(carrito));
        }

        validarStock(item.getProducto(), item.getColor(), item.getTalla(), request.getCantidad());
        BigDecimal precio = resolverPrecio(item.getProducto(), item.getColor(), item.getTalla());
        item.setCantidad(request.getCantidad());
        item.setPrecio(precio);
        item.setSubtotal(precio.multiply(BigDecimal.valueOf(request.getCantidad())));
        return carritoRestMapper.toDto(carritoRepositoryPort.save(carrito));
    }

    @DeleteMapping("/items/{itemId}")
    public CarritoDTO eliminarItem(@PathVariable Long itemId) {
        Carrito carrito = getOrCreateCarritoActual();
        carrito.getItems().removeIf(item -> Objects.equals(item.getId(), itemId));
        return carritoRestMapper.toDto(carritoRepositoryPort.save(carrito));
    }

    private Carrito getOrCreateCarritoActual() {
        Usuario usuario = getUsuarioActual();
        return carritoRepositoryPort.findByUsuarioId(usuario.getId()).orElseGet(() -> {
            Carrito nuevo = new Carrito();
            nuevo.setUsuario(usuario);
            nuevo.setItems(new ArrayList<>());
            return carritoRepositoryPort.save(nuevo);
        });
    }

    private Usuario getUsuarioActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesion");
        }
        return usuarioRepositoryPort.findByEmail(authentication.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    private void validarStock(Producto producto, String color, String talla, int cantidadSolicitada) {
        int disponible = calcularStockDisponible(producto, color, talla);
        if (cantidadSolicitada > disponible) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock insuficiente para la combinacion seleccionada");
        }
    }

    private int calcularStockDisponible(Producto producto, String color, String talla) {
        Map<String, Map<String, Integer>> stockPorColorTalla = parseStockPorColorTalla(producto.getStockPorColorTallaJson());
        if (color != null && talla != null && stockPorColorTalla.containsKey(color)) {
            Integer disponible = stockPorColorTalla.get(color).get(talla);
            if (disponible != null) {
                return disponible;
            }
        }
        if (color != null && producto.getStockPorColor() != null && producto.getStockPorColor().containsKey(color)) {
            return producto.getStockPorColor().get(color);
        }
        return Math.max(producto.getStock(), 0);
    }

    private Map<String, Map<String, Integer>> parseStockPorColorTalla(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(raw, new TypeReference<Map<String, Map<String, Integer>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private Map<String, Map<String, BigDecimal>> parsePrecioPorColorTalla(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(raw, new TypeReference<Map<String, Map<String, BigDecimal>>>() {});
        } catch (Exception ex) {
            return Collections.emptyMap();
        }
    }

    private BigDecimal resolverPrecio(Producto producto, String color, String talla) {
        if (color != null && talla != null) {
            Map<String, Map<String, BigDecimal>> precios = parsePrecioPorColorTalla(producto.getPrecioPorColorTallaJson());
            Map<String, BigDecimal> porTalla = precios.get(color);
            if (porTalla != null) {
                BigDecimal precio = porTalla.get(talla);
                if (precio != null) return precio;
            }
        }
        return producto.getPrecio();
    }
}
