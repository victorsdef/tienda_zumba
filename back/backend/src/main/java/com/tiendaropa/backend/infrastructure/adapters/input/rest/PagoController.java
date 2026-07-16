package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.ConfiguracionUseCase;
import com.tiendaropa.backend.application.ports.input.EmailUseCase;
import com.tiendaropa.backend.application.ports.input.OrdenUseCase;
import com.tiendaropa.backend.application.ports.output.OrdenRepositoryPort;
import com.tiendaropa.backend.application.ports.output.ProductoRepositoryPort;
import com.tiendaropa.backend.application.ports.output.UsuarioRepositoryPort;
import com.tiendaropa.backend.domain.model.Orden;
import com.tiendaropa.backend.domain.model.OrdenItem;
import com.tiendaropa.backend.domain.model.Producto;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.orden.OrdenDTO;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.dto.payphone.PrepararPagoRequest;
import com.tiendaropa.backend.infrastructure.adapters.input.rest.mapper.OrdenRestMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping({"/api/nueva-arquitectura/pagos", "/api/pagos"})
@RequiredArgsConstructor
@Slf4j
public class PagoController {

    private final OrdenRepositoryPort ordenRepositoryPort;
    private final OrdenUseCase ordenUseCase;
    private final ProductoRepositoryPort productoRepositoryPort;
    private final UsuarioRepositoryPort usuarioRepositoryPort;
    private final ConfiguracionUseCase configuracionUseCase;
    private final EmailUseCase emailUseCase;
    private final OrdenRestMapper ordenRestMapper;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

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

