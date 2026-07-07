package com.tiendaropa.backend.controller;

import com.tiendaropa.backend.dto.orden.OrdenDTO;
import com.tiendaropa.backend.dto.payphone.PrepararPagoRequest;
import com.tiendaropa.backend.service.PayphoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PayphoneController {

    private final PayphoneService payphoneService;

    /**
     * Prepara la transacción en Payphone y devuelve la URL de redirección.
     * El frontend redirige al usuario a esa URL para pagar.
     */
    @PostMapping("/preparar")
    public ResponseEntity<Map<String, String>> preparar(@RequestBody PrepararPagoRequest req) {
        return ResponseEntity.ok(payphoneService.preparar(
            req.getOrdenId(), req.getEmail(), req.getCelular()
        ));
    }

    /**
     * Payphone redirige al frontend con ?id=X&clientTransactionId=Y.
     * El frontend llama aquí para confirmar y actualizar el estado de la orden.
     */
    @PostMapping("/confirmar")
    public ResponseEntity<OrdenDTO> confirmar(
        @RequestParam Integer id,
        @RequestParam String clientTransactionId
    ) {
        return ResponseEntity.ok(payphoneService.confirmar(id, clientTransactionId));
    }
}
