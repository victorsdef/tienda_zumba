package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.orden.*;
import com.tiendaropa.backend.entity.*;
import com.tiendaropa.backend.entity.enums.EstadoOrden;
import com.tiendaropa.backend.repository.CarritoRepository;
import com.tiendaropa.backend.repository.DireccionRepository;
import com.tiendaropa.backend.repository.OrdenRepository;
import com.tiendaropa.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OrdenService {
    private static final String TIPO_DOMICILIO = "DOMICILIO";
    private static final String TIPO_CUENCA = "CUENCA";
    private static final String TIPO_RETIRO = "RETIRO";

    private final OrdenRepository ordenRepository;
    private final CarritoRepository carritoRepository;
    private final CarritoService carritoService;
    private final EmailService emailService;
    private final ProductoRepository productoRepository;
    private final ProductoService productoService;
    private final DireccionRepository direccionRepository;
    private final ConfiguracionService configuracionService;

    @Transactional
    public OrdenDTO crear(Long usuarioId, CrearOrdenRequest req) {
        Carrito carrito = carritoRepository.findByUsuarioId(usuarioId)
            .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
        if (carrito.getItems().isEmpty()) throw new IllegalStateException("El carrito está vacío");

        String tipoEntrega = normalizarTipoEntrega(req.getTipoEntrega(), req.isConEnvio());

        // Resolver dirección
        String nombreEnvio = null;
        String celularEnvio = null;
        String provinciaEnvio = null;
        String cantonEnvio = null;
        String ciudadEnvio = null;
        String calleEnvio = null;

        if (!TIPO_RETIRO.equals(tipoEntrega)) {
            nombreEnvio = req.getNombreEnvio();
            celularEnvio = req.getCelularEnvio();
            provinciaEnvio = req.getProvinciaEnvio();
            cantonEnvio = req.getCantonEnvio();
            ciudadEnvio = req.getCiudadEnvio();
            calleEnvio = req.getCalleEnvio();

            if (req.getDireccionId() != null) {
                Direccion dir = direccionRepository.findById(req.getDireccionId())
                    .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));
                nombreEnvio = dir.getNombreCompleto();
                celularEnvio = dir.getCelular();
                provinciaEnvio = dir.getProvincia();
                cantonEnvio = dir.getCanton();
                ciudadEnvio = dir.getCiudad();
                calleEnvio = dir.getDireccion();
            }
            validarDireccionSegunEntrega(tipoEntrega, ciudadEnvio);
        }

        BigDecimal costoEnvio = resolverCostoEnvio(tipoEntrega);

        Orden orden = Orden.builder()
            .codigoOrden(generarCodigoOrden())
            .usuario(carrito.getUsuario()).estado(EstadoOrden.PENDIENTE)
            .nombreEnvio(nombreEnvio).celularEnvio(celularEnvio)
            .provinciaEnvio(provinciaEnvio).cantonEnvio(cantonEnvio)
            .ciudadEnvio(ciudadEnvio).calleEnvio(calleEnvio)
            .tipoEntrega(tipoEntrega)
            .costoEnvio(costoEnvio)
            .build();

        BigDecimal total = BigDecimal.ZERO;
        for (ItemCarrito item : carrito.getItems()) {
            int disponible = productoService.getStockDisponible(item.getProducto(), item.getColor(), item.getTalla());
            if (item.getCantidad() > disponible) {
                throw new IllegalStateException("Stock insuficiente para " + item.getProducto().getNombre());
            }
            BigDecimal subtotal = item.getProducto().getPrecio().multiply(BigDecimal.valueOf(item.getCantidad()));
            total = total.add(subtotal);
            ItemOrden io = ItemOrden.builder()
                .orden(orden).producto(item.getProducto())
                .nombreProducto(item.getProducto().getNombre())
                .cantidad(item.getCantidad()).precio(item.getProducto().getPrecio())
                .talla(item.getTalla()).color(item.getColor()).build();
            orden.getItems().add(io);
        }
        total = total.add(costoEnvio);
        orden.setTotal(total);
        ordenRepository.save(orden);
        carritoService.vaciar(usuarioId);

        Usuario u = carrito.getUsuario();
        emailService.enviarConfirmacionOrden(u.getEmail(), u.getNombre(), orden.getCodigoOrden(), total.toPlainString());

        return toDTO(orden);
    }

    @Transactional
    public OrdenDTO crearInvitado(OrdenInvitadoRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalStateException("El carrito no puede estar vacío");
        }

        String tipoEntrega = normalizarTipoEntrega(req.getTipoEntrega(), req.isConEnvio());
        validarDireccionSegunEntrega(tipoEntrega, req.getCiudad());
        BigDecimal costoEnvio = resolverCostoEnvio(tipoEntrega);

        String nombreEnvio = TIPO_RETIRO.equals(tipoEntrega) ? null : req.getNombreCompleto();
        String celularEnvio = TIPO_RETIRO.equals(tipoEntrega) ? null : req.getCelular();
        String provinciaEnvio = TIPO_RETIRO.equals(tipoEntrega) ? null : req.getProvincia();
        String cantonEnvio = TIPO_RETIRO.equals(tipoEntrega) ? null : req.getCanton();
        String ciudadEnvio = TIPO_RETIRO.equals(tipoEntrega) ? null : req.getCiudad();
        String calleEnvio = TIPO_RETIRO.equals(tipoEntrega) ? null : req.getDireccion();

        Orden orden = Orden.builder()
            .codigoOrden(generarCodigoOrden())
            .estado(EstadoOrden.PENDIENTE)
            .nombreInvitado(req.getNombre())
            .emailInvitado(req.getEmail())
            .nombreEnvio(nombreEnvio)
            .celularEnvio(celularEnvio)
            .provinciaEnvio(provinciaEnvio)
            .cantonEnvio(cantonEnvio)
            .ciudadEnvio(ciudadEnvio)
            .calleEnvio(calleEnvio)
            .tipoEntrega(tipoEntrega)
            .costoEnvio(costoEnvio)
            .build();

        BigDecimal total = BigDecimal.ZERO;
        for (OrdenInvitadoRequest.ItemInvitadoRequest itemReq : req.getItems()) {
            Producto producto = productoRepository.findById(itemReq.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemReq.getProductoId()));
            int cantidad = itemReq.getCantidad() != null ? itemReq.getCantidad() : 1;
            int disponible = productoService.getStockDisponible(producto, itemReq.getColor(), itemReq.getTalla());
            if (cantidad > disponible) {
                throw new IllegalStateException("Stock insuficiente para " + producto.getNombre());
            }
            BigDecimal subtotal = producto.getPrecio().multiply(BigDecimal.valueOf(cantidad));
            total = total.add(subtotal);
            ItemOrden io = ItemOrden.builder()
                .orden(orden).producto(producto)
                .nombreProducto(producto.getNombre())
                .cantidad(cantidad).precio(producto.getPrecio())
                .talla(itemReq.getTalla()).color(itemReq.getColor()).build();
            orden.getItems().add(io);
        }
        total = total.add(costoEnvio);
        orden.setTotal(total);
        ordenRepository.save(orden);

        emailService.enviarConfirmacionOrden(req.getEmail(), req.getNombre(), orden.getCodigoOrden(), total.toPlainString());

        return toDTO(orden);
    }

    @Transactional
    public void generarCodigosOrdenesExistentes() {
        ordenRepository.findAll().forEach(orden -> {
            if (orden.getCodigoOrden() == null || orden.getCodigoOrden().isBlank()) {
                orden.setCodigoOrden(generarCodigoOrden());
                ordenRepository.save(orden);
            }
        });
    }

    public Page<OrdenDTO> misOrdenes(Long usuarioId, Pageable pageable) {
        return ordenRepository.findByUsuarioId(usuarioId, pageable).map(this::toDTO);
    }

    public OrdenDTO obtener(Long id) {
        return toDTO(findOrThrow(id));
    }

    public OrdenDTO obtenerPorCodigo(String codigoOrden) {
        return toDTO(findByCodigoOrThrow(codigoOrden));
    }

    @Transactional
    public OrdenDTO cancelarPorUsuario(Long ordenId, Long usuarioId) {
        Orden orden = findOrThrow(ordenId);
        if (orden.getUsuario() == null || !orden.getUsuario().getId().equals(usuarioId))
            throw new RuntimeException("No autorizado");
        if (orden.getEstado() != EstadoOrden.PENDIENTE)
            throw new IllegalStateException("Solo se pueden cancelar órdenes pendientes");
        orden.setEstado(EstadoOrden.CANCELADO);
        return toDTO(ordenRepository.save(orden));
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
        if (req.getNumeroGuia() != null && !req.getNumeroGuia().isBlank()) {
            orden.setNumeroGuia(req.getNumeroGuia());
        }
        OrdenDTO dto = toDTO(ordenRepository.save(orden));

        String email = orden.getUsuario() != null
            ? orden.getUsuario().getEmail()
            : orden.getEmailInvitado();
        String nombre = orden.getUsuario() != null
            ? orden.getUsuario().getNombre()
            : orden.getNombreInvitado();

        if (req.getEstado() == EstadoOrden.PAGADO) {
            orden.getItems().forEach(item -> {
                if (item.getProducto() == null) return;
                productoRepository.findById(item.getProducto().getId()).ifPresent(p -> {
                    productoService.descontarStock(p, item.getColor(), item.getTalla(), item.getCantidad());
                    productoRepository.save(p);
                });
            });
        }

        if (email != null) {
            switch (req.getEstado()) {
                case CANCELADO      -> emailService.enviarPagoCancelado(email, nombre, orden.getCodigoOrden());
                case EN_PREPARACION -> emailService.enviarEnPreparacion(email, nombre, orden.getCodigoOrden());
                case ENVIADO        -> emailService.enviarEnviado(email, nombre, orden.getCodigoOrden(), orden.getNumeroGuia());
                case ENTREGADO      -> emailService.enviarEntregado(email, nombre, orden.getCodigoOrden());
                default -> {}
            }
        }
        return dto;
    }

    @Transactional
    public OrdenDTO actualizarGuia(Long id, ActualizarGuiaOrdenRequest req) {
        Orden orden = findOrThrow(id);
        if (orden.getEstado() != EstadoOrden.ENVIADO && orden.getEstado() != EstadoOrden.ENTREGADO) {
            throw new IllegalStateException("Solo se puede cargar la guia cuando la orden ya fue enviada");
        }
        if (req.getNumeroGuia() != null && !req.getNumeroGuia().isBlank()) {
            orden.setNumeroGuia(req.getNumeroGuia().trim());
        }
        if (req.getGuiaImagenUrl() != null && !req.getGuiaImagenUrl().isBlank()) {
            orden.setGuiaImagenUrl(req.getGuiaImagenUrl().trim());
        }
        return toDTO(ordenRepository.save(orden));
    }

    private String generarCodigoOrden() {
        String fecha = LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        for (int intentos = 0; intentos < 50; intentos++) {
            String codigo = "ORD-" + fecha + "-" + randomAlfanumerico(4);
            if (!ordenRepository.existsByCodigoOrden(codigo)) {
                return codigo;
            }
        }
        throw new IllegalStateException("No se pudo generar un codigo de orden unico");
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

    private Orden findOrThrow(Long id) {
        return ordenRepository.findById(id).orElseThrow(() -> new RuntimeException("Orden no encontrada: " + id));
    }

    private Orden findByCodigoOrThrow(String codigoOrden) {
        return ordenRepository.findByCodigoOrden(codigoOrden)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + codigoOrden));
    }

    public OrdenDTO toDTO(Orden o) {
        OrdenDTO dto = new OrdenDTO();
        dto.setId(o.getId());
        dto.setCodigoOrden(o.getCodigoOrden());
        if (o.getUsuario() != null) {
            dto.setUsuarioId(o.getUsuario().getId());
            dto.setUsuarioNombre(o.getUsuario().getNombre());
        } else {
            dto.setNombreInvitado(o.getNombreInvitado());
            dto.setEmailInvitado(o.getEmailInvitado());
        }
        dto.setTotal(o.getTotal()); dto.setEstado(o.getEstado());
        dto.setNombreEnvio(o.getNombreEnvio()); dto.setCelularEnvio(o.getCelularEnvio());
        dto.setProvinciaEnvio(o.getProvinciaEnvio()); dto.setCantonEnvio(o.getCantonEnvio());
        dto.setCiudadEnvio(o.getCiudadEnvio()); dto.setCalleEnvio(o.getCalleEnvio());
        dto.setTipoEntrega(o.getTipoEntrega());
        dto.setCostoEnvio(o.getCostoEnvio());
        dto.setPayphoneTransactionId(o.getPayphoneTransactionId());
        dto.setCodigoAutorizacion(o.getCodigoAutorizacion());
        dto.setMarcaTarjeta(o.getMarcaTarjeta());
        dto.setNumeroGuia(o.getNumeroGuia());
        dto.setGuiaImagenUrl(o.getGuiaImagenUrl());
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

    private String normalizarTipoEntrega(String tipoEntrega, boolean conEnvio) {
        if (tipoEntrega == null || tipoEntrega.isBlank()) {
            return conEnvio ? TIPO_DOMICILIO : TIPO_RETIRO;
        }

        String normalizado = tipoEntrega.trim().toUpperCase();
        return switch (normalizado) {
            case TIPO_DOMICILIO, TIPO_CUENCA, TIPO_RETIRO -> normalizado;
            default -> conEnvio ? TIPO_DOMICILIO : TIPO_RETIRO;
        };
    }

    private BigDecimal resolverCostoEnvio(String tipoEntrega) {
        return switch (tipoEntrega) {
            case TIPO_DOMICILIO -> configuracionService.getDecimal("costo_envio", new BigDecimal("6.00"));
            case TIPO_CUENCA -> configuracionService.getDecimal("costo_envio_cuenca", new BigDecimal("3.00"));
            default -> BigDecimal.ZERO;
        };
    }

    private void validarDireccionSegunEntrega(String tipoEntrega, String ciudadEnvio) {
        if (TIPO_RETIRO.equals(tipoEntrega)) return;

        if (ciudadEnvio == null || ciudadEnvio.isBlank()) {
            throw new IllegalStateException("Debes indicar una ciudad de entrega");
        }

        if (TIPO_CUENCA.equals(tipoEntrega) && !esCiudadCuenca(ciudadEnvio)) {
            throw new IllegalStateException("El envio dentro de Cuenca solo aplica para direcciones en Cuenca");
        }
    }

    private boolean esCiudadCuenca(String ciudadEnvio) {
        return ciudadEnvio != null && ciudadEnvio.trim().equalsIgnoreCase("Cuenca");
    }
}
