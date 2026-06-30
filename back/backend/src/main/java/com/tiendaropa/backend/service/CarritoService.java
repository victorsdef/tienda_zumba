package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.carrito.*;
import com.tiendaropa.backend.entity.Carrito;
import com.tiendaropa.backend.entity.ItemCarrito;
import com.tiendaropa.backend.entity.Producto;
import com.tiendaropa.backend.repository.CarritoRepository;
import com.tiendaropa.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ProductoRepository productoRepository;

    public CarritoDTO obtener(Long usuarioId) {
        Carrito carrito = getCarritoByUsuario(usuarioId);
        return toDTO(carrito);
    }

    @Transactional
    public CarritoDTO agregar(Long usuarioId, AgregarItemRequest req) {
        Carrito carrito = getCarritoByUsuario(usuarioId);
        Producto producto = productoRepository.findById(req.getProductoId())
            .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        carrito.getItems().stream()
            .filter(i -> i.getProducto().getId().equals(req.getProductoId())
                && equals(i.getTalla(), req.getTalla())
                && equals(i.getColor(), req.getColor()))
            .findFirst()
            .ifPresentOrElse(
                i -> i.setCantidad(i.getCantidad() + req.getCantidad()),
                () -> {
                    ItemCarrito item = ItemCarrito.builder()
                        .carrito(carrito)
                        .producto(producto)
                        .cantidad(req.getCantidad())
                        .talla(req.getTalla())
                        .color(req.getColor())
                        .build();
                    carrito.getItems().add(item);
                }
            );
        return toDTO(carritoRepository.save(carrito));
    }

    @Transactional
    public CarritoDTO actualizar(Long usuarioId, Long itemId, ActualizarItemRequest req) {
        Carrito carrito = getCarritoByUsuario(usuarioId);
        carrito.getItems().stream()
            .filter(i -> i.getId().equals(itemId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Item no encontrado"))
            .setCantidad(req.getCantidad());
        return toDTO(carritoRepository.save(carrito));
    }

    @Transactional
    public CarritoDTO eliminarItem(Long usuarioId, Long itemId) {
        Carrito carrito = getCarritoByUsuario(usuarioId);
        carrito.getItems().removeIf(i -> i.getId().equals(itemId));
        return toDTO(carritoRepository.save(carrito));
    }

    @Transactional
    public void vaciar(Long usuarioId) {
        Carrito carrito = getCarritoByUsuario(usuarioId);
        carrito.getItems().clear();
        carritoRepository.save(carrito);
    }

    private Carrito getCarritoByUsuario(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
    }

    private CarritoDTO toDTO(Carrito carrito) {
        List<ItemCarritoDTO> items = carrito.getItems().stream().map(i -> {
            ItemCarritoDTO dto = new ItemCarritoDTO();
            dto.setId(i.getId());
            dto.setProductoId(i.getProducto().getId());
            dto.setProductoNombre(i.getProducto().getNombre());
            dto.setProductoImagen(i.getProducto().getImagenes().isEmpty() ? null : i.getProducto().getImagenes().get(0));
            dto.setPrecio(i.getProducto().getPrecio());
            dto.setCantidad(i.getCantidad());
            dto.setTalla(i.getTalla());
            dto.setColor(i.getColor());
            return dto;
        }).toList();

        BigDecimal total = items.stream()
            .map(i -> i.getPrecio().multiply(BigDecimal.valueOf(i.getCantidad())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        CarritoDTO dto = new CarritoDTO();
        dto.setId(carrito.getId());
        dto.setItems(items);
        dto.setTotal(total);
        dto.setCantidadItems(items.stream().mapToInt(ItemCarritoDTO::getCantidad).sum());
        return dto;
    }

    private boolean equals(String a, String b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}