    @PostMapping("/preparar")
    public ResponseEntity<Map<String, String>> preparar(@RequestBody PrepararPagoRequest req) {
        if (req.getOrdenId() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La orden es requerida");
        validarConfiguracion();

        Orden orden = ordenRepositoryPort.findById(req.getOrdenId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada: " + req.getOrdenId()));

        if ("PAGADO".equalsIgnoreCase(orden.getEstado()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La orden " + codigoVisible(orden) + " ya fue pagada");

        DesglosePayphone desglose = construirDesglose(orden);
        int centavos = toCentavos(desglose.amount());
        String clientTransactionId = "orden-" + req.getOrdenId() + "-" + System.currentTimeMillis();

        String emailUsuario = null;
        if (orden.getUsuarioId() != null) {
            emailUsuario = usuarioRepositoryPort.findById(orden.getUsuarioId())
                .map(u -> u.getEmail()).orElse(null);
        }
        String emailPago = primeroConValor(req.getEmail(), emailUsuario, orden.getEmailInvitado());
        String celularPago = primeroConValor(req.getCelular(), orden.getCelularEnvio());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", payphoneToken);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("amount", centavos);
        if (desglose.amountWithoutTax().compareTo(BigDecimal.ZERO) > 0)
            body.put("amountWithoutTax", toCentavos(desglose.amountWithoutTax()));
        if (desglose.amountWithTax().compareTo(BigDecimal.ZERO) > 0)
            body.put("amountWithTax", toCentavos(desglose.amountWithTax()));
        if (desglose.tax().compareTo(BigDecimal.ZERO) > 0)
            body.put("tax", toCentavos(desglose.tax()));
        body.put("clientTransactionId", clientTransactionId);
        body.put("storeId", storeId);
        body.put("currency", "USD");
        body.put("reference", "Pedido " + codigoVisible(orden) + " - Sofia Couture EC");
        body.put("responseUrl", responseBaseUrl + "/pago-confirmado");
        body.put("cancellationUrl", responseBaseUrl + "/ordenes/" + req.getOrdenId());
        body.put("lang", "es");
        if (emailPago != null) body.put("email", emailPago);
        if (celularPago != null && celularPago.length() >= 10)
            body.put("phoneNumber", "+593" + celularPago.replaceFirst("^0", ""));

        ResponseEntity<Map> response;
        try {
            response = restTemplate.exchange(prepareUrl, HttpMethod.POST,
                new HttpEntity<>(body, headers), Map.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Payphone preparar 4xx — status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payphone rechazó la preparación: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Payphone preparar error — {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Error al conectar con Payphone: " + e.getMessage());
        }

        Map<?, ?> result = response.getBody();
        log.info("Payphone preparar respuesta: {}", result);
        if (result == null || !result.containsKey("payWithCard"))
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payphone no devolvió URL de pago: " + result);

        Map<String, String> resp = new LinkedHashMap<>();
        resp.put("redirectUrl", String.valueOf(result.get("payWithCard")));
        resp.put("payWithPayphone", String.valueOf(result.get("payWithPayPhone")));
        resp.put("clientTransactionId", clientTransactionId);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/confirmar")
    public ResponseEntity<OrdenDTO> confirmar(
        @RequestParam Integer id,
        @RequestParam String clientTransactionId
    ) {
        Long ordenId = parsearOrdenId(clientTransactionId);
        Orden orden = ordenRepositoryPort.findById(ordenId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada: " + ordenId));

        if ("PAGADO".equalsIgnoreCase(orden.getEstado()))
            return ResponseEntity.ok(toDto(orden));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", payphoneToken);

        Map<String, Object> body = Map.of("id", id, "clientTxId", clientTransactionId);

        ResponseEntity<Map> response;
        try {
            response = restTemplate.exchange(confirmUrl, HttpMethod.POST,
                new HttpEntity<>(body, headers), Map.class);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Payphone confirmar 4xx — status={} body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Payphone rechazó la confirmación: " + e.getResponseBodyAsString());
        }

        Map<?, ?> result = response.getBody();
        if (result == null) throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Respuesta vacía de Payphone");

        String status = String.valueOf(result.get("transactionStatus"));

        if ("Approved".equalsIgnoreCase(status)) {
            orden.setEstado("PAGADO");
            orden.setPayphoneTransactionId(String.valueOf(result.get("transactionId")));
            orden.setCodigoAutorizacion(String.valueOf(result.get("authorizationCode")));
            Object brand = result.get("cardBrand");
            if (brand != null) orden.setMarcaTarjeta(String.valueOf(brand));
            ordenUseCase.actualizar(orden);
            descontarStock(orden);

            String emailCliente = null;
            String nombreCliente = orden.getNombreInvitado();
            if (orden.getUsuarioId() != null) {
                var usuario = usuarioRepositoryPort.findById(orden.getUsuarioId()).orElse(null);
                if (usuario != null) { emailCliente = usuario.getEmail(); nombreCliente = usuario.getNombre(); }
            }
            if (emailCliente == null) emailCliente = orden.getEmailInvitado();
            if (emailCliente != null)
                emailUseCase.enviarConfirmacionOrden(emailCliente, nombreCliente != null ? nombreCliente : "", orden.getCodigoOrden(), orden.getTotal().toPlainString());
        } else {
            orden.setEstado("CANCELADO");
            ordenUseCase.actualizar(orden);
            String emailDest = orden.getEmailInvitado();
            String nombreDest = orden.getNombreInvitado();
            if (orden.getUsuarioId() != null) {
                var usuario = usuarioRepositoryPort.findById(orden.getUsuarioId()).orElse(null);
                if (usuario != null) { emailDest = usuario.getEmail(); nombreDest = usuario.getNombre(); }
            }
            if (emailDest != null)
                emailUseCase.enviarPagoCancelado(emailDest, nombreDest != null ? nombreDest : "", codigoVisible(orden));
        }

        return ResponseEntity.ok(toDto(orden));
    }

    // ── helpers ──────────────────────────────────────────────────────

    private void validarConfiguracion() {
        if (payphoneToken == null || payphoneToken.isBlank() || !payphoneToken.startsWith("Bearer "))
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Payphone no está configurado: falta PAYPHONE_TOKEN con formato 'Bearer ...'");
        if (storeId == null || storeId.isBlank())
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                "Payphone no está configurado: falta PAYPHONE_STORE_ID");
    }

    private DesglosePayphone construirDesglose(Orden orden) {
        BigDecimal ivaPct = configuracionUseCase.getDecimal("iva_porcentaje", new BigDecimal("15.00"));
        BigDecimal divisor = BigDecimal.ONE.add(ivaPct.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));

        BigDecimal conIva = BigDecimal.ZERO;
        BigDecimal sinIva = BigDecimal.ZERO;

        for (OrdenItem item : orden.getItems()) {
            BigDecimal precio = item.getPrecioUnitario() != null ? item.getPrecioUnitario()
                : (item.getPrecio() != null ? item.getPrecio() : BigDecimal.ZERO);
            BigDecimal subtotal = precio.multiply(BigDecimal.valueOf(item.getCantidad() != null ? item.getCantidad() : 1))
                .setScale(2, RoundingMode.HALF_UP);

            boolean aplicaIva = true;
            if (item.getProductoId() != null) {
                Producto prod = productoRepositoryPort.findById(item.getProductoId()).orElse(null);
                if (prod != null && prod.getAplicaIva() != null) aplicaIva = prod.getAplicaIva();
            }
            if (aplicaIva) conIva = conIva.add(subtotal);
            else sinIva = sinIva.add(subtotal);
        }

        BigDecimal envio = orden.getCostoEnvio() != null ? orden.getCostoEnvio() : BigDecimal.ZERO;
        sinIva = sinIva.add(envio);

        BigDecimal amountWithTax = BigDecimal.ZERO;
        BigDecimal tax = BigDecimal.ZERO;
        if (conIva.compareTo(BigDecimal.ZERO) > 0) {
            amountWithTax = conIva.divide(divisor, 2, RoundingMode.HALF_UP);
            tax = conIva.subtract(amountWithTax).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal amountWithoutTax = sinIva.setScale(2, RoundingMode.HALF_UP);
        BigDecimal amount = amountWithoutTax.add(amountWithTax).add(tax).setScale(2, RoundingMode.HALF_UP);
        return new DesglosePayphone(amount, amountWithTax, amountWithoutTax, tax);
    }

    private void descontarStock(Orden orden) {
        for (OrdenItem item : orden.getItems()) {
            if (item.getProductoId() == null) continue;
            productoRepositoryPort.findById(item.getProductoId()).ifPresent(prod -> {
                int cantidad = item.getCantidad() != null ? item.getCantidad() : 0;
                if (cantidad <= 0) return;
                try {
                    String color = item.getColor();
                    String talla = item.getTalla();
                    if (color != null && talla != null && prod.getStockPorColorTallaJson() != null) {
                        java.util.Map<String, java.util.Map<String, Integer>> mapa = objectMapper.readValue(
                            prod.getStockPorColorTallaJson(),
                            new TypeReference<java.util.Map<String, java.util.Map<String, Integer>>>() {}
                        );
                        if (mapa.containsKey(color) && mapa.get(color).containsKey(talla)) {
                            int actual = mapa.get(color).getOrDefault(talla, 0);
                            mapa.get(color).put(talla, Math.max(0, actual - cantidad));
                            prod.setStockPorColorTallaJson(objectMapper.writeValueAsString(mapa));
                        }
                    } else {
                        prod.setStock(Math.max(0, prod.getStock() - cantidad));
                    }
                } catch (Exception e) {
                    log.warn("Error descontando stock producto {}: {}", prod.getId(), e.getMessage());
                    prod.setStock(Math.max(0, prod.getStock() - cantidad));
                }
                productoRepositoryPort.save(prod);
                log.info("Stock producto {} color={} talla={} reducido en {}", prod.getId(), item.getColor(), item.getTalla(), cantidad);
            });
        }
    }

    private int toCentavos(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).intValueExact();
    }

    private String primeroConValor(String... valores) {
        for (String v : valores) if (v != null && !v.isBlank()) return v;
        return null;
    }

    private Long parsearOrdenId(String clientTransactionId) {
        try { return Long.parseLong(clientTransactionId.split("-")[1]); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "clientTransactionId inválido: " + clientTransactionId); }
    }

    private String codigoVisible(Orden orden) {
        return orden.getCodigoOrden() != null && !orden.getCodigoOrden().isBlank()
            ? orden.getCodigoOrden() : "#" + orden.getId();
    }

    private OrdenDTO toDto(Orden orden) {
        OrdenDTO dto = ordenRestMapper.toDto(orden);
        if (orden.getUsuarioId() != null && (dto.getUsuarioNombre() == null || dto.getUsuarioNombre().isBlank()))
            usuarioRepositoryPort.findById(orden.getUsuarioId()).ifPresent(u -> dto.setUsuarioNombre(u.getNombre()));
        return dto;
    }

    private record DesglosePayphone(BigDecimal amount, BigDecimal amountWithTax, BigDecimal amountWithoutTax, BigDecimal tax) {}
}
