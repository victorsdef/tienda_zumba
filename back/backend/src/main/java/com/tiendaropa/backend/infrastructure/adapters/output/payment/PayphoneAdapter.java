package com.tiendaropa.backend.infrastructure.adapters.output.payment;

import com.tiendaropa.backend.application.ports.output.PayphonePort;
import org.springframework.stereotype.Component;

@Component
public class PayphoneAdapter implements PayphonePort {

    @Override
    public String procesar(String referencia) {
        return "Pago procesado correctamente: " + referencia;
    }
}
