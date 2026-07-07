package com.tiendaropa.backend.infrastructure.adapters.input.rest;

import com.tiendaropa.backend.application.ports.input.PagoUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/nueva-arquitectura/pagos", "/api/pagos"})
@RequiredArgsConstructor
public class PagoController {

    private final PagoUseCase pagoUseCase;

    @PostMapping("/{referencia}")
    public String procesar(@PathVariable String referencia) {
        return pagoUseCase.procesarPago(referencia);
    }
}
