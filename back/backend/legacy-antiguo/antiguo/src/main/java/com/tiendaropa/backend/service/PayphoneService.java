package com.tiendaropa.backend.service;

import com.tiendaropa.backend.dto.orden.OrdenDTO;
import com.tiendaropa.backend.entity.ItemOrden;
import com.tiendaropa.backend.entity.Orden;
import com.tiendaropa.backend.entity.Producto;
import com.tiendaropa.backend.entity.enums.EstadoOrden;
import com.tiendaropa.backend.repository.OrdenRepository;
import com.tiendaropa.backend.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayphoneService {

    private final OrdenRepository ordenRepository;
    private final OrdenService ordenService;
    private final ProductoRepository productoRepository;
    private final ProductoService productoService;
    private final ConfiguracionService configuracionService;
    private final EmailService emailService;
    private final RestTemplate restTemplate;

    @Value("${payphone.token}")
    private String payphoneToken;

    @Value("${payphone.store-id}")
    private String storeId;

    @Value("${payphone.prepare-url}")
    private String prepareUrl;

    @Value("${payphone.confirm-url}")
    private String confirmUrl;

    @Value("${payphone.response-base-url}")
    private String responseBaseUrl;

    /**
     * Prepara la transacción en Payphone y devuelve la URL de pago.
     * El cliente es redirigido a esa URL para completar el pago.
     */
    public Map<String, String> preparar(Long ordenId, String email, String celular) {
        if (ordenId == null) {
            throw new IllegalArgumentException("La orden es requerida para iniciar el pago");
        }
        validarConfiguracion();

        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + ordenId));
        if (orden.getEstado() == EstadoOrden.PAGADO) {
            throw new IllegalStateException("La orden " + codigoVisible(orden) + " ya fue pagada");
        }

        DesglosePayphone desglose = construirDesglose(orden);
        int centavos = toCentavos(desglose.amount());
        String clientTransactionId = "orden-" + ordenId + "-" + System.currentTimeMillis();
        String emailPago = primeroConValor(email,
            orden.getUsuario() != null ? orden.getUsuario().getEmail() : orden.getEmailInvitado());
        String celularPago = primeroConValor(celular, orden.getCelularEnvio());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", payphoneToken);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", centavos);
        if (desglose.amountWithoutTax().compareTo(BigDecimal.ZERO) > 0) {
            body.put("amountWithoutTax", toCentavos(desglose.amountWithoutTax()));
        }
        if (desglose.amountWithTax().compareTo(BigDecimal.ZERO) > 0) {
            body.put("amountWithTax", toCentavos(desglose.amountWithTax()));
        }
        if (desglose.tax().compareTo(BigDecimal.ZERO) > 0) {
            body.put("tax", toCentavos(desglose.tax()));
        }
        body.put("clientTransactionId", clientTransactionId);
        body.put("storeId", storeId);
        body.put("currency", "USD");
        body.put("reference", "Pedido " + codigoVisible(orden) + " - Sofia Couture EC");
        body.put("responseUrl", responseBaseUrl + "/pago-confirmado");
        body.put("cancellationUrl", responseBaseUrl + "/ordenes/" + ordenId);
        body.put("lang", "es");
        if (emailPago != null) body.put("email", emailPago);
        if (celularPago != null && celularPago.length() >= 10) {
            body.put("phoneNumber", "+593" + celularPago.replaceFirst("^0", ""));
        }

        ResponseEntity<Map> response;
        try {
            response = restTemplate.exchange(
                prepareUrl, HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
            );
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Payphone preparar 4xx — status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Payphone rechazó la preparación: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Payphone preparar error — {}", e.getMessage(), e);
            throw new RuntimeException("Error al conectar con Payphone: " + e.getMessage());
        }

        Map<?, ?> result = response.getBody();
        log.info("Payphone preparar respuesta: {}", result);
        if (result == null || !result.containsKey("payWithCard")) {
            throw new RuntimeException("Payphone no devolvió URL de pago: " + result);
        }

        Map<String, String> resp = new LinkedHashMap<>();
        resp.put("redirectUrl", String.valueOf(result.get("payWithCard")));
        resp.put("payWithPayphone", String.valueOf(result.get("payWithPayPhone")));
        resp.put("clientTransactionId", clientTransactionId);
        return resp;
    }

    private void validarConfiguracion() {
        if (payphoneToken == null || payphoneToken.isBlank() || !payphoneToken.startsWith("Bearer ")) {
            throw new IllegalStateException("Payphone no está configurado: falta PAYPHONE_TOKEN con formato Bearer ...");
        }
        if (storeId == null || storeId.isBlank()) {
            throw new IllegalStateException("Payphone no está configurado: falta PAYPHONE_STORE_ID");
        }
    }

    private String primeroConValor(String primero, String segundo) {
        if (primero != null && !primero.isBlank()) return primero;
        if (segundo != null && !segundo.isBlank()) return segundo;
        return null;
    }

    /**
     * Confirma la transacción con Payphone después de la redirección.
     * Debe llamarse dentro de los 5 minutos posteriores al pago.
     */
    @Transactional
    public OrdenDTO confirmar(Integer id, String clientTransactionId) {
        Long ordenId = parsearOrdenId(clientTransactionId);
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new RuntimeException("Orden no encontrada: " + ordenId));

        if (orden.getEstado() == EstadoOrden.PAGADO) {
            return ordenService.toDTO(orden);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", payphoneToken);

        Map<String, Object> body = Map.of(
            "id", id,
            "clientTxId", clientTransactionId
        );

        ResponseEntity<Map> response;
        try {
            response = restTemplate.exchange(
                confirmUrl, HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
            );
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Payphone confirmar 4xx — status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Payphone rechazó la confirmación: " + e.getResponseBodyAsString());
        }

        Map<?, ?> result = response.getBody();
        if (result == null) throw new RuntimeException("Respuesta vacía de Payphone");

        String status = String.valueOf(result.get("transactionStatus"));

        if ("Approved".equalsIgnoreCase(status)) {
            orden.setEstado(EstadoOrden.PAGADO);
            orden.setPayphoneTransactionId(String.valueOf(result.get("transactionId")));
            orden.setCodigoAutorizacion(String.valueOf(result.get("authorizationCode")));
            Object brand = result.get("cardBrand");
            if (brand != null) orden.setMarcaTarjeta(String.valueOf(brand));
            ordenRepository.save(orden);
            descontarStock(orden);
            String nombreCliente = orden.getUsuario() != null ? orden.getUsuario().getNombre() : orden.getNombreInvitado();
            String emailCliente = orden.getUsuario() != null ? orden.getUsuario().getEmail() : orden.getEmailInvitado();
            String adminHtml = emailService.construirHtmlNotificacionAdmin(orden, nombreCliente, emailCliente);
            emailService.enviarFacturaCliente(orden);
            emailService.enviarNotificacionAdminPreparada(
                adminHtml,
                "Nuevo pedido " + codigoVisible(orden) + " — $" + orden.getTotal()
            );
        } else {
            orden.setEstado(EstadoOrden.CANCELADO);
            ordenRepository.save(orden);
            String emailDest = orden.getUsuario() != null ? orden.getUsuario().getEmail() : orden.getEmailInvitado();
            String nombreDest = orden.getUsuario() != null ? orden.getUsuario().getNombre() : orden.getNombreInvitado();
            if (emailDest != null) emailService.enviarPagoCancelado(emailDest, nombreDest, codigoVisible(orden));
        }

        return ordenService.toDTO(orden);
    }

    private void descontarStock(Orden orden) {
        orden.getItems().forEach(item -> {
            if (item.getProducto() == null) return;
            productoRepository.findById(item.getProducto().getId()).ifPresent(producto -> {
                productoService.descontarStock(producto, item.getColor(), item.getTalla(), item.getCantidad());
                productoRepository.save(producto);
                log.info("Stock producto {} color={} reducido en {} unidades",
                    producto.getId(), item.getColor(), item.getCantidad());
            });
        });
    }

    private DesglosePayphone construirDesglose(Orden orden) {
        BigDecimal ivaPorcentaje = configuracionService.getDecimal("iva_porcentaje", new BigDecimal("15.00"));
        BigDecimal divisorIva = BigDecimal.ONE.add(
            ivaPorcentaje.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP)
        );

        BigDecimal totalConIvaIncluido = BigDecimal.ZERO;
        BigDecimal totalSinIva = BigDecimal.ZERO;

        for (ItemOrden item : orden.getItems()) {
            BigDecimal subtotal = item.getPrecio()
                .multiply(BigDecimal.valueOf(item.getCantidad()))
                .setScale(2, RoundingMode.HALF_UP);

            Producto producto = item.getProducto();
            boolean aplicaIva = producto == null || productoService.aplicaIva(producto);
            if (aplicaIva) {
                totalConIvaIncluido = totalConIvaIncluido.add(subtotal);
            } else {
                totalSinIva = totalSinIva.add(subtotal);
            }
        }

        BigDecimal envio = orden.getCostoEnvio() != null ? orden.getCostoEnvio() : BigDecimal.ZERO;
        totalSinIva = totalSinIva.add(envio);

        BigDecimal amountWithTax = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;
        if (totalConIvaIncluido.compareTo(BigDecimal.ZERO) > 0) {
            amountWithTax = totalConIvaIncluido.divide(divisorIva, 2, RoundingMode.HALF_UP);
            tax = totalConIvaIncluido.subtract(amountWithTax).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal amountWithoutTax = totalSinIva.setScale(2, RoundingMode.HALF_UP);
        BigDecimal amount = amountWithoutTax.add(amountWithTax).add(tax).setScale(2, RoundingMode.HALF_UP);
        return new DesglosePayphone(amount, amountWithTax, amountWithoutTax, tax);
    }

    private int toCentavos(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100))
            .intValueExact();
    }

    private record DesglosePayphone(
        BigDecimal amount,
        BigDecimal amountWithTax,
        BigDecimal amountWithoutTax,
        BigDecimal tax
    ) {}

    private Long parsearOrdenId(String clientTransactionId) {
        try {
            String[] parts = clientTransactionId.split("-");
            return Long.parseLong(parts[1]);
        } catch (Exception e) {
            throw new RuntimeException("clientTransactionId inválido: " + clientTransactionId);
        }
    }

    private String codigoVisible(Orden orden) {
        return orden.getCodigoOrden() != null && !orden.getCodigoOrden().isBlank()
            ? orden.getCodigoOrden()
            : "#" + orden.getId();
    }
}
