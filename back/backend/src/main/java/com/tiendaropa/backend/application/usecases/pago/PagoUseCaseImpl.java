package com.tiendaropa.backend.application.usecases.pago;

import com.tiendaropa.backend.application.ports.input.PagoUseCase;
import com.tiendaropa.backend.application.ports.output.PayphonePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PagoUseCaseImpl implements PagoUseCase {

    private final PayphonePort payphonePort;

    @Override
    public String procesarPago(String referencia) {
        return payphonePort.procesar(referencia);
    }
}
