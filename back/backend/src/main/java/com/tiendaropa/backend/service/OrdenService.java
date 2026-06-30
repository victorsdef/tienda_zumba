package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.orden.*;
import com.tiendaropa.backend.entity.*;
import com.tiendaropa.backend.entity.enums.EstadoOrden;
import com.tiendaropa.backend.repository.CarritoRepository;
import com.tiendaropa.backend.repository.OrdenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final CarritoRepository carritoRepository;
    private final CarritoService carritoService;

    @Transactional
    public OrdenDTO crear(Long usuarioId, CrearOrdenRequest req) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        if (carrito.getItems().isEmpty()) throw new IllegalStateException("El carrito está vacío");

        Orden orden = Orden.builder()
            .usuario(carrito.getUsuario()).estado(EstadoOrden.PENDIENTE)
            .calleEnvio(req.getCalleEnvio()).ciudadEnvio(req.getCiudadEnvio())
            .provinciaEnvio(req.getProvinciaEnvio()).codigoPostalEnvio(req.getCodigoPostalEnvio())
            .build();

        BigDecimal total = BigDecimal.ZERO;
        for (ItemCarrito item : carrito.getItems()) {
            BigDecimal subtotal = item.getProducto().getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            total = total.add(subtotal);
            ItemOrden io = ItemOrden.builder()
                .orden(orden).producto(item.getProducto())
                .nombreProducto(item.getProducto().getNombre())
                .cantidad(item.getCantidad()).precio(item.getProducto().getPrecio())
                .talla(item.getTalla()).color(item.getColor()).build();
            orden.getItems().add(io);
        }
        orden.setTotal(total);
        ordenRepository.save(orden);
        carritoService.vaciar(usuarioId);
        return toDTO(orden);
    }

    public Page<OrdenDTO> misOrdenes(Long usuarioId, Pageable pageable) {
        return ordenRepository.findByUsuarioId(usuarioId, pageable).map(this::toDTO);
    }

    public OrdenDTO obtener(Long id) {
        return toDTO(findOrThrow(id));
    }

    public Page<OrdenDTO> listarTodas(Pageable pageable) {
        return ordenRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<OrdenDTO> listarPorEstado(EstadoOrden estado, Pageable pageable) {
        return ordenRepository.findByEstado(estado, pageable).map(this::toDTO);
    }

    @Transactional
    public OrdenDTO cambiarEstado(Long id, CambiarEstadoRequest req) {
        Orden orden = findOrThrow(id);
        orden.setEstado(req.getEstado());
        return toDTO(ordenRepository.save(orden));
    }

    private Orden findOrThrow(Long id) {
        return ordenRepository.findById(id).orElseThrow(() -> new RuntimeException("Orden no encontrada: " + id));
    }

    private OrdenDTO toDTO(Orden o) {
        OrdenDTO dto = new OrdenDTO();
        dto.setId(o.getId()); dto.setUsuarioId(o.getUsuario().getId());
        dto.setUsuarioNombre(o.getUsuario().getNombre());
        dto.setTotal(o.getTotal()); dto.setEstado(o.getEstado());
        dto.setCalleEnvio(o.getCalleEnvio()); dto.setCiudadEnvio(o.getCiudadEnvio());
        dto.setProvinciaEnvio(o.getProvinciaEnvio()); dto.setCodigoPostalEnvio(o.getCodigoPostalEnvio());
        dto.setFechaCreacion(o.getFechaCreacion());
        dto.setItems(o.getItems().stream().map(i -> {
            ItemOrdenDTO idto = new ItemOrdenDTO();
            idto.setId(i.getId());
            if (i.getProducto() != null) {
                idto.setProductoId(i.getProducto().getId());
                idto.setProductoImagen(i.getProducto().getImagenes().isEmpty() ? null : i.getProducto().getImagenes().get(0));
            }
            idto.setNombreProducto(i.getNombreProducto()); idto.setCantidad(i.getCantidad());
            idto.setPrecio(i.getPrecio()); idto.setTalla(i.getTalla()); idto.setColor(i.getColor());
            return idto;
        }).toList());
        return dto;
    }
}
